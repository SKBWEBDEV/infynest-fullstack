// File Path: src/pages/Anime.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Anime() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ANIME PRODUCTS
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await API.get("/products?category=anime");

        console.log("Anime products:", response.data);

        const data = response.data;

        const productList = data?.products || data?.data || data?.results || [];

        if (mounted) {
          setProducts(Array.isArray(productList) ? productList : []);
        }
      } catch (error) {
        console.error("Failed to fetch Anime products:", error);

        if (mounted) {
          setProducts([]);

          toast.error(
            error?.response?.data?.message || "Failed to load Anime products",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
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
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="mb-6">
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />

            <div className="mt-2 h-1 w-12 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* PRODUCT SKELETON */}
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              gap-3
              sm:gap-5
            "
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
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
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-900
              "
            >
              Anime
            </h1>

            <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
          </div>

          <div
            className="
              py-14
              text-center
              border
              border-dashed
              border-gray-300
              rounded-xl
            "
          >
            <p className="text-sm text-gray-500">
              No Anime products available.
            </p>

            <Link
              to="/"
              className="
                inline-flex
                mt-4
                px-5
                py-2.5
                rounded-lg
                bg-indigo-600
                text-white
                text-sm
                font-semibold
                hover:bg-indigo-700
                transition
              "
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <section className="py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-bold
                text-gray-900
              "
            >
              Anime
            </h1>

            <div className="mt-2 h-1 w-12 bg-indigo-600 rounded-full" />
          </div>

          <span className="text-sm text-gray-500">
            {products.length} Products
          </span>
        </div>

        {/* ======================================
            PRODUCT GRID
        ====================================== */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-3
            sm:gap-5
          "
        >
          {products.map((product) => {
            const productId = product._id || product.id;

            const image = getImage(product);

            const { retailPrice, discountPrice, hasDiscount, finalPrice } =
              getPricing(product);

            return (
              <div
                key={productId}
                className="
                  group
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
                    IMAGE
                ================================== */}
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
                      ANIME
                    </span>

                    {/* IMAGE */}
                    <img
                      src={image}
                      alt={product.name || "Anime Product"}
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

                {/* ==================================
                    PRODUCT INFO
                ================================== */}
                <div className="p-2.5 sm:p-3">
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
                    ANIME
                  </p>

                  {/* PRODUCT NAME */}
                  <Link to={`/product/${productId}`}>
                    <h2
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
                    </h2>
                  </Link>

                  {/* PRICE */}
                  <div className="mt-2">
                    {hasDiscount ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
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

                  {/* ==================================
                      BUTTONS
                  ================================== */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {/* DETAILS */}
                    <Link
                      to={`/product/${productId}`}
                      className="
                        flex
                        items-center
                        justify-center
                        py-2
                        px-1
                        rounded-md
                        border
                        border-gray-300
                        text-[8px]
                        sm:text-[9px]
                        font-semibold
                        text-gray-700
                        hover:bg-gray-100
                        transition
                      "
                    >
                      Details
                    </Link>

                    {/* ADD CART */}
                    <Link
                      to={`/product/${productId}`}
                      className="
                        flex
                        items-center
                        justify-center
                        py-2
                        px-1
                        rounded-md
                        bg-indigo-600
                        text-white
                        text-[8px]
                        sm:text-[9px]
                        font-semibold
                        hover:bg-indigo-700
                        transition
                      "
                    >
                      Add Cart
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
