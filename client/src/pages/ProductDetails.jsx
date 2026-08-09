// File Path: src/pages/ProductDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiShoppingBag,
  HiArrowLeft,
  HiCheck,
  HiHeart,
  HiEye,
  HiLightningBolt,
} from "react-icons/hi";

import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // FETCH PRODUCT
  // ==========================================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(`${API_URL}/products/${id}`);

        const productData = data?.product || data?.data || data;

        setProduct(productData);

        // ==========================================
        // FIRST IMAGE
        // ==========================================
        if (
          Array.isArray(productData?.images) &&
          productData.images.length > 0
        ) {
          setSelectedImage(productData.images[0]);
        } else if (productData?.image) {
          setSelectedImage(productData.image);
        }

        // ==========================================
        // FIRST SIZE
        // ==========================================
        if (Array.isArray(productData?.sizes) && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }

        // ==========================================
        // FIRST COLOR
        // ==========================================
        if (
          Array.isArray(productData?.colors) &&
          productData.colors.length > 0
        ) {
          setSelectedColor(productData.colors[0]);
        }

        // ==========================================
        // WISHLIST
        // ==========================================
        const savedWishlist =
          JSON.parse(localStorage.getItem("shopbd_wishlist")) || [];

        setIsWishlisted(savedWishlist.includes(id));

        // ==========================================
        // RELATED PRODUCTS
        // ==========================================
        if (productData?.category) {
          const allProductsRes = await axios.get(`${API_URL}/products`);

          const allData = allProductsRes.data;

          const allList = Array.isArray(allData)
            ? allData
            : allData?.products || allData?.data || [];

          const filtered = allList.filter(
            (item) =>
              item?.category?.trim().toLowerCase() ===
                productData.category?.trim().toLowerCase() && item?._id !== id,
          );

          setRelatedProducts(filtered.slice(0, 5));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);

        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading product details...</p>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center px-5">
        <h1 className="text-2xl font-black text-white mb-2">
          Product Not Found
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          The product you are looking for does not exist or has been removed.
        </p>

        <button
          onClick={() => navigate("/products")}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // ==========================================
  // IMAGE URL
  // ==========================================
  const getImageUrl = (img) => {
    if (!img) {
      return "https://via.placeholder.com/400";
    }

    return img.startsWith("http") ? img : `${API_URL}/${img}`;
  };

  // ==========================================
  // PRICE CALCULATION
  // ==========================================
  const retailPrice = Number(product?.retailPrice ?? product?.price ?? 0);

  const discountPrice =
    product?.discountPrice !== null &&
    product?.discountPrice !== undefined &&
    product?.discountPrice !== ""
      ? Number(product.discountPrice)
      : null;

  const hasDiscount =
    discountPrice !== null &&
    !Number.isNaN(discountPrice) &&
    discountPrice >= 0 &&
    retailPrice > 0 &&
    discountPrice < retailPrice;

  const finalPrice = hasDiscount ? discountPrice : retailPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((retailPrice - discountPrice) / retailPrice) * 100)
    : 0;

  const savedAmount = hasDiscount ? retailPrice - discountPrice : 0;

  // ==========================================
  // COLOR SELECT
  // ==========================================
  const handleColorSelect = (color, index) => {
    setSelectedColor(color);

    if (Array.isArray(product.images) && product.images[index]) {
      setSelectedImage(product.images[index]);
    }
  };

  // ==========================================
  // WISHLIST
  // ==========================================
  const toggleWishlist = () => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("shopbd_wishlist")) || [];

    let updatedWishlist;

    if (isWishlisted) {
      updatedWishlist = savedWishlist.filter((item) => item !== id);

      setIsWishlisted(false);
    } else {
      updatedWishlist = [...savedWishlist, id];

      setIsWishlisted(true);
    }

    localStorage.setItem("shopbd_wishlist", JSON.stringify(updatedWishlist));
  };

  // ==========================================
  // QUANTITY
  // ==========================================
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(product.stock || 1, prev + 1));
  };

  // ==========================================
  // VALIDATE PRODUCT OPTIONS
  // ==========================================
  const validateProductOptions = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before continuing.");

      return false;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color before continuing.");

      return false;
    }

    if (!product.stock || product.stock <= 0) {
      alert("This product is currently out of stock.");

      return false;
    }

    return true;
  };

  // ==========================================
  // CREATE CART ITEM
  // ==========================================
  const createCartItem = () => {
    return {
      cartId: `${product._id}-${
        selectedSize || "nosize"
      }-${selectedColor || "nocolor"}`,

      productId: product._id,

      name: product.name,

      // Discount price becomes actual price
      price: finalPrice,

      // Original price
      retailPrice: retailPrice,

      // Discount price
      discountPrice: hasDiscount ? discountPrice : null,

      image: selectedImage,

      size: selectedSize || "N/A",

      color: selectedColor || "N/A",

      quantity: quantity,

      stock: product.stock || 10,
    };
  };

  // ==========================================
  // ADD TO CART
  // ==========================================
  const handleAddToCart = () => {
    if (!validateProductOptions()) {
      return;
    }

    const cartItem = createCartItem();

    addToCart(cartItem);

    setSuccessMessage("Successfully added to cart!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ==========================================
  // BUY NOW
  // ==========================================
  const handleBuyNow = () => {
    if (!validateProductOptions()) {
      return;
    }

    const cartItem = createCartItem();

    // Add product to cart first
    addToCart(cartItem);

    // Then directly go to checkout/order page
    navigate("/cart");
  };

  // ==========================================
  // RETURN
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ======================================
            SUCCESS MESSAGE
        ====================================== */}
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#161920] border border-purple-500/60 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-2xl shadow-purple-600/30 backdrop-blur-md">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <HiCheck size={16} />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-purple-400">
                Cart Updated
              </span>

              <span className="text-xs text-gray-300 font-medium">
                {successMessage}
              </span>
            </div>

            <Link
              to="/cart"
              className="ml-4 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-bold rounded-xl transition border border-purple-500/30"
            >
              View Cart
            </Link>
          </div>
        )}

        {/* ======================================
            BACK BUTTON
        ====================================== */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
        >
          <HiArrowLeft size={16} />
          Back
        </button>

        {/* ======================================
            PRODUCT DETAILS
        ====================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#161920] border border-gray-800/80 p-6 md:p-8 rounded-3xl shadow-xl">
          {/* ====================================
              LEFT - IMAGES
          ==================================== */}
          <div className="space-y-4">
            <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <img
                src={getImageUrl(selectedImage)}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />

              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  isWishlisted
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-black/50 text-gray-300 hover:text-white"
                }`}
              >
                <HiHeart size={18} />
              </button>

              {/* Category */}
              {product.category && (
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-purple-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {product.category}
                </span>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <span className="absolute bottom-4 left-4 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedImage === img
                        ? "border-purple-500 scale-105"
                        : "border-gray-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ====================================
              RIGHT - PRODUCT INFO
          ==================================== */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Name */}
              <h1 className="text-xl md:text-2xl font-black text-white">
                {product.name}
              </h1>

              {/* =================================
                  PRICE
              ================================= */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* FINAL PRICE */}
                  <span className="text-2xl md:text-3xl font-black text-purple-400">
                    ৳{finalPrice}
                  </span>

                  {/* ORIGINAL PRICE */}
                  {hasDiscount && (
                    <span className="text-base md:text-lg text-gray-500 line-through font-semibold">
                      ৳{retailPrice}
                    </span>
                  )}

                  {/* DISCOUNT */}
                  {hasDiscount && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* SAVING */}
                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-green-400 font-bold">
                      You save ৳{savedAmount}
                    </span>

                    <span className="text-[10px] text-gray-600">•</span>

                    <span className="text-[10px] text-gray-500">
                      Limited time offer
                    </span>
                  </div>
                )}

                {!hasDiscount && (
                  <p className="text-[10px] text-gray-500">Regular price</p>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed border-y border-gray-800/60 py-4">
                {product.description}
              </p>

              {/* =================================
                  SIZES
              ================================= */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Select Size:
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedSize === size
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500"
                            : "bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================
                  COLORS
              ================================= */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Color/Pattern:
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color, index)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedColor === color
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500"
                            : "bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================
                  STOCK
              ================================= */}
              <div className="flex items-center gap-2 text-xs font-medium pt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.stock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />

                <span
                  className={
                    product.stock > 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* ====================================
                BOTTOM ACTIONS
            ==================================== */}
            <div className="space-y-4 pt-4 border-t border-gray-800/60">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-300">
                  Quantity
                </span>

                <div className="flex items-center bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-9 h-9 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="w-10 text-center text-xs font-bold text-white">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= (product.stock || 1)}
                    className="w-9 h-9 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="ml-auto text-right">
                  <p className="text-[9px] text-gray-500 uppercase">Total</p>

                  <p className="text-sm font-black text-white">
                    ৳{finalPrice * quantity}
                  </p>
                </div>
              </div>

              {/* ====================================
                  BUTTONS
              ==================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ADD TO CART */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    product.stock > 0
                      ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <HiShoppingBag size={18} />
                  Add to Cart
                </button>

                {/* BUY NOW */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    product.stock > 0
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <HiLightningBolt size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            RELATED PRODUCTS
        ====================================== */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Related Products
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                You may also like these products.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((item) => {
                const itemImg = item?.images?.[0] || item?.image;

                const formattedImg = getImageUrl(itemImg);

                const itemRetailPrice = Number(
                  item?.retailPrice ?? item?.price ?? 0,
                );

                const itemDiscountPrice =
                  item?.discountPrice !== null &&
                  item?.discountPrice !== undefined &&
                  item?.discountPrice !== ""
                    ? Number(item.discountPrice)
                    : null;

                const itemHasDiscount =
                  itemDiscountPrice !== null &&
                  !Number.isNaN(itemDiscountPrice) &&
                  itemDiscountPrice >= 0 &&
                  itemRetailPrice > 0 &&
                  itemDiscountPrice < itemRetailPrice;

                const itemFinalPrice = itemHasDiscount
                  ? itemDiscountPrice
                  : itemRetailPrice;

                const itemDiscountPercentage = itemHasDiscount
                  ? Math.round(
                      ((itemRetailPrice - itemDiscountPrice) /
                        itemRetailPrice) *
                        100,
                    )
                  : 0;

                return (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="group bg-[#161920] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 p-2.5 md:p-3"
                  >
                    {/* IMAGE */}
                    <div className="relative h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden bg-[#0f1115] border border-gray-800/60 mb-3 flex items-center justify-center">
                      <img
                        src={formattedImg}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />

                      {item.category && (
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-purple-400 text-[8px] md:text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                          {item.category}
                        </span>
                      )}

                      {/* DISCOUNT */}
                      {itemHasDiscount && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-md">
                          {itemDiscountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-[11px] md:text-xs truncate group-hover:text-purple-400 transition">
                        {item.name}
                      </h3>

                      <p className="text-[9px] md:text-[10px] text-gray-500 line-clamp-1">
                        {item.description || "Quality product for you."}
                      </p>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-gray-800/70">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] md:text-xs font-black text-purple-400 truncate">
                          ৳{itemFinalPrice}
                        </span>

                        {itemHasDiscount && (
                          <span className="text-[9px] md:text-[10px] text-gray-600 line-through truncate">
                            ৳{itemRetailPrice}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 text-[9px] md:text-[10px] bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 transition">
                        <HiEye size={11} />
                        View
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
