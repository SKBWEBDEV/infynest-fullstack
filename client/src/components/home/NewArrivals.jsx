// File Path: client/src/components/home/NewArrivals.jsx

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function NewArrivals() {
  const scrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // ==========================================
  // FETCH NEW ARRIVALS FROM DATABASE
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
  // GET PRODUCT IMAGE
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
  // GET HOVER IMAGE
  // ==========================================
  const getHoverImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 1) {
      return product.images[1];
    }

    return getImage(product);
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
  // CARD WIDTH
  // ==========================================
  const getCardWidth = () => {
    if (window.innerWidth < 640) {
      return 280 + 16;
    }

    return 320 + 24;
  };

  // ==========================================
  // PREVIOUS
  // ==========================================
  const handlePrev = () => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: -getCardWidth(),
      behavior: "smooth",
    });
  };

  // ==========================================
  // NEXT
  // ==========================================
  const handleNext = () => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: getCardWidth(),
      behavior: "smooth",
    });
  };

  // ==========================================
  // AUTO SLIDE
  // ==========================================
  useEffect(() => {
    if (isPaused || products.length <= 1) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      const container = scrollRef.current;

      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: getCardWidth(),
          behavior: "smooth",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-56 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
          </div>

          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  flex-none
                  w-[280px]
                  sm:w-[320px]
                  bg-white
                  rounded-lg
                  overflow-hidden
                  border
                  border-gray-100
                  animate-pulse
                "
              >
                <div className="h-72 bg-gray-200" />

                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-5 w-24 bg-gray-200 rounded mt-3" />
                  <div className="h-10 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // NO NEW ARRIVALS
  // ==========================================
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              New Arrivals
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Fresh styles just landed for you
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* DESKTOP ARROWS */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={handlePrev}
                className="
                  p-2.5
                  rounded-full
                  border
                  border-gray-300
                  bg-white
                  hover:bg-gray-900
                  hover:text-white
                  transition
                  shadow-sm
                "
                aria-label="Previous"
              >
                <svg
                  className="w-5 h-5"
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

              <button
                onClick={handleNext}
                className="
                  p-2.5
                  rounded-full
                  border
                  border-gray-300
                  bg-white
                  hover:bg-gray-900
                  hover:text-white
                  transition
                  shadow-sm
                "
                aria-label="Next"
              >
                <svg
                  className="w-5 h-5"
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
            </div>

            <Link
              to="/shop"
              className="
                text-xs
                sm:text-sm
                font-semibold
                text-indigo-600
                hover:text-indigo-800
                whitespace-nowrap
              "
            >
              View All →
            </Link>
          </div>
        </div>

        {/* ==========================================
            PRODUCTS SLIDER
        ========================================== */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="
            flex
            gap-4
            sm:gap-6
            overflow-x-auto
            py-2
            scroll-smooth
            no-scrollbar
            w-full
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product) => {
            const productId = product._id || product.id;

            const image = getImage(product);
            const hoverImage = getHoverImage(product);

            const { retailPrice, discountPrice, hasDiscount, finalPrice } =
              getPrice(product);

            return (
              <div
                key={productId}
                className="
                  group
                  flex-none
                  w-[280px]
                  sm:w-[320px]
                  bg-white
                  rounded-lg
                  shadow-sm
                  border
                  border-gray-100
                  overflow-hidden
                  hover:shadow-md
                  transition
                  flex
                  flex-col
                "
              >
                {/* ==================================
                    IMAGE
                ================================== */}
                <Link to={`/product/${productId}`} className="block">
                  <div
                    className="
                      relative
                      h-72
                      overflow-hidden
                      bg-gray-100
                    "
                  >
                    {/* NEW ARRIVAL BADGE */}
                    <span
                      className="
                        absolute
                        top-3
                        left-3
                        z-20
                        px-2.5
                        py-1
                        rounded-full
                        bg-indigo-600
                        text-white
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                      "
                    >
                      New
                    </span>

                    {/* MAIN IMAGE */}
                    <img
                      src={image}
                      alt={product.name || "Product"}
                      loading="lazy"
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition-opacity
                        duration-500
                        group-hover:opacity-0
                      "
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.jpg";
                      }}
                    />

                    {/* HOVER IMAGE */}
                    <img
                      src={hoverImage}
                      alt=""
                      loading="lazy"
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:opacity-100
                        group-hover:scale-105
                      "
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.jpg";
                      }}
                    />
                  </div>
                </Link>

                {/* ==================================
                    PRODUCT INFO
                ================================== */}
                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/product/${productId}`}>
                    <h3
                      className="
                        text-sm
                        font-medium
                        text-gray-800
                        line-clamp-2
                        min-h-[40px]
                        hover:text-indigo-600
                        transition
                      "
                    >
                      {product.name}
                    </h3>
                  </Link>

                  {/* PRICE */}
                  <div className="mt-2">
                    {hasDiscount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">
                          ৳{retailPrice}
                        </span>

                        <span className="text-lg font-bold text-gray-900">
                          ৳{discountPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ৳{finalPrice}
                      </span>
                    )}
                  </div>

                  {/* ADD TO CART / DETAILS */}
                  <Link
                    to={`/product/${productId}`}
                    className="
                      mt-4
                      w-full
                      bg-gray-900
                      text-white
                      py-2.5
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-center
                      hover:bg-indigo-600
                      transition
                    "
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
