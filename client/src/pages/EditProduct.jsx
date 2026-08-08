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

  const [retailPrice, setRetailPrice] = useState("");

  const [discountPrice, setDiscountPrice] = useState("");

  const [stock, setStock] = useState("");

  const [category, setCategory] = useState("spider-man");

  const [sizes, setSizes] = useState("");

  const [colors, setColors] = useState("");

  const [tags, setTags] = useState("");

  const [description, setDescription] = useState("");

  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState([]);

  const [imageUrls, setImageUrls] = useState("");

  const [imageInputType, setImageInputType] = useState("file");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH PRODUCT
  // ==========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);

        const prod = data.data || data.product || data;

        setName(prod.name || "");

        setRetailPrice(prod.retailPrice ?? "");

        setDiscountPrice(prod.discountPrice ?? "");

        setStock(prod.stock ?? "");

        setCategory(prod.category || "spider-man");

        setSizes(Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "");

        setColors(Array.isArray(prod.colors) ? prod.colors.join(", ") : "");

        setTags(Array.isArray(prod.tags) ? prod.tags.join(", ") : "");

        setDescription(prod.description || "");

        setIsFeatured(Boolean(prod.isFeatured));

        // Existing images
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          setImageUrls(prod.images.join(", "));
        }
      } catch (error) {
        console.error("Fetch product error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to fetch product details",
        );
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

  const isDiscountInvalid =
    discount !== null && retail > 0 && discount >= retail;

  const discountPercentage =
    discount !== null && retail > 0 && discount > 0 && discount < retail
      ? Math.round(((retail - discount) / retail) * 100)
      : 0;

  const savedAmount =
    discount !== null && retail > 0 && discount < retail
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
    if (retailPrice === "" || Number(retailPrice) < 0) {
      toast.error("Please enter a valid retail price.");

      return;
    }

    // ==========================================
    // DISCOUNT VALIDATION
    // ==========================================
    if (discountPrice !== "" && Number(discountPrice) < 0) {
      toast.error("Discount price cannot be negative.");

      return;
    }

    if (discountPrice !== "" && Number(discountPrice) >= Number(retailPrice)) {
      toast.error("Discount price must be lower than retail price.");

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ==========================================
      // BASIC INFORMATION
      // ==========================================
      formData.append("name", name);

      formData.append("description", description);

      formData.append("retailPrice", Number(retailPrice));

      formData.append("stock", Number(stock));

      formData.append("category", category);

      formData.append("isFeatured", String(isFeatured));

      // ==========================================
      // DISCOUNT PRICE
      // ==========================================
      if (discountPrice !== "") {
        formData.append("discountPrice", Number(discountPrice));
      } else {
        // Empty means remove discount
        formData.append("discountPrice", "");
      }

      // ==========================================
      // SIZES
      // ==========================================
      const sizesArray = sizes
        ? sizes
            .split(",")
            .map((size) => size.trim().toUpperCase())
            .filter(Boolean)
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
      // EXISTING / URL IMAGES
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
      // NEW FILE IMAGES
      // ==========================================
      if (imageInputType === "file" && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      // ==========================================
      // UPDATE
      // ==========================================
      await API.put(`/products/${id}`, formData);

      toast.success("Product updated successfully!");

      navigate("/admin/products");
    } catch (error) {
      console.error("Update product error:", error);

      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black">Edit Product</h1>

          <p className="text-xs text-gray-400 mt-1">
            Update your product information, pricing and images.
          </p>
        </div>

        {/* ======================================
            FORM
        ====================================== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PRODUCT NAME */}
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
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white">Pricing</h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Set your regular price and optional sale price.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RETAIL PRICE */}
              <div>
                <label className="block text-gray-300 mb-1.5 font-semibold text-xs">
                  Retail Price
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
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
                    className={`w-full pl-9 pr-3.5 py-3.5 bg-[#1e222d] border rounded-xl text-white focus:outline-none transition ${
                      isDiscountInvalid
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-800 focus:border-green-500"
                    }`}
                  />
                </div>

                {/* DISCOUNT INFO */}
                {discountPercentage > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold">
                      {discountPercentage}% OFF
                    </span>

                    <span className="text-[10px] text-gray-400">
                      Save ৳{savedAmount}
                    </span>
                  </div>
                )}

                {/* INVALID DISCOUNT */}
                {isDiscountInvalid && (
                  <p className="text-[10px] text-red-400 mt-2 font-semibold">
                    ⚠ Discount price must be lower than retail price (৳
                    {retailPrice}).
                  </p>
                )}

                {!isDiscountInvalid && discountPrice === "" && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    Leave empty if there is no discount.
                  </p>
                )}
              </div>
            </div>

            {/* PRICE PREVIEW */}
            {discountPercentage > 0 && (
              <div className="mt-5 p-3.5 rounded-xl bg-[#0f1115] border border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Customer will pay
                  </p>

                  <p className="text-xl font-black text-white mt-0.5">
                    ৳{discount}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-500">Regular</p>

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
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="50"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
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
                placeholder="S, M, L, XL"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
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
                  New images will be added to the existing images.
                </p>
              </div>
            ) : (
              /* URL INPUT */
              <div>
                <input
                  type="text"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full p-3.5 bg-[#0f1115] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Separate multiple image URLs with commas.
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
