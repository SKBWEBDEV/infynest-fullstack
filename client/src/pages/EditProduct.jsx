// File Path: src/pages/EditProduct.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Pricing
  const [retailPrice, setRetailPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [minWholesaleQty, setMinWholesaleQty] = useState("1");

  // Product
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("spider-man");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Images
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState("");
  const [imageInputType, setImageInputType] = useState("file");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ==========================================
  // FETCH PRODUCT
  // ==========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);

        const { data } = await API.get(`/products/${id}`);

        const prod = data?.data || data?.product || data;

        setName(prod?.name || "");
        setDescription(prod?.description || "");

        setRetailPrice(
          prod?.retailPrice !== null && prod?.retailPrice !== undefined
            ? String(prod.retailPrice)
            : "",
        );

        setDiscountPrice(
          prod?.discountPrice !== null && prod?.discountPrice !== undefined
            ? String(prod.discountPrice)
            : "",
        );

        setWholesalePrice(
          prod?.wholesalePrice !== null && prod?.wholesalePrice !== undefined
            ? String(prod.wholesalePrice)
            : "",
        );

        setMinWholesaleQty(
          prod?.minWholesaleQty !== null && prod?.minWholesaleQty !== undefined
            ? String(prod.minWholesaleQty)
            : "1",
        );

        setStock(
          prod?.stock !== null && prod?.stock !== undefined
            ? String(prod.stock)
            : "",
        );

        setCategory(prod?.category || "spider-man");

        // ------------------------------------------
        // SIZES
        // ------------------------------------------
        if (Array.isArray(prod?.sizes)) {
          setSizes(prod.sizes.join(", "));
        } else {
          setSizes("");
        }

        // ------------------------------------------
        // COLORS
        // ------------------------------------------
        if (Array.isArray(prod?.colors)) {
          setColors(prod.colors.join(", "));
        } else {
          setColors("");
        }

        // ------------------------------------------
        // TAGS
        // ------------------------------------------
        if (Array.isArray(prod?.tags)) {
          setTags(prod.tags.join(", "));
        } else {
          setTags("");
        }

        setIsFeatured(Boolean(prod?.isFeatured));

        // ------------------------------------------
        // EXISTING IMAGES
        // ------------------------------------------
        if (Array.isArray(prod?.images)) {
          setImageUrls(prod.images.join(", "));
        } else {
          setImageUrls("");
        }
      } catch (error) {
        console.error("Fetch product error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to fetch product details",
        );
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ==========================================
  // FILE CHANGE
  // ==========================================
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  // ==========================================
  // PRICE VALUES
  // ==========================================
  const retail = Number(retailPrice);

  const discount = discountPrice === "" ? null : Number(discountPrice);

  const wholesale = wholesalePrice === "" ? null : Number(wholesalePrice);

  const minimumWholesaleQty =
    minWholesaleQty === "" ? 1 : Number(minWholesaleQty);

  // ==========================================
  // DISCOUNT VALIDATION
  // ==========================================
  const isDiscountInvalid =
    discount !== null &&
    (Number.isNaN(discount) ||
      discount < 0 ||
      retail <= 0 ||
      discount >= retail);

  // ==========================================
  // DISCOUNT CALCULATION
  // ==========================================
  const discountPercentage =
    discount !== null &&
    !Number.isNaN(discount) &&
    retail > 0 &&
    discount > 0 &&
    discount < retail
      ? Math.round(((retail - discount) / retail) * 100)
      : 0;

  const savedAmount =
    discount !== null &&
    !Number.isNaN(discount) &&
    retail > 0 &&
    discount < retail
      ? retail - discount
      : 0;

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // RETAIL PRICE VALIDATION
    // ==========================================
    if (retailPrice === "" || Number.isNaN(retail) || retail < 0) {
      toast.error("Please enter a valid retail price.");
      return;
    }

    // ==========================================
    // DISCOUNT PRICE VALIDATION
    // ==========================================
    if (discountPrice !== "") {
      if (Number.isNaN(discount) || discount < 0) {
        toast.error("Discount price cannot be negative.");
        return;
      }

      if (discount >= retail) {
        toast.error(
          `Discount price must be lower than retail price (৳${retail}).`,
        );
        return;
      }
    }

    // ==========================================
    // WHOLESALE PRICE VALIDATION
    // ==========================================
    if (wholesalePrice !== "") {
      if (Number.isNaN(wholesale) || wholesale < 0) {
        toast.error("Wholesale price cannot be negative.");
        return;
      }
    }

    // ==========================================
    // MIN WHOLESALE QTY VALIDATION
    // ==========================================
    if (Number.isNaN(minimumWholesaleQty) || minimumWholesaleQty < 1) {
      toast.error("Minimum wholesale quantity must be at least 1.");
      return;
    }

    // ==========================================
    // STOCK VALIDATION
    // ==========================================
    if (stock === "" || Number.isNaN(Number(stock)) || Number(stock) < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ==========================================
      // BASIC INFORMATION
      // ==========================================
      formData.append("name", name.trim());

      formData.append("description", description.trim());

      // ==========================================
      // RETAIL PRICE
      // ==========================================
      formData.append("retailPrice", Number(retailPrice));

      // ==========================================
      // DISCOUNT PRICE
      // ==========================================
      if (discountPrice === "") {
        // Empty = remove discount
        formData.append("discountPrice", "");
      } else {
        formData.append("discountPrice", Number(discountPrice));
      }

      // ==========================================
      // WHOLESALE PRICE
      // ==========================================
      if (wholesalePrice === "") {
        formData.append("wholesalePrice", "");
      } else {
        formData.append("wholesalePrice", Number(wholesalePrice));
      }

      // ==========================================
      // MIN WHOLESALE QTY
      // ==========================================
      formData.append("minWholesaleQty", Number(minWholesaleQty));

      // ==========================================
      // STOCK
      // ==========================================
      formData.append("stock", Number(stock));

      // ==========================================
      // CATEGORY
      // ==========================================
      formData.append("category", category);

      // ==========================================
      // FEATURED
      // ==========================================
      formData.append("isFeatured", String(isFeatured));

      // ==========================================
      // SIZES
      // IMPORTANT:
      // Don't uppercase "Free Size"
      // because Product schema allows:
      // S, M, L, XL, XXL, Free Size
      // ==========================================
      const sizesArray = sizes
        ? sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean)
            .map((size) => {
              const normalized = size.toLowerCase();

              if (normalized === "free size") {
                return "Free Size";
              }

              return size.toUpperCase();
            })
        : [];

      formData.append("sizes", JSON.stringify(sizesArray));

      // ==========================================
      // COLORS
      // ==========================================
      const colorsArray = colors
        ? colors
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean)
        : [];

      formData.append("colors", JSON.stringify(colorsArray));

      // ==========================================
      // TAGS
      // ==========================================
      const tagsArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      formData.append("tags", JSON.stringify(tagsArray));

      // ==========================================
      // IMAGE URLs
      // ==========================================
      if (imageInputType === "url" && imageUrls.trim()) {
        const urlsArray = imageUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);

        if (urlsArray.length > 0) {
          formData.append("imageUrls", JSON.stringify(urlsArray));
        }
      }

      // ==========================================
      // NEW IMAGE FILES
      // ==========================================
      if (imageInputType === "file" && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      // ==========================================
      // UPDATE PRODUCT
      // ==========================================
      await API.put(`/products/${id}`, formData);

      toast.success("Product updated successfully!");

      navigate("/admin/products");
    } catch (error) {
      console.error("Update product error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update product";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-400 text-sm mt-3">Loading product...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-6 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Edit Product
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Update your product information, pricing and images.
          </p>
        </div>

        {/* ======================================
            FORM
        ====================================== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ======================================
              PRODUCT NAME
          ====================================== */}
          <div>
            <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter product name"
              className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* ======================================
              PRICING
          ====================================== */}
          <div className="bg-[#161920] border border-gray-800 rounded-2xl p-5">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-white">Pricing</h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Set retail, discount and wholesale pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RETAIL PRICE */}
              <div>
                <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                  Retail Price
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    required
                    placeholder="849"
                    className="w-full pl-9 pr-3.5 py-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Regular selling price
                </p>
              </div>

              {/* DISCOUNT PRICE */}
              <div>
                <label className="flex items-center gap-2 mb-1.5 text-xs font-semibold">
                  <span className="text-gray-300">Discount Price</span>

                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold">
                    OPTIONAL
                  </span>
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400 font-bold">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="500"
                    className={`w-full pl-9 pr-3.5 py-3.5 bg-[#1e222d] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition ${
                      isDiscountInvalid
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-800 focus:border-green-500"
                    }`}
                  />
                </div>

                {/* DISCOUNT SUCCESS */}
                {discountPercentage > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold">
                      {discountPercentage}% OFF
                    </span>

                    <span className="text-[10px] text-gray-400">
                      Save ৳{savedAmount}
                    </span>
                  </div>
                )}

                {/* DISCOUNT ERROR */}
                {isDiscountInvalid && (
                  <p className="text-[10px] text-red-400 mt-2 font-semibold">
                    ⚠ Discount price must be lower than retail price
                    {retail > 0 ? ` (৳${retail})` : "."}
                  </p>
                )}

                {/* OPTIONAL INFO */}
                {!isDiscountInvalid && discountPrice === "" && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    Leave empty if there is no discount.
                  </p>
                )}
              </div>

              {/* WHOLESALE PRICE */}
              <div>
                <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                  Wholesale Price
                  <span className="text-gray-600 ml-1">Optional</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 font-bold">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    placeholder="700"
                    className="w-full pl-9 pr-3.5 py-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Price for wholesale customers
                </p>
              </div>

              {/* MIN WHOLESALE QTY */}
              <div>
                <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                  Minimum Wholesale Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={minWholesaleQty}
                  onChange={(e) => setMinWholesaleQty(e.target.value)}
                  placeholder="1"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Minimum quantity required for wholesale price
                </p>
              </div>
            </div>

            {/* PRICE PREVIEW */}
            {discountPercentage > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-[#0f1115] border border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Customer will pay
                  </p>

                  <p className="text-2xl font-black text-white mt-0.5">
                    ৳{discount}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] text-gray-500">Regular Price</p>

                  <p className="text-sm text-gray-500 line-through">
                    ৳{retail}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ======================================
              STOCK + CATEGORY
          ====================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STOCK */}
            <div>
              <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="50"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="spider-man">Spider-Man</option>

                <option value="chainsaw-man">Chainsaw Man</option>

                <option value="stranger-things">Stranger Things</option>

                <option value="ghost-rider">Ghost Rider</option>

                <option value="essentials">Essentials</option>

                <option value="anime">Anime</option>

                <option value="venom">Venom</option>
              </select>
            </div>
          </div>

          {/* ======================================
              SIZES / COLORS / TAGS
          ====================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SIZES */}
            <div>
              <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                Sizes
              </label>

              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L, XL, Free Size"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />

              <p className="text-[9px] text-gray-600 mt-1">
                Example: S, M, L, XL, XXL, Free Size
              </p>
            </div>

            {/* COLORS */}
            <div>
              <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                Colors
              </label>

              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Red, Blue, Black"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* TAGS */}
            <div>
              <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                Related Tags
              </label>

              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="shirt, cotton, casual"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* ======================================
              PRODUCT IMAGES
          ====================================== */}
          <div className="bg-[#161920] p-5 rounded-2xl border border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Product Images</h2>

                <p className="text-[10px] text-gray-500 mt-1">
                  Keep existing images or add new ones.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    imageInputType === "file"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  Upload File
                </button>

                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    imageInputType === "url"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  Image URLs
                </button>
              </div>
            </div>

            {/* FILE UPLOAD */}
            {imageInputType === "file" ? (
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2.5 bg-[#0f1115] border border-gray-800 rounded-xl text-white text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />

                {images.length > 0 && (
                  <p className="text-[11px] text-purple-400 mt-2 font-medium">
                    {images.length} new image(s) selected
                  </p>
                )}

                <p className="text-[10px] text-gray-500 mt-2">
                  New uploaded images will be added to the existing images.
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full p-3.5 bg-[#0f1115] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Existing images are loaded above. Edit or replace URLs as
                  needed.
                </p>
              </div>
            )}
          </div>

          {/* ======================================
              DESCRIPTION
          ====================================== */}
          <div>
            <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
              Description
            </label>

            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter product description..."
              className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* ======================================
              FEATURED
          ====================================== */}
          <div className="bg-[#161920] border border-gray-800 rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />

              <div>
                <p className="text-xs font-semibold text-gray-200">
                  Mark as Featured Product
                </p>

                <p className="text-[10px] text-gray-500 mt-0.5">
                  Show this product in featured sections.
                </p>
              </div>
            </label>
          </div>

          {/* ======================================
              SUBMIT
          ====================================== */}
          <button
            type="submit"
            disabled={loading || isDiscountInvalid}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
