// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import slideImages from "./sliderImages.json";
import "./App.css";

// import required modules
import { Autoplay, Pagination } from "swiper/modules";

export default function SliderComponent() {
  const sliderImages = slideImages.images;
  return (
    <>
      <Swiper
        pagination={true}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        speed={2500}
        loop={true}
      >
        {sliderImages.map((image) => (
          <SwiperSlide>
            <img src={image.img} alt={image.alt} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
