import React, { Suspense, lazy, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import  HomePage  from "./screens/homePage";
import HomeNavbar from "./components/headers/HomeNavbar";
import OtherNavbar from "./components/headers/OtherNavbar";
import  Footer  from "./components/footer";

// The landing page ships in the main bundle; other pages load on first visit
const ProductsPage = lazy(() => import("./screens/productsPage"));
const OrdersPage = lazy(() => import("./screens/ordersPage"));
const UsersPage = lazy(() => import("./screens/userPage"));
const OtherMemberPage = lazy(() => import("./screens/otherMemberPage"));
const HelpPage = lazy(() => import("./screens/helpPage"));
import useBasket from "./hooks/useBasket";
import AuthenticationModal from "./components/auth";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../lib/sweetAlert";
import { Messages } from "../lib/config";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";

function App() {
  const location = useLocation();
  const {setAuthMember} = useGlobals();
  const { cartItems, onAdd, onRemove, 
         onDelete, onDeleteAll, } = useBasket();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  


  /**  HANDLERS**/
 
  const handleSignupClose = () => setSignupOpen(false);
  const handleLoginClose = () => setLoginOpen(false);

  const openLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };
  const openSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const handleLogoutClick = (e: React.MouseEvent<HTMLElement> ) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseLogout = () => setAnchorEl(null);
  const handleLogoutRequest = async () => {
    try {
      const member = new MemberService();
      await member.logout();

      await sweetTopSuccessAlert("success", 700);
      setAuthMember(null);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(Messages.error1);
    }
  }

  return (
  <>
    {location.pathname === "/" ? (
      <HomeNavbar
        cartItems={cartItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onDelete={onDelete}
        onDeleteAll={onDeleteAll}
        openSignup={openSignup}
        openLogin={openLogin}
        anchorEl={anchorEl}
        handleLogoutClick={handleLogoutClick}
        handleCloseLogout={handleCloseLogout}
        handleLogoutRequest={handleLogoutRequest}
        />
    ) : (
      <OtherNavbar 
        cartItems={cartItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onDelete={onDelete}
        onDeleteAll={onDeleteAll} 
        openSignup={openSignup}
        openLogin={openLogin}
        anchorEl={anchorEl}
        handleLogoutClick={handleLogoutClick}
        handleCloseLogout={handleCloseLogout}
        handleLogoutRequest={handleLogoutRequest}
        
        />
    )}

    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
    <Routes>
      <Route path="/products/*" element={<ProductsPage onAdd={onAdd} />} />
      <Route path="/orders/*" element={<OrdersPage />} />
      <Route path="/member-page/*" element={<UsersPage />} />
      <Route path="/other-member-page/:memberId" element={<OtherMemberPage />} />
      <Route path="/help/*" element={<HelpPage />} />
      {/* v5 fell back to the home page for unknown paths; keep that behaviour */}
      <Route path="*" element={<HomePage />} />
    </Routes>
    </Suspense>

    <Footer />

  <AuthenticationModal
   signupOpen={signupOpen}
   loginOpen={loginOpen}
   handleLoginClose={handleLoginClose}
   handleSignupClose={handleSignupClose}

  />
  </>
);

}


export default App;





