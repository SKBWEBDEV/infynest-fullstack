
// File Path: client/src/components/home/CategoryProducts.jsx

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
  badge = "HOT",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigationId = `category-${categorySlug
    ?.toLowerCase()
    .replace(/\s+/g, "-")}`;

  // ==========================================
  // FETCH CATEGORY PRODUCTS
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        /*
          IMPORTANT:
          Add Product form uses "Design Category".
          So first try designCategory.
        */

        const response = await API.get(
          `/products?designCategory=${encodeURIComponent(categorySlug)}`
        );

        console.log(
          `Products for design category "${categorySlug}":`,
          response.data
        );

        const data = response.data;

        const productList =
          data?.products ||
          data?.data ||
          data?.results ||
          [];

        if (mounted) {
          setProducts(
            Array.isArray(productList) ? productList : []
          );
        }
      } catch (error) {
        console.error(
          `Failed to load ${categorySlug} products:`,
          error
        );

        if (mounted) {
          setProducts([]);

          toast.error(
            error?.response?.data?.message ||
              `Failed to load ${title} products`
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
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [categorySlug, title]);

  // ==========================================
  // GET IMAGE
  // ==========================================
  const getImage = (product) => {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (firstImage?.url) {
        return firstImage.url;
      }
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
    const retailPrice = Number(
      product.retailPrice || 0
    );

    const discountPrice =
      product.discountPrice !== null &&
      product.discountPrice !== undefined
        ? Number(product.discountPrice)
        : null;

    const hasDiscount =
      discountPrice !== null &&
      discountPrice < retailPrice;

    return {
      retailPrice,
      discountPrice,
      hasDiscount,
      finalPrice: hasDiscount
        ? discountPrice
        : retailPrice,
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
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />

              <div className="mt-2 h-1 w-12 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* PRODUCT SKELETON */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
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
    return (
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* HEADER */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {title}
              </h2>

              <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
            </div>

            <Link
              to="/shop"
              className="
                text-xs
                sm:text-sm
                font-semibold
                text-indigo-600
                hover:text-indigo-800
                transition
              "
            >
              View All →
            </Link>
          </div>

          <div className="
            py-10
            text-center
            border
            border-dashed
            border-gray-300
            rounded-xl
          ">
            <p className="text-sm text-gray-500">
              No products available in {title}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ======================================
            HEADER
        ====================================== */}
        <div className="flex items-end justify-between mb-6">

          {/* LEFT */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h2>

            <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* PREVIOUS */}
            <button
              type="button"
              className={`
                ${navigationId}-prev
                hidden
                sm:flex
                items-center
                justify-center
                w-8
                h-8
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

            {/* NEXT */}
            <button
              type="button"
              className={`
                ${navigationId}-next
                hidden
                sm:flex
                items-center
                justify-center
                w-8
                h-8
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
              to={`/${categorySlug
                ?.toLowerCase()
                .replace(/\s+/g, "-")}`}
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
        <div className="w-full overflow-hidden">

          <Swiper
            modules={[Autoplay, Navigation]}
            navigation={{
              prevEl: `.${navigationId}-prev`,
              nextEl: `.${navigationId}-next`,
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
            className="!pb-2"
          >

            {products.map((product) => {
              const productId =
                product._id || product.id;

              const image = getImage(product);

              const {
                retailPrice,
                discountPrice,
                hasDiscount,
                finalPrice,
              } = getPricing(product);

              return (
                <SwiperSlide
                  key={productId}
                  className="!h-auto"
                >
                  {/* PRODUCT CARD */}
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
                      flex
                      flex-col
                    "
                  >

                    {/* IMAGE */}
                    <Link
                      to={`/product/${productId}`}
                      className="block"
                    >
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
                          alt={
                            product.name ||
                            product.title ||
                            "Product"
                          }
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
                            e.currentTarget.src =
                              "/placeholder-product.jpg";
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
                        flex
                        flex-col
                        flex-grow
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

                      {/* NAME */}
                      <Link
                        to={`/product/${productId}`}
                      >
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
                          {product.name ||
                            product.title}
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

                      {/* BUY NOW */}
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
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

