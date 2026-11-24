import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../ui/Icons";

export interface Toast {
  id: number;
  title: string;
  text?: string;
  link?: { to: string; label: string };
}

const ToastContext = createContext<(toast: Omit<Toast, "id">) => void>(() => undefined);
export const useToast = () => useContext(ToastContext);

const LIFETIME_MS = 6000;
const MAX_VISIBLE = 3;

/** Small live notifications in the corner; announced politely to screen readers */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((x) => x.id !== id));
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { ...toast, id }].slice(-MAX_VISIBLE));
      timers.current.set(id, window.setTimeout(() => dismiss(id), LIFETIME_MS));
    },
    [dismiss]
  );

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="bo-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="bo-toast">
            <div className="bo-toast__body">
              <strong>{toast.title}</strong>
              {toast.text ? <span>{toast.text}</span> : null}
              {toast.link ? (
                <Link to={toast.link.to} className="bo-toast__link" onClick={() => dismiss(toast.id)}>{toast.link.label}</Link>
              ) : null}
            </div>
            <button type="button" className="bo-toast__close" aria-label={t("common.close")} onClick={() => dismiss(toast.id)}>
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
