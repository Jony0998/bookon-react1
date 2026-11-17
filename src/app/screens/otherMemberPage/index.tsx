import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import "../../../css/account.css";

/** Public profile of another reader */
export default function OtherMemberPage() {
  const { t } = useTranslation();
  const { memberId = "" } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    new MemberService()
      .getMemberById(memberId)
      .then(setMember)
      .catch(() => navigate("/"));
  }, [memberId, navigate]);

  if (!member) return <main className="bo-page" />;

  return (
    <main className="bo-wrap bo-section bo-page bo-account">
      <div className="bo-card bo-profile bo-profile--public">
        <img
          className="bo-profile__avatar"
          src={member.memberImage ? `${serverApi}/${member.memberImage}` : "/icons/default-user.svg"}
          alt=""
          onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")}
        />
        <h1 className="bo-profile__nick">{member.memberNick}</h1>
        <span className="bo-tag">{member.memberType === MemberType.LIBRARY ? t("profile.library") : t("profile.reader")}</span>
        {member.memberPoints !== undefined ? (
          <div className="bo-profile__stats">
            <div><strong>{member.memberPoints}</strong><span className="bo-muted">{t("profile.points")}</span></div>
          </div>
        ) : null}
        <p className="bo-muted bo-profile__desc">{member.memberDesc || t("profile.noDesc")}</p>
      </div>
    </main>
  );
}
