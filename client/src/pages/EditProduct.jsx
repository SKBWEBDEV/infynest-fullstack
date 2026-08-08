
// File Path: src/pages/EditProduct.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Men");

  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState("");
  const [imageInputType, setImageInputType] = useState("file");

  const [loading, setLoading] = useState(false);

  // ================================
  // Fetch Product
  // ================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);

        const prod = data.data || data.product || data;

        setName(prod.name || "");
        setRetailPrice(prod.retailPrice ?? "");
        setDiscountPrice(prod.discountPrice ?? "");
        setStock(prod.stock ?? "");
        setCategory(prod.category || "Men");

        setSizes(prod.sizes ? prod.sizes.join(", ") : "");
        setColors(prod.colors ? prod.colors.join(", ") : "");
        setTags(prod.tags ? prod.tags.join(", ") : "");

        setDescription(prod.description || "");
        setIsFeatured(Boolean(prod.isFeatured));

        if (prod.images && prod.images.length > 0) {
          setImageUrls(prod.images.join(", "));
        }
      } catch (error) {
        console.error("Fetch product error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch product details"
        );
      }
    };

    fetchProduct();
  }, [id]);

  // ================================
  // File Change
  // ================================
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  // ================================
  // Submit
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Discount validation
    if (
      discountPrice !== "" &&
      Number(discountPrice) >= Number(retailPrice)
    ) {
      toast.error(
        "Discount price must be less than retail price."
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Basic fields
      data.append("name", name);
      data.append("description", description);
      data.append("retailPrice", Number(retailPrice));
      data.append("stock", Number(stock));
      data.append("category", category);
      data.append("isFeatured", String(isFeatured));

      // Discount Price
      if (discountPrice !== "") {
        data.append("discountPrice", Number(discountPrice));
      } else {
        // Empty discount হলে null পাঠাবে
        data.append("discountPrice", "");
      }

      // Sizes
      const sizesArray = sizes
        ? sizes
            .split(",")
            .map((size) => size.trim().toUpperCase())
            .filter(Boolean)
        : [];

      // Colors
      const colorsArray = colors
        ? colors
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean)
        : [];

      // Tags
      const tagsArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      data.append("sizes", JSON.stringify(sizesArray));
      data.append("colors", JSON.stringify(colorsArray));
      data.append("tags", JSON.stringify(tagsArray));

      // ================================
      // Image URLs
      // ================================
      if (imageInputType === "url" && imageUrls.trim()) {
        const urlsArray = imageUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);

        data.append("imageUrls", JSON.stringify(urlsArray));
      }

      // ================================
      // Image Files
      // ================================
      if (imageInputType === "file" && images.length > 0) {
        images.forEach((image) => {
          data.append("images", image);
        });
      }

      // Update Product
      await API.put(`/products/${id}`, data);

      toast.success("Product updated successfully!");

      navigate("/admin/products");
    } catch (error) {
      console.error("Update product error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Discount Percentage
  // ================================
  const discountPercentage =
    discountPrice !== "" &&
    Number(retailPrice) > 0 &&
    Number(discountPrice) < Number(retailPrice)
      ? Math.round(
          ((Number(retailPrice) - Number(discountPrice)) /
            Number(retailPrice)) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black">
            Edit Product
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Update your product information, pricing and images.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Product Name */}
          <div>
            <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
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

          {/* Price Section */}
          <div className="bg-[#161920] border border-gray-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-4">
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Retail Price */}
              <div>
                <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                  Retail Price (৳)
                </label>

                <input
                  type="number"
                  min="0"
                  value={retailPrice}
                  onChange={(e) =>
                    setRetailPrice(e.target.value)
                  }
                  required
                  placeholder="1200"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Discount Price */}
              <div>
                <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                  Discount Price (৳)
                  <span className="text-gray-600 ml-1">
                    Optional
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) =>
                    setDiscountPrice(e.target.value)
                  }
                  placeholder="Optional"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />

                {discountPercentage > 0 && (
                  <p className="text-[11px] text-green-400 mt-1.5 font-semibold">
                    {discountPercentage}% OFF
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Stock & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Stock */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                Stock Qty
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                required
                placeholder="50"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">
                  Accessories
                </option>
              </select>
            </div>

          </div>

          {/* Sizes / Colors / Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Sizes */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                Sizes
              </label>

              <input
                type="text"
                value={sizes}
                onChange={(e) =>
                  setSizes(e.target.value)
                }
                placeholder="S, M, L, XL"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                Colors
              </label>

              <input
                type="text"
                value={colors}
                onChange={(e) =>
                  setColors(e.target.value)
                }
                placeholder="Red, Blue, Black"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
                Related Tags / Keywords
              </label>

              <input
                type="text"
                value={tags}
                onChange={(e) =>
                  setTags(e.target.value)
                }
                placeholder="shirt, cotton, casual"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>

          {/* Product Images */}
          <div className="bg-[#161920] p-4 rounded-2xl border border-gray-800 space-y-4">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

              <div>
                <h2 className="text-sm font-bold text-white">
                  Product Images
                </h2>

                <p className="text-[10px] text-gray-500 mt-1">
                  Upload new images or use image URLs.
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setImageInputType("file")
                  }
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
                  onClick={() =>
                    setImageInputType("url")
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    imageInputType === "url"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  Image URL(s)
                </button>

              </div>
            </div>

            {/* File Upload */}
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
                    {images.length} file(s) selected
                  </p>
                )}

              </div>
            ) : (
              /* URL Input */
              <div>

                <input
                  type="text"
                  value={imageUrls}
                  onChange={(e) =>
                    setImageUrls(e.target.value)
                  }
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full p-3.5 bg-[#0f1115] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />

                <p className="text-[10px] text-gray-500 mt-1.5">
                  Add multiple image URLs separated by commas.
                </p>

              </div>
            )}

          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 mb-1.5 font-semibold text-xs">
              Description
            </label>

            <textarea
              rows="5"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              placeholder="Enter product description..."
              className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Featured */}
          <div className="bg-[#161920] border border-gray-800 rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) =>
                  setIsFeatured(e.target.checked)
                }
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Updating..."
              : "Update Product"}
          </button>

        </form>
      </div>
    </div>
  );
}

