import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "./screens/homePage";
import Header from "./components/shell/Header";
import Footer from "./components/shell/Footer";
import CartDrawer from "./components/shell/CartDrawer";
import AuthenticationModal from "./components/auth";
import { sweetErrorHandling } from "../lib/sweetAlert";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";

// The landing page ships in the main bundle; other pages load on first visit
const ProductsPage = lazy(() => import("./screens/productsPage"));
const OrdersPage = lazy(() => import("./screens/ordersPage"));
const UsersPage = lazy(() => import("./screens/userPage"));
const OtherMemberPage = lazy(() => import("./screens/otherMemberPage"));
const HelpPage = lazy(() => import("./screens/helpPage"));
const WishlistPage = lazy(() => import("./screens/wishlistPage"));
const NotFoundPage = lazy(() => import("./screens/notFoundPage"));

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const { setAuthMember } = useGlobals();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);

  // New page: start at the top (the browser keeps the old scroll position otherwise)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const openLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };
  const openSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const logout = async () => {
    try {
      await new MemberService().logout();
      setAuthMember(null);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(new Error(t("common.loadError")));
    }
  };

  return (
    <div className="bo-root">
      <Header openLogin={openLogin} openSignup={openSignup} onLogout={logout} />

      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/*" element={<ProductsPage openLogin={openLogin} />} />
          <Route path="/orders/*" element={<OrdersPage />} />
          <Route path="/member-page/*" element={<UsersPage />} />
          <Route path="/wishlist" element={<WishlistPage openLogin={openLogin} />} />
          <Route path="/other-member-page/:memberId" element={<OtherMemberPage />} />
          <Route path="/help/*" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
      <CartDrawer openLogin={openLogin} />

      <AuthenticationModal
        signupOpen={signupOpen}
        loginOpen={loginOpen}
        handleLoginClose={() => setLoginOpen(false)}
        handleSignupClose={() => setSignupOpen(false)}
      />
    </div>
  );
}

export default App;
