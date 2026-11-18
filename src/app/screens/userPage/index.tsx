import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import MemberService from "../../services/MemberService";
import OrderService from "../../services/OrderService";
import ProductService from "../../services/ProductService";
import { Member } from "../../../lib/types/member";
import { Order } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { OrderStatus } from "../../../lib/enums/order.enum";
import { MemberType } from "../../../lib/enums/member.enum";
import { serverApi } from "../../../lib/config";
import { displayAuthor, formatDate, formatPrice } from "../../../lib/format";
import { apiErrorText } from "../../../lib/apiError";
import BookCover from "../../components/ui/BookCover";
import { GirihPattern } from "../../components/ui/Girih";
import { BoxIcon, CheckIcon, HeartIcon, UserIcon } from "../../components/ui/Icons";
import "../../../css/account.css";
import "../../../css/profile.css";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE = 5 * 1024 * 1024;
const NICK_RE = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{7,15}$/;

type Tab = "profile" | "security" | "activity";
type Form = { memberNick: string; memberEmail: string; memberPhone: string; memberAddress: string; memberDesc: string };
type Errors = Partial<Record<keyof Form, string>>;

const formFrom = (m: Member): Form => ({
  memberNick: m.memberNick ?? "",
  memberEmail: m.memberEmail ?? "",
  memberPhone: m.memberPhone ?? "",
  memberAddress: m.memberAddress ?? "",
  memberDesc: m.memberDesc ?? "",
});

const avatarOf = (m: Member) => (m.memberImage ? `${serverApi}/${m.memberImage}` : "/icons/default-user.svg");
const fallbackAvatar = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = "/icons/default-user.svg";
};

