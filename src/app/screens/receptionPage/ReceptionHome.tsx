import React, { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import InquiryService, { rememberInquiry, savedInquiries, threadLink } from "../../services/InquiryService";
import MemberService from "../../services/MemberService";
import OrderService from "../../services/OrderService";
import { INQUIRY_TOPICS, Inquiry, InquiryTopic, MESSAGE_MAX, MESSAGE_MIN } from "../../../lib/types/inquiry";
import { Member } from "../../../lib/types/member";
import { Order } from "../../../lib/types/order";
import { OrderStatus } from "../../../lib/enums/order.enum";
import { apiErrorText } from "../../../lib/apiError";
import { formatDate, formatPrice, orderNo, realPhone } from "../../../lib/format";
import { GirihPattern } from "../../components/ui/Girih";
import { ChatIcon, CheckIcon, HelpIcon, LinkIcon, PhoneIcon, PinIcon, SendIcon } from "../../components/ui/Icons";
import { ThreadRow } from "./parts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const cleanPhone = (value: string) => value.replace(/[\s()-]/g, "");

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

export default function ReceptionHome() {
  const { t, i18n } = useTranslation();
  const { authMember } = useGlobals();
  const [params] = useSearchParams();

  const initialTopic = INQUIRY_TOPICS.find((x) => x === params.get("topic")) ?? "BOOK";
  const [topic, setTopic] = useState<InquiryTopic>(initialTopic);
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ inquiry: Inquiry; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [library, setLibrary] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mine, setMine] = useState<{ inquiry: Inquiry; key?: string }[]>([]);

  useEffect(() => {
    new MemberService().getLibrary().then(setLibrary).catch(() => setLibrary(null));
  }, []);

  // A reader's own orders, so a question can point at one
  useEffect(() => {
    if (!authMember) {
      setOrders([]);
      return;
    }
    const service = new OrderService();
    Promise.all(
      [OrderStatus.PAUSE, OrderStatus.PROCESS, OrderStatus.FINISH].map((orderStatus) =>
        service.getMyOrders({ page: 1, limit: 5, orderStatus }).catch(() => [] as Order[])
      )
    ).then((lists) => setOrders(lists.flat().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))));
  }, [authMember]);

  // Conversations: from the account when signed in, otherwise the links this browser kept
  useEffect(() => {
    const service = new InquiryService();
    if (authMember) {
      service.getMine().then((list) => setMine(list.map((inquiry) => ({ inquiry })))).catch(() => setMine([]));
      return;
    }
    Promise.all(
      savedInquiries().slice(0, 8).map((s) => service.getOne(s.id, s.key).then((inquiry) => ({ inquiry, key: s.key })).catch(() => null))
    ).then((list) => setMine(list.filter((x): x is { inquiry: Inquiry; key: string } => !!x)));
  }, [authMember, sent]);

  const phoneShown = realPhone(library?.memberPhone);
  const address = library?.memberAddress?.trim() ?? "";
  const needEmail = !authMember || !authMember.memberEmail;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!authMember && (name.trim().length < 2 || name.trim().length > 60)) next.name = t("errors.invalidName");
    if ((!authMember && !EMAIL_RE.test(email.trim())) || (email.trim() && !EMAIL_RE.test(email.trim()))) next.email = t("errors.invalidEmail");
    if (phone.trim() && !PHONE_RE.test(cleanPhone(phone))) next.phone = t("errors.invalidPhone");
    if (message.trim().length < MESSAGE_MIN || message.trim().length > MESSAGE_MAX) next.message = t("errors.invalidMessage");
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const result = await new InquiryService().create({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        topic,
        orderId: topic === "ORDER" && orderId ? orderId : undefined,
        message: message.trim(),
        lang: i18n.language,
        website,
      });
      rememberInquiry({ id: result.inquiry._id, key: result.key, createdAt: result.inquiry.createdAt });
      setSent(result);
      setMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFailure(apiErrorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(threadLink(sent.inquiry._id, sent.key));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link stays visible to copy by hand */
    }
  };

  const clear = (field: keyof Errors) => setErrors((x) => ({ ...x, [field]: undefined }));

  return (
    <main className="bo-page bo-account bo-reception">
      <section className="bo-help-hero">
        <GirihPattern className="bo-girih-bg" style={{ inset: 0 }} />
        <div className="bo-wrap" style={{ position: "relative" }}>
          <span className="bo-eyebrow"><span className="bo-eyebrow__dot" />{t("reception.eyebrow")}</span>
          <h1 className="bo-section-title">{t("reception.title")}</h1>
          <p className="bo-muted bo-section__sub bo-reception__sub">{t("reception.sub")}</p>
        </div>
      </section>

      <div className="bo-wrap bo-section bo-reception__grid">
        <section className="bo-card bo-me__section bo-reception__main" aria-labelledby="rc-form-title">
          {sent ? (
            <div className="bo-reception__sent" role="status">
              <span className="bo-auth__check"><CheckIcon size={34} /></span>
              <h2 className="bo-reception__title" id="rc-form-title">{t("reception.sentTitle")}</h2>
              <p className="bo-muted">
                {t("reception.sentText")} {sent.inquiry.inquiryEmail ? t("reception.sentMail", { email: sent.inquiry.inquiryEmail }) : null}
              </p>
              {!authMember ? (
                <div className="bo-reception__link">
                  <span>{t("reception.guestLink")}</span>
                  <code>{threadLink(sent.inquiry._id, sent.key)}</code>
                  <button type="button" className="bo-btn bo-btn--ghost" onClick={copyLink}>
                    {copied ? <CheckIcon size={18} /> : <LinkIcon size={18} />} {copied ? t("reception.copied") : t("reception.copy")}
                  </button>
                  <small className="bo-muted">{t("reception.guestLinkHint")}</small>
                </div>
              ) : null}
              <div className="bo-page-message__actions">
                <Link to={`/reception/${sent.inquiry._id}?key=${encodeURIComponent(sent.key)}`} className="bo-btn bo-btn--primary">{t("reception.openThread")}</Link>
                <button type="button" className="bo-btn bo-btn--ghost" onClick={() => setSent(null)}>{t("reception.another")}</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="bo-reception__form">
              <h2 className="bo-reception__title" id="rc-form-title"><ChatIcon size={22} />{t("reception.formTitle")}</h2>

              <fieldset className="bo-reception__topics">
                <legend>{t("reception.topic")}</legend>
                <div className="bo-chips">
                  {INQUIRY_TOPICS.map((key) => (
                    <button key={key} type="button" className="bo-chip" aria-pressed={topic === key} onClick={() => setTopic(key)}>
                      {t(`reception.topics.${key}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              {topic === "ORDER" && orders.length ? (
                <div className="bo-field">
                  <label htmlFor="rc-order">{t("reception.order")}</label>
                  <select id="rc-order" className="bo-input" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                    <option value="">{t("reception.orderNone")}</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        {orderNo(o._id)} · {formatDate(o.createdAt, i18n.language)} · {formatPrice(o.orderTotal)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {authMember ? (
                <p className="bo-reception__as">{t("reception.asMember", { nick: authMember.memberNick })}</p>
              ) : null}

              <div className="bo-form__grid">
                {!authMember ? (
                  <div className={`bo-field ${errors.name ? "has-error" : ""}`}>
                    <label htmlFor="rc-name">{t("reception.name")} *</label>
                    <input id="rc-name" className="bo-input" value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} autoComplete="name" maxLength={60} aria-invalid={!!errors.name} />
                    {errors.name ? <small className="bo-field__error" role="alert">{errors.name}</small> : null}
                  </div>
                ) : null}
                {needEmail ? (
                  <div className={`bo-field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="rc-email">{t("reception.email")}{authMember ? "" : " *"}</label>
                    <input id="rc-email" className="bo-input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); clear("email"); }} autoComplete="email" maxLength={254} aria-invalid={!!errors.email} />
                    {errors.email ? <small className="bo-field__error" role="alert">{errors.email}</small> : <small className="bo-muted">{t("reception.emailHint")}</small>}
                  </div>
                ) : null}
                <div className={`bo-field ${errors.phone ? "has-error" : ""}`}>
                  <label htmlFor="rc-phone">{t("reception.phone")}</label>
                  <input id="rc-phone" className="bo-input" value={phone} onChange={(e) => { setPhone(e.target.value); clear("phone"); }} inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" maxLength={20} aria-invalid={!!errors.phone} />
                  {errors.phone ? <small className="bo-field__error" role="alert">{errors.phone}</small> : <small className="bo-muted">{t("reception.phoneHint")}</small>}
                </div>
                <div className={`bo-field bo-field--wide ${errors.message ? "has-error" : ""}`}>
                  <label htmlFor="rc-message">{t("reception.message")} *</label>
                  <textarea id="rc-message" className="bo-input bo-textarea" rows={6} value={message} onChange={(e) => { setMessage(e.target.value); clear("message"); }} placeholder={t("reception.messagePlaceholder")} maxLength={MESSAGE_MAX} aria-invalid={!!errors.message} />
                  <span className="bo-reception__count">
                    {errors.message ? <small className="bo-field__error" role="alert">{errors.message}</small> : <span />}
                    <small className="bo-muted">{message.length}/{MESSAGE_MAX}</small>
                  </span>
                </div>
              </div>

              {/* Hidden from people; bots that fill every field get refused */}
              <div className="bo-hp" aria-hidden="true">
                <label htmlFor="rc-website">Website</label>
                <input id="rc-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <div className="bo-form__foot">
                {failure ? <p className="bo-alert" role="alert">{failure}</p> : <span />}
                <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy}>
                  <SendIcon size={18} /> {busy ? t("reception.sending") : t("reception.send")}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="bo-account__side">
          {mine.length || authMember ? (
            <section className="bo-card bo-side-card" aria-labelledby="rc-mine">
              <h2 className="bo-side-card__title" id="rc-mine"><ChatIcon size={20} />{t("reception.mineTitle")}</h2>
              {mine.length ? (
                <ul className="bo-threads">
                  {mine.map(({ inquiry, key }) => <ThreadRow key={inquiry._id} inquiry={inquiry} keyParam={key} />)}
                </ul>
              ) : (
                <p className="bo-muted bo-side-card__hint">{t("reception.mineEmpty")}</p>
              )}
            </section>
          ) : null}

          {phoneShown || address ? (
            <section className="bo-card bo-side-card" aria-labelledby="rc-contact">
              <h2 className="bo-side-card__title" id="rc-contact"><PhoneIcon size={20} />{t("reception.contactTitle")}</h2>
              {phoneShown ? (
                <div className="bo-side-card__row">
                  <span className="bo-muted">{t("reception.phoneLabel")}</span>
                  <a className="bo-reception__contact" href={`tel:${phoneShown.replace(/[^\d+]/g, "")}`}>{phoneShown}</a>
                </div>
              ) : null}
              {address ? (
                <div className="bo-side-card__row">
                  <span className="bo-muted">{t("reception.addressLabel")}</span>
                  <span className="bo-reception__contact"><PinIcon size={16} /> {address}</span>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="bo-card bo-side-card" aria-labelledby="rc-faq">
            <h2 className="bo-side-card__title" id="rc-faq"><HelpIcon size={20} />{t("reception.faqTitle")}</h2>
            <p className="bo-muted bo-side-card__hint">{t("reception.faqText")}</p>
            <Link to="/help" className="bo-btn bo-btn--ghost">{t("reception.faqLink")}</Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
