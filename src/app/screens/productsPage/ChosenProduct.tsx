import React, { useEffect, useState } from "react";
import { Container, Stack, Box, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { MenuBook, Star, ShoppingCart, Favorite, FavoriteBorder } from "@mui/icons-material";
import Divider from "../../components/divider";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setChosenProduct, setRestaurant } from "./slice";
import { createSelector } from "reselect";
import { retrieveChosenProduct, retrieveRestaurant } from "./selector";
import { Product } from "../../../lib/types/product";
import { useParams } from "react-router-dom";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi } from "../../../lib/config";
import { CartItem } from "../../../lib/types/search";
import { useGlobals } from "../../hooks/useGlobals";
import { sweetErrorHandling } from "../../../lib/sweetAlert";



/** REDUX SLICE & SELECTOR */
 const actionDispatch = (dispatch: Dispatch) => ({
  setRestaurant: (data: Member) => dispatch(setRestaurant(data)),
    setChosenProduct: (data: Product) => dispatch(setChosenProduct(data)),

 });

  const chosenProductRetriever = createSelector(
   retrieveChosenProduct,
   (chosenProduct) => ({chosenProduct})
  );

   const restaurantRetriever = createSelector(
   retrieveRestaurant,
   (restaurant) => ({restaurant})
  );

   interface ChosenProductsProps {
       onAdd: (item: CartItem) => void;
     }

export default function ChosenProduct(props: ChosenProductsProps) {
  const { onAdd } = props;
  const {productId} = useParams<{ productId: string }>();
  const {setRestaurant, setChosenProduct} = actionDispatch(useDispatch());
  const { chosenProduct } = useSelector(chosenProductRetriever);
  const { restaurant } = useSelector(restaurantRetriever);
  const { authMember } = useGlobals();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const productSvc = new ProductService();
    productSvc
      .getProduct(productId)
      .then((data) => {
        setChosenProduct(data);
        setLikeCount(data.productLikes ?? 0);
      })
      .catch((err) => console.log(err));

    const member = new MemberService();
    member
      .getLibrary()
      .then((data) => setRestaurant(data))
      .catch((err) => console.log(err));

    if (authMember) {
      productSvc
        .checkLiked(productId)
        .then((isLiked) => setLiked(isLiked))
        .catch(() => {});
    }
  }, [productId]);

  const handleLike = async () => {
    try {
      if (!authMember) {
        sweetErrorHandling(new Error("Please login to like books!")).then();
        return;
      }
      const productSvc = new ProductService();
      const updated = await productSvc.likeProduct(productId as string);
      setLikeCount(updated.productLikes);
      setLiked(!liked);
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  if (!chosenProduct) return null;

  return (
    <div className={"chosen-product"}>
      <Box className={"title"}>
        <MenuBook sx={{ fontSize: 40, mr: 2, color: '#667eea', verticalAlign: 'middle' }} />
        Book Details
      </Box>
      <Container className={"product-container"}>
        <Stack className={"chosen-product-slider"}>
          <Swiper
            loop={true}
            spaceBetween={10}
            navigation={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="swiper-area"
          >
            {chosenProduct?.productImages.map(
              (ele: string, index: number) => {
                const imagePath = `${serverApi}/${ele}`
                return (
                  <SwiperSlide key={index}>
                    <img className="slider-image" src={imagePath} alt={chosenProduct?.productName} />
                  </SwiperSlide>
                );
              }
            )}
          </Swiper>
        </Stack>
        <Stack className={"chosen-product-info"}>
          <Box className={"info-box"}>
            <Box className={"product-header"}>
              <strong className={"product-name"}>{chosenProduct?.productName}</strong>
              <Box className={"book-badge"}>
                <MenuBook sx={{ fontSize: 18, mr: 0.5 }} />
                <span>Book</span>
              </Box>
            </Box>
            <Box className={"publisher-info"}>
              <span className={"resto-name"}>Publisher: {restaurant?.memberNick || "BookOn"}</span>
              <span className={"resto-name"}>Contact: {restaurant?.memberPhone || "+998 90 123 45 67"}</span>
            </Box>

            <Box className={"rating-box"}>
              <Box className={"rating-wrapper"}>
                <Rating name="half-rating" defaultValue={4.8} precision={0.1} readOnly />
                <Typography sx={{ ml: 1, fontWeight: 600, color: '#667eea' }}>4.8</Typography>
                <Typography sx={{ ml: 1, color: '#888' }}>({Math.floor(Math.random() * 100) + 50} reviews)</Typography>
              </Box>
              <div className={"evaluation-box"}>
                <div className={"product-view"}>
                  <RemoveRedEyeIcon sx={{ mr: "10px", color: '#667eea' }} />
                  <span>{chosenProduct?.productViews} views</span>
                </div>
                <div className={"product-view"} style={{ cursor: "pointer" }} onClick={handleLike}>
                  {liked
                    ? <Favorite sx={{ mr: "8px", color: "#e53935" }} />
                    : <FavoriteBorder sx={{ mr: "8px", color: "#667eea" }} />}
                  <span>{likeCount} likes</span>
                </div>
              </div>
            </Box>
            <Divider height="2" width="100%" bg="linear-gradient(90deg, transparent, #667eea, transparent)" />
            <p className={"product-desc"}>
              {chosenProduct?.productDesc
               ? chosenProduct?.productDesc 
               : "No description available for this book." }
               </p>
            <Divider height="2" width="100%" bg="linear-gradient(90deg, transparent, #667eea, transparent)" />
            <div className={"product-price"}>
              <span>Price:</span>
              <span className={"price-value"}>${chosenProduct?.productPrice}</span>
            </div>
            <div className={"button-box"}>
              <Button 
                variant="contained"
                className={"add-to-cart-btn"}
                startIcon={<ShoppingCart />}
               onClick={(e) => {
                 
                   onAdd({
                       _id: chosenProduct._id,
                       quantity: 1,
                       name: chosenProduct.productName,
                       price: chosenProduct.productPrice,
                       image: chosenProduct.productImages[0], 
                         });
                      e.stopPropagation();
                      }}
              >Add To Cart</Button>
            </div>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}


