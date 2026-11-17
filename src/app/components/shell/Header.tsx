import React, { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Drawer from "@mui/material/Drawer";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useGlobals } from "../../hooks/useGlobals";
import { useCart } from "../../context/CartContext";
import { useThemeMode } from "../../context/ThemeContext";
import { LANGUAGES } from "../../../i18n";
import { serverApi } from "../../../lib/config";
import { BrandWordmark, GirihMark } from "../ui/Girih";
import {
  BoxIcon, CartIcon, CloseIcon, HeartIcon, LogoutIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon, UserIcon,
} from "../ui/Icons";

interface HeaderProps {
  openLogin: () => void;
  openSignup: () => void;
  onLogout: () => void;
}

const menuPaperSx = {
  mt: 1,
  minWidth: 220,
  borderRadius: "16px",
  bgcolor: "var(--surface)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow)",
  "& .MuiMenuItem-root": { gap: 1.5, minHeight: 44, fontFamily: "var(--font-ui)", fontWeight: 600 },
};

export default function Header({ openLogin, openSignup, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { authMember } = useGlobals();
  const { cartItems, openCart } = useCart();
  const { theme, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountEl, setAccountEl] = useState<HTMLElement | null>(null);

  // Close the mobile menu after navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const links = [
    { to: "/", label: t("common.home"), end: true },
    { to: "/products", label: t("common.books") },
    ...(authMember ? [{ to: "/orders", label: t("common.orders") }] : []),
    { to: "/help", label: t("common.help") },
  ];

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  };

  const searchForm = (className: string) => (
    <form role="search" className={className} onSubmit={submitSearch}>
      <SearchIcon size={18} />
      <label className="bo-sr-only" htmlFor={`${className}-q`}>{t("common.search")}</label>
      <input
        id={`${className}-q`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("common.searchPlaceholder")}
        maxLength={100}
      />
    </form>
  );

  const langSwitch = (
    <div className="bo-lang" role="group" aria-label={t("common.language")}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          title={lang.name}
          aria-pressed={i18n.language === lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );

  return (
    <header className="bo-header">
      <div className="bo-wrap bo-header__row">
        <button type="button" className="bo-icon-btn bo-header__burger" aria-label={t("common.menu")} onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </button>

        <Link to="/" className="bo-header__brand" aria-label="BookOn">
          <GirihMark />
          <BrandWordmark />
        </Link>

        <nav className="bo-header__nav" aria-label={t("common.menu")}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* The catalog has its own, larger search box */}
        {location.pathname === "/products" ? <span className="bo-search-spacer" /> : searchForm("bo-search")}

        <div className="bo-header__tools">
          <span className="bo-header__lang-desktop">{langSwitch}</span>
          <button
            type="button"
            className="bo-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("common.themeToLight") : t("common.themeToDark")}
            title={theme === "dark" ? t("common.themeToLight") : t("common.themeToDark")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" className="bo-icon-btn" onClick={openCart} aria-label={`${t("common.cart")} (${cartCount})`}>
            <CartIcon />
            {cartCount > 0 ? <span className="bo-badge" aria-hidden="true">{cartCount}</span> : null}
          </button>

          {authMember ? (
            <>
              <button
                type="button"
                className="bo-avatar-btn"
                aria-label={t("common.account")}
                aria-haspopup="menu"
                aria-expanded={!!accountEl}
                onClick={(e) => setAccountEl(e.currentTarget)}
              >
                <img
                  src={authMember.memberImage ? `${serverApi}/${authMember.memberImage}` : "/icons/default-user.svg"}
                  alt=""
                  onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")}
                />
              </button>
              <Menu
                anchorEl={accountEl}
                open={!!accountEl}
                onClose={() => setAccountEl(null)}
                onClick={() => setAccountEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{ paper: { sx: menuPaperSx } }}
              >
                <MenuItem disabled sx={{ opacity: "1 !important", fontWeight: 800 }}>{authMember.memberNick}</MenuItem>
                <MenuItem onClick={() => navigate("/member-page")}><UserIcon size={18} />{t("common.myPage")}</MenuItem>
                <MenuItem onClick={() => navigate("/orders")}><BoxIcon size={18} />{t("common.orders")}</MenuItem>
                <MenuItem onClick={() => navigate("/wishlist")}><HeartIcon size={18} />{t("common.wishlist")}</MenuItem>
                <MenuItem onClick={onLogout} sx={{ color: "var(--danger)" }}><LogoutIcon size={18} />{t("common.logout")}</MenuItem>
              </Menu>
            </>
          ) : (
            <button type="button" className="bo-btn bo-btn--dark bo-header__login" onClick={openLogin}>
              {t("common.login")}
            </button>
          )}
        </div>
      </div>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: "min(340px, 88vw)", bgcolor: "var(--bg)", color: "var(--ink)" } } }}
      >
        <div className="bo-mobile-nav">
          <div className="bo-mobile-nav__top">
            <Link to="/" className="bo-header__brand"><GirihMark /><BrandWordmark /></Link>
            <button type="button" className="bo-icon-btn" aria-label={t("common.close")} onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          {searchForm("bo-search bo-search--mobile")}
          <nav aria-label={t("common.menu")}>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                {link.label}
              </NavLink>
            ))}
            {authMember ? <NavLink to="/wishlist">{t("common.wishlist")}</NavLink> : null}
            {authMember ? <NavLink to="/member-page">{t("common.myPage")}</NavLink> : null}
          </nav>
          {langSwitch}
          {!authMember ? (
            <div className="bo-mobile-nav__auth">
              <button type="button" className="bo-btn bo-btn--dark" onClick={() => { setMobileOpen(false); openLogin(); }}>{t("common.login")}</button>
              <button type="button" className="bo-btn bo-btn--ghost" onClick={() => { setMobileOpen(false); openSignup(); }}>{t("common.signup")}</button>
            </div>
          ) : null}
        </div>
      </Drawer>
    </header>
  );
}
