import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function CategoryProducts({
  title,
  products = [],
  categorySlug,
  badge = "HOT SALE",
}) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // ============================================
  // MOBILE AUTO SLIDER
  // ============================================
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const handleResize = () => {
      // PC হলে কোনো auto slider না
      if (window.innerWidth >= 640) return;
    };

    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      // শুধুমাত্র mobile
      if (window.innerWidth >= 640) return;

      if (isPaused) return;

      const cardWidth = container.clientWidth / 2;

      const maxScroll = container.scrollWidth - container.clientWidth;

      // শেষের দিকে গেলে আবার শুরুতে
      if (container.scrollLeft + cardWidth >= maxScroll - 5) {
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

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [isPaused]);

  // ============================================
  // PRODUCTS
  // ============================================

  return (
    <section className="w-full py-8 sm:py-12">
      {/* ========================================
          HEADER
      ======================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-end justify-between gap-4">
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
        {products.map((product, index) => (
          <Link
            to={`/product/${product._id || product.id}`}
            key={`${product._id || product.id}-${index}`}
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
                src={product.image}
                alt={product.name}
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
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
                {product.originalPrice &&
                product.originalPrice > product.price ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        text-[11px]
                        sm:text-xs
                        text-gray-400
                        line-through
                      "
                    >
                      ৳{product.originalPrice}
                    </span>

                    <span
                      className="
                        text-sm
                        sm:text-base
                        font-bold
                        text-gray-900
                      "
                    >
                      ৳{product.price}
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
                    ৳{product.price}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
