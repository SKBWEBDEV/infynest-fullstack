
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
  const sliderRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPausedRef = useRef(false);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await API.get(
          `/products?category=${encodeURIComponent(categorySlug)}`
        );

        console.log(
          `${categorySlug} products:`,
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
            Array.isArray(productList)
              ? productList
              : []
          );
        }
      } catch (error) {
        console.error(
          `Failed to fetch ${categorySlug}:`,
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
    }

    return () => {
      mounted = false;
    };
  }, [categorySlug, title]);

  // ==========================================
  // IMAGE
  // ==========================================
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

  // ==========================================
  // PRICE
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
  // GET ORIGINAL CONTENT WIDTH
  // ==========================================
  const getOriginalWidth = () => {
    const slider = sliderRef.current;

    if (!slider) {
      return 0;
    }

    const cards =
      slider.querySelectorAll(
        "[data-original-card]"
      );

    if (!cards.length) {
      return 0;
    }

    const firstCard = cards[0];

    const cardWidth =
      firstCard.getBoundingClientRect().width;

    const styles =
      window.getComputedStyle(slider);

    const gap =
      parseFloat(
        styles.columnGap ||
          styles.gap ||
          "0"
      ) || 0;

    return (
      (cardWidth + gap) *
      products.length
    );
  };

  // ==========================================
  // AUTO SLIDE
  // ==========================================
  useEffect(() => {
    if (products.length < 2) {
      return;
    }

    let lastTime = 0;

    // ========================================
    // SPEED
    // ========================================
    // 20 = slow
    // 30 = normal
    // 40 = fast
    const SPEED = 30;

    const animate = (time) => {
      if (!lastTime) {
        lastTime = time;
      }

      const delta =
        (time - lastTime) / 1000;

      lastTime = time;

      const slider = sliderRef.current;

      if (!slider) {
        animationRef.current =
          requestAnimationFrame(animate);

        return;
      }

      // ======================================
      // MOBILE ONLY
      // ======================================
      if (
        window.innerWidth < 640 &&
        !isPausedRef.current
      ) {
        slider.scrollLeft +=
          SPEED * delta;

        // ====================================
        // INFINITE LOOP
        // ====================================
        const originalWidth =
          getOriginalWidth();

        if (
          originalWidth > 0 &&
          slider.scrollLeft >=
            originalWidth
        ) {
          slider.scrollLeft -=
            originalWidth;
        }
      }

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [products]);

  // ==========================================
  // TOUCH START
  // ==========================================
  const handleTouchStart = () => {
    isPausedRef.current = true;

    if (pauseTimeoutRef.current) {
      clearTimeout(
        pauseTimeoutRef.current
      );
    }
  };

  // ==========================================
  // TOUCH END
  // ==========================================
  const handleTouchEnd = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(
        pauseTimeoutRef.current
      );
    }

    pauseTimeoutRef.current =
      setTimeout(() => {
        isPausedRef.current = false;
      }, 1500);
  };

  // ==========================================
  // MOUSE ENTER
  // ==========================================
  const handleMouseEnter = () => {
    // Desktop doesn't auto-slide anyway.
    // This only prevents accidental movement.
    isPausedRef.current = true;
  };

  // ==========================================
  // MOUSE LEAVE
  // ==========================================
  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  // ==========================================
  // CLEANUP
  // ==========================================
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (pauseTimeoutRef.current) {
        clearTimeout(
          pauseTimeoutRef.current
        );
      }
    };
  }, []);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const handleAddToCart = async (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId =
        product._id || product.id;

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

  // ==========================================
  // HEADER
  // ==========================================
  const Header = () => (
    <div
      className="
        flex
        items-end
        justify-between
        gap-4
        mb-5
        px-4
        sm:px-6
        lg:px-8
      "
    >
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

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto">
          <Header />

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
            {[1, 2, 3, 4].map(
              (item) => (
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
              )
            )}
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
      <section className="py-8">
        <div className="max-w-7xl mx-auto">
          <Header />

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
              No products available in{" "}
              {title}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // CREATE 2 COPIES
  // ==========================================
  const sliderProducts = [
    ...products,
    ...products,
  ];

  // ==========================================
  // MAIN
  // ==========================================
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <Header />

        {/* ====================================
            MOBILE SLIDER
        ==================================== */}
        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="
            flex
            gap-3
            overflow-x-auto

            px-4
            sm:px-6
            lg:px-8

            pb-3

            scrollbar-hide

            sm:grid
            sm:grid-cols-4
            sm:gap-5
            sm:overflow-hidden
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling:
              "touch",
            scrollBehavior: "auto",
          }}
        >
          {sliderProducts.map(
            (product, index) => {
              const productId =
                product._id ||
                product.id;

              const image =
                getImage(product);

              const {
                retailPrice,
                discountPrice,
                hasDiscount,
                finalPrice,
              } = getPricing(product);

              return (
                <div
                  key={`${productId}-${index}`}
                  data-product-card
                  data-original-card={
                    index < products.length
                      ? "true"
                      : undefined
                  }
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

                  {/* INFO */}
                  <div className="p-3 sm:p-4">
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

                    {/* PRICE */}
                    <div className="mt-2">
                      {hasDiscount ? (
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            flex-wrap
                          "
                        >
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

                    {/* BUTTONS */}
                    <div
                      className="
                        mt-3
                        grid
                        grid-cols-2
                        gap-2
                      "
                    >
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

