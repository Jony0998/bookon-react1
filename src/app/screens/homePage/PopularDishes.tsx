import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { CssVarsProvider } from "@mui/joy/styles";
import CardCover from '@mui/joy/CardCover';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from "@mui/joy/Typography";
import { MenuBook, Visibility, Star } from "@mui/icons-material";
import { useHistory } from "react-router-dom";

import { useSelector } from "react-redux"; 
import { createSelector } from "reselect";
import { retrievePopularDishes } from "./selector";
import { Product } from "../../../lib/types/product";
import { serverApi } from "../../../lib/config";

 
/** REDUX SLICE & SELECTOR */
const popularDishesRetriever = createSelector(
  retrievePopularDishes,
  (popularDishes) => ({popularDishes})
);



export default function PopularDishes() {
  const { popularDishes } = useSelector(popularDishesRetriever);
  const history = useHistory();

  // Sort by views in descending order (most viewed first)
  // This ensures proper sorting even if data comes unsorted
  const safePopularDishes = Array.isArray(popularDishes) 
    ? [...popularDishes]
        .sort((a, b) => {
          const viewsA = a.productViews || 0;
          const viewsB = b.productViews || 0;
          // Descending order: highest views first
          return viewsB - viewsA;
        })
        .slice(0, 8) // Take top 8 most viewed books
    : [];

  const handleCardClick = (productId: string) => {
    history.push(`/products/${productId}`);
  };

    return (
    <div className={"popular-dishes-frame"}>
        <Container>
        <Stack className="popular-section">
            <Box className="category-title">
              <MenuBook sx={{ fontSize: 40, mr: 2, color: '#667eea' }} />
              Popular Books
            </Box>
                <Stack className="cards-frame">
                 
                    {safePopularDishes.length !== 0 ? (
                    safePopularDishes.map((product: Product ) => {
                const imagePath = product.productImages && product.productImages.length > 0
                  ? `${serverApi}/${product.productImages[0]}`
                  : "/icons/books-icon.png";      
          return (
             <CssVarsProvider key={product._id}>
           <Card 
             className={"card"}
             sx={{ minHeight: '480px', width: 320, cursor: 'pointer' }}
             onClick={() => handleCardClick(product._id)}
           >
      <CardCover>
        <img 
          src={imagePath} 
          alt={product.productName}
          onError={(e: any) => {
            e.target.src = "/icons/books-icon.png";
          }}
        />
      </CardCover>
    <CardCover className={"card-cover"} />
      <CardContent sx={{ justifyContent: "flex-end", p: 2 }}>
        <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems="center"
        mb={1}
        >
        <Typography
        level="h2"
        fontSize="xl"
        fontWeight="700"
        textColor="#fff"
        sx={{
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          lineHeight: 1.3
        }}
        > 
          {product.productName}
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 10px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <Visibility
            sx={{ fontSize: 18, color: '#FFD700' }}
          />
          <Typography
            sx={{
              fontWeight: "600",
              color: "#fff",
              fontSize: '14px'
            }}
          >
            {product.productViews}
          </Typography>
        </Box>
      </Stack>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 1
      }}>
        <Star sx={{ fontSize: 18, color: '#FFD700' }} />
        <Typography
          sx={{
            fontWeight: "600",
            color: "#FFD700",
            fontSize: '16px'
          }}
        >
          4.8
        </Typography>
        <Typography
          sx={{
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: '14px',
            ml: 1
          }}
        >
          ({Math.floor(Math.random() * 100) + 50} reviews)
        </Typography>
      </Box>
      </CardContent>
      <CardOverflow
      sx={{
        display: "flex",
        gap: 1.5,
        py: 2,
        px: "var(--Card-padding)",
        borderTop: "2px solid rgba(255, 215, 0, 0.3)",
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        minHeight: "70px",
      }}
      >
     <Typography
     startDecorator={<MenuBook sx={{ color: '#FFD700' }} />}
     textColor="rgba(255, 255, 255, 0.9)"
     sx={{
       fontWeight: 500,
       fontSize: '14px',
       lineHeight: 1.5
     }}
     >
      {product.productDesc || 'Brief information about the book'}
     </Typography>
      </CardOverflow>
    </Card>   
        </CssVarsProvider>

          );
      })
    ) : (
         <Box className="no-data">
              Popular books are not available
            </Box>
    )}
                </Stack>
        </Stack>
        </Container>
        </div>
   );
}