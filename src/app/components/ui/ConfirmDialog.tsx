import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Themed replacement for window.confirm */
export default function ConfirmDialog({ open, message, confirmLabel, danger, busy, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      slotProps={{
        paper: { sx: { borderRadius: "24px", bgcolor: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)", maxWidth: 420 } },
      }}
    >
      <div className="bo-confirm">
        <p>{message}</p>
        <div className="bo-confirm__actions">
          <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose} disabled={busy}>{t("common.close")}</button>
          <button
            type="button"
            className={`bo-btn ${danger ? "bo-btn--danger" : "bo-btn--primary"}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
