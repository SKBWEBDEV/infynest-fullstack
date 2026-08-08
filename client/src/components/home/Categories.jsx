
// File Path: src/components/home/CategoryProducts.jsx

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

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
          `/products?category=${categorySlug}`
        );

        console.log(
          `Products for ${categorySlug}:`,
          response.data
        );

        const data = response.data;

        // Backend response handle
        const productList =
          data?.products ||
          data?.data ||
          data?.results ||
          [];

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (error) {
        console.error(
          `Failed to fetch ${categorySlug} products:`,
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug]);

  // ============================================
  // MOBILE AUTO SLIDER
  // ============================================
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const interval = setInterval(() => {
      // Only mobile
      if (window.innerWidth >= 640) return;

      // Pause when mouse is over the slider
      if (isPaused) return;

      // No products
      if (products.length === 0) return;

      const cardWidth = container.clientWidth / 2;

      const maxScroll =
        container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0) return;

      // Go back to beginning
      if (
        container.scrollLeft + cardWidth >=
        maxScroll - 5
      ) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: cardWidth,
          behavior: "smooth",
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, products]);

  // ============================================
  // PRICE
  // ============================================
  const getPrice = (product) => {
    return product.discountPrice ??
      product.retailPrice ??
      0;
  };

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

    // fallback for old products
    if (product.image) {
      return product.image;
    }

    return "/placeholder-product.jpg";
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-gray-900">
                {title}
              </h2>

              <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
            </div>

            <Link
              to={`/category/${categorySlug}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap"
            >
              View All →
            </Link>
          </div>

          {/* Loading Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-gray-100 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-gray-200" />

                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
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
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-gray-900">
                {title}
              </h2>

              <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
            </div>

            <Link
              to={`/category/${categorySlug}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap"
            >
              View All →
            </Link>
          </div>

          <div className="py-10 text-center border border-dashed border-gray-300 rounded-xl">
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
    <section className="w-full">
      {/* ========================================
          HEADER
      ======================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-end justify-between">
          {/* Category Name */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-gray-900">
              {title}
            </h2>

            <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
          </div>

          {/* View All */}
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
      </div>

      {/* ========================================
          PRODUCTS
      ======================================== */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8

          flex
          gap-3

          overflow-x-auto
          scrollbar-hide

          sm:grid
          sm:grid-cols-4
          sm:gap-5
          sm:overflow-hidden
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {products.map((product, index) => {
          const productId =
            product._id || product.id;

          const image = getImage(product);

          const retailPrice =
            Number(product.retailPrice || 0);

          const discountPrice =
            product.discountPrice !== null &&
            product.discountPrice !== undefined
              ? Number(product.discountPrice)
              : null;

          const finalPrice =
            discountPrice !== null
              ? discountPrice
              : retailPrice;

          return (
            <Link
              to={`/product/${productId}`}
              key={`${productId}-${index}`}
              className="
                group
                flex-none

                w-[calc(50%-6px)]

                sm:w-auto

                bg-white
                rounded-lg
                overflow-hidden
                border
                border-gray-100
                shadow-sm
                hover:shadow-lg
                transition
              "
            >
              {/* ==================================
                  IMAGE
              ================================== */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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
                  alt={product.name || "Product"}
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
                <h3
                  className="
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-900
                    line-clamp-2
                    min-h-[32px]
                  "
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-2">
                  {discountPrice !== null &&
                  discountPrice < retailPrice ? (
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
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

