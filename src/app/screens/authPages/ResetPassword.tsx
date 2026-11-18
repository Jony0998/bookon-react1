import React, { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MemberService from "../../services/MemberService";
import { apiErrorText } from "../../../lib/apiError";
import { CheckIcon } from "../../components/ui/Icons";

/** Landing page of the emailed reset link: /reset-password?token=... */
export default function ResetPasswordPage({ openLogin }: { openLogin: () => void }) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError(t("errors.weakPassword"));
    if (password !== repeat) return setError(t("reset.mismatch"));
    setBusy(true);
    setError("");
    try {
      await new MemberService().resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(apiErrorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="bo-wrap bo-page-message" role="status">
        <span className="bo-auth__check"><CheckIcon size={36} /></span>
        <h1 className="bo-section-title">{t("reset.title")}</h1>
        <p className="bo-muted">{t("reset.done")}</p>
        <div className="bo-page-message__actions">
          <button type="button" className="bo-btn bo-btn--primary" onClick={openLogin}>{t("common.login")}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="bo-wrap bo-page-message">
      <form className="bo-card bo-form bo-reset" onSubmit={submit} noValidate>
        <h1 className="bo-side-card__title" style={{ fontSize: 30 }}>{t("reset.title")}</h1>
        {token ? (
          <>
            <p className="bo-muted" style={{ margin: 0 }}>{t("reset.sub")}</p>
            <label className="bo-field">
              <span>{t("reset.password")}</span>
              <input className="bo-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" maxLength={72} autoFocus required />
              <small className="bo-muted">{t("auth.passwordHint")}</small>
            </label>
            <label className="bo-field">
              <span>{t("reset.repeat")}</span>
              <input className="bo-input" type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" maxLength={72} required />
            </label>
            {error ? <p className="bo-alert" role="alert">{error}</p> : null}
            <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy}>{t("reset.submit")}</button>
          </>
        ) : (
          <p className="bo-alert" role="alert">{t("reset.missing")}</p>
        )}
      </form>
    </main>
  );
}
