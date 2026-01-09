import { Box, Stack } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay, Navigation, Pagination } from "swiper";
import { Event, CalendarToday, LocationOn } from "@mui/icons-material";
import { plans } from "../../../lib/data/plans";

SwiperCore.use([Autoplay, Navigation, Pagination]);

export default function Events() {
  return (
    <div className={"events-frame"}>
      <Stack className={"events-main"}>
        <Box className={"events-text"}>
          <span className={"category-title"}>
            <Event sx={{ fontSize: 40, mr: 2, color: '#667eea', verticalAlign: 'middle' }} />
            Book Events
          </span>
        </Box>

        <Swiper
          className={"events-info swiper-wrapper"}
          slidesPerView={"auto"}
          centeredSlides={true}
          spaceBetween={30}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
          }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: true,
          }}
        >
          {plans.map((value, number) => {
            return (
              <SwiperSlide key={number} className={"events-info-frame"}>
                <div className={`events-img event-bg-${number + 1}`}>
                  <div className="events-img-overlay"></div>
                </div>
                <Box className={"events-desc"}>
                  <Box className={"events-bott"}>
                    <Box className={"bott-left"}>
                      <div className={"event-title-speaker"}>
                        <strong>{value.title}</strong>
                        <div className={"event-organizator"}>
                          <Event sx={{ fontSize: 18, color: '#FFD700', mr: 1 }} />
                          <p className={"spec-text-author"}>{value.author}</p>
                        </div>
                      </div>

                      <p className={"text-desc"}> {value.desc} </p>

                      <div className={"bott-info"}>
                        <div className={"bott-info-main"}>
                          <CalendarToday sx={{ fontSize: 18, color: '#667eea', mr: 1 }} />
                          {value.date}
                        </div>
                        <div className={"bott-info-main"}>
                          <LocationOn sx={{ fontSize: 18, color: '#667eea', mr: 1 }} />
                          {value.location}
                        </div>
                      </div>
                    </Box>
                  </Box>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <Box className={"prev-next-frame"}>
          <img
            src={"/icons/arrow-right.svg"}
            className={"swiper-button-prev"}
            alt="Previous"
          />
          <div className={"dot-frame-pagination swiper-pagination"}></div>
          <img
            src={"/icons/arrow-right.svg"}
            className={"swiper-button-next"}
            style={{ transform: "rotate(-180deg)" }}
            alt="Next"
          />
        </Box>
      </Stack>
    </div>
  );
}
