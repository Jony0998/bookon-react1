import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Drawer from "@mui/material/Drawer";
import { useCart } from "../../context/CartContext";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { FREE_SHIPPING_FROM, formatPrice, shippingFor } from "../../../lib/format";
import BookCover from "../ui/BookCover";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "../ui/Icons";

/** Slide-in cart: quantities, delivery progress, totals and checkout */
export default function CartDrawer({ openLogin }: { openLogin: () => void }) {
  const { t } = useTranslation();
  const { cartItems, isOpen, closeCart, onAdd, onRemove, onDelete, onDeleteAll } = useCart();
  const { authMember, setOrderBuilder } = useGlobals();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingFor(subtotal);
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);

  const checkout = async () => {
    if (!authMember) {
      closeCart();
      openLogin();
      return;
    }
    setPlacing(true);
    try {
      await new OrderService().createOrder(cartItems);
      onDeleteAll();
      setOrderBuilder(new Date());
      closeCart();
      navigate("/orders");
    } catch (err) {
      sweetErrorHandling(new Error(t("cart.orderFailed"))).then();
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeCart}
      slotProps={{ paper: { sx: { width: "min(440px, 100vw)", bgcolor: "var(--bg)", color: "var(--ink)" } } }}
    >
      <section className="bo-cart" aria-labelledby="bo-cart-title">
        <div className="bo-cart__head">
          <h2 id="bo-cart-title" className="bo-display">{t("cart.title")}</h2>
          <button type="button" className="bo-icon-btn" aria-label={t("common.close")} onClick={closeCart}>
            <CloseIcon />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="bo-cart__empty">
            <p className="bo-display">{t("cart.empty")}</p>
            <p className="bo-muted">{t("cart.emptyHint")}</p>
            <Link to="/products" className="bo-btn bo-btn--primary" onClick={closeCart}>{t("cart.browse")}</Link>
          </div>
        ) : (
          <>
            <div className="bo-cart__ship" aria-live="polite">
              <span><TruckIcon size={18} />{left > 0 ? t("cart.freeShippingLeft", { amount: formatPrice(left) }) : t("cart.freeShippingReached")}</span>
              <span className="bo-cart__bar"><span style={{ width: `${progress}%` }} /></span>
            </div>

            <ul className="bo-cart__list">
              {cartItems.map((item) => (
                <li key={item._id} className="bo-cart__item">
                  <Link to={`/products/${item._id}`} className="bo-cart__cover" onClick={closeCart} aria-label={item.name}>
                    <BookCover id={item._id} title={item.name} image={item.image} titleSize={11} />
                  </Link>
                  <div className="bo-cart__info">
                    <Link to={`/products/${item._id}`} onClick={closeCart} className="bo-cart__name">{item.name}</Link>
                    <span className="bo-muted">{formatPrice(item.price)}</span>
                    <div className="bo-cart__qty" role="group" aria-label={item.name}>
                      <button type="button" aria-label={t("cart.decrease")} onClick={() => onRemove(item)}><MinusIcon size={16} /></button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={t("cart.increase")} onClick={() => onAdd(item)}><PlusIcon size={16} /></button>
                    </div>
                  </div>
                  <div className="bo-cart__line">
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                    <button type="button" className="bo-cart__remove" aria-label={`${t("cart.remove")}: ${item.name}`} onClick={() => onDelete(item)}>
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="bo-cart__foot">
              <dl>
                <div><dt>{t("cart.subtotal")}</dt><dd>{formatPrice(subtotal)}</dd></div>
                <div><dt>{t("cart.shipping")}</dt><dd>{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</dd></div>
                <div className="bo-cart__total"><dt>{t("cart.total")}</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
              </dl>
              {!authMember ? <p className="bo-muted bo-cart__hint">{t("cart.loginFirst")}</p> : null}
              <button type="button" className="bo-btn bo-btn--primary bo-btn--lg" onClick={checkout} disabled={placing}>
                {authMember ? t("cart.checkout") : t("common.login")}
              </button>
              <button type="button" className="bo-cart__clear" onClick={onDeleteAll}>{t("cart.clear")}</button>
            </div>
          </>
        )}
      </section>
    </Drawer>
  );
}
