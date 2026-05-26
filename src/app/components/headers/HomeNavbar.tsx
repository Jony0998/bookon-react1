import { Box, Button, Container, ListItemIcon, Menu, MenuItem, Stack } from "@mui/material";
import { NavLink } from "react-router-dom";
import Basket from "./Basket";
import React from "react";
import { CartItem } from "../../../lib/types/search";
import { useGlobals } from "../../hooks/useGlobals";
import { serverApi } from "../../../lib/config";
import { Logout, Login, PersonAdd, MenuBook } from "@mui/icons-material";

export interface HomeNavbarProps {
    cartItems: CartItem[];
    onAdd: (item: CartItem) => void;
    onRemove: (item: CartItem) => void;
    onDelete: (item: CartItem) => void;
    onDeleteAll: () => void;
    openSignup: () => void;
    openLogin: () => void;
    handleLogoutClick: (e: React.MouseEvent<HTMLElement>) => void;
    anchorEl: HTMLElement | null;
    handleCloseLogout: () => void;
    handleLogoutRequest: () => void;
}


export default function HomeNavbar(props: HomeNavbarProps) {
       const {
        cartItems,
         onAdd, 
         onRemove,
         onDelete,
         onDeleteAll,
         openSignup,
         openLogin,
         handleLogoutClick,
         anchorEl,
         handleCloseLogout,
         handleLogoutRequest,
         } = props;
    const {authMember} = useGlobals();

  /** HANDLERS */
    return (
    <div className="home-navbar">
        <Container className="navbar-container"> 
            <Stack className="menu">
        <Box className="brand-container">
            <NavLink to="/" className="brand-link">
                <Box className="brand-wrapper">
                    <MenuBook className="brand-icon" sx={{ fontSize: 32, color: '#667eea' }} />
                    <Box className="brand-text">BookOn</Box>
                </Box>
            </NavLink>
        </Box>
        <Stack className="links" >
            <Box className={"hover-line"}>
            <NavLink to="/" activeClassName={"underline"}>
            Home </NavLink>
        </Box>
         <Box className={"hover-line"}>
            <NavLink to="/products" activeClassName={"underline"}>
            Books </NavLink>
        </Box>
        { authMember ? (
            <Box className={"hover-line"}>
            <NavLink to="/orders" activeClassName={"underline"}>
            Orders </NavLink>
        </Box>
    ) : null}
        { authMember ? (
            <Box className={"hover-line"}>
            <NavLink to="/member-page" activeClassName={"underline"}>
            My Page </NavLink>
        </Box>
    ) : null}
         <Box className={"hover-line"}>
            <NavLink to="/help" activeClassName={"underline"}>
            Help </NavLink>
        </Box>

        <Basket 
        cartItems={cartItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onDelete={onDelete}
        onDeleteAll={onDeleteAll} 
        />

        {!authMember ? (
            <Box>
                <Button 
                    className="login-button"
                    variant="contained"
                    onClick={openLogin}
                    startIcon={<Login />}
                >
                    Login
                </Button>
            </Box>
            ) : (
            <img className="user-avatar"
            src={authMember?.memberImage 
                ? `${serverApi}/${authMember?.memberImage}` 
                : "/icons/default-user.svg"
            }
            alt="User menu"
            role="button"
            aria-haspopup={"true"}
            onClick={handleLogoutClick}
            />
            )}


<Menu
 anchorEl={anchorEl}
	id="account-menu"
    open={Boolean(anchorEl)}
    onClose={handleCloseLogout}
    onClick={handleCloseLogout}
	PaperProps={{
		elevation: 0,
		sx: {
			overflow: 'visible',
			filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
			mt: 1.5,
			'& .MuiAvatar-root': {
				width: 32,
				height: 32,
				ml: -0.5,
				mr: 1,
			},
			'&:before': {
				content: '""',
				display: 'block',
				position: 'absolute',
				top: 0,
				right: 14,
				width: 10,
				height: 10,
				bgcolor: 'background.paper',
				transform: 'translateY(-50%) rotate(45deg)',
				zIndex: 0,
			},
		},
	}}
	transformOrigin={{ horizontal: 'right', vertical: 'top' }}
	anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
	<MenuItem
    onClick={handleLogoutRequest}>
		<ListItemIcon>
			<Logout fontSize="small" style={{ color: 'blue' }} />
		</ListItemIcon>
		Logout
	</MenuItem>
</Menu>


            </Stack>
            </Stack>
               <Stack className={"header-frame"}>
                <Stack className={"detail"}>
                <Box className={"head-main-txt"}>
                    The Largest Online Book Store</Box>
                <Box className={"well-txt"}>
                    Reading - Knowledge, Knowledge - Power</Box> 
                <Box className={"service-txt"}>
                    24/7 Service Available</Box>    
                <Box className={"signup"}>
                    {!authMember ? (
                        <Button 
                            variant={"contained"} 
                            className={"signup-button"} 
                            onClick={openSignup}
                            startIcon={<PersonAdd />}
                        >
                            SIGN UP
                        </Button>
                    ) : null}
                </Box> 
                </Stack>
                <Box className={"banner-visual"}>
                    <div className="book-pages">
                        <span className="book-page book-page-1" />
                        <span className="book-page book-page-2" />
                        <span className="book-page book-page-3" />
                        <span className="book-page book-page-4" />
                        <span className="book-page book-page-5" />
                    </div>
                    <span className="banner-shape banner-shape-1" />
                    <span className="banner-shape banner-shape-2" />
                    <div className="banner-grid" />
                </Box>
               </Stack>
        </Container>
    </div>
    );
}