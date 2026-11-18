import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import { useCart, toCartItem } from "../../context/CartContext";
import OrderService from "../../services/OrderService";
import { Order } from "../../../lib/types/order";
import { OrderStatus } from "../../../lib/enums/order.enum";
import { ProductStatus } from "../../../lib/enums/product.enum";
import { formatDate, formatPrice } from "../../../lib/format";
import { serverApi } from "../../../lib/config";
import BookCover from "../../components/ui/BookCover";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { BoxIcon, CheckIcon, RouteIcon, TruckIcon } from "../../components/ui/Icons";
import "../../../css/account.css";

const PAGE_SIZE = 10;
const TABS = [
  { status: OrderStatus.PAUSE, label: "orders.tabPending", empty: "orders.emptyPending" },
  { status: OrderStatus.PROCESS, label: "orders.tabProcess", empty: "orders.emptyProcess" },
  { status: OrderStatus.FINISH, label: "orders.tabFinish", empty: "orders.emptyFinish" },
] as const;
type TabStatus = (typeof TABS)[number]["status"];

type Pending = { order: Order; next: OrderStatus } | null;

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { authMember, orderBuilder, setOrderBuilder } = useGlobals();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabStatus>(OrderStatus.PAUSE);
  const [lists, setLists] = useState<Partial<Record<TabStatus, Order[]>>>({});
  const [more, setMore] = useState<Partial<Record<TabStatus, boolean>>>({});
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authMember) navigate("/");
  }, [authMember, navigate]);

  const load = useCallback(
    async (status: TabStatus, page: number) => {
      const list = await new OrderService().getMyOrders({ page, limit: PAGE_SIZE, orderStatus: status });
      setLists((current) => ({ ...current, [status]: page === 1 ? list : [...(current[status] || []), ...list] }));
      setMore((current) => ({ ...current, [status]: list.length === PAGE_SIZE }));
    },
    []
  );

  // Reload every tab when an order is created or changes status
  useEffect(() => {
    if (!authMember) return;
    TABS.forEach(({ status }) => load(status, 1).catch(() => setError(t("common.loadError"))));
  }, [authMember, orderBuilder, load, t]);

  const runUpdate = async () => {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      await new OrderService().updateOrder({ orderId: pending.order._id, orderStatus: pending.next });
      if (pending.next === OrderStatus.PROCESS) setTab(OrderStatus.PROCESS);
      if (pending.next === OrderStatus.FINISH) setTab(OrderStatus.FINISH);
      setOrderBuilder(new Date());
      setPending(null);
    } catch {
      setError(t("orders.failed"));
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  if (!authMember) return null;
  const current = lists[tab];
  const activeTab = TABS.find((x) => x.status === tab)!;

  const ask = pending
    ? pending.next === OrderStatus.DELETE
      ? { message: t("orders.cancelAsk"), label: t("orders.cancel"), danger: true }
      : pending.next === OrderStatus.PROCESS
      ? { message: t("orders.confirmAsk"), label: t("orders.confirm"), danger: false }
      : { message: t("orders.receivedAsk"), label: t("orders.received"), danger: false }
    : null;

  return (
    <main className="bo-wrap bo-section bo-page bo-account">
      <h1 className="bo-section-title">{t("orders.title")}</h1>
      <p className="bo-muted bo-section__sub" style={{ marginBottom: 28 }}>{t("orders.sub")}</p>

      <div className="bo-account__grid">
        <div className="bo-account__main">
          <div className="bo-tabs" role="tablist" aria-label={t("orders.title")}>
            {TABS.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                role="tab"
                id={`tab-${status}`}
                aria-selected={tab === status}
                aria-controls="orders-panel"
                onClick={() => setTab(status)}
              >
                {t(label)}
                {lists[status]?.length ? <span className="bo-tabs__count">{lists[status]!.length}{more[status] ? "+" : ""}</span> : null}
              </button>
            ))}
          </div>

          {error ? <p className="bo-alert" role="alert">{error}</p> : null}

          <div id="orders-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="bo-orders">
            {!current ? (
              Array.from({ length: 2 }, (_, i) => <div key={i} className="bo-skeleton" style={{ height: 220, borderRadius: 24 }} />)
            ) : current.length === 0 ? (
              <div className="bo-page-message bo-page-message--inline">
                <span className="bo-page-message__icon" style={{ color: "var(--accent)" }}><BoxIcon size={36} /></span>
                <p className="bo-muted">{t(activeTab.empty)}</p>
                <Link to="/products" className="bo-btn bo-btn--primary">{t("cart.browse")}</Link>
              </div>
            ) : (
              current.map((order) => (
                <OrderCard key={order._id} order={order} lang={i18n.language} onAction={(next) => setPending({ order, next })} />
              ))
            )}
            {current && more[tab] ? (
              <button type="button" className="bo-btn bo-btn--ghost" style={{ alignSelf: "center" }} onClick={() => load(tab, Math.ceil(current.length / PAGE_SIZE) + 1)}>
                {t("catalog.loadMore")}
              </button>
            ) : null}
          </div>
        </div>

        <aside className="bo-account__side">
          <div className="bo-card bo-side-card">
            <div className="bo-side-card__member">
              <img
                src={authMember.memberImage ? `${serverApi}/${authMember.memberImage}` : "/icons/default-user.svg"}
                alt=""
                onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")}
              />
              <div>
                <strong>{authMember.memberNick}</strong>
                <span className="bo-muted">{t("home.points", { count: authMember.memberPoints ?? 0 })}</span>
              </div>
            </div>
            <div className="bo-side-card__row">
              <span className="bo-muted">{t("orders.address")}</span>
              <span>{authMember.memberAddress || t("orders.noAddress")}</span>
              <Link to="/member-page" className="bo-link-arrow" style={{ minHeight: 32 }}>{t("orders.editAddress")}</Link>
            </div>
            <p className="bo-muted bo-side-card__hint">{t("orders.pointsHint")}</p>
          </div>
          <div className="bo-card bo-side-card">
            <h2 className="bo-side-card__title"><TruckIcon size={20} />{t("orders.payTitle")}</h2>
            <p className="bo-muted" style={{ margin: 0, lineHeight: 1.6 }}>{t("orders.payText")}</p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={!!pending}
        message={ask?.message ?? ""}
        confirmLabel={ask?.label ?? ""}
        danger={ask?.danger}
        busy={busy}
        onConfirm={runUpdate}
        onClose={() => setPending(null)}
      />
    </main>
  );
}

