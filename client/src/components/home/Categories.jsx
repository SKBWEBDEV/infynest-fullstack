
// File Path: src/components/home/CategoryProducts.jsx

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function CategoryProducts({
  title,
  categorySlug,
  badge = "HOT SALE",
}) {
  const scrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // ============================================
  // FETCH CATEGORY PRODUCTS
  // ============================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await API.get(
          `/products?category=${encodeURIComponent(categorySlug)}`
        );

        console.log(
          `Products for ${categorySlug}:`,
          response.data
        );

        const data = response.data;

        const productList =
          data?.products ||
          data?.data ||
          data?.results ||
          [];

        setProducts(
          Array.isArray(productList)
            ? productList
            : []
        );
      } catch (error) {
        console.error(
          `Failed to fetch ${categorySlug} products:`,
          error
        );

        setProducts([]);

        toast.error(
          error?.response?.data?.message ||
            `Failed to load ${title} products`
        );
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug, title]);

  // ============================================
  // MOBILE AUTO SLIDER
  // ============================================
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const autoSlide = () => {
      // Only mobile
      if (window.innerWidth >= 640) return;

      // Don't slide when paused
      if (isPaused) return;

      // No products
      if (!products.length) return;

      const firstCard =
        container.querySelector("[data-product-card]");

      if (!firstCard) return;

      const cardWidth =
        firstCard.getBoundingClientRect().width;

      const styles = window.getComputedStyle(container);

      const gap =
        parseFloat(styles.columnGap || styles.gap || 0);

      const scrollAmount = cardWidth + gap;

      const maxScroll =
        container.scrollWidth -
        container.clientWidth;

      if (maxScroll <= 0) return;

      const currentScroll =
        container.scrollLeft;

      // If near end -> go back to beginning
      if (
        currentScroll + scrollAmount >=
        maxScroll - 5
      ) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    };

    const interval = setInterval(
      autoSlide,
      2500
    );

    return () => {
      clearInterval(interval);
    };
  }, [isPaused, products]);

  // ============================================
  // IMAGE
  // ============================================
  const getImage = (product) => {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    if (product.image) {
      return product.image;
    }

    return "/placeholder-product.jpg";
  };

  // ============================================
  // ADD TO CART
  // ============================================
  const handleAddToCart = async (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId =
        product._id || product.id;

      // ------------------------------------------
      // Change this endpoint if your backend uses
      // another cart route.
      // ------------------------------------------
      await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      toast.success(
        `${product.name} added to cart!`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to add product to cart"
      );
    }
  };

  // ============================================
  // HEADER
  // ============================================
  const Header = () => (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
          {title}
        </h2>

        <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
      </div>

      <Link
        to={`/category/${categorySlug}`}
        className="
          text-sm
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
  );

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
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

  // ============================================
  // NO PRODUCTS
  // ============================================
  if (products.length === 0) {
    return (
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header />

          <div
            className="
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
        </div>
      </section>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================
  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* ========================================
            HEADER
        ======================================== */}
        <div className="px-4 sm:px-6 lg:px-8">
          <Header />
        </div>

        {/* ========================================
            MOBILE / DESKTOP PRODUCTS
        ======================================== */}
        <div
          ref={scrollRef}
          onMouseEnter={() =>
            setIsPaused(true)
          }
          onMouseLeave={() =>
            setIsPaused(false)
          }
          onTouchStart={() =>
            setIsPaused(true)
          }
          onTouchEnd={() => {
            // Give user a little time before auto-slide
            setTimeout(() => {
              setIsPaused(false);
            }, 1200);
          }}
          className="
            flex
            gap-3
            overflow-x-auto
            px-4
            sm:px-6
            lg:px-8
            pb-2

            sm:grid
            sm:grid-cols-4
            sm:gap-5
            sm:overflow-hidden

            scrollbar-hide
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          {products.map(
            (product, index) => {
              const productId =
                product._id ||
                product.id;

              const image =
                getImage(product);

              const retailPrice =
                Number(
                  product.retailPrice || 0
                );

              const discountPrice =
                product.discountPrice !==
                  null &&
                product.discountPrice !==
                  undefined
                  ? Number(
                      product.discountPrice
                    )
                  : null;

              const hasDiscount =
                discountPrice !== null &&
                discountPrice <
                  retailPrice;

              const finalPrice =
                hasDiscount
                  ? discountPrice
                  : retailPrice;

              return (
                <div
                  key={`${productId}-${index}`}
                  data-product-card
                  className="
                    group
                    flex-none

                    w-[calc(50%-6px)]

                    sm:w-auto

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
                  {/* ==================================
                      PRODUCT IMAGE
                  ================================== */}
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
                      {/* Badge */}
                      {badge && (
                        <span
                          className="
                            absolute
                            top-2
                            left-2
                            z-10

                            bg-black
                            text-white

                            text-[9px]
                            sm:text-[10px]

                            font-bold
                            px-2
                            py-1
                            rounded
                          "
                        >
                          {badge}
                        </span>
                      )}

                      <img
                        src={image}
                        alt={
                          product.name ||
                          "Product"
                        }
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

                  {/* ==================================
                      PRODUCT INFO
                  ================================== */}
                  <div className="p-3 sm:p-4">
                    {/* Product Type */}
                    <p
                      className="
                        text-[9px]
                        sm:text-[10px]
                        font-semibold
                        text-gray-500
                        uppercase
                        mb-1
                      "
                    >
                      T-SHIRT
                    </p>

                    {/* Product Name */}
                    <Link
                      to={`/product/${productId}`}
                    >
                      <h3
                        className="
                          text-xs
                          sm:text-sm
                          font-semibold
                          text-gray-900

                          line-clamp-2
                          min-h-[32px]

                          hover:text-indigo-600
                          transition
                        "
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mt-2">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="
                              text-[11px]
                              sm:text-xs
                              text-gray-400
                              line-through
                            "
                          >
                            ৳{retailPrice}
                          </span>

                          <span
                            className="
                              text-sm
                              sm:text-base
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
                            text-sm
                            sm:text-base
                            font-bold
                            text-gray-900
                          "
                        >
                          ৳{finalPrice}
                        </span>
                      )}
                    </div>

                    {/* ==================================
                        ACTION BUTTONS
                    ================================== */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {/* View Details */}
                      <Link
                        to={`/product/${productId}`}
                        className="
                          flex
                          items-center
                          justify-center

                          py-2
                          px-2

                          rounded-lg
                          border
                          border-gray-300

                          text-[10px]
                          sm:text-xs
                          font-semibold
                          text-gray-700

                          hover:bg-gray-100
                          transition
                        "
                      >
                        View Details
                      </Link>

                      {/* Add To Cart */}
                      <button
                        type="button"
                        onClick={(e) =>
                          handleAddToCart(
                            e,
                            product
                          )
                        }
                        className="
                          flex
                          items-center
                          justify-center

                          py-2
                          px-2

                          rounded-lg

                          bg-indigo-600
                          text-white

                          text-[10px]
                          sm:text-xs
                          font-semibold

                          hover:bg-indigo-700
                          active:scale-95

                          transition
                        "
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

