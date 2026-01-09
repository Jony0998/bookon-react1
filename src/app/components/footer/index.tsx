import React from "react";
import { Box, Container, Stack, Typography, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import styled from "styled-components";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useGlobals } from "../../hooks/useGlobals";
import "../../../css/footer.css";

const FooterWrapper = styled.div`
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/img/banner.webp') center/cover;
    opacity: 0.15;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const FooterContent = styled(Container)`
  padding: 80px 20px 40px;
  position: relative;
`;

const LogoSection = styled(Box)`
  margin-bottom: 30px;
  
  img {
    filter: brightness(1.2);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const DescriptionText = styled(Typography)`
  color: #e0e0e0;
  line-height: 1.8;
  margin-top: 20px;
  font-size: 15px;
  max-width: 350px;
`;

const SocialIcons = styled(Box)`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  
  .social-icon {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: rgba(102, 126, 234, 0.8);
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  }
`;

const SectionTitle = styled(Typography)`
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 12px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const FooterLink = styled(Link)`
  color: #b0b0b0;
  text-decoration: none;
  font-size: 15px;
  margin-bottom: 12px;
  display: block;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
  
  &::before {
    content: '📖';
    margin-right: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    color: #fff;
    padding-left: 5px;
    transform: translateX(5px);
    
    &::before {
      opacity: 1;
    }
  }
`;

const ContactItem = styled(Box)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
  color: #b0b0b0;
  
  .icon {
    color: #667eea;
    margin-right: 12px;
    margin-top: 3px;
    font-size: 20px;
  }
  
  .text {
    flex: 1;
    font-size: 15px;
    line-height: 1.6;
    color: #e0e0e0;
  }
`;

const Divider = styled(Box)`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: 50px 0 30px;
`;

const Copyright = styled(Box)`
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 20px 0;
  
  .highlight {
    color: #667eea;
    font-weight: 600;
  }
`;

export default function Footer() {
  const { authMember } = useGlobals();

  return (
    <FooterWrapper>
      <FooterContent>
        <Stack 
          direction={{ xs: "column", md: "row" }} 
          spacing={{ xs: 4, md: 6 }}
          sx={{ mb: 4 }}
        >
          {/* Logo va Tavsif */}
          <Box sx={{ flex: { xs: "1", md: "0.4" } }}>
            <LogoSection>
              <img 
                width="120px" 
                src="/icons/books-logo.webp" 
                alt="BookOn logo" 
              />
            </LogoSection>
            <DescriptionText>
              BookOn - your most trusted online book store. 
              We offer you the best books at affordable prices. 
              Wide selection and quality service for book lovers.
            </DescriptionText>
            <SocialIcons>
              <IconButton className="social-icon" size="small">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton className="social-icon" size="small">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton className="social-icon" size="small">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton className="social-icon" size="small">
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </SocialIcons>
          </Box>

          {/* Bo'limlar */}
          <Box sx={{ flex: { xs: "1", md: "0.3" } }}>
            <SectionTitle>Sections</SectionTitle>
            <Stack spacing={1}>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/products">Books</FooterLink>
              {authMember && <FooterLink to="/orders">Orders</FooterLink>}
              {authMember && <FooterLink to="/member-page">My Page</FooterLink>}
              <FooterLink to="/help">Help</FooterLink>
            </Stack>
          </Box>

          {/* Aloqa */}
          <Box sx={{ flex: { xs: "1", md: "0.3" } }}>
            <SectionTitle>Contact Us</SectionTitle>
            <Stack>
              <ContactItem>
                <LocationOnIcon className="icon" />
                <Typography className="text">
                  Tashkent, Uzbekistan
                </Typography>
              </ContactItem>
              <ContactItem>
                <PhoneIcon className="icon" />
                <Typography className="text">
                  +998 90 123 45 67
                </Typography>
              </ContactItem>
              <ContactItem>
                <EmailIcon className="icon" />
                <Typography className="text">
                  info@bookon.uz
                </Typography>
              </ContactItem>
              <ContactItem>
                <AccessTimeIcon className="icon" />
                <Typography className="text">
                  24/7 Service Available
                </Typography>
              </ContactItem>
            </Stack>
          </Box>
        </Stack>

        <Divider />

        <Copyright>
          © {new Date().getFullYear()} <span className="highlight">BookOn</span>. 
          All rights reserved. | Reading - Knowledge, Knowledge - Power
        </Copyright>
      </FooterContent>
    </FooterWrapper>
  );
}