function OrderCard({ order, lang, onAction }: { order: Order; lang: string; onAction: (next: OrderStatus) => void }) {
  const { t } = useTranslation();
  const { addProduct, openCart } = useCart();
  const step = order.orderStatus === OrderStatus.PAUSE ? 0 : order.orderStatus === OrderStatus.PROCESS ? 1 : 2;
  const steps = [t("orders.stepPending"), t("orders.stepProcess"), t("orders.stepFinish")];
  const products = order.productData || [];

  const reorder = () => {
    order.orderItems.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (product && product.productStatus === ProductStatus.PROCESS && product.productLeftCount > 0) {
        addProduct(product, item.itemQuantity);
      }
    });
    openCart();
  };
  const canReorder = order.orderItems.some((item) => {
    const product = products.find((p) => p._id === item.productId);
    return product && product.productStatus === ProductStatus.PROCESS && product.productLeftCount > 0;
  });

  return (
    <article className="bo-card bo-order">
      <header className="bo-order__head">
        <div>
          <strong>{t("orders.order")} #{order._id.slice(-6).toUpperCase()}</strong>
          <span className="bo-muted">{formatDate(order.createdAt, lang)}</span>
        </div>
        <ol className="bo-steps" aria-label={steps[step]}>
          {steps.map((label, i) => (
            <li key={label} className={i <= step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <span className="bo-steps__dot">{i < step ? <CheckIcon size={12} /> : i === 1 ? <RouteIcon size={12} /> : null}</span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      <ul className="bo-order__items">
        {order.orderItems.map((item) => {
          const product = products.find((p) => p._id === item.productId);
          const name = product?.productName ?? t("orders.unavailable");
          return (
            <li key={item._id}>
              {product ? (
                <Link to={`/products/${product._id}`} className="bo-order__cover" aria-label={name}>
                  <BookCover id={product._id} title={name} image={product.productImages?.[0]} titleSize={9} />
                </Link>
              ) : (
                <span className="bo-order__cover"><BookCover id={item.productId} title={name} titleSize={9} /></span>
              )}
              <span className="bo-order__name">{name}</span>
              <span className="bo-muted">{formatPrice(item.itemPrice)} × {item.itemQuantity}</span>
              <strong>{formatPrice(item.itemPrice * item.itemQuantity)}</strong>
            </li>
          );
        })}
      </ul>

      {order.orderAddress || order.orderPhone ? (
        <p className="bo-order__delivery">
          <TruckIcon size={16} />
          <span>{[order.orderAddress, order.orderPhone].filter(Boolean).join(" · ")}</span>
          {order.orderNote ? <em>“{order.orderNote}”</em> : null}
        </p>
      ) : null}

      <footer className="bo-order__foot">
        <dl>
          <div><dt>{t("orders.books")}</dt><dd>{formatPrice(order.orderTotal - order.orderDelivery)}</dd></div>
          <div><dt>{t("orders.shipping")}</dt><dd>{order.orderDelivery ? formatPrice(order.orderDelivery) : t("cart.free")}</dd></div>
          <div className="is-total"><dt>{t("orders.total")}</dt><dd>{formatPrice(order.orderTotal)}</dd></div>
        </dl>
        <div className="bo-order__actions">
          {/* Confirming is the library's job now; the reader can only cancel while pending */}
          {order.orderStatus === OrderStatus.PAUSE ? (
            <button type="button" className="bo-btn bo-btn--ghost" onClick={() => onAction(OrderStatus.DELETE)}>{t("orders.cancel")}</button>
          ) : order.orderStatus === OrderStatus.PROCESS ? (
            <button type="button" className="bo-btn bo-btn--primary" onClick={() => onAction(OrderStatus.FINISH)}>{t("orders.received")}</button>
          ) : canReorder ? (
            <button type="button" className="bo-btn bo-btn--ghost" onClick={reorder}>{t("orders.reorder")}</button>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
