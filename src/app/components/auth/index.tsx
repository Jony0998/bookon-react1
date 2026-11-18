import React, { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import { useGlobals } from "../../hooks/useGlobals";
import MemberService from "../../services/MemberService";
import { apiErrorText } from "../../../lib/apiError";
import { BrandWordmark, GirihMark, GirihPattern } from "../ui/Girih";
import { CheckIcon, CloseIcon } from "../ui/Icons";
import "../../../css/account.css";

export type AuthMode = "login" | "signup";
type View = AuthMode | "forgot" | "forgotSent" | "welcome";

interface AuthModalProps {
  mode: AuthMode | null;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NICK_RE = /^[A-Za-z0-9_]{3,30}$/;

/** Sign in, sign up and "forgot password" in one themed dialog */
export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const { t, i18n } = useTranslation();
  const { setAuthMember } = useGlobals();
  const [view, setView] = useState<View>("login");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState({ nick: "", email: "", emailSent: false });

  // Each opening starts on the requested tab with a clean form
  useEffect(() => {
    if (!mode) return;
    setView(mode);
    setError("");
    setPassword("");
    setShowPassword(false);
  }, [mode]);

  const go = (next: View) => {
    setView(next);
    setError("");
  };

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(apiErrorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) return setError(t("auth.required"));
    run(async () => {
      const member = await new MemberService().login({ login: login.trim(), memberPassword: password });
      setAuthMember(member);
      onClose();
    });
  };

  const submitSignup = (e: FormEvent) => {
    e.preventDefault();
    if (!NICK_RE.test(nick.trim())) return setError(t("errors.invalidNick"));
    if (!EMAIL_RE.test(email.trim())) return setError(t("errors.invalidEmail"));
    if (password.length < 8) return setError(t("errors.weakPassword"));
    run(async () => {
      const { member, emailSent } = await new MemberService().signup(
        { memberNick: nick.trim(), memberEmail: email.trim(), memberPassword: password },
        i18n.language
      );
      setAuthMember(member);
      setWelcome({ nick: member.memberNick, email: member.memberEmail ?? "", emailSent });
      go("welcome");
    });
  };

  const submitForgot = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError(t("errors.invalidEmail"));
    run(async () => {
      await new MemberService().forgotPassword(email.trim(), i18n.language);
      go("forgotSent");
    });
  };

  const passwordField = (autoComplete: string, hint?: string) => (
    <label className="bo-field">
      <span>{t("auth.password")}</span>
      <span className="bo-password">
        <input
          className="bo-input"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={autoComplete}
          maxLength={72}
          required
        />
        <button type="button" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
          {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
        </button>
      </span>
      {hint ? <small className="bo-muted">{hint}</small> : null}
    </label>
  );

  // Typing again hides the previous error
  const clearError = () => {
    if (error) setError("");
  };

  const errorLine = error ? <p className="bo-alert" role="alert">{error}</p> : null;

  return (
    <Dialog
      open={!!mode}
      onClose={busy ? undefined : onClose}
      maxWidth={false}
      slotProps={{
        paper: { sx: { borderRadius: "28px", bgcolor: "var(--surface)", color: "var(--ink)", m: 2, width: "min(880px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", overflow: "hidden" } },
        backdrop: { sx: { backgroundColor: "var(--overlay)", backdropFilter: "blur(4px)" } },
      }}
      aria-labelledby="bo-auth-title"
    >
      <div className="bo-auth">
        <aside className="bo-auth__side" aria-hidden="true">
          <GirihPattern className="bo-girih-bg" style={{ inset: 0, opacity: 0.18, color: "var(--gold)" }} />
          <div className="bo-auth__brand"><GirihMark size={34} /><BrandWordmark size={28} /></div>
          <div>
            <p className="bo-auth__side-title">{t("auth.sideTitle")}</p>
            <p className="bo-auth__side-text">{t("auth.sideText")}</p>
          </div>
        </aside>

        <div className="bo-auth__main">
          <button type="button" className="bo-icon-btn bo-auth__close" aria-label={t("common.close")} onClick={onClose} disabled={busy}>
            <CloseIcon />
          </button>

          {view === "login" ? (
            <form onSubmit={submitLogin} noValidate className="bo-auth__form" onInput={clearError}>
              <h2 id="bo-auth-title">{t("auth.loginTitle")}</h2>
              <p className="bo-muted">{t("auth.loginSub")}</p>
              <label className="bo-field">
                <span>{t("auth.login")}</span>
                <input className="bo-input" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoFocus maxLength={254} required />
              </label>
              {passwordField("current-password")}
              <button type="button" className="bo-auth__link bo-auth__forgot" onClick={() => { setEmail(login.includes("@") ? login.trim() : email); go("forgot"); }}>
                {t("auth.forgot")}
              </button>
              {errorLine}
              <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy}>{t("auth.submitLogin")}</button>
              <p className="bo-auth__switch">{t("auth.noAccount")} <button type="button" className="bo-auth__link" onClick={() => go("signup")}>{t("auth.toSignup")}</button></p>
            </form>
          ) : view === "signup" ? (
            <form onSubmit={submitSignup} noValidate className="bo-auth__form" onInput={clearError}>
              <h2 id="bo-auth-title">{t("auth.signupTitle")}</h2>
              <p className="bo-muted">{t("auth.signupSub")}</p>
              <label className="bo-field">
                <span>{t("auth.nick")}</span>
                <input className="bo-input" value={nick} onChange={(e) => setNick(e.target.value)} autoComplete="username" autoFocus maxLength={30} required />
                <small className="bo-muted">{t("auth.nickHint")}</small>
              </label>
              <label className="bo-field">
                <span>{t("auth.email")}</span>
                <input className="bo-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} required />
              </label>
              {passwordField("new-password", t("auth.passwordHint"))}
              {errorLine}
              <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy}>{t("auth.submitSignup")}</button>
              <p className="bo-auth__switch">{t("auth.haveAccount")} <button type="button" className="bo-auth__link" onClick={() => go("login")}>{t("auth.toLogin")}</button></p>
            </form>
          ) : view === "forgot" ? (
            <form onSubmit={submitForgot} noValidate className="bo-auth__form" onInput={clearError}>
              <h2 id="bo-auth-title">{t("auth.forgotTitle")}</h2>
              <p className="bo-muted">{t("auth.forgotSub")}</p>
              <label className="bo-field">
                <span>{t("auth.email")}</span>
                <input className="bo-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus maxLength={254} required />
              </label>
              {errorLine}
              <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy}>{t("auth.forgotSubmit")}</button>
              <button type="button" className="bo-auth__link" onClick={() => go("login")}>{t("auth.back")}</button>
            </form>
          ) : view === "forgotSent" ? (
            <div className="bo-auth__form bo-auth__done" role="status">
              <span className="bo-auth__check"><CheckIcon size={30} /></span>
              <h2 id="bo-auth-title">{t("auth.forgotTitle")}</h2>
              <p className="bo-muted">{t("auth.forgotSent")}</p>
              <button type="button" className="bo-btn bo-btn--dark" onClick={() => go("login")}>{t("auth.back")}</button>
            </div>
          ) : (
            <div className="bo-auth__form bo-auth__done" role="status">
              <span className="bo-auth__check"><CheckIcon size={30} /></span>
              <h2 id="bo-auth-title">{t("auth.welcome", { nick: welcome.nick })}</h2>
              {welcome.emailSent ? <p className="bo-muted">{t("auth.checkEmail", { email: welcome.email })}</p> : null}
              <button type="button" className="bo-btn bo-btn--primary bo-btn--lg" onClick={onClose} autoFocus>{t("cart.browse")}</button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
