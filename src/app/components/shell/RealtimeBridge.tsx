import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSocketEvent } from "../../context/SocketContext";
import { useGlobals } from "../../hooks/useGlobals";
import { orderNo } from "../../../lib/format";
import { useToast } from "./Toasts";

/**
 * App-wide reactions to server pushes: the library changed an order's status,
 * or answered a question. Pages that show the same data refresh themselves.
 */
export default function RealtimeBridge() {
  const { t } = useTranslation();
  const toast = useToast();
  const location = useLocation();
  const { setOrderBuilder } = useGlobals();

  useSocketEvent<{ orderId: string; orderStatus: string; by: string }>("order:status", (p) => {
    setOrderBuilder(new Date()); // the orders page reloads on this
    if (p.by !== "LIBRARY") return;
    toast({
      title: t("live.orderTitle", { no: orderNo(p.orderId) }),
      text: t(`live.orderStatus.${p.orderStatus}`, { defaultValue: p.orderStatus }),
      link: location.pathname.startsWith("/orders") ? undefined : { to: "/orders", label: t("live.openOrders") },
    });
  });

  useSocketEvent<{ inquiryId: string; unread: number }>("inquiry:unread", (p) => {
    // already looking at that conversation: it shows the reply itself
    if (location.pathname === `/reception/${p.inquiryId}`) return;
    toast({ title: t("live.replyTitle"), text: t("live.replyText"), link: { to: `/reception/${p.inquiryId}`, label: t("live.openReply") } });
  });

  return null;
}
