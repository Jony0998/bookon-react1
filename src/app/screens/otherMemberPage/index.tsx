import React, { useEffect, useState } from "react";
import { Box, Container, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useParams, useHistory } from "react-router-dom";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import "../../../css/userPage.css";

export default function OtherMemberPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const history = useHistory();

  useEffect(() => {
    const service = new MemberService();
    service
      .getMemberById(memberId)
      .then((data) => setMember(data))
      .catch(() => history.push("/"));
  }, [memberId]);

  if (!member) return null;

  return (
    <div className={"user-page"}>
      <Container>
        <Stack className={"my-page-frame"} justifyContent="center">
          <Stack className={"my-page-right"} sx={{ ml: 0, width: "100%", maxWidth: 400, mx: "auto" }}>
            <Box className={"order-info-box"}>
              <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
                <div className={"order-user-img"}>
                  <img
                    src={
                      member.memberImage
                        ? `${serverApi}/${member.memberImage}`
                        : "/icons/default-user.svg"
                    }
                    className={"order-user-avatar"}
                    alt="Member avatar"
                  />
                  <div className={"order-user-icon-box"}>
                    <img
                      src={
                        member.memberType === MemberType.LIBRARY
                          ? "/icons/restaurant.svg"
                          : "/icons/user-badge.svg"
                      }
                      alt="User type"
                    />
                  </div>
                </div>
                <span className={"order-user-name"}>{member.memberNick}</span>
                <span className={"order-user-prof"}>{member.memberType}</span>
                <span className={"order-user-prof"}>
                  {member.memberAddress ? member.memberAddress : "no address"}
                </span>
              </Box>
              <Box className={"user-media-box"}>
                <FacebookIcon />
                <InstagramIcon />
                <TelegramIcon />
                <YouTubeIcon />
              </Box>
              <p className={"user-desc"}>
                {member.memberDesc ? member.memberDesc : "no description"}
              </p>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
