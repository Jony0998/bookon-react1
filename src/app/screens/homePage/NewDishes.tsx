import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { CardOverflow, CssVarsProvider } from "@mui/joy";
import Typography from "@mui/joy/Typography";
import { Visibility, AutoStories, Star } from "@mui/icons-material";
import Card from "@mui/joy/Card";
import AspectRatio from "@mui/joy/AspectRatio";
import { useSelector } from "react-redux"; 
import { createSelector } from "reselect";
import { retrieveNewDishes } from "./selector";
import { Product } from "../../../lib/types/product";
import { serverApi } from "../../../lib/config";
import { ProductCollection } from "../../../lib/enums/product.enum";
import { useHistory } from "react-router-dom";

 
/** REDUX SLICE & SELECTOR */
const newDishesRetriever = createSelector(
  retrieveNewDishes,
  (newDishes) => ({newDishes})
);

export default function NewDishes() {
    const { newDishes } = useSelector(newDishesRetriever);
    const history = useHistory();
    const safeNewDishes = Array.isArray(newDishes) ? newDishes : [];

    const handleCardClick = (productId: string) => {
      history.push(`/products/${productId}`);
    };

  return (
    <div className="homepage">
      <div className="new-products-frame">
        <Container>
          <Stack className="main">
            <Box className="category-title">
              <AutoStories sx={{ fontSize: 40, mr: 2, color: '#667eea' }} />
              New Books
            </Box>
            <Stack className="cards-frame">
              <CssVarsProvider>
                {safeNewDishes.length !== 0 ? (
                  safeNewDishes.map((product: Product, index: number) => {
                const imagePath = `${serverApi}/${product.productImages[0]}`;      
                const sizeVolume = 
                product.productCollection === ProductCollection.DRINK
                 ? product.productVolume + "l" : product.productSize + " size";    
                    return (
                    <Card 
                      key={product._id} 
                      variant="outlined" 
                      className="card"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleCardClick(product._id)}
                    >
                      <CardOverflow sx={{ position: 'relative' }}>
                        <div className="product-sale">
                          <AutoStories sx={{ fontSize: 14, mr: 0.5 }} />
                          {sizeVolume}
                        </div>
                        <AspectRatio ratio="1">
                          <img src={imagePath} alt={product.productName} />
                        </AspectRatio>
                        <Box className="new-badge">
                          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                            NEW
                          </Typography>
                        </Box>
                      </CardOverflow>

                      <CardOverflow variant="soft" className="product-detail">
                        <Stack className="info" spacing={1.5}>
                          <Stack flexDirection={"row"} alignItems="center" justifyContent="space-between">
                            <Typography className="title" sx={{ flex: 1 }}>
                              {product.productName}
                            </Typography>
                            <Box className="price-badge">
                              <Typography className="price">${product.productPrice}</Typography>
                            </Box>
                          </Stack>
                          <Stack flexDirection={"row"} alignItems="center" justifyContent="space-between" gap={2}>
                            <Box className="rating-box">
                              <Star sx={{ fontSize: 18, color: '#FFD700' }} />
                              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', ml: 0.5 }}>
                                4.8
                              </Typography>
                              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#888', ml: 0.5 }}>
                                ({Math.floor(Math.random() * 100) + 50})
                              </Typography>
                            </Box>
                            <Box className="views-box">
                              <Visibility sx={{ fontSize: 18, color: '#667eea' }} />
                              <Typography className="views-text">
                                {product.productViews || 0}
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: '#888', ml: 0.3 }}>
                                views
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </CardOverflow>
                    </Card>
                    );
                  })
                ) : (
                  <Box className="no-data">
                    New books are not available
                  </Box>
                )}
              </CssVarsProvider>
            </Stack>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
