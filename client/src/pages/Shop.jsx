
// File Path: src/pages/Shop.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";
import { HiShoppingBag } from "react-icons/hi";

export default function Shop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ALL PRODUCTS
  // ==========================================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data } = await API.get("/products");

        const productList = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.results || [];

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // BUY NOW
  // ==========================================
  const handleBuyNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0f1115]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />

          <p className="text-xs text-gray-400 mt-4">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* ======================================
            HEADER
        ====================================== */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Explore Our Products
          </h1>

          <p className="text-xs md:text-sm text-gray-400 mt-1.5">
            Browse through our latest collection of items.
          </p>
        </div>

        {/* ======================================
            CATEGORY FILTER
            ONLY ALL
        ====================================== */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="
              px-4
              py-2
              rounded-xl
              text-xs
              font-bold
              bg-purple-600
              text-white
              shadow-lg
              shadow-purple-600/30
              cursor-default
            "
          >
            All
          </button>
        </div>

        {/* ======================================
            PRODUCT COUNT
        ====================================== */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {products.length}{" "}
            {products.length === 1 ? "Product" : "Products"}
          </p>
        </div>

        {/* ======================================
            PRODUCTS GRID
        ====================================== */}
        {products.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center">
            <p className="text-sm text-gray-400">
              No products found.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-3
              sm:gap-4
              md:gap-6
            "
          >
            {products.map((item) => {
              const itemImg =
                item?.images?.[0] || item?.image;

              const formattedImg = getImageUrl(itemImg);

              const hasDiscount =
                item.discountPrice !== null &&
                item.discountPrice !== undefined &&
                Number(item.discountPrice) > 0 &&
                Number(item.discountPrice) <
                  Number(item.retailPrice);

              return (
                <div
                  key={item._id}
                  className="
                    bg-[#161920]
                    border
                    border-gray-800
                    rounded-2xl
                    sm:rounded-3xl
                    overflow-hidden
                    hover:border-purple-500/50
                    transition
                    duration-300
                    flex
                    flex-col
                    justify-between
                    group
                    p-2.5
                    sm:p-3
                    md:p-4
                    shadow-xl
                  "
                >
                  {/* ======================================
                      PRODUCT IMAGE
                  ====================================== */}
                  <div>
                    <div
                      className="
                        relative
                        aspect-[4/5]
                        rounded-xl
                        sm:rounded-2xl
                        overflow-hidden
                        bg-gray-900
                        mb-3
                      "
                    >
                      <img
                        src={formattedImg}
                        alt={item.name || "Product"}
                        className="
                          w-full
                          h-full
                          object-cover
                          object-center
                          group-hover:scale-105
                          transition
                          duration-500
                        "
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder-product.jpg";
                        }}
                      />

                      {/* CATEGORY */}
                      {item.category && (
                        <span
                          className="
                            absolute
                            top-2
                            left-2
                            bg-black/60
                            backdrop-blur-md
                            text-purple-400
                            text-[8px]
                            sm:text-[10px]
                            font-bold
                            px-2
                            py-1
                            rounded-md
                            sm:rounded-lg
                            uppercase
                          "
                        >
                          {item.category}
                        </span>
                      )}

                      {/* DISCOUNT BADGE */}
                      {hasDiscount && (
                        <span
                          className="
                            absolute
                            top-2
                            right-2
                            bg-green-500
                            text-white
                            text-[8px]
                            sm:text-[10px]
                            font-black
                            px-2
                            py-1
                            rounded-md
                            sm:rounded-lg
                          "
                        >
                          {Math.round(
                            ((Number(item.retailPrice) -
                              Number(item.discountPrice)) /
                              Number(item.retailPrice)) *
                              100
                          )}
                          % OFF
                        </span>
                      )}
                    </div>

                    {/* ======================================
                        PRODUCT NAME
                    ====================================== */}
                    <h3
                      className="
                        font-bold
                        text-white
                        text-xs
                        sm:text-sm
                        truncate
                        group-hover:text-purple-400
                        transition
                      "
                    >
                      {item.name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p
                      className="
                        text-[10px]
                        sm:text-xs
                        text-gray-400
                        line-clamp-1
                        mt-1
                      "
                    >
                      {item.description ||
                        "Best quality product for you."}
                    </p>
                  </div>

                  {/* ======================================
                      PRICE + BUY NOW
                  ====================================== */}
                  <div
                    className="
                      pt-3
                      mt-3
                      border-t
                      border-gray-800/80
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      {/* PRICE */}
                      <div className="min-w-0">
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span
                              className="
                                text-xs
                                sm:text-sm
                                font-black
                                text-green-400
                                whitespace-nowrap
                              "
                            >
                              ৳
                              {Number(
                                item.discountPrice
                              ).toLocaleString()}
                            </span>

                            <span
                              className="
                                text-[9px]
                                sm:text-[10px]
                                text-gray-500
                                line-through
                                whitespace-nowrap
                              "
                            >
                              ৳
                              {Number(
                                item.retailPrice
                              ).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="
                              text-xs
                              sm:text-sm
                              font-black
                              text-purple-400
                              whitespace-nowrap
                            "
                          >
                            ৳
                            {Number(
                              item.retailPrice ||
                                item.price ||
                                0
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>

{/* ACTION BUTTONS */}
<div className="flex items-center gap-1.5 shrink-0">

  {/* VIEW DETAILS */}
  <button
    type="button"
    onClick={() => navigate(`/product/${item._id}`)}
    className="
      px-2.5
      sm:px-3.5
      py-2
      bg-gray-700
      hover:bg-gray-600
      text-white
      text-[9px]
      sm:text-xs
      font-bold
      rounded-lg
      sm:rounded-xl
      transition
      flex
      items-center
      justify-center
      cursor-pointer
      whitespace-nowrap
    "
  >
    View Details
  </button>

  {/* BUY NOW */}
  <button
    type="button"
    onClick={() => handleBuyNow(item._id)}
    className="
      px-2.5
      sm:px-3.5
      py-2
      bg-purple-600
      hover:bg-purple-700
      text-white
      text-[9px]
      sm:text-xs
      font-bold
      rounded-lg
      sm:rounded-xl
      transition
      flex
      items-center
      justify-center
      gap-1.5
      shadow-md
      shadow-purple-600/30
      cursor-pointer
      whitespace-nowrap
    "
  >
    <HiShoppingBag size={13} />

    <span>Buy Now</span>
  </button>

</div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