export default function UserPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { authMember, setAuthMember } = useGlobals();
  const [tab, setTab] = useState<Tab>("profile");
  const [form, setForm] = useState<Form | null>(authMember ? formFrom(authMember) : null);
  const [errors, setErrors] = useState<Errors>({});
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [resend, setResend] = useState({ busy: false, text: "" });
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [liked, setLiked] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!authMember) navigate("/");
  }, [authMember, navigate]);

  // Fresh copy from the server: the cached one may be stale (e.g. email just confirmed)
  useEffect(() => {
    if (!authMember) return;
    new MemberService()
      .getDetail()
      .then((member) => {
        setAuthMember(member);
        setForm(formFrom(member));
      })
      .catch(() => undefined);
    const orderService = new OrderService();
    Promise.all(
      [OrderStatus.PAUSE, OrderStatus.PROCESS, OrderStatus.FINISH].map((status) =>
        orderService.getMyOrders({ page: 1, limit: 50, orderStatus: status }).catch(() => [] as Order[])
      )
    ).then((lists) => {
      const all = lists.flat();
      setOrderCount(all.length);
      setOrders(all.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 3));
    });
    new ProductService().getLikedProducts().then(setLiked).catch(() => setLiked([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const original = useMemo(() => (authMember ? formFrom(authMember) : null), [authMember]);
  const dirty = !!form && !!original && (image !== null || (Object.keys(form) as (keyof Form)[]).some((k) => form[k].trim() !== original[k]));

  // Warn before closing the tab with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!authMember || !form || !original) return null;

  const avatar = preview || avatarOf(authMember);
  const isLibrary = authMember.memberType === MemberType.LIBRARY;

  const field = (key: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  };

  const pickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE) {
      setStatus({ kind: "error", text: t("errors.badImage") });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
    setTab("profile");
  };

  /** Same rules as the API; unchanged legacy values are left alone */
  const validate = (): Errors => {
    const next: Errors = {};
    const nick = form.memberNick.trim();
    if (!nick) next.memberNick = t("profile.required");
    else if (nick !== original.memberNick && !NICK_RE.test(nick)) next.memberNick = t("errors.invalidNick");
    const email = form.memberEmail.trim();
    if (email && !EMAIL_RE.test(email)) next.memberEmail = t("errors.invalidEmail");
    const phone = form.memberPhone.trim();
    if (phone && phone !== original.memberPhone && !PHONE_RE.test(phone.replace(/[\s()-]/g, ""))) next.memberPhone = t("errors.invalidPhone");
    if (form.memberAddress.length > 200) next.memberAddress = t("errors.tooLong");
    if (form.memberDesc.length > 500) next.memberDesc = t("errors.tooLong");
    return next;
  };

  const discard = () => {
    setForm(original);
    setImage(null);
    setPreview("");
    setErrors({});
    setStatus(null);
  };

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: "error", text: Object.values(found)[0] as string });
      return;
    }
    setSaving(true);
    try {
      const member = await new MemberService().updateMember({
        memberNick: form.memberNick.trim(),
        memberEmail: form.memberEmail.trim(),
        memberPhone: form.memberPhone.trim(),
        memberAddress: form.memberAddress.trim(),
        memberDesc: form.memberDesc.trim(),
        memberImage: image ?? undefined,
      });
      setAuthMember(member);
      setForm(formFrom(member));
      setImage(null);
      setPreview("");
      setStatus({ kind: "ok", text: t("profile.saved") });
    } catch (err) {
      setStatus({ kind: "error", text: apiErrorText(err, t) });
    } finally {
      setSaving(false);
    }
  };

  const resendVerification = async () => {
    setResend({ busy: true, text: "" });
    try {
      const result = await new MemberService().resendVerification(i18n.language);
      if (result.alreadyVerified) setAuthMember(await new MemberService().getDetail());
      setResend({ busy: false, text: result.emailSent || result.alreadyVerified ? t("verify.resent") : t("verify.notSent") });
    } catch (err) {
      setResend({ busy: false, text: apiErrorText(err, t) });
    }
  };

  const goTab = (next: Tab) => {
    if (tab === "profile" && next !== "profile" && dirty && !window.confirm(t("profile.leaveWarning"))) return;
    if (tab === "profile" && next !== "profile" && dirty) discard();
    setTab(next);
  };

  const statusLabel = (s: OrderStatus) =>
    s === OrderStatus.PAUSE ? t("orders.tabPending") : s === OrderStatus.PROCESS ? t("orders.tabProcess") : t("orders.tabFinish");

  return (
    <main className="bo-page bo-account bo-me">
      {/* ---------- Cover ---------- */}
      <section className="bo-me__cover">
        <GirihPattern className="bo-girih-bg" style={{ inset: 0, opacity: 0.16, color: "var(--gold)" }} />
        <div className="bo-wrap bo-me__head">
          <div className="bo-me__avatar">
            <img src={avatar} alt="" onError={fallbackAvatar} />
            <label className="bo-me__camera" title={t("profile.changePhoto")}>
              <span className="bo-sr-only">{t("profile.changePhoto")}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} />
            </label>
          </div>
          <div className="bo-me__id">
            <span className="bo-me__role">{isLibrary ? t("profile.library") : t("profile.reader")}</span>
            <h1 className="bo-me__nick">{authMember.memberNick}</h1>
            <div className="bo-me__meta">
              {authMember.createdAt ? <span>{t("profile.since", { date: formatDate(authMember.createdAt, i18n.language) })}</span> : null}
              {authMember.memberEmail ? (
                <span className={authMember.memberEmailVerified ? "is-ok" : "is-warn"}>
                  {authMember.memberEmailVerified ? <CheckIcon size={14} /> : null}
                  {authMember.memberEmail}
                </span>
              ) : null}
            </div>
            {authMember.memberDesc ? <p className="bo-me__bio">{authMember.memberDesc}</p> : null}
          </div>
        </div>
      </section>

      <div className="bo-wrap bo-me__body">
        {/* ---------- Stats ---------- */}
        <div className="bo-me__stats">
          <Link to="/orders" className="bo-me__stat">
            <span className="bo-me__stat-icon"><BoxIcon size={22} /></span>
            <strong>{orderCount ?? "–"}</strong>
            <span>{t("profile.statOrders")}</span>
          </Link>
          <Link to="/wishlist" className="bo-me__stat">
            <span className="bo-me__stat-icon is-heart"><HeartIcon size={22} /></span>
            <strong>{liked ? liked.length : "–"}</strong>
            <span>{t("profile.statWishlist")}</span>
          </Link>
          <div className="bo-me__stat">
            <span className="bo-me__stat-icon is-gold">★</span>
            <strong>{authMember.memberPoints ?? 0}</strong>
            <span>{t("profile.points")}</span>
          </div>
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="bo-tabs bo-me__tabs" role="tablist" aria-label={t("profile.title")}>
          {(["profile", "security", "activity"] as Tab[]).map((key) => (
            <button key={key} type="button" role="tab" id={`me-tab-${key}`} aria-selected={tab === key} aria-controls={`me-panel-${key}`} onClick={() => goTab(key)}>
              {key === "profile" ? t("profile.tabProfile") : key === "security" ? t("profile.tabSecurity") : t("profile.tabActivity")}
            </button>
          ))}
        </div>

        {tab === "profile" ? (
          <form id="me-panel-profile" role="tabpanel" aria-labelledby="me-tab-profile" className="bo-me__panel" onSubmit={save} noValidate>
            {image ? <p className="bo-me__notice">{t("profile.newPhoto")}</p> : null}

            <fieldset className="bo-card bo-me__section">
              <legend>
                <span className="bo-me__section-title"><UserIcon size={20} />{t("profile.personal")}</span>
                <span className="bo-muted">{t("profile.personalSub")}</span>
              </legend>
              <div className="bo-form__grid">
                <Field id="me-nick" label={`${t("profile.nick")} *`} error={errors.memberNick} hint={t("auth.nickHint")} wide>
                  <input id="me-nick" className="bo-input" value={form.memberNick} onChange={field("memberNick")} maxLength={30} autoComplete="username" aria-invalid={!!errors.memberNick} />
                </Field>
                <Field id="me-desc" label={t("profile.desc")} error={errors.memberDesc} hint={t("profile.descCount", { count: form.memberDesc.length })} wide>
                  <textarea id="me-desc" className="bo-input bo-textarea" value={form.memberDesc} onChange={field("memberDesc")} maxLength={500} rows={4} aria-invalid={!!errors.memberDesc} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="bo-card bo-me__section">
              <legend>
                <span className="bo-me__section-title"><BoxIcon size={20} />{t("profile.contact")}</span>
                <span className="bo-muted">{t("profile.contactSub")}</span>
              </legend>
              <div className="bo-form__grid">
                <Field id="me-email" label={t("profile.email")} error={errors.memberEmail} wide>
                  <input id="me-email" className="bo-input" type="email" value={form.memberEmail} onChange={field("memberEmail")} maxLength={254} autoComplete="email" aria-invalid={!!errors.memberEmail} />
                  <span className="bo-email-status" aria-live="polite">
                    {!authMember.memberEmail ? (
                      <span className="is-warn">{t("verify.addEmail")}</span>
                    ) : authMember.memberEmailVerified ? (
                      <span className="is-ok"><CheckIcon size={14} />{t("verify.verified")}</span>
                    ) : (
                      <>
                        <span className="is-warn">{t("verify.notVerified")}</span>
                        <button type="button" onClick={resendVerification} disabled={resend.busy}>{t("verify.resend")}</button>
                        {resend.text ? <span className="bo-muted">{resend.text}</span> : null}
                      </>
                    )}
                  </span>
                </Field>
                <Field id="me-phone" label={t("profile.phone")} error={errors.memberPhone} hint={t("profile.phoneHint")}>
                  <input id="me-phone" className="bo-input" value={form.memberPhone} onChange={field("memberPhone")} maxLength={20} inputMode="tel" autoComplete="tel" aria-invalid={!!errors.memberPhone} />
                </Field>
                <Field id="me-address" label={t("profile.address")} error={errors.memberAddress} hint={t("profile.addressHint")}>
                  <input id="me-address" className="bo-input" value={form.memberAddress} onChange={field("memberAddress")} maxLength={200} autoComplete="street-address" aria-invalid={!!errors.memberAddress} />
                </Field>
              </div>
            </fieldset>

            <div className={`bo-me__savebar ${dirty || status ? "is-visible" : ""}`} role="region" aria-label={t("profile.save")}>
              <div className="bo-me__savebar-inner">
                {status ? (
                  <p className={status.kind === "ok" ? "bo-success" : "bo-alert"} role={status.kind === "ok" ? "status" : "alert"}>
                    {status.kind === "ok" ? <CheckIcon size={16} /> : null}
                    {status.text}
                  </p>
                ) : (
                  <span className="bo-me__unsaved">{t("profile.unsaved")}</span>
                )}
                <div className="bo-me__savebar-actions">
                  {dirty ? <button type="button" className="bo-btn bo-btn--ghost" onClick={discard} disabled={saving}>{t("profile.discard")}</button> : null}
                  <button type="submit" className="bo-btn bo-btn--primary" disabled={saving || !dirty}>{t("profile.save")}</button>
                </div>
              </div>
            </div>
          </form>
        ) : tab === "security" ? (
          <SecurityPanel member={authMember} />
        ) : (
          <div id="me-panel-activity" role="tabpanel" aria-labelledby="me-tab-activity" className="bo-me__panel bo-me__activity">
            <section className="bo-card bo-me__section">
              <div className="bo-me__section-head">
                <span className="bo-me__section-title"><BoxIcon size={20} />{t("profile.recentOrders")}</span>
                <Link to="/orders" className="bo-link-arrow">{t("profile.allOrders")}</Link>
              </div>
              {!orders ? (
                <div className="bo-skeleton" style={{ height: 120 }} />
              ) : orders.length === 0 ? (
                <p className="bo-muted">{t("profile.noOrders")}</p>
              ) : (
                <ul className="bo-me__orders">
                  {orders.map((order) => (
                    <li key={order._id}>
                      <div className="bo-me__order-covers" aria-hidden="true">
                        {order.orderItems.slice(0, 3).map((item) => {
                          const p = order.productData?.find((x) => x._id === item.productId);
                          return <BookCover key={item._id} id={item.productId} title={p?.productName ?? ""} image={p?.productImages?.[0]} titleSize={9} />;
                        })}
                      </div>
                      <div className="bo-me__order-text">
                        <strong>{t("orders.order")} #{order._id.slice(-6).toUpperCase()}</strong>
                        <span className="bo-muted">{formatDate(order.createdAt, i18n.language)}</span>
                      </div>
                      <span className={`bo-pill is-${order.orderStatus.toLowerCase()}`}>{statusLabel(order.orderStatus)}</span>
                      <strong className="bo-me__order-total">{formatPrice(order.orderTotal)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bo-card bo-me__section">
              <div className="bo-me__section-head">
                <span className="bo-me__section-title"><HeartIcon size={20} />{t("profile.wishlistPreview")}</span>
                <Link to="/wishlist" className="bo-link-arrow">{t("common.seeAll")}</Link>
              </div>
              {!liked ? (
                <div className="bo-skeleton" style={{ height: 160 }} />
              ) : liked.length === 0 ? (
                <p className="bo-muted">{t("profile.noWishlist")}</p>
              ) : (
                <div className="bo-me__shelf">
                  {liked.slice(0, 6).map((book) => (
                    <Link key={book._id} to={`/products/${book._id}`} className="bo-me__shelf-book" title={book.productName}>
                      <BookCover id={book._id} title={book.productName} author={displayAuthor(book.productAuthor)} image={book.productImages?.[0]} titleSize={13} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ id, label, error, hint, wide, children }: { id: string; label: string; error?: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`bo-field ${wide ? "bo-field--wide" : ""} ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <small className="bo-field__error" role="alert">{error}</small> : hint ? <small className="bo-muted">{hint}</small> : null}
    </div>
  );
}

function SecurityPanel({ member }: { member: Member }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !next) return setStatus({ kind: "error", text: t("auth.required") });
    if (next.length < 8) return setStatus({ kind: "error", text: t("errors.weakPassword") });
    if (next !== repeat) return setStatus({ kind: "error", text: t("reset.mismatch") });
    setBusy(true);
    try {
      await new MemberService().changePassword(current, next);
      setCurrent("");
      setNext("");
      setRepeat("");
      setStatus({ kind: "ok", text: t("profile.passwordChanged") });
    } catch (err) {
      setStatus({ kind: "error", text: apiErrorText(err, t) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form id="me-panel-security" role="tabpanel" aria-labelledby="me-tab-security" className="bo-me__panel" onSubmit={submit} onInput={() => status && setStatus(null)} noValidate>
      <fieldset className="bo-card bo-me__section">
        <legend>
          <span className="bo-me__section-title">{t("profile.securityTitle")}</span>
          <span className="bo-muted">{t("profile.securitySub")}</span>
        </legend>
        <div className="bo-form__grid bo-me__password-grid">
          <Field id="me-pw-current" label={t("profile.currentPassword")} wide>
            <input id="me-pw-current" className="bo-input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" maxLength={72} />
          </Field>
          <Field id="me-pw-new" label={t("profile.newPassword")} hint={t("auth.passwordHint")}>
            <input id="me-pw-new" className="bo-input" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" maxLength={72} />
          </Field>
          <Field id="me-pw-repeat" label={t("profile.repeatPassword")}>
            <input id="me-pw-repeat" className="bo-input" type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" maxLength={72} />
          </Field>
        </div>
        <div className="bo-form__foot">
          {status ? (
            <p className={status.kind === "ok" ? "bo-success" : "bo-alert"} role={status.kind === "ok" ? "status" : "alert"}>
              {status.kind === "ok" ? <CheckIcon size={16} /> : null}
              {status.text}
            </p>
          ) : <span />}
          <button type="submit" className="bo-btn bo-btn--primary" disabled={busy}>{t("profile.changePassword")}</button>
        </div>
        <p className="bo-muted bo-me__reset-note">{member.memberEmail ? t("profile.emailForReset") : t("profile.noEmailForReset")}</p>
      </fieldset>
    </form>
  );
}
