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
  HiPlus,
  HiMinus,
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

  const [showProductDetails, setShowProductDetails] = useState(false);

  // ==========================================
  // FETCH PRODUCT
  // ==========================================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `${API_URL}/products/${id}`,
        );

        const productData =
          data?.product ||
          data?.data ||
          data;

        if (!productData) {
          setProduct(null);
          setLoading(false);
          return;
        }

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
        } else {
          setSelectedImage("");
        }

        // ==========================================
        // FIRST SIZE
        // ==========================================
        if (
          Array.isArray(productData?.sizes) &&
          productData.sizes.length > 0
        ) {
          setSelectedSize(productData.sizes[0]);
        } else {
          setSelectedSize("");
        }

        // ==========================================
        // FIRST COLOR
        // ==========================================
        if (
          Array.isArray(productData?.colors) &&
          productData.colors.length > 0
        ) {
          setSelectedColor(productData.colors[0]);
        } else {
          setSelectedColor("");
        }

        // ==========================================
        // WISHLIST
        // ==========================================
        const savedWishlist =
          JSON.parse(
            localStorage.getItem("shopbd_wishlist"),
          ) || [];

        setIsWishlisted(
          savedWishlist.includes(id),
        );

        // ==========================================
        // RELATED PRODUCTS
        // ==========================================
        try {
          const allProductsRes =
            await axios.get(
              `${API_URL}/products`,
            );

          const allData =
            allProductsRes.data;

          const allList = Array.isArray(
            allData,
          )
            ? allData
            : allData?.products ||
              allData?.data ||
              [];

          const currentCategory =
            String(
              productData?.category || "",
            )
              .trim()
              .toLowerCase();

          const filtered = allList.filter(
            (item) => {
              const itemCategory =
                String(
                  item?.category || "",
                )
                  .trim()
                  .toLowerCase();

              return (
                item?._id !== id &&
                currentCategory &&
                itemCategory ===
                  currentCategory
              );
            },
          );

          setRelatedProducts(
            filtered.slice(0, 5),
          );
        } catch (relatedError) {
          console.error(
            "Related products error:",
            relatedError,
          );

          setRelatedProducts([]);
        }
      } catch (error) {
        console.error(
          "Error fetching product details:",
          error,
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-400 mt-3">
            Loading product details...
          </p>
        </div>
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
          The product you are looking for
          does not exist or has been removed.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
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
      return "https://via.placeholder.com/600x600?text=No+Image";
    }

    if (
      typeof img === "string" &&
      (img.startsWith("http://") ||
        img.startsWith("https://") ||
        img.startsWith("data:"))
    ) {
      return img;
    }

    const cleanApiUrl = String(
      API_URL || "",
    ).replace(/\/$/, "");

    const cleanImage = String(
      img,
    ).replace(/^\//, "");

    return `${cleanApiUrl}/${cleanImage}`;
  };

  // ==========================================
  // PRODUCT ARRAYS
  // ==========================================
  const productImages = Array.isArray(
    product.images,
  )
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const productSizes = Array.isArray(
    product.sizes,
  )
    ? product.sizes
    : [];

  const productColors = Array.isArray(
    product.colors,
  )
    ? product.colors
    : [];

  const productTags = Array.isArray(
    product.tags,
  )
    ? product.tags
    : [];

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================
  const productDetails =
    product?.details &&
    typeof product.details === "object" &&
    !Array.isArray(product.details)
      ? product.details
      : {};

  const hasProductSpecifications = [
    productDetails.collection,
    productDetails.material,
    productDetails.sleeve,
    productDetails.fit,
    productDetails.fabric,
    productDetails.composition,
    productDetails.styleCode,
  ].some(
    (value) =>
      String(value || "").trim() !== "",
  );

  // ==========================================
  // CATEGORY LABEL
  // ==========================================
  const formatCategory = (value) => {
    if (!value) return "";

    const categoryMap = {
      "regular-fit": "Regular Fit",
      oversized: "Oversized",
      "spider-man": "Spider-Man",
      "chainsaw-man": "Chainsaw Man",
      "stranger-things": "Stranger Things",
      "ghost-rider": "Ghost Rider",
      essentials: "Essentials",
      anime: "Anime",
      venom: "Venom",
    };

    if (categoryMap[value]) {
      return categoryMap[value];
    }

    return String(value)
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  };

  // ==========================================
  // PRICE CALCULATION
  // ==========================================
  const retailPrice = Number(
    product?.retailPrice ??
      product?.price ??
      0,
  );

  const discountPrice =
    product?.discountPrice !== null &&
    product?.discountPrice !== undefined &&
    product?.discountPrice !== ""
      ? Number(product.discountPrice)
      : null;

  const wholesalePrice =
    product?.wholesalePrice !== null &&
    product?.wholesalePrice !== undefined &&
    product?.wholesalePrice !== ""
      ? Number(product.wholesalePrice)
      : null;

  const minWholesaleQty =
    product?.minWholesaleQty !== null &&
    product?.minWholesaleQty !== undefined &&
    product?.minWholesaleQty !== ""
      ? Number(product.minWholesaleQty)
      : 1;

  const hasDiscount =
    discountPrice !== null &&
    !Number.isNaN(discountPrice) &&
    discountPrice >= 0 &&
    retailPrice > 0 &&
    discountPrice < retailPrice;

  const finalPrice = hasDiscount
    ? discountPrice
    : retailPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((retailPrice -
          discountPrice) /
          retailPrice) *
          100,
      )
    : 0;

  const savedAmount = hasDiscount
    ? retailPrice - discountPrice
    : 0;

  // ==========================================
  // STOCK
  // ==========================================
  const stock = Number(
    product?.stock || 0,
  );

  const isInStock = stock > 0;

  // ==========================================
  // COLOR SELECT
  // ==========================================
  const handleColorSelect = (
    color,
    index,
  ) => {
    setSelectedColor(color);

    /*
      colors[index] -> images[index]
    */

    if (productImages[index]) {
      setSelectedImage(
        productImages[index],
      );
    }
  };

  // ==========================================
  // WISHLIST
  // ==========================================
  const toggleWishlist = () => {
    const savedWishlist =
      JSON.parse(
        localStorage.getItem(
          "shopbd_wishlist",
        ),
      ) || [];

    let updatedWishlist;

    if (isWishlisted) {
      updatedWishlist =
        savedWishlist.filter(
          (item) => item !== id,
        );

      setIsWishlisted(false);
    } else {
      updatedWishlist = [
        ...savedWishlist,
        id,
      ];

      setIsWishlisted(true);
    }

    localStorage.setItem(
      "shopbd_wishlist",
      JSON.stringify(updatedWishlist),
    );
  };

  // ==========================================
  // QUANTITY
  // ==========================================
  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(1, prev - 1),
    );
  };

  const increaseQuantity = () => {
    setQuantity((prev) =>
      Math.min(
        stock || 1,
        prev + 1,
      ),
    );
  };

  // ==========================================
  // VALIDATE OPTIONS
  // ==========================================
  const validateProductOptions = () => {
    if (
      productSizes.length > 0 &&
      !selectedSize
    ) {
      alert(
        "Please select a size before continuing.",
      );
      return false;
    }

    if (
      productColors.length > 0 &&
      !selectedColor
    ) {
      alert(
        "Please select a color before continuing.",
      );
      return false;
    }

    if (!isInStock) {
      alert(
        "This product is currently out of stock.",
      );
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

      price: finalPrice,

      retailPrice: retailPrice,

      discountPrice: hasDiscount
        ? discountPrice
        : null,

      image: selectedImage,

      size: selectedSize || "N/A",

      color: selectedColor || "N/A",

      quantity: quantity,

      stock: stock || 10,
    };
  };

  // ==========================================
  // ADD TO CART
  // ==========================================
  const handleAddToCart = () => {
    if (!validateProductOptions()) {
      return;
    }

    const cartItem =
      createCartItem();

    addToCart(cartItem);

    setSuccessMessage(
      "Successfully added to cart!",
    );

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

    const cartItem =
      createCartItem();

    addToCart(cartItem);

    navigate("/cart");
  };

  // ==========================================
  // RELATED PRODUCT CARD
  // ==========================================
  const renderRelatedProduct = (
    item,
  ) => {
    const itemImg =
      item?.images?.[0] ||
      item?.image;

    const formattedImg =
      getImageUrl(itemImg);

    const itemRetailPrice = Number(
      item?.retailPrice ??
        item?.price ??
        0,
    );

    const itemDiscountPrice =
      item?.discountPrice !== null &&
      item?.discountPrice !== undefined &&
      item?.discountPrice !== ""
        ? Number(item.discountPrice)
        : null;

    const itemHasDiscount =
      itemDiscountPrice !== null &&
      !Number.isNaN(
        itemDiscountPrice,
      ) &&
      itemDiscountPrice >= 0 &&
      itemRetailPrice > 0 &&
      itemDiscountPrice <
        itemRetailPrice;

    const itemFinalPrice =
      itemHasDiscount
        ? itemDiscountPrice
        : itemRetailPrice;

    const itemDiscountPercentage =
      itemHasDiscount
        ? Math.round(
            ((itemRetailPrice -
              itemDiscountPrice) /
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
              {formatCategory(
                item.category,
              )}
            </span>
          )}

          {itemHasDiscount && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-md">
              {itemDiscountPercentage}%
              OFF
            </span>
          )}
        </div>

        {/* INFO */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-white text-[11px] md:text-xs truncate group-hover:text-purple-400 transition">
            {item.name}
          </h3>

          <p className="text-[9px] md:text-[10px] text-gray-500 line-clamp-2">
            {item.description ||
              "Quality product for you."}
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

          <span className="shrink-0 text-[9px] md:text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded-lg flex items-center gap-1">
            <HiEye size={11} />
            View
          </span>
        </div>
      </Link>
    );
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
            BACK
        ====================================== */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
        >
          <HiArrowLeft size={16} />
          Back
        </button>

        {/* ======================================
            PRODUCT
        ====================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#161920] border border-gray-800/80 p-6 md:p-8 rounded-3xl shadow-xl">

          {/* ====================================
              LEFT - IMAGES
          ==================================== */}
          <div className="space-y-4">

            <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">

              <img
                src={getImageUrl(
                  selectedImage,
                )}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />

              {/* WISHLIST */}
              <button
                type="button"
                onClick={
                  toggleWishlist
                }
                className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  isWishlisted
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-black/50 text-gray-300 hover:text-white"
                }`}
              >
                <HiHeart size={18} />
              </button>

              {/* CATEGORY */}
              {product.category && (
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-purple-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {formatCategory(
                    product.category,
                  )}
                </span>
              )}

              {/* NEW ARRIVAL */}
              {product.isNewArrival && (
                <span className="absolute bottom-4 right-4 bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg">
                  NEW ARRIVAL
                </span>
              )}

              {/* DISCOUNT */}
              {hasDiscount && (
                <span className="absolute bottom-4 left-4 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg">
                  {discountPercentage}%
                  OFF
                </span>
              )}
            </div>

            {/* THUMBNAILS */}
            {productImages.length >
              1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {productImages.map(
                  (img, index) => (
                    <button
                      type="button"
                      key={`${img}-${index}`}
                      onClick={() =>
                        setSelectedImage(
                          img,
                        )
                      }
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        selectedImage ===
                        img
                          ? "border-purple-500 scale-105"
                          : "border-gray-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(
                          img,
                        )}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* ====================================
              RIGHT - PRODUCT INFO
          ==================================== */}
          <div className="flex flex-col justify-between space-y-6">

            <div className="space-y-4">

              {/* PRODUCT NAME */}
              <h1 className="text-xl md:text-2xl font-black text-white">
                {product.name}
              </h1>

              {/* =================================
                  PRICE
              ================================= */}
              <div className="space-y-2">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="text-2xl md:text-3xl font-black text-purple-400">
                    ৳{finalPrice}
                  </span>

                  {hasDiscount && (
                    <span className="text-base md:text-lg text-gray-500 line-through font-semibold">
                      ৳{retailPrice}
                    </span>
                  )}

                  {hasDiscount && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black">
                      {discountPercentage}%
                      OFF
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-green-400 font-bold">
                      You save ৳
                      {savedAmount}
                    </span>

                    <span className="text-[10px] text-gray-600">
                      •
                    </span>

                    <span className="text-[10px] text-gray-500">
                      Limited time offer
                    </span>
                  </div>
                )}

                {!hasDiscount && (
                  <p className="text-[10px] text-gray-500">
                    Regular price
                  </p>
                )}
              </div>

              {/* =================================
                  DESCRIPTION + DETAILS
              ================================= */}
              <div className="border-y border-gray-800/60">

                {/* DESCRIPTION */}
                <button
                  type="button"
                  onClick={() =>
                    setShowProductDetails(
                      showProductDetails ===
                        "description"
                        ? false
                        : "description",
                    )
                  }
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                      {showProductDetails ===
                      "description" ? (
                        <HiMinus
                          size={14}
                        />
                      ) : (
                        <HiPlus
                          size={14}
                        />
                      )}
                    </div>

                    <span className="text-xs font-bold text-gray-200 group-hover:text-purple-400 transition">
                      Description
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-500">
                    {showProductDetails ===
                    "description"
                      ? "Hide description"
                      : "View description"}
                  </span>
                </button>

                {showProductDetails ===
                  "description" && (
                  <div className="pb-4">
                    <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                        {product.description ||
                          "No description available for this product."}
                      </p>
                    </div>
                  </div>
                )}

                {/* PRODUCT DETAILS */}
                <button
                  type="button"
                  onClick={() =>
                    setShowProductDetails(
                      showProductDetails ===
                        "details"
                        ? false
                        : "details",
                    )
                  }
                  className="w-full flex items-center justify-between py-4 text-left group border-t border-gray-800/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                      {showProductDetails ===
                      "details" ? (
                        <HiMinus
                          size={14}
                        />
                      ) : (
                        <HiPlus
                          size={14}
                        />
                      )}
                    </div>

                    <span className="text-xs font-bold text-gray-200 group-hover:text-purple-400 transition">
                      Product Details
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-500">
                    {showProductDetails ===
                    "details"
                      ? "Hide details"
                      : "View details"}
                  </span>
                </button>

                {/* =================================
                    PRODUCT DETAILS CONTENT
                ================================= */}
                {showProductDetails ===
                  "details" && (
                  <div className="pb-4">
                    <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4 space-y-3">

                      {/* ==============================
                          PRODUCT SPECIFICATIONS
                      ============================== */}
                      {hasProductSpecifications && (
                        <div className="space-y-3 pb-3 border-b border-gray-800/60">

                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            Product Specifications
                          </p>

                          {/* COLLECTION */}
                          {productDetails.collection && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Collection
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.collection
                                }
                              </span>
                            </div>
                          )}

                          {/* MATERIAL */}
                          {productDetails.material && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Material
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.material
                                }
                              </span>
                            </div>
                          )}

                          {/* SLEEVE */}
                          {productDetails.sleeve && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Sleeve
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.sleeve
                                }
                              </span>
                            </div>
                          )}

                          {/* FIT */}
                          {productDetails.fit && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Fit
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.fit
                                }
                              </span>
                            </div>
                          )}

                          {/* FABRIC */}
                          {productDetails.fabric && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Fabric
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.fabric
                                }
                              </span>
                            </div>
                          )}

                          {/* COMPOSITION */}
                          {productDetails.composition && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Composition
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.composition
                                }
                              </span>
                            </div>
                          )}

                          {/* STYLE CODE */}
                          {productDetails.styleCode && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Style Code
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  productDetails.styleCode
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ==============================
                          CATEGORY
                      ============================== */}
                      {product.category && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-gray-500">
                            Category
                          </span>

                          <span className="text-[10px] font-semibold text-gray-200 text-right">
                            {formatCategory(
                              product.category,
                            )}
                          </span>
                        </div>
                      )}

                      {/* ==============================
                          WHOLESALE
                      ============================== */}
                      {wholesalePrice !==
                        null &&
                        !Number.isNaN(
                          wholesalePrice,
                        ) &&
                        wholesalePrice > 0 && (
                          <>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Wholesale Price
                              </span>

                              <span className="text-[10px] font-bold text-blue-400 text-right">
                                ৳
                                {
                                  wholesalePrice
                                }
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-gray-500">
                                Min. Wholesale Qty
                              </span>

                              <span className="text-[10px] font-semibold text-gray-200 text-right">
                                {
                                  minWholesaleQty
                                }
                              </span>
                            </div>
                          </>
                        )}

                      {/* ==============================
                          TAGS
                      ============================== */}
                      {productTags.length >
                        0 && (
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-[10px] text-gray-500">
                            Tags
                          </span>

                          <div className="flex flex-wrap justify-end gap-1.5">
                            {productTags.map(
                              (
                                tag,
                                index,
                              ) => (
                                <span
                                  key={`${tag}-${index}`}
                                  className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-semibold"
                                >
                                  #{tag}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* ==============================
                          FEATURED
                      ============================== */}
                      {product.isFeatured && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-gray-500">
                            Product Status
                          </span>

                          <span className="text-[10px] font-bold text-yellow-400">
                            Featured Product
                          </span>
                        </div>
                      )}

                      {/* ==============================
                          NEW ARRIVAL
                      ============================== */}
                      {product.isNewArrival && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-gray-500">
                            Collection Status
                          </span>

                          <span className="text-[10px] font-bold text-purple-400">
                            New Arrival
                          </span>
                        </div>
                      )}

                      {/* ==============================
                          NO EXTRA DETAILS
                      ============================== */}
                      {!hasProductSpecifications &&
                        !product.category &&
                        wholesalePrice ===
                          null &&
                        productTags.length ===
                          0 &&
                        !product.isFeatured &&
                        !product.isNewArrival && (
                          <p className="text-[10px] text-gray-500 text-center py-2">
                            No additional product
                            details available.
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* =================================
                  SIZES
              ================================= */}
              {productSizes.length >
                0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Select Size:
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {productSizes.map(
                      (
                        size,
                        index,
                      ) => (
                        <button
                          type="button"
                          key={`${size}-${index}`}
                          onClick={() =>
                            setSelectedSize(
                              size,
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            selectedSize ===
                            size
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500"
                              : "bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          {size}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* =================================
                  COLORS
              ================================= */}
              {productColors.length >
                0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Color/Pattern:
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {productColors.map(
                      (
                        color,
                        index,
                      ) => (
                        <button
                          type="button"
                          key={`${color}-${index}`}
                          onClick={() =>
                            handleColorSelect(
                              color,
                              index,
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            selectedColor ===
                            color
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500"
                              : "bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          {color}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* =================================
                  STOCK
              ================================= */}
              <div className="flex items-center gap-2 text-xs font-medium pt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isInStock
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span
                  className={
                    isInStock
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {isInStock
                    ? `In Stock${
                        stock > 0
                          ? ` (${stock})`
                          : ""
                      }`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* ====================================
                ACTIONS
            ==================================== */}
            <div className="space-y-4 pt-4 border-t border-gray-800/60">

              {/* QUANTITY */}
              <div className="flex items-center gap-4">

                <span className="text-xs font-bold text-gray-300">
                  Quantity
                </span>

                <div className="flex items-center bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="w-9 h-9 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="w-10 text-center text-xs font-bold text-white">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      (stock || 1)
                    }
                    className="w-9 h-9 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* TOTAL */}
                <div className="ml-auto text-right">
                  <p className="text-[9px] text-gray-500 uppercase">
                    Total
                  </p>

                  <p className="text-sm font-black text-white">
                    ৳
                    {finalPrice *
                      quantity}
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* ADD TO CART */}
                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={!isInStock}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    isInStock
                      ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <HiShoppingBag
                    size={18}
                  />
                  Add to Cart
                </button>

                {/* BUY NOW */}
                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={!isInStock}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    isInStock
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <HiLightningBolt
                    size={18}
                  />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            RELATED PRODUCTS
        ====================================== */}
        {relatedProducts.length >
          0 && (
          <section className="space-y-4">

            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Related Products
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                You may also like these
                products.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map(
                renderRelatedProduct,
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}