import React, { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";
import { Order } from "../../../lib/types/order";
import { FREE_SHIPPING_FROM, formatPrice, shippingFor } from "../../../lib/format";
import { apiErrorText } from "../../../lib/apiError";
import BookCover from "../../components/ui/BookCover";
import { GirihMark } from "../../components/ui/Girih";
import { CartIcon, CheckIcon, TruckIcon } from "../../components/ui/Icons";
import "../../../css/account.css";
import "../../../css/profile.css";
import "../../../css/checkout.css";

const PHONE_RE = /^\+?\d{7,15}$/;
const cleanPhone = (value: string) => value.replace(/[\s()-]/g, "");

export default function CheckoutPage({ openLogin }: { openLogin: () => void }) {
  const { t } = useTranslation();
  const { cartItems, onDeleteAll, openCart } = useCart();
  const { authMember, setOrderBuilder } = useGlobals();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [save, setSave] = useState(true);
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  // Prefill from the profile; a free-text legacy phone is left for the reader to fix
  useEffect(() => {
    if (!authMember) return;
    setPhone((current) => current || (authMember.memberPhone && PHONE_RE.test(cleanPhone(authMember.memberPhone)) ? authMember.memberPhone : ""));
    setAddress((current) => current || authMember.memberAddress || "");
    setSave(!authMember.memberAddress || !authMember.memberPhone);
  }, [authMember]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingFor(subtotal);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const steps = (active: number) => (
    <ol className="bo-checkout__steps" aria-label={t("checkout.title")}>
      {[t("checkout.stepCart"), t("checkout.stepDelivery"), t("checkout.stepDone")].map((label, i) => (
        <li key={label} className={i <= active ? "is-done" : ""} aria-current={i === active ? "step" : undefined}>
          <span>{i < active ? <CheckIcon size={14} /> : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );

  if (placed) {
    return (
      <main className="bo-wrap bo-section bo-page bo-checkout">
        {steps(2)}
        <section className="bo-card bo-checkout__done" role="status">
          <span className="bo-auth__check"><CheckIcon size={36} /></span>
          <h1 className="bo-section-title">{t("checkout.doneTitle")}</h1>
          <p className="bo-muted">{t("checkout.doneText", { no: `#${placed._id.slice(-6).toUpperCase()}` })}</p>
          <ol className="bo-checkout__next">
            <li><GirihMark size={22} stroke={3} />{t("checkout.next1")}</li>
            <li><GirihMark size={22} stroke={3} />{t("checkout.next2", { phone: placed.orderPhone ?? phone })}</li>
            <li><GirihMark size={22} stroke={3} />{t("checkout.next3")}</li>
          </ol>
          <div className="bo-page-message__actions">
            <Link to="/orders" className="bo-btn bo-btn--primary bo-btn--lg">{t("checkout.toOrders")}</Link>
            <Link to="/products" className="bo-btn bo-btn--ghost bo-btn--lg">{t("checkout.continue")}</Link>
          </div>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="bo-wrap bo-page-message">
        <span className="bo-page-message__icon" style={{ color: "var(--accent)" }}><CartIcon size={36} /></span>
        <h1 className="bo-section-title">{t("checkout.emptyTitle")}</h1>
        <p className="bo-muted">{t("checkout.emptyText")}</p>
        <div className="bo-page-message__actions">
          <Link to="/products" className="bo-btn bo-btn--primary">{t("cart.browse")}</Link>
        </div>
      </main>
    );
  }

  if (!authMember) {
    return (
      <main className="bo-wrap bo-page-message">
        <span className="bo-page-message__icon" style={{ color: "var(--accent)" }}><CartIcon size={36} /></span>
        <h1 className="bo-section-title">{t("checkout.loginTitle")}</h1>
        <p className="bo-muted">{t("checkout.loginText")}</p>
        <div className="bo-page-message__actions">
          <button type="button" className="bo-btn bo-btn--primary" onClick={openLogin}>{t("common.login")}</button>
        </div>
      </main>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!PHONE_RE.test(cleanPhone(phone))) next.phone = t("errors.invalidPhone");
    if (address.trim().length < 5) next.address = t("errors.invalidAddress");
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const order = await new OrderService().createOrder(cartItems, { phone: phone.trim(), address: address.trim(), note: note.trim() }, save);
      onDeleteAll();
      setOrderBuilder(new Date());
      setPlaced(order);
      window.scrollTo(0, 0);
    } catch (err) {
      setFailure(apiErrorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="bo-wrap bo-section bo-page bo-account bo-checkout">
      {steps(1)}
      <h1 className="bo-section-title" style={{ marginBottom: 24 }}>{t("checkout.title")}</h1>

      <form className="bo-checkout__grid" onSubmit={submit} noValidate>
        <section className="bo-card bo-me__section bo-checkout__form" aria-labelledby="co-delivery">
          <div className="bo-checkout__head">
            <span className="bo-me__section-title" id="co-delivery"><TruckIcon size={20} />{t("checkout.deliveryTitle")}</span>
            <span className="bo-muted">{t("checkout.deliverySub")}</span>
          </div>

          <div className="bo-checkout__recipient">
            <span className="bo-muted">{t("checkout.recipient")}</span>
            <strong>{authMember.memberNick}</strong>
          </div>

          <div className="bo-form__grid">
            <div className={`bo-field ${errors.phone ? "has-error" : ""}`}>
              <label htmlFor="co-phone">{t("checkout.phone")} *</label>
              <input id="co-phone" className="bo-input" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: undefined })); }} inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" maxLength={20} aria-invalid={!!errors.phone} />
              {errors.phone ? <small className="bo-field__error" role="alert">{errors.phone}</small> : <small className="bo-muted">{t("checkout.phoneHint")}</small>}
            </div>
            <div className={`bo-field bo-field--wide ${errors.address ? "has-error" : ""}`}>
              <label htmlFor="co-address">{t("checkout.address")} *</label>
              <textarea id="co-address" className="bo-input bo-textarea" rows={2} value={address} onChange={(e) => { setAddress(e.target.value); setErrors((x) => ({ ...x, address: undefined })); }} autoComplete="street-address" placeholder={t("checkout.addressPlaceholder")} maxLength={200} aria-invalid={!!errors.address} />
              {errors.address ? <small className="bo-field__error" role="alert">{errors.address}</small> : <small className="bo-muted">{t("checkout.addressHint")}</small>}
            </div>
            <div className="bo-field bo-field--wide">
              <label htmlFor="co-note">{t("checkout.note")}</label>
              <input id="co-note" className="bo-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("checkout.notePlaceholder")} maxLength={300} />
            </div>
          </div>

          <label className="bo-checkout__save">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
            {t("checkout.saveToProfile")}
          </label>

          <div className="bo-checkout__pay">
            <strong>{t("checkout.payTitle")}</strong>
            <span className="bo-muted">{t("checkout.payText")}</span>
          </div>
        </section>

        <aside className="bo-card bo-me__section bo-checkout__summary" aria-labelledby="co-summary">
          <div className="bo-checkout__head bo-checkout__head--row">
            <span className="bo-me__section-title" id="co-summary">{t("checkout.summary")} · {count}</span>
            <button type="button" className="bo-auth__link" onClick={openCart}>{t("checkout.edit")}</button>
          </div>
          <ul className="bo-checkout__items">
            {cartItems.map((item) => (
              <li key={item._id}>
                <span className="bo-checkout__cover"><BookCover id={item._id} title={item.name} image={item.image} titleSize={9} /></span>
                <span className="bo-checkout__name">{item.name}<small className="bo-muted">{formatPrice(item.price)} × {item.quantity}</small></span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <dl className="bo-checkout__totals">
            <div><dt>{t("cart.subtotal")}</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>{t("cart.shipping")}</dt><dd>{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</dd></div>
            {shipping > 0 ? <p className="bo-muted bo-checkout__free">{t("cart.freeShippingLeft", { amount: formatPrice(FREE_SHIPPING_FROM - subtotal) })}</p> : null}
            <div className="is-total"><dt>{t("cart.total")}</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
          </dl>
          {failure ? <p className="bo-alert" role="alert">{failure}</p> : null}
          <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={busy} style={{ width: "100%" }}>
            {busy ? t("checkout.placing") : t("checkout.place")}
          </button>
        </aside>
      </form>
    </main>
  );
}
