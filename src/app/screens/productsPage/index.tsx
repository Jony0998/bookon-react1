import React from "react";
import { Route, Routes } from "react-router-dom";
import ChosenProduct from "./ChosenProduct";
import Products from "./Products";
import "../../../css/products.css";
import { CartItem } from "../../../lib/types/search";

interface ProductsPageProps {
  onAdd: (item: CartItem) => void;
}

/** Mounted at /products/* (see App.tsx) */
export default function ProductsPage(props: ProductsPageProps) {
  const { onAdd } = props;
  return (
    <div className={"products-page"}>
      <Routes>
        <Route path=":productId" element={<ChosenProduct onAdd={onAdd} />} />
        <Route index element={<Products onAdd={onAdd} />} />
      </Routes>
    </div>
  );
}
