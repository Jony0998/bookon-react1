import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { Box, Button, Stack, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import styled from "styled-components";
import { 
  Login as LoginIcon, 
  PersonAdd, 
  Person, 
  Phone, 
  Lock, 
  Close,
  MenuBook 
} from "@mui/icons-material";
import { T } from "../../../lib/types/common";
import { Messages } from "../../../lib/config";
import { LoginInput, MemberInput } from "../../../lib/types/member";
import MemberService from "../../services/MemberService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { useGlobals } from "../../hooks/useGlobals";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
    },
  },
  paper: {
    outline: "none",
  },
}));

const AuthModalWrapper = styled(Box)`
  position: relative;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 100vw;
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
  }
`;

const AuthImageSection = styled(Box)`
  width: 45%;
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 180px;
    padding: 25px 20px;
    
    .MuiTypography-h3 {
      font-size: 24px !important;
    }
    
    .MuiSvgIcon-root {
      font-size: 60px !important;
    }
  }
`;

const AuthFormSection = styled(Box)`
  width: 55%;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 20px;
    max-height: 70vh;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const TitleWrapper = styled(Box)`
  text-align: center;
  margin-bottom: 40px;
`;

const StyledTextField = styled(TextField)`
  width: 100%;
  margin-bottom: 20px;
  
  .MuiOutlinedInput-root {
    border-radius: 12px;
    background: #f8f8ff;
    transition: all 0.3s ease;
    padding-left: 0;
    
    &:hover {
      background: #ffffff;
    }
    
    &.Mui-focused {
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .MuiInputAdornment-root {
      margin-left: 14px;
      margin-right: 0;
    }
    
    .MuiInputBase-input {
      padding-left: 12px;
    }
    
    fieldset {
      border-color: rgba(102, 126, 234, 0.2);
      border-width: 2px;
    }
    
    &:hover fieldset {
      border-color: rgba(102, 126, 234, 0.4);
    }
    
    &.Mui-focused fieldset {
      border-color: #667eea;
    }
  }
  
  .MuiInputLabel-root {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    
    &.Mui-focused {
      color: #667eea;
    }
  }
  
  .MuiFormHelperText-root {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    margin-top: 6px;
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 16px;
  text-transform: none;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface AuthenticationModalProps {
  signupOpen: boolean;
  loginOpen: boolean;
  handleSignupClose: () => void;
  handleLoginClose: () => void;
}

export default function AuthenticationModal(props: AuthenticationModalProps) {
  const { signupOpen, loginOpen, handleSignupClose, handleLoginClose } = props;
  const classes = useStyles();
  const [memberNick, setMemberNick] = useState<string>("");
  const [memberPhone, setMemberPhone] = useState<string>("");
  const [memberPassword, setMemberPassword] = useState<string>("");
  const {setAuthMember} = useGlobals();

  /** HANDLERS **/
  
  const handleUsername = (e: T) => {
    setMemberNick(e.target.value);
  };

    const handlePhone = (e: T) => {
    setMemberPhone(e.target.value);
  };

    const handlePassword = (e: T) => {
    setMemberPassword(e.target.value);
  };

  const handlePasswordKeyDown = (e: T) => {
    if(e.key === "Enter" && signupOpen) {
      handleSignupRequest().then();
    } else if(e.key ==="Enter" && loginOpen) {
      handleLoginRequest().then();
    }
  }


  // Validation functions
  const validateUsername = (username: string): string | null => {
    if (username.trim() === "") {
      return Messages.error3;
    }
    if (username.length < 3) {
      return Messages.error6;
    }
    // Username can only contain letters, numbers, and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return Messages.error7;
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (phone.trim() === "") {
      return Messages.error3;
    }
    // Remove spaces, dashes, and plus signs for validation
    const cleanPhone = phone.replace(/[\s\-+]/g, "");
    // Check if phone contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
      return Messages.error8;
    }
    if (cleanPhone.length < 9) {
      return Messages.error9;
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password === "") {
      return Messages.error3;
    }
    if (password.length < 6) {
      return Messages.error10;
    }
    return null;
  };

  const handleSignupRequest = async () => {
    try {
      // Validate all fields before sending request
      const usernameError = validateUsername(memberNick);
      if (usernameError) {
        throw new Error(usernameError);
      }

      const phoneError = validatePhone(memberPhone);
      if (phoneError) {
        throw new Error(phoneError);
      }

      const passwordError = validatePassword(memberPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Clean phone number (remove spaces, dashes, plus signs)
      const cleanPhone = memberPhone.replace(/[\s\-+]/g, "");

      const signupInput: MemberInput = {
        memberNick: memberNick.trim(),
        memberPhone: cleanPhone,
        memberPassword: memberPassword,
      };

      const member = new MemberService();
      const result = await member.signup(signupInput);
      
      // Only close modal and save user if signup is successful
      setAuthMember(result);
      handleSignupClose();
      
      // Reset form fields after successful signup
      setMemberNick("");
      setMemberPhone("");
      setMemberPassword("");
    } catch(err: any) {
      console.log(err);
      // Don't close modal on error - let user see the error and fix it
      const errorMessage = err?.response?.data?.message || err?.message || Messages.error1;
      sweetErrorHandling(errorMessage).then();
    }
  };

  const handleLoginRequest = async () => {
    try {
      const isFulfill = memberNick !== "" && memberPassword !== "";
      if(!isFulfill) throw new Error(Messages.error3);

      const loginInput: LoginInput = {
        memberNick: memberNick.trim(),
        memberPassword: memberPassword,
      };

      const member = new MemberService();
      const result = await member.login(loginInput);
       
      // Only close modal and save user if login is successful
      setAuthMember(result);
      handleLoginClose();
      
      // Reset form fields after successful login
      setMemberNick("");
      setMemberPassword("");
    } catch(err: any) {
      console.log(err);
      // Don't close modal on error - let user see the error and fix it
      const errorMessage = err?.response?.data?.message || err?.message || Messages.error1;
      sweetErrorHandling(errorMessage).then();
    }
  };



  return (
    <div>
      {/* Signup Modal */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={signupOpen}
        onClose={handleSignupClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={signupOpen}>
          <AuthModalWrapper className={classes.paper}>
            <CloseButton onClick={handleSignupClose} size="small">
              <Close />
            </CloseButton>
            
            <AuthImageSection>
              <MenuBook sx={{ fontSize: 100, color: '#fff', mb: 3, opacity: 0.9 }} />
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  mb: 2,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  textAlign: 'center'
                }}
              >
                Join BookOn
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  textAlign: 'center',
                  fontSize: '16px',
                  maxWidth: '300px'
                }}
              >
                Start your reading journey today. Discover thousands of books and expand your knowledge.
              </Typography>
            </AuthImageSection>

            <AuthFormSection>
              <TitleWrapper>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1a1a2e',
                    mb: 1,
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}
                >
                  Create Account
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: '#666', fontSize: '14px' }}
                >
                  Sign up to get started
                </Typography>
              </TitleWrapper>

              <StyledTextField
                id="signup-username"
                label="Username"
                variant="outlined"
                value={memberNick}
                onChange={handleUsername}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your username"
                helperText="3+ characters, letters, numbers, and underscores only"
                fullWidth
              />

              <StyledTextField
                id="signup-phone"
                label="Phone Number"
                variant="outlined"
                value={memberPhone}
                onChange={handlePhone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your phone number"
                helperText="9+ digits"
                fullWidth
              />

              <StyledTextField
                id="signup-password"
                label="Password"
                type="password"
                variant="outlined"
                value={memberPassword}
                onChange={handlePassword}
                onKeyDown={handlePasswordKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
                helperText="6+ characters"
                fullWidth
              />

              <SubmitButton
                variant="contained"
                onClick={handleSignupRequest}
                startIcon={<PersonAdd />}
              >
                Create Account
              </SubmitButton>
            </AuthFormSection>
          </AuthModalWrapper>
        </Fade>
      </Modal>

      {/* Login Modal */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={loginOpen}
        onClose={handleLoginClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={loginOpen}>
          <AuthModalWrapper className={classes.paper}>
            <CloseButton onClick={handleLoginClose} size="small">
              <Close />
            </CloseButton>
            
            <AuthImageSection>
              <MenuBook sx={{ fontSize: 100, color: '#fff', mb: 3, opacity: 0.9 }} />
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  mb: 2,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  textAlign: 'center'
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  textAlign: 'center',
                  fontSize: '16px',
                  maxWidth: '300px'
                }}
              >
                Continue your reading adventure. Access your favorite books and discover new ones.
              </Typography>
            </AuthImageSection>

            <AuthFormSection>
              <TitleWrapper>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1a1a2e',
                    mb: 1,
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}
                >
                  Sign In
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: '#666', fontSize: '14px' }}
                >
                  Enter your credentials to continue
                </Typography>
              </TitleWrapper>

              <StyledTextField
                id="login-username"
                label="Username"
                variant="outlined"
                value={memberNick}
                onChange={handleUsername}
                onKeyDown={handlePasswordKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your username"
                fullWidth
                sx={{ mb: 3 }}
              />

              <StyledTextField
                id="login-password"
                label="Password"
                type="password"
                variant="outlined"
                value={memberPassword}
                onChange={handlePassword}
                onKeyDown={handlePasswordKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
                fullWidth
                sx={{ mb: 3 }}
              />

              <SubmitButton
                variant="contained"
                onClick={handleLoginRequest}
                startIcon={<LoginIcon />}
              >
                Sign In
              </SubmitButton>
            </AuthFormSection>
          </AuthModalWrapper>
        </Fade>
      </Modal>
    </div>
  );
}
