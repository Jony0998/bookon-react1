import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import MemberService from "../../services/MemberService";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import { BoxIcon, CheckIcon, HeartIcon, HelpIcon } from "../../components/ui/Icons";
import { formatDate } from "../../../lib/format";
import "../../../css/account.css";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE = 5 * 1024 * 1024;

export default function UserPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { authMember, setAuthMember } = useGlobals();
  const [form, setForm] = useState({ memberNick: "", memberPhone: "", memberAddress: "", memberDesc: "" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authMember) {
      navigate("/");
      return;
    }
    setForm({
      memberNick: authMember.memberNick ?? "",
      memberPhone: authMember.memberPhone ?? "",
      memberAddress: authMember.memberAddress ?? "",
      memberDesc: authMember.memberDesc ?? "",
    });
  }, [authMember, navigate]);

  // Free the object URL of a replaced preview
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  if (!authMember) return null;

  const avatar = preview || (authMember.memberImage ? `${serverApi}/${authMember.memberImage}` : "/icons/default-user.svg");
  const field = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    setStatus(null);
  };

  const pickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE) {
      setStatus({ kind: "error", text: t("profile.badImage") });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.memberNick.trim() || !form.memberPhone.trim()) {
      setStatus({ kind: "error", text: t("profile.required") });
      return;
    }
    setSaving(true);
    try {
      const member = await new MemberService().updateMember({
        memberNick: form.memberNick.trim(),
        memberPhone: form.memberPhone.trim(),
        memberAddress: form.memberAddress.trim(),
        memberDesc: form.memberDesc.trim(),
        memberImage: image ?? undefined,
      });
      setAuthMember(member);
      setImage(null);
      setPreview("");
      setStatus({ kind: "ok", text: t("profile.saved") });
    } catch (err: any) {
      setStatus({ kind: "error", text: err?.response?.data?.message || t("orders.failed") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bo-wrap bo-section bo-page bo-account">
      <h1 className="bo-section-title" style={{ marginBottom: 28 }}>{t("profile.title")}</h1>
      <div className="bo-account__grid bo-account__grid--profile">
        <aside className="bo-account__side">
          <div className="bo-card bo-profile">
            <img className="bo-profile__avatar" src={avatar} alt="" onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")} />
            <strong className="bo-profile__nick">{authMember.memberNick}</strong>
            <span className="bo-tag">{authMember.memberType === MemberType.LIBRARY ? t("profile.library") : t("profile.reader")}</span>
            <div className="bo-profile__stats">
              <div><strong>{authMember.memberPoints ?? 0}</strong><span className="bo-muted">{t("profile.points")}</span></div>
            </div>
            <p className="bo-muted bo-profile__desc">{authMember.memberDesc || t("profile.noDesc")}</p>
            {authMember.createdAt ? <span className="bo-muted" style={{ fontSize: 13 }}>{t("profile.since", { date: formatDate(authMember.createdAt, i18n.language) })}</span> : null}
          </div>
          <nav className="bo-card bo-side-card bo-quick" aria-label={t("profile.quick")}>
            <Link to="/orders"><BoxIcon size={18} />{t("common.orders")}</Link>
            <Link to="/wishlist"><HeartIcon size={18} />{t("common.wishlist")}</Link>
            <Link to="/help"><HelpIcon size={18} />{t("common.help")}</Link>
          </nav>
        </aside>

        <form className="bo-card bo-form" onSubmit={save} noValidate>
          <h2 className="bo-side-card__title">{t("profile.edit")}</h2>

          <div className="bo-form__photo">
            <img src={avatar} alt="" onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")} />
            <div>
              <label className="bo-btn bo-btn--ghost">
                {t("profile.changePhoto")}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickImage} />
              </label>
              <p className="bo-muted">{t("profile.photoHint")}</p>
            </div>
          </div>

          <div className="bo-form__grid">
            <label className="bo-field bo-field--wide">
              <span>{t("profile.nick")} *</span>
              <input className="bo-input" value={form.memberNick} onChange={field("memberNick")} maxLength={40} required autoComplete="username" />
            </label>
            <label className="bo-field">
              <span>{t("profile.phone")} *</span>
              <input className="bo-input" value={form.memberPhone} onChange={field("memberPhone")} maxLength={20} inputMode="tel" required autoComplete="tel" />
            </label>
            <label className="bo-field">
              <span>{t("profile.address")}</span>
              <input className="bo-input" value={form.memberAddress} onChange={field("memberAddress")} maxLength={200} autoComplete="street-address" />
            </label>
            <label className="bo-field bo-field--wide">
              <span>{t("profile.desc")}</span>
              <textarea className="bo-input bo-textarea" value={form.memberDesc} onChange={field("memberDesc")} maxLength={500} rows={4} />
            </label>
          </div>

          <div className="bo-form__foot">
            {status ? (
              <p className={status.kind === "ok" ? "bo-success" : "bo-alert"} role={status.kind === "ok" ? "status" : "alert"}>
                {status.kind === "ok" ? <CheckIcon size={16} /> : null}
                {status.text}
              </p>
            ) : <span />}
            <button type="submit" className="bo-btn bo-btn--primary bo-btn--lg" disabled={saving}>{t("profile.save")}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
