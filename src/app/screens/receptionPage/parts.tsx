import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Inquiry, InquiryStatus } from "../../../lib/types/inquiry";
import { formatDate } from "../../../lib/format";

export function StatusPill({ status }: { status: InquiryStatus }) {
  const { t } = useTranslation();
  return <span className={`bo-istatus is-${status}`}>{t(`reception.status.${status}`)}</span>;
}

/** One conversation in "My messages" */
export function ThreadRow({ inquiry, keyParam }: { inquiry: Inquiry; keyParam?: string }) {
  const { t, i18n } = useTranslation();
  const last = inquiry.inquiryMessages[inquiry.inquiryMessages.length - 1];
  const href = `/reception/${inquiry._id}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}`;
  return (
    <li>
      <Link to={href} className={`bo-threads__row ${inquiry.inquiryReaderUnread ? "is-unread" : ""}`}>
        <span className="bo-threads__top">
          <strong>{t(`reception.topics.${inquiry.inquiryTopic}`)}</strong>
          {inquiry.inquiryReaderUnread ? <span className="bo-threads__new">{t("reception.unread")}</span> : <StatusPill status={inquiry.inquiryStatus} />}
        </span>
        {last ? (
          <span className="bo-threads__text">
            {last.messageFrom === "READER" ? `${t("reception.you")}: ` : ""}
            {last.messageText}
          </span>
        ) : null}
        <span className="bo-muted bo-threads__meta">
          {formatDate(inquiry.lastMessageAt, i18n.language)} · {t("reception.messages", { count: inquiry.inquiryMessages.length })}
        </span>
      </Link>
    </li>
  );
}
