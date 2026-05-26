import React from "react";
import { Box, Button, Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { MenuBook } from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import { Messages, serverApi } from "../../../lib/config";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";

interface BasketProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
}

export default function Basket(props: BasketProps) {
  const {cartItems, onAdd, onRemove, onDelete, onDeleteAll } = props;
  const { authMember, setOrderBuilder} = useGlobals();
  const history = useHistory();
  const itemsPrice: number = cartItems.reduce(
    (a: number, c: CartItem) => a + c.quantity * c.price,
    0
  );
  const shippingCost: number = itemsPrice < 100 ? 5 : 0;
  const totalPrice = (itemsPrice + shippingCost).toFixed(1);


  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /** HANDLERS **/
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const proceedOrderHandler = async () => {
    try {
      handleClose();
      if (!authMember) throw new Error(Messages.error2);

      const order = new OrderService();
      await order.createOrder(cartItems);

      onDeleteAll();

      setOrderBuilder(new Date());
      history.push("/orders");

    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  }


  return (
    <Box className={"hover-line"}>
      <IconButton
        aria-label="cart"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          color: '#f8f8ff',
          transition: 'all 0.3s ease',
          '&:hover': {
            color: '#FFD700',
            transform: 'scale(1.1)',
          }
        }}
      >
        <Badge 
          badgeContent={cartItems.length} 
          color="secondary"
          sx={{
            '& .MuiBadge-badge': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              minWidth: '20px',
              height: '20px',
            }
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 28 }} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        // onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Stack className={"basket-frame"}>
          <Box className={"all-check-box"}>
            {cartItems.length === 0 ? (
                 <Box sx={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   gap: 1.5, 
                   color: '#fff',
                   width: '100%',
                   py: 2
                 }}>
                   <MenuBook sx={{ fontSize: 28, opacity: 0.9 }} />
                   <Box sx={{ 
                     fontWeight: 600, 
                     fontSize: '18px',
                     fontFamily: "'Poppins', sans-serif"
                   }}>
                     Your cart is empty!
                   </Box>
                 </Box>
            ) : (
              <Stack 
                flexDirection={"row"} 
                alignItems="center" 
                justifyContent="space-between"
                gap={1}
                sx={{ width: '100%' }}
              >
                <Stack flexDirection={"row"} alignItems="center" gap={1.5}>
                  <MenuBook sx={{ fontSize: 24, color: '#fff' }} />
                  <Box sx={{ 
                    fontWeight: 700, 
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Cart ({cartItems.length})
                  </Box>
                </Stack>
                <IconButton
                  onClick={() => onDeleteAll()}
                  sx={{
                    color: '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#ff4444',
                      transform: 'scale(1.1) rotate(5deg)',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <DeleteForeverIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Stack>
                   
            )}
           
          </Box>

          <Box className={"orders-main-wrapper"}>
            <Box className={"orders-wrapper"}>
            {cartItems.map((item: CartItem) => {
             const imagePath = `${serverApi}/${item.image}`;
              return (  
                <Box className={"basket-info-box"} key={item._id}>
                  <IconButton
                    className={"cancel-btn"}
                    onClick={() => onDelete(item)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#ff4444',
                      background: 'rgba(255, 68, 68, 0.1)',
                      width: '28px',
                      height: '28px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 68, 68, 0.2)',
                        transform: 'scale(1.1) rotate(90deg)',
                      }
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <img 
                    src={imagePath} 
                    className={"product-img"} 
                    alt={item.name}
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = "/icons/books-icon.png";
                    }}
                  />
                  <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
                    <Box className={"product-name"}>{item.name}</Box>
                    <Box className={"product-price"}>
                      ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    ml: 2
                  }}>
                    <IconButton
                      onClick={() => onRemove(item)}
                      sx={{
                        minWidth: '32px',
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                        color: '#667eea',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      -
                    </IconButton>
                    <Box sx={{
                      minWidth: '30px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '16px',
                      color: '#1a1a2e',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {item.quantity}
                    </Box>
                    <IconButton
                      onClick={() => onAdd(item)}
                      sx={{
                        minWidth: '32px',
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      +
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
    

            
            </Box>
          </Box>
          {cartItems.length !== 0 ? (
            <Box className={"basket-order"}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    <span>Books:</span>
                    <span style={{ fontWeight: 600 }}>${itemsPrice.toFixed(2)}</span>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    <span>Shipping:</span>
                    <span style={{ fontWeight: 600 }}>${shippingCost.toFixed(2)}</span>
                  </Box>
                  <Box sx={{
                    borderTop: '2px solid rgba(102, 126, 234, 0.2)',
                    pt: 1,
                    mt: 0.5
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      <span>Total:</span>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        ${totalPrice}
                      </span>
                    </Box>
                  </Box>
                </Stack>
              </Box>
              <Button 
                onClick={proceedOrderHandler}
                startIcon={<ShoppingCartIcon />} 
                variant={"contained"}
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '16px',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                  }
                }}>
                Place Order
              </Button>
            </Box>
        ) : null}
         
        </Stack>
      </Menu>
    </Box>
  );
}