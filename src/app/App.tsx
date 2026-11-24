import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./screens/homePage";
import Header from "./components/shell/Header";
import Footer from "./components/shell/Footer";
import CartDrawer from "./components/shell/CartDrawer";
import { ToastProvider } from "./components/shell/Toasts";
import RealtimeBridge from "./components/shell/RealtimeBridge";
import AuthModal, { AuthMode } from "./components/auth";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";

// The landing page ships in the main bundle; other pages load on first visit
const ProductsPage = lazy(() => import("./screens/productsPage"));
const OrdersPage = lazy(() => import("./screens/ordersPage"));
const UsersPage = lazy(() => import("./screens/userPage"));
const OtherMemberPage = lazy(() => import("./screens/otherMemberPage"));
const HelpPage = lazy(() => import("./screens/helpPage"));
const WishlistPage = lazy(() => import("./screens/wishlistPage"));
const CheckoutPage = lazy(() => import("./screens/checkoutPage"));
const NewsPage = lazy(() => import("./screens/newsPage"));
const ReceptionPage = lazy(() => import("./screens/receptionPage"));
const VerifyEmailPage = lazy(() => import("./screens/authPages/VerifyEmail"));
const ResetPasswordPage = lazy(() => import("./screens/authPages/ResetPassword"));
const NotFoundPage = lazy(() => import("./screens/notFoundPage"));

function App() {
  const location = useLocation();
  const { setAuthMember } = useGlobals();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  // New page: start at the top (the browser keeps the old scroll position otherwise)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const openLogin = () => setAuthMode("login");
  const openSignup = () => setAuthMode("signup");

  // MemberService.logout clears local state even when the request fails
  const logout = async () => {
    await new MemberService().logout();
    setAuthMember(null);
  };

  return (
    <ToastProvider>
    <div className="bo-root">
      <RealtimeBridge />
      <Header openLogin={openLogin} openSignup={openSignup} onLogout={logout} />

      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/*" element={<ProductsPage openLogin={openLogin} />} />
          <Route path="/orders/*" element={<OrdersPage />} />
          <Route path="/member-page/*" element={<UsersPage />} />
          <Route path="/wishlist" element={<WishlistPage openLogin={openLogin} />} />
          <Route path="/checkout" element={<CheckoutPage openLogin={openLogin} />} />
          <Route path="/news/*" element={<NewsPage />} />
          <Route path="/other-member-page/:memberId" element={<OtherMemberPage />} />
          <Route path="/help/*" element={<HelpPage />} />
          <Route path="/reception/*" element={<ReceptionPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage openLogin={openLogin} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
      <CartDrawer openLogin={openLogin} />
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
    </div>
    </ToastProvider>
  );
}

export default App;
