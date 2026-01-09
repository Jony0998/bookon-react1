import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Button, Container, Stack } from "@mui/material";
import { MonetizationOn, RemoveRedEye, MenuBook, AutoStories, LocalLibrary, School, Category } from "@mui/icons-material";
import  SearchIcon from "@mui/icons-material/Search";
import Badge from "@mui/material/Badge";
import PaginationItem from "@mui/material/PaginationItem";
import Pagination from "@mui/material/Pagination";
import  ArrowBackIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "react-redux"; 
import { Dispatch } from "@reduxjs/toolkit";
import { setProducts } from "./slice";
import { createSelector } from "reselect";
import { retrieveProducts } from "./selector";
import { Product, ProductInquiry } from "../../../lib/types/product";
import ProductService from "../../services/ProductService";
import { ProductCollection } from "../../../lib/enums/product.enum";
import { serverApi } from "../../../lib/config";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";



/** REDUX SLICE & SELECTOR */
 const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
 });
  const productsRetriever = createSelector(
   retrieveProducts,
   (products) => ({products

   }));


   
   interface ProductsProps {
     onAdd: (item: CartItem) => void;
   }

export default function Products(props: ProductsProps) {
    const { onAdd } = props;
    const {setProducts} = actionDispatch(useDispatch());
    const { products } = useSelector(productsRetriever);
    const safeProducts = Array.isArray(products) ? products : [];
    const [ productSearch, setProductSearch ]  = useState<ProductInquiry>({
         page: 1,
         limit: 8,
         order: "createdAt",
         productCollection: undefined,
         search: "",
    });

    const [ searchText, setSearchText ] = useState<string>("");
    const [ totalPages, setTotalPages ] = useState<number>(1);
    const history = useHistory();

  useEffect(() => {
    const product = new ProductService();
      product
       .getProducts(productSearch)
        .then((data) => {
          setProducts(data);
          // If returned data equals limit, there might be more pages
          // We'll show pagination if current page has full limit of items
          if (data.length === productSearch.limit) {
            // Assume there's at least one more page
            setTotalPages(productSearch.page + 1);
          } else {
            // This is the last page
            setTotalPages(productSearch.page);
          }
        })
        .catch((err) => console.log(err));
  }, [productSearch, setProducts]);


  useEffect(() => {
    if(searchText === "" && productSearch.search !== "") {
      setProductSearch(prev => ({
        ...prev,
        search: "",
        page: 1,
      }));
    }
  }, [searchText, productSearch.search]);

  /** HANDLERS */

 const searchCollectionHandler = (collection: ProductCollection | undefined) => {
   setProductSearch(prev => ({
     ...prev,
     page: 1,
     productCollection: collection,
   }));
   // Scroll to products section when category is clicked
   setTimeout(() => {
     const productsSection = document.querySelector('.product-wrapper');
     if (productsSection) {
       productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }
   }, 100);
 };

 const searchOrderHandler = (order: string) => {
   setProductSearch(prev => ({
     ...prev,
     page: 1,
     order: order,
   }));
 };

 const searchProductHandler = () => {
  setProductSearch(prev => ({
    ...prev,
    page: 1,
    search: searchText,
  }));
 };

 const paginationHandler = (e: ChangeEvent<any>, value: number) => {
   setProductSearch(prev => ({
     ...prev,
     page: value,
   }));
   // Scroll to top when page changes
   window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const chooseDishHandler = (id: string) => {
   history.push(`/products/${id}`);
 };



    return <div className="products-page">
        <Container>
            <Stack className="menu-frame">
                <Stack className="title-box">
                    <Box className="title-txt">
                      <MenuBook sx={{ fontSize: 40, mr: 2, color: '#667eea', verticalAlign: 'middle' }} />
                      BookOn Store
                    </Box>
                    <Stack className="search-input">
                        <input
                        type={"search"}
                        className={"search-input"}
                        name={"singleResearch"}
                        placeholder={"Search books..."}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {  
                          if (e.key === "Enter") searchProductHandler();
                        }}
                      
                        />
                      
                        <Box className="search-box" 
            
                        >
                       <Button
       variant="contained"
       sx={{ borderRadius: '18.5px', }}
       endIcon={<SearchIcon />}
       onClick={searchProductHandler}
  >
    SEARCH    </Button>
                        </Box>
                        </Stack>
                </Stack>
                <Stack className={"dishes-filter-section"}>
                    <Stack className={"dishes-filter-box"}>
                 <Button
                 variant={"contained"}
                 color={productSearch.order === "createdAt" ? "primary" : "secondary"}
                 className={"order"}
                 onClick={() => searchOrderHandler("createdAt")}
                 startIcon={<AutoStories />}
                 >
                  New Books
                 </Button>
                 <Button
                 variant={"contained"}
                 color={productSearch.order === "productPrice" ? "primary" : "secondary"}
                 className={"order"}
                 onClick={() => searchOrderHandler("productPrice")}
                 startIcon={<MonetizationOn />}
                 >
                  Price
                 </Button>
                 <Button
                 variant={"contained"}
                color={productSearch.order === "productViews" ? "primary" : "secondary"}
                 className={"order"}
                 onClick={() => searchOrderHandler("productViews")}
                 startIcon={<RemoveRedEye />}
                 >
                  Popular
                 </Button>
                    </Stack>

                </Stack>
                <Stack className={"right-category-section"}>
                    <Stack className={"right-category-box"} >
                      <Button
                      sx={{
                    transform: 'rotate(-90deg)',
                   transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                 color={
                    productSearch.productCollection === undefined 
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => {
                   setProductSearch(prev => ({
                     ...prev,
                     page: 1,
                     productCollection: undefined,
                   }));
                   // Scroll to products section when ALL is clicked
                   setTimeout(() => {
                     const productsSection = document.querySelector('.product-wrapper');
                     if (productsSection) {
                       productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }
                   }, 100);
                 }}
                 
                 >
                  ALL
                 </Button>
                      <Button
                      sx={{
                    transform: 'rotate(-90deg)',
                   transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                 color={
                    productSearch.productCollection === ProductCollection.DISH 
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => searchCollectionHandler(ProductCollection.DISH)}
                 
                 >
                  FICTION
                 </Button>
                 <Button
                    sx={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                  color={
                    productSearch.productCollection === ProductCollection.SALAD 
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => searchCollectionHandler(ProductCollection.SALAD)}
                 >
                  NON-FICTION
                 </Button>
                 <Button
                    sx={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                  color={
                    productSearch.productCollection === ProductCollection.DRINK 
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => searchCollectionHandler(ProductCollection.DRINK)}
                 >
                  EDUCATION
                 </Button>
                 <Button
                    sx={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                  color={
                    productSearch.productCollection === ProductCollection.DESSERT
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => searchCollectionHandler(ProductCollection.DESSERT)}
                 >
                  CHILDREN
                 </Button>
                 <Button
                    sx={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left center',
                     }}
                 variant={"contained"}
                  color={
                    productSearch.productCollection === ProductCollection.OTHER
                    ? "primary"
                    : "secondary"
                 }
                 className={"order"}
                 onClick={() => searchCollectionHandler(ProductCollection.OTHER)}
                 >
                  OTHER
                 </Button>  
                    </Stack>
                </Stack>
                <Stack className={"product-wrapper"}>
                {safeProducts.length !== 0 ? (
                    safeProducts.map((product: Product) => {
                        const imagePath = product.productImages && product.productImages.length > 0
                          ? `${serverApi}/${product.productImages[0]}`
                          : "/icons/books-icon.png";
                        const sizeVolume = product.productCollection === ProductCollection.DRINK 
                        ? product.productVolume + " pages" 
                        : product.productSize + " pages";
                        return (
                     <Stack key={product._id} className={"product-card"}
                      onClick={() => chooseDishHandler(product._id)}
                     >
                        <Box className="product-img">
                          <img 
                            src={imagePath} 
                            alt={product.productName}
                            className="product-image"
                            onError={(e: any) => {
                              e.target.src = "/icons/books-icon.png";
                            }}
                          />
                          <div className={"product-sale"}>{sizeVolume}</div>
                          <Button className={"shop-btn"}
                          onClick={(e) => {
                        
                            onAdd({
                              _id: product._id,
                              quantity: 1,
                              name: product.productName,
                              price: product.productPrice,
                              image: product.productImages[0], 
                            });
                            e.stopPropagation();
                          }}
                          >
                            <img 
                            src={"/icons/shopping-cart.svg"}
                            style={{ display: "flex"}}
                            alt="Add to cart"
                            />
                            </Button> 
                            <Button className={"view-btn"}
                            sx={{ right: "36px"}} >
                                <Badge badgeContent={
                                    product.productViews
                                } color="secondary">
                                    <RemoveRedEye
                                    sx={{
                                        color: product.productViews === 0 ? "gray" : "white",
                                    }}
                                    />
                                </Badge>
                                </Button> 
                        </Box>
                       <Box className={"product-desc"}>
                     <span className={"product-title"}>
                                 {product.productName}
                                  </span>
                      <div className={"product-price"}>
                          <MonetizationOn /> <span>{product.productPrice}</span>
                             </div>
                                  </Box>
                     </Stack>
                        );
                    })
                ) : (
                    <Box className="no-data">Books are not available!</Box>
                )}
                </Stack>
                  {safeProducts.length > 0 && totalPages > 1 && (
                  <Stack className={"pagination-section"}>
      <Pagination
        count={totalPages}
        page={productSearch.page}
        renderItem={(item) => (
     <PaginationItem
         slots={{ 
         previous: ArrowBackIcon,
         next: ArrowForwardIcon
           }}
         {...item}
         sx={{
           '&.Mui-selected': {
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             color: '#fff',
             fontWeight: 700,
             '&:hover': {
               background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
             }
           },
           '&:hover': {
             background: 'rgba(102, 126, 234, 0.1)',
           }
         }}
       />
      )}
      onChange={paginationHandler}
      />
                 </Stack>
                 )}

            </Stack>

        </Container>

    <div className={"brands-top"}>
      <Container>
        <Stack className={"brands-frame"}>
          <Box className={"brand-title"}>
            <Category sx={{ fontSize: 40, mr: 2, color: '#FFD700', verticalAlign: 'middle' }} />
            Book Categories
          </Box>
          <Stack className={"brands-boxes"}>
            <Box className={"brands-box"} onClick={() => searchCollectionHandler(ProductCollection.DISH)}>
              <div className="category-bg category-1">
                <AutoStories sx={{ fontSize: 70, color: '#fff', mb: 2 }} />
                <Box sx={{ color: '#fff', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Fiction</Box>
                <Box sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 400, mt: 1, textAlign: 'center' }}>Novels & Stories</Box>
              </div>
            </Box>
            <Box className={"brands-box"} onClick={() => searchCollectionHandler(ProductCollection.SALAD)}>
              <div className="category-bg category-2">
                <LocalLibrary sx={{ fontSize: 70, color: '#fff', mb: 2 }} />
                <Box sx={{ color: '#fff', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Non-Fiction</Box>
                <Box sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 400, mt: 1, textAlign: 'center' }}>Biography & History</Box>
              </div>
            </Box>
            <Box className={"brands-box"} onClick={() => searchCollectionHandler(ProductCollection.DRINK)}>
              <div className="category-bg category-3">
                <School sx={{ fontSize: 70, color: '#fff', mb: 2 }} />
                <Box sx={{ color: '#fff', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Education</Box>
                <Box sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 400, mt: 1, textAlign: 'center' }}>Textbooks & Guides</Box>
              </div>
            </Box>
            <Box className={"brands-box"} onClick={() => searchCollectionHandler(ProductCollection.DESSERT)}>
              <div className="category-bg category-4">
                <MenuBook sx={{ fontSize: 70, color: '#fff', mb: 2 }} />
                <Box sx={{ color: '#fff', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Children</Box>
                <Box sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 400, mt: 1, textAlign: 'center' }}>Kids Books</Box>
              </div>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </div>

<div className={"address"}>
<Container>
<Stack className={"address-area"}>
<Box className={"title"}>
  <MenuBook sx={{ fontSize: 40, mr: 2, color: '#667eea', verticalAlign: 'middle' }} />
  Our Location
</Box>
<iframe
style={{ marginTop: "60px" }}
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.0!2d69.2406!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTQnMjYuMiJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
referrerPolicy="no-referrer-when-downgrade"
title="BookOn Store location"
></iframe>
</Stack>
</Container>
</div>

    </div>;
}