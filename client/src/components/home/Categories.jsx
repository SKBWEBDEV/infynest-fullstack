// File Path: src/components/home/CategoryProducts.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import API from "../../services/api";
import toast from "react-hot-toast";

export default function CategoryProducts({
  title,
  categorySlug,
  badge = "HOT SALE",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // UNIQUE NAVIGATION ID
  // ==========================================
  const navigationId = `category-${categorySlug}`;

  // ==========================================
  // FETCH CATEGORY PRODUCTS
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await API.get(
          `/products?category=${encodeURIComponent(categorySlug)}`,
        );

        console.log(`Products for ${categorySlug}:`, response.data);

        const data = response.data;

        const productList = data?.products || data?.data || data?.results || [];

        if (mounted) {
          setProducts(Array.isArray(productList) ? productList : []);
        }
      } catch (error) {
        console.error(`Failed to fetch ${categorySlug} products:`, error);

        if (mounted) {
          setProducts([]);

          toast.error(
            error?.response?.data?.message ||
              `Failed to load ${title} products`,
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (categorySlug) {
      fetchProducts();
    }

    return () => {
      mounted = false;
    };
  }, [categorySlug, title]);

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
  // GET PRICING
  // ==========================================
  const getPricing = (product) => {
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
  // ADD TO CART
  // ==========================================
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId = product._id || product.id;

      await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to add product to cart",
      );
    }
  };

  // ==========================================
  // HEADER
  // ==========================================
  const Header = () => (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        mb-5
      "
    >
      {/* TITLE */}
      <div>
        <h2
          className="
            text-xl
            sm:text-2xl
            font-bold
            text-gray-900
          "
        >
          {title}
        </h2>

        <div
          className="
            mt-2
            h-1
            w-12
            bg-indigo-600
            rounded-full
          "
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2">
        {/* PREVIOUS BUTTON */}
        <button
          type="button"
          className={`
            ${navigationId}-prev

            flex
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
            cursor-pointer
          `}
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

        {/* NEXT BUTTON */}
        <button
          type="button"
          className={`
            ${navigationId}-next

            flex
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
            cursor-pointer
          `}
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
          to={`/category/${categorySlug}`}
          className="
            ml-1

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
  );

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="py-6">
        <div className="mb-5 px-4 sm:px-6 lg:px-8">
          <Header />
        </div>

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-4
            gap-3
            sm:gap-5
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                  bg-gray-100
                  rounded-xl
                  overflow-hidden
                  animate-pulse
                "
            >
              <div
                className="
                    aspect-[3/4]
                    bg-gray-200
                  "
              />

              <div className="p-3">
                <div
                  className="
                      h-3
                      bg-gray-200
                      rounded
                      mb-2
                    "
                />

                <div
                  className="
                      h-4
                      bg-gray-200
                      rounded
                      w-3/4
                      mb-3
                    "
                />

                <div
                  className="
                      h-8
                      bg-gray-200
                      rounded
                    "
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ==========================================
  // NO PRODUCTS
  // ==========================================
  if (products.length === 0) {
    return (
      <section className="py-6">
        <div className="mb-5 px-4 sm:px-6 lg:px-8">
          <Header />
        </div>

        <div
          className="
            mx-4
            sm:mx-6
            lg:mx-8

            py-10

            text-center

            border
            border-dashed
            border-gray-300

            rounded-xl
          "
        >
          <p className="text-sm text-gray-500">
            No products available in {title}.
          </p>
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <section className="py-6">
      {/* ======================================
          HEADER
      ====================================== */}
      <div className="px-4 sm:px-6 lg:px-8">
        <Header />
      </div>

      {/* ======================================
          SWIPER PRODUCT SLIDER
      ====================================== */}
      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl: `.${navigationId}-prev`,
          nextEl: `.${navigationId}-next`,
        }}
        /*
          Infinite loop
          Swiper needs enough slides for loop mode.
        */
        loop={products.length >= 4}
        /*
          AUTO SLIDE
        */
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        /*
          Smooth transition
        */
        speed={700}
        /*
          MOBILE
          Exactly 2 cards.
        */
        slidesPerView={2}
        spaceBetween={10}
        /*
          RESPONSIVE
        */
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
        /*
          Important:
          prevent Swiper from stretching cards
        */
        className="
          !px-4
          sm:!px-6
          lg:!px-8
          !pb-2
        "
      >
        {products.map((product) => {
          const productId = product._id || product.id;

          const image = getImage(product);

          const { retailPrice, discountPrice, hasDiscount, finalPrice } =
            getPricing(product);

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
                {/* =================================
                      PRODUCT IMAGE
                  ================================= */}
                <Link to={`/product/${productId}`} className="block">
                  <div
                    className="
                        relative
                        aspect-[3/4]
                        overflow-hidden
                        bg-gray-100
                      "
                  >
                    {/* BADGE */}
                    {badge && (
                      <span
                        className="
                            absolute
                            top-2
                            left-2
                            z-10

                            bg-black
                            text-white

                            text-[8px]
                            sm:text-[9px]

                            font-bold

                            px-1.5
                            py-1

                            rounded
                          "
                      >
                        {badge}
                      </span>
                    )}

                    {/* IMAGE */}
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

                {/* =================================
                      PRODUCT INFO
                  ================================= */}
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

                  {/* =================================
                        PRICE
                    ================================= */}
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
                        {/* OLD PRICE */}
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

                  {/* =================================
                        ACTION BUTTONS
                    ================================= */}
                  <div
                    className="
                        mt-2
                        grid
                        grid-cols-2
                        gap-1
                      "
                  >
                    {/* VIEW DETAILS */}
                    <Link
                      to={`/product/${productId}`}
                      className="
                          flex
                          items-center
                          justify-center

                          py-1.5
                          px-1

                          rounded-md

                          border
                          border-gray-300

                          text-[8px]
                          sm:text-[9px]
                          lg:text-[10px]

                          font-semibold
                          text-gray-700

                          hover:bg-gray-100

                          transition

                          whitespace-nowrap
                        "
                    >
                      Details
                    </Link>

                    {/* ADD TO CART */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="
                          flex
                          items-center
                          justify-center

                          py-1.5
                          px-1

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
                      Add Cart
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
