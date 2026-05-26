import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { useHistory } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy";
import Card from "@mui/joy/Card";
import AspectRatio from "@mui/joy/AspectRatio";
import Typography from "@mui/joy/Typography";
import { People, Star, MenuBook, Favorite } from "@mui/icons-material";

import { useSelector } from "react-redux"; 
import { createSelector } from "reselect";
import { retrieveTopUsers } from "./selector";
import { serverApi } from "../../../lib/config";
import { Member } from "../../../lib/types/member";
import styled from "styled-components";

/** REDUX SLICE & SELECTOR */
const topUsersRetriever = createSelector(
  retrieveTopUsers,
  (topUsers) => ({topUsers})
);

const ActiveUsersWrapper = styled.div`
  &.active-users-frame {
    margin-top: 0;
    width: 100%;
    min-height: 600px;
    padding: 80px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
      z-index: 0;
    }

    & > * {
      position: relative;
      z-index: 1;
    }

    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      animation: fadeIn 0.8s ease-out;
    }

    .category-title {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 42px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.5px;
      text-align: center;
      color: #1a1a2e;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      position: relative;
      padding-bottom: 20px;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 4px;
        background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
        border-radius: 2px;
      }
    }

    .cards-frame {
      margin-top: 60px;
      position: relative;
      width: 100%;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      min-height: 350px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      gap: 30px;
      flex-wrap: nowrap;
    }

    .user-card {
      width: calc(25% - 23px);
      min-width: 280px;
      max-width: 320px;
      min-height: 380px;
      border-radius: 25px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ffffff;
      border: 2px solid rgba(102, 126, 234, 0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
      position: relative;
      animation: slideInUp 0.6s ease-out;
      animation-fill-mode: both;
      flex: 1 1 calc(25% - 23px);

      &:nth-child(1) {
        animation-delay: 0.1s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }

      &:nth-child(4) {
        animation-delay: 0.4s;
      }

      &:nth-child(5) {
        animation-delay: 0.5s;
      }

      &:nth-child(6) {
        animation-delay: 0.6s;
      }

      &:nth-child(7) {
        animation-delay: 0.7s;
      }

      &:nth-child(8) {
        animation-delay: 0.8s;
      }

      &:hover {
        transform: translateY(-15px) scale(1.05);
        box-shadow: 0 25px 60px rgba(102, 126, 234, 0.3);
        border-color: rgba(102, 126, 234, 0.4);

        .user-name {
          color: #667eea;
        }

        img {
          transform: scale(1.15);
        }

        .user-rank-badge {
          transform: scale(1.1) rotate(5deg);
        }

        .user-badge {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        }
      }

      img {
        width: 100%;
        height: 100%;
        display: flex;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
    }

    .user-rank-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 10;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      padding: 8px 14px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }

    .user-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.15) 100%);
      pointer-events: none;
      z-index: 1;
    }

    .user-name-box {
      width: 100%;
      padding: 25px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: linear-gradient(180deg, #ffffff 0%, #fafbfb 100%);
      border-top: 2px solid rgba(102, 126, 234, 0.1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, transparent, #667eea, transparent);
        border-radius: 0 0 3px 3px;
      }
    }

    .user-name {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      font-family: 'Poppins', sans-serif;
      text-align: center;
      transition: color 0.3s ease;
      letter-spacing: 0.3px;
    }

    .user-badge {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(102, 126, 234, 0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pagination-wrapper {
      margin-top: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 20px 0;
    }

    .no-data {
      width: 100%;
      height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-transform: capitalize;
      font-family: "Poppins", sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      line-height: 34px;
      color: #667eea;
      gap: 15px;

      &::before {
        content: '👥';
        font-size: 60px;
        opacity: 0.5;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1200px) {
      .user-card {
        width: calc(25% - 23px);
        flex: 1 1 calc(25% - 23px);
        min-width: 240px;
      }
    }

    @media (max-width: 960px) {
      padding: 60px 0;

      .category-title {
        font-size: 32px;
      }

      .cards-frame {
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .user-card {
        width: calc(50% - 10px);
        flex: 1 1 calc(50% - 10px);
        min-width: 250px;
        max-width: 300px;
      }
    }

    @media (max-width: 600px) {
      .category-title {
        font-size: 28px;
        flex-direction: column;
        gap: 10px;
      }

      .cards-frame {
        gap: 15px;
        flex-wrap: wrap;
      }

      .user-card {
        width: 100%;
        flex: 1 1 100%;
        min-width: 100%;
        max-width: 100%;
      }
    }
  }
`;

export default function ActiveUsers() {
  const {topUsers} = useSelector(topUsersRetriever);
  const history = useHistory();
  const safeTopUsers = Array.isArray(topUsers) ? topUsers : [];
  const displayedUsers = safeTopUsers.slice(0, 4);

  return (
    <div className="homepage">
      <ActiveUsersWrapper className="active-users-frame">
        <Container>
          <Stack className="main">
            <Box className="category-title">
              <People sx={{ fontSize: 40, mr: 2, color: '#667eea' }} />
              Active Readers
            </Box>

            <CssVarsProvider>
              <Stack
                direction="row"
                spacing={3}
                flexWrap="nowrap"
                justifyContent="center"
                alignItems="flex-start"
                className="cards-frame"
              >
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((member: Member, index: number) => {
                    const imagePath = `${serverApi}/${member.memberImage}`;
                    return (
                    <Card
                      key={member._id}
                      className="user-card"
                      variant="outlined"
                      sx={{ p: 0, position: 'relative', cursor: 'pointer' }}
                      onClick={() => history.push(`/other-member-page/${member._id}`)}
                    >
                      <Box className="user-rank-badge">
                        <Star sx={{ fontSize: 18, color: '#1a1a2e' }} />
                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>
                          #{index + 1}
                        </Typography>
                      </Box>
                      <AspectRatio ratio="1" 
                        sx={{ 
                          width: "100%",
                          borderTopLeftRadius: "25px",
                          borderTopRightRadius: "25px", 
                          overflow: "hidden",
                          position: 'relative'
                        }}
                      >
                        <img
                          src={imagePath}
                          alt={member.memberNick}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <Box className="user-overlay" />
                        <Box sx={{
                          position: 'absolute',
                          bottom: '15px',
                          left: '15px',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: 'rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <MenuBook sx={{ fontSize: 16, color: '#FFD700' }} />
                          <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                            Top Reader
                          </Typography>
                        </Box>
                      </AspectRatio>
                      <Box className="user-name-box">
                        <Typography className="user-name" level="body-sm">
                          {member.memberNick}
                        </Typography>
                        <Box className="user-badge">
                          <Favorite sx={{ fontSize: 14, color: '#667eea' }} />
                          <Typography sx={{ fontSize: '13px', color: '#667eea', fontWeight: 600 }}>
                            Reader
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  );
               })
                ) : (
                  <Box className="no-data">Active readers are not available</Box>
                )}
              </Stack>
            </CssVarsProvider>
          </Stack>
        </Container>
      </ActiveUsersWrapper>
    </div>
  );
}
