import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MemberService from "../../services/MemberService";
import { useGlobals } from "../../hooks/useGlobals";
import { CheckIcon, CloseIcon } from "../../components/ui/Icons";
import { GirihMark } from "../../components/ui/Girih";

/** Landing page of the emailed confirmation link: /verify-email?token=... */
export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { authMember, setAuthMember } = useGlobals();
  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const started = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice; the token is single-use, so send it once
    if (started.current) return;
    started.current = true;
    const token = params.get("token");
    if (!token) {
      setState("failed");
      return;
    }
    const service = new MemberService();
    service
      .verifyEmail(token)
      .then(async () => {
        setState("done");
        if (authMember) setAuthMember(await service.getDetail().catch(() => authMember));
      })
      .catch(() => setState("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bo-wrap bo-page-message" aria-live="polite">
      {state === "working" ? <GirihMark size={64} stroke={1.6} /> : null}
      {state === "done" ? <span className="bo-auth__check"><CheckIcon size={36} /></span> : null}
      {state === "failed" ? <span className="bo-page-message__icon"><CloseIcon size={36} /></span> : null}
      <h1 className="bo-section-title">{t("verify.title")}</h1>
      <p className="bo-muted">{t(`verify.${state}`)}</p>
      {state !== "working" ? (
        <div className="bo-page-message__actions">
          {authMember ? <Link to="/member-page" className="bo-btn bo-btn--dark">{t("verify.toProfile")}</Link> : null}
          <Link to="/products" className="bo-btn bo-btn--ghost">{t("cart.browse")}</Link>
        </div>
      ) : null}
    </main>
  );
}
