// File Path: client/src/components/home/NewArrivals.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import API from "../../services/api";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH NEW ARRIVALS
  // ==========================================
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);

        const response = await API.get("/products?isNewArrival=true");

        console.log("New Arrivals:", response.data);

        const data = response.data;

        const productList = data?.products || data?.data || data?.results || [];

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (error) {
        console.error("Failed to load new arrivals:", error);

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // ==========================================
  // GET IMAGE
  // ==========================================
  const getImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    if (product.image) {
      return product.image;
    }

    return "/placeholder-product.jpg";
  };

  // ==========================================
  // GET PRICE
  // ==========================================
  const getPrice = (product) => {
    const retailPrice = Number(product.retailPrice || 0);

    const discountPrice =
      product.discountPrice !== null && product.discountPrice !== undefined
        ? Number(product.discountPrice)
        : null;

    const hasDiscount = discountPrice !== null && discountPrice < retailPrice;

    return {
      retailPrice,
      discountPrice,
      hasDiscount,
      finalPrice: hasDiscount ? discountPrice : retailPrice,
    };
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />

              <div className="h-4 w-56 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
          </div>

          {/* PRODUCT SKELETON */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="
                  bg-gray-100
                  rounded-xl
                  overflow-hidden
                  animate-pulse
                "
              >
                <div className="aspect-[3/4] bg-gray-200" />

                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2" />

                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // NO PRODUCTS
  // ==========================================
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="flex items-center justify-between gap-4 mb-5">
          {/* TITLE */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              New Arrivals
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Fresh styles just landed for you
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* PREVIOUS */}
            <button
              type="button"
              className="new-arrivals-prev hidden sm:flex
                items-center
                justify-center
                w-8
                h-8
                sm:w-9
                sm:h-9
                rounded-full
                border
                border-gray-300
                bg-white
                text-gray-700
                shadow-sm
                hover:bg-gray-900
                hover:text-white
                hover:border-gray-900
                transition
              "
              aria-label="Previous products"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* NEXT */}
            <button
              type="button"
              className="new-arrivals-next hidden sm:flex
                items-center
                justify-center
                w-8
                h-8
                sm:w-9
                sm:h-9
                rounded-full
                border
                border-gray-300
                bg-white
                text-gray-700
                shadow-sm
                hover:bg-gray-900
                hover:text-white
                hover:border-gray-900
                transition
              "
              aria-label="Next products"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* VIEW ALL */}
            <Link
              to="/shop"
              className="
                text-xs
                sm:text-sm
                font-semibold
                text-indigo-600
                hover:text-indigo-800
                transition
                whitespace-nowrap
              "
            >
              View All →
            </Link>
          </div>
        </div>

        {/* ======================================
            PRODUCT SLIDER
        ====================================== */}
        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{
            prevEl: ".new-arrivals-prev",
            nextEl: ".new-arrivals-next",
          }}
          loop={products.length >= 4}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={700}
          slidesPerView={2}
          spaceBetween={10}
          breakpoints={{
            0: {
              slidesPerView: 2,
              spaceBetween: 10,
            },

            640: {
              slidesPerView: 3,
              spaceBetween: 14,
            },

            1024: {
              slidesPerView: 6,
              spaceBetween: 14,
            },

            1280: {
              slidesPerView: 7,
              spaceBetween: 16,
            },
          }}
          className="!px-0 !pb-2"
        >
          {products.map((product) => {
            const productId = product._id || product.id;

            const image = getImage(product);

            const { retailPrice, discountPrice, hasDiscount, finalPrice } =
              getPrice(product);

            return (
              <SwiperSlide key={productId} className="!h-auto">
                {/* =================================
                    PRODUCT CARD
                ================================= */}
                <div
                  className="
                    group
                    h-full
                    bg-white
                    rounded-xl
                    overflow-hidden
                    border
                    border-gray-200
                    shadow-sm
                    hover:shadow-lg
                    transition
                  "
                >
                  {/* IMAGE */}
                  <Link to={`/product/${productId}`} className="block">
                    <div
                      className="
                        relative
                        aspect-[3/4]
                        overflow-hidden
                        bg-gray-100
                      "
                    >
                      {/* NEW BADGE */}
                      <span
                        className="
                          absolute
                          top-2
                          left-2
                          z-10
                          bg-indigo-600
                          text-white
                          text-[8px]
                          sm:text-[9px]
                          font-bold
                          px-1.5
                          py-1
                          rounded
                        "
                      >
                        NEW
                      </span>

                      {/* PRODUCT IMAGE */}
                      <img
                        src={image}
                        alt={product.name || "Product"}
                        loading="lazy"
                        className="
                          w-full
                          h-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                  </Link>

                  {/* PRODUCT INFO */}
                  <div
                    className="
                      p-2
                      sm:p-2.5
                      lg:p-3
                    "
                  >
                    {/* PRODUCT TYPE */}
                    <p
                      className="
                        text-[8px]
                        sm:text-[9px]
                        font-semibold
                        text-gray-500
                        uppercase
                        mb-1
                      "
                    >
                      T-SHIRT
                    </p>

                    {/* PRODUCT NAME */}
                    <Link to={`/product/${productId}`}>
                      <h3
                        className="
                          text-[10px]
                          sm:text-xs
                          lg:text-sm
                          font-semibold
                          text-gray-900
                          line-clamp-2
                          min-h-[28px]
                          hover:text-indigo-600
                          transition
                        "
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {/* PRICE */}
                    <div className="mt-1.5">
                      {hasDiscount ? (
                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            flex-wrap
                          "
                        >
                          {/* RETAIL PRICE */}
                          <span
                            className="
                              text-[9px]
                              sm:text-[10px]
                              text-gray-400
                              line-through
                            "
                          >
                            ৳{retailPrice}
                          </span>

                          {/* DISCOUNT PRICE */}
                          <span
                            className="
                              text-xs
                              sm:text-sm
                              font-bold
                              text-gray-900
                            "
                          >
                            ৳{discountPrice}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="
                            text-xs
                            sm:text-sm
                            font-bold
                            text-gray-900
                          "
                        >
                          ৳{finalPrice}
                        </span>
                      )}
                    </div>

                    {/* VIEW PRODUCT */}
                    <div className="mt-2">
                      <Link
                        to={`/product/${productId}`}
                        className="
                          flex
                          items-center
                          justify-center
                          w-full
                          py-2
                          px-2
                          rounded-md
                          bg-indigo-600
                          text-white
                          text-[8px]
                          sm:text-[9px]
                          lg:text-[10px]
                          font-semibold
                          hover:bg-indigo-700
                          active:scale-95
                          transition
                          whitespace-nowrap
                        "
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
