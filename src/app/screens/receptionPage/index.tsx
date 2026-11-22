import React from "react";
import { Route, Routes } from "react-router-dom";
import ReceptionHome from "./ReceptionHome";
import ThreadPage from "./ThreadPage";
import "../../../css/account.css";
import "../../../css/profile.css";
import "../../../css/reception.css";

/** /reception — ask the library; /reception/:id — one conversation */
export default function ReceptionPage() {
  return (
    <Routes>
      <Route path=":id" element={<ThreadPage />} />
      <Route index element={<ReceptionHome />} />
    </Routes>
  );
}
