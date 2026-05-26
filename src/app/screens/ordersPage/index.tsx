
import { SyntheticEvent, useEffect, useState } from "react";
import { Box, Container, Stack } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { MenuBook, ShoppingBag, CheckCircle, CreditCard } from "@mui/icons-material";
import PausedOrders from "./PausedOrders";
import ProcessOrders from "./ProcessOrders";
import FinishedOrders from "./FinishedOrders";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import { useDispatch } from "react-redux"; 
import { Dispatch } from "@reduxjs/toolkit";
import { setPausedOrders, setProcessOrders, setFinishedOrders } from "./slice";
import { Order, OrderInquiry } from "../../../lib/types/order";
import { OrderStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { useGlobals } from "../../hooks/useGlobals";
import { useHistory } from "react-router-dom";
import "../../../css/order.css";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";


/** REDUX SLICE & SELECTOR */
 const actionDispatch = (dispatch: Dispatch) => ({
  setPausedOrders: (data: Order[]) => dispatch(setPausedOrders(data)),
  setProcessOrders: (data: Order[]) => dispatch(setProcessOrders(data)),
  setFinishedOrders: (data: Order[]) => dispatch(setFinishedOrders(data)),
 });


export default function OrdersPage() {
  const {setPausedOrders, setProcessOrders, setFinishedOrders } = 
    actionDispatch(useDispatch());
  const {orderBuilder, authMember} = useGlobals();  
  const history = useHistory();
  const [value, setValue] = useState("1");
  const [orderInquiry, setOrderInquiry] = useState<OrderInquiry>({
    page: 1,
    limit: 5,
    orderStatus: OrderStatus.PAUSE,
  });

  useEffect(() => {
    const order = new OrderService();

   order
   .getMyOrders({...orderInquiry, orderStatus: OrderStatus.PAUSE})
   .then((data) => setPausedOrders(data))
   .catch((err) => console.log(err));

    order
   .getMyOrders({...orderInquiry, orderStatus: OrderStatus.PROCESS})
   .then((data) => setProcessOrders(data))
   .catch((err) => console.log(err));

    order
   .getMyOrders({...orderInquiry, orderStatus: OrderStatus.FINISH})
   .then((data) => setFinishedOrders(data))
   .catch((err) => console.log(err));

  }, [orderInquiry, orderBuilder, setPausedOrders, setProcessOrders, setFinishedOrders]);


  /** HANDLERS **/

const handleChange = (e: SyntheticEvent, newValue: string) => {
  setValue(newValue);
};

 if(!authMember) history.push("/");

  return (
    <div className={"order-page"}>
      <Container className={"order-container"}>
        <Stack className={"order-left"}>
        <TabContext value={value}>
          <Box className={"order-nav-frame"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider"}}>
              <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              className={"table-list"}
              >
         <Tab 
           icon={<ShoppingBag sx={{ fontSize: 20, mr: 1 }} />}
           iconPosition="start"
           label="PENDING ORDERS" 
           value={"1"}
         />
         <Tab 
           icon={<MenuBook sx={{ fontSize: 20, mr: 1 }} />}
           iconPosition="start"
           label="PROCESSING ORDERS" 
           value={"2"}
         />
         <Tab 
           icon={<CheckCircle sx={{ fontSize: 20, mr: 1 }} />}
           iconPosition="start"
           label="COMPLETED ORDERS" 
           value={"3"}
         />
              </Tabs>
            </Box>
          </Box>
          <Stack className={"order-main-content"}>
            <PausedOrders setValue={setValue}/>
            <ProcessOrders  setValue={setValue}/>
            <FinishedOrders />
          </Stack>
          </TabContext>  
        </Stack>

    <Stack className="order-right" spacing={3}>
      <Box className="order-info-box">
        <Box className="member-box">
          <div className="order-user-img">
            <img
              src={ authMember?.memberImage
                  ? `${serverApi}/${authMember.memberImage}`
                  : "/icons/default-user.svg"}
              alt="User"
              className="order-user-avatar"
            />
            <div className="order-user-icon-box">
              <img
                src={
                  authMember?.memberType === MemberType.LIBRARY
                        ? "/icons/restaurant.svg"
                        : "/icons/user-badge.svg"}
             
                className="order-user-prof-img"
              />
            </div>
          </div>

        
          <span className="order-user-name">{authMember?.memberNick}</span>
          <span className="order-user-prof">
            {authMember?.memberType === MemberType.LIBRARY ? "Library" : "Reader"}
          </span>
        </Box>
        <Box className="liner"></Box>

        <Box className="order-user-address">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOnIcon sx={{ mr: 1 }} />
            <span>{authMember?.memberAddress 
                  ? authMember.memberAddress 
                  : 
                  "Do not exist"}</span>
          </Box>
        </Box>
      </Box>

        <Box className="order-info-box">
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, width: "100%" }}>
          <CreditCard sx={{ fontSize: 24, mr: 1, color: '#667eea' }} />
          <Box sx={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>Payment Information</Box>
        </Box>
        <Stack spacing={2} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Card Number"
            value="5243 4090 2002 7495"
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Expiry Date"
              value="07 / 24"
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="CVV"
              value="010"
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                  },
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label="Cardholder Name"
            value={authMember?.memberNick || "Cardholder Name"}
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                },
              },
            }}
          />
        </Stack>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            px: 2,
            gap: 1,
          }}
        >
          <img src="/icons/western-card.svg" alt="Western Union" height={30} />
          <img src="/icons/master-card.svg" alt="MasterCard" height={30} />
          <img src="/icons/paypal-card.svg" alt="PayPal" height={30} />
          <img src="/icons/visa-card.svg" alt="Visa" height={30} />
        </Box>
      </Box>
    </Stack>

      </Container>

    </div>
  )
}