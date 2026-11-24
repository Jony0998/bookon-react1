import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import InquiryService, { INQUIRY_READ_EVENT, rememberInquiry, savedKeyFor } from "../../services/InquiryService";
import { Inquiry, MESSAGE_MAX, MESSAGE_MIN } from "../../../lib/types/inquiry";
import { apiErrorText } from "../../../lib/apiError";
import { formatDate } from "../../../lib/format";
import { GirihMark } from "../../components/ui/Girih";
import { ChatIcon, SendIcon } from "../../components/ui/Icons";
import { StatusPill } from "./parts";
import { useSocket, useSocketConnected, useSocketEvent } from "../../context/SocketContext";

const REFRESH_MS = 30_000;

const time = (value: string, lang: string) => {
  const d = new Date(value);
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${formatDate(d, lang)}, ${hm}`;
};

export default function ThreadPage() {
  const { t, i18n } = useTranslation();
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const { authMember } = useGlobals();
  const key = params.get("key") || savedKeyFor(id) || undefined;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [missing, setMissing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const seenCount = useRef(-1);

  const load = useCallback(async () => {
    try {
      const data = await new InquiryService().getOne(id, key);
      // The server marked any new reply as read on this request: let the header recount
      if (seenCount.current !== data.inquiryMessages.length) window.dispatchEvent(new Event(INQUIRY_READ_EVENT));
      seenCount.current = data.inquiryMessages.length;
      setInquiry(data);
      setMissing(false);
      if (key) rememberInquiry({ id, key, createdAt: data.createdAt });
    } catch {
      setMissing(true);
    }
  }, [id, key, authMember]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  // ---- live: join this conversation's room; replies, typing and status are pushed
  const socket = useSocket();
  const live = useSocketConnected();
  const [libraryTyping, setLibraryTyping] = useState(false);
  const typingTimer = useRef<number>();
  const lastTypingSent = useRef(0);

  useEffect(() => {
    if (!socket || !live) return;
    socket.emit("inquiry:join", { id, key });
    return () => {
      socket.emit("inquiry:leave", { id });
    };
  }, [socket, live, id, key]);

  // Without a live connection, check for replies every 30 s (only while the tab is visible)
  useEffect(() => {
    if (live) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [live, load]);

  useSocketEvent<{ inquiryId: string; message: { _id: string } }>("inquiry:message", (p) => {
    if (p.inquiryId !== id) return;
    setLibraryTyping(false);
    // reload instead of appending: the server then also marks the reply as read
    if (!inquiry?.inquiryMessages.some((m) => m._id === p.message._id)) load();
  });
  useSocketEvent<{ inquiryId: string; from: string }>("inquiry:typing", (p) => {
    if (p.inquiryId !== id || p.from !== "LIBRARY") return;
    setLibraryTyping(true);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setLibraryTyping(false), 4000);
  });
  useSocketEvent<{ inquiryId: string; status: Inquiry["inquiryStatus"] }>("inquiry:status", (p) => {
    if (p.inquiryId === id) setInquiry((cur) => (cur ? { ...cur, inquiryStatus: p.status } : cur));
  });
  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  const notifyTyping = () => {
    const now = Date.now();
    if (!socket || !live || now - lastTypingSent.current < 1500) return;
    lastTypingSent.current = now;
    socket.emit("inquiry:typing", { id });
  };

  const count = inquiry?.inquiryMessages.length ?? 0;
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
  }, [count]);

  useEffect(() => {
    if (!inquiry) return;
    const previous = document.title;
    document.title = `${t(`reception.topics.${inquiry.inquiryTopic}`)} — ${t("reception.title")} — BookOn`;
    return () => {
      document.title = previous;
    };
  }, [inquiry, t]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const message = text.trim();
    if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
      setError(t("errors.invalidMessage"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      setInquiry(await new InquiryService().reply(id, message, key));
      setText("");
    } catch (err) {
      setError(apiErrorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  if (missing) {
    return (
      <main className="bo-wrap bo-page-message">
        <span className="bo-page-message__icon" style={{ color: "var(--accent)" }}><ChatIcon size={36} /></span>
        <h1 className="bo-section-title">{t("reception.title")}</h1>
        <p className="bo-muted">{t("reception.notFound")}</p>
        <div className="bo-page-message__actions">
          <Link to="/reception" className="bo-btn bo-btn--primary">{t("reception.formTitle")}</Link>
        </div>
      </main>
    );
  }

  if (!inquiry) return <main className="bo-wrap bo-section" style={{ minHeight: "60vh" }} aria-busy="true" />;

  const last = inquiry.inquiryMessages[inquiry.inquiryMessages.length - 1];

  return (
    <main className="bo-wrap bo-section bo-page bo-account bo-thread">
      <nav className="bo-crumbs" aria-label="breadcrumbs">
        <Link to="/">{t("common.home")}</Link>
        <span aria-hidden="true">/</span>
        <Link to="/reception">{t("reception.title")}</Link>
      </nav>

      <header className="bo-thread__head">
        <div>
          <h1 className="bo-section-title">{t(`reception.topics.${inquiry.inquiryTopic}`)}</h1>
          <p className="bo-muted">{formatDate(inquiry.createdAt, i18n.language)} · {inquiry.inquiryName}</p>
        </div>
        <div className="bo-thread__status">
          {live ? <span className="bo-live" title={t("reception.liveHint")}><i aria-hidden="true" />{t("reception.live")}</span> : null}
          <StatusPill status={inquiry.inquiryStatus} />
        </div>
      </header>

      <section className="bo-card bo-thread__card" aria-label={t("reception.mineTitle")}>
        <ol className="bo-thread__list" ref={listRef}>
          {inquiry.inquiryMessages.map((m) => {
            const fromLibrary = m.messageFrom === "LIBRARY";
            return (
              <li key={m._id} className={`bo-bubble ${fromLibrary ? "is-library" : "is-me"}`}>
                <span className="bo-bubble__who">
                  {fromLibrary ? <><GirihMark size={16} stroke={3} /> {t("reception.library")}</> : t("reception.you")}
                  <span className="bo-muted"> · {time(m.createdAt, i18n.language)}</span>
                </span>
                <p className="bo-bubble__text">{m.messageText}</p>
              </li>
            );
          })}
        </ol>

        {libraryTyping ? (
          <p className="bo-typing" aria-live="polite">
            <span className="bo-typing__dots" aria-hidden="true"><i /><i /><i /></span>
            {t("reception.typing")}
          </p>
        ) : null}

        {!libraryTyping && last?.messageFrom === "READER" && inquiry.inquiryStatus !== "CLOSED" ? (
          <p className="bo-thread__note">{t("reception.waitingNote")}</p>
        ) : null}
        {inquiry.inquiryStatus === "CLOSED" ? <p className="bo-thread__note">{t("reception.closedNote")}</p> : null}

        <form className="bo-thread__reply" onSubmit={send}>
          <label htmlFor="th-text" className="bo-sr-only">{t("reception.replyLabel")}</label>
          <textarea
            id="th-text"
            className="bo-input bo-textarea"
            rows={3}
            value={text}
            maxLength={MESSAGE_MAX}
            placeholder={t("reception.replyPlaceholder")}
            onChange={(e) => { setText(e.target.value); setError(""); notifyTyping(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
            }}
          />
          <div className="bo-thread__reply-foot">
            {error ? <p className="bo-alert" role="alert">{error}</p> : <small className="bo-muted">{t("reception.shortcut")}</small>}
            <button type="submit" className="bo-btn bo-btn--primary" disabled={busy || !text.trim()}>
              <SendIcon size={18} /> {t("reception.send")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
