import React from "react";
import { Route, Routes } from "react-router-dom";
import Catalog from "./Catalog";
import BookDetail from "./BookDetail";
import "../../../css/catalog.css";

/** Mounted at /products/* (see App.tsx) */
export default function ProductsPage({ openLogin }: { openLogin: () => void }) {
  return (
    <Routes>
      <Route path=":productId" element={<BookDetail openLogin={openLogin} />} />
      <Route index element={<Catalog />} />
    </Routes>
  );
}
