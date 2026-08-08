// File Path: src/pages/AddProduct.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
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

  const navigate = useNavigate();

  const getUserInfo = () => {
    try {
      const storedUser = localStorage.getItem("userInfo");

      if (!storedUser) {
        return {};
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid userInfo:", error);
      return {};
    }
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const userInfo = getUserInfo();

  if (!userInfo.token) {
    toast.error("Please login first.");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const data = new FormData();

data.append("name", name);
data.append("description", description);
data.append("retailPrice", Number(retailPrice));
data.append("category", category);
data.append("stock", Number(stock));
data.append("isFeatured", String(isFeatured));

    const sizesArray = sizes
      ? sizes
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];

    const colorsArray = colors
      ? colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    data.append("sizes", JSON.stringify(sizesArray));
    data.append("colors", JSON.stringify(colorsArray));
    data.append("tags", JSON.stringify(tagsArray));

    if (imageInputType === "url" && imageUrls.trim()) {
      const urlsArray = imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      data.append("imageUrls", JSON.stringify(urlsArray));
    }

    if (imageInputType === "file" && images.length > 0) {
      images.forEach((image) => {
        data.append("images", image);
      });
    }

    // API service ব্যবহার করবে
    await API.post("/products", data);

    toast.success("Product created successfully!");

    navigate("/admin/products");
  } catch (error) {
    console.error("Create product error:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to create product"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-white mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Product Name */}
        <div>
          <label className="block text-gray-400 mb-1 font-semibold">
            Product Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            placeholder="e.g. Premium Cotton Shirt"
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Retail Price (৳)
            </label>

            <input
              type="number"
              min="0"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="1200"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Wholesale Price (৳)
            </label>

            <input
  type="number"
  min="0"
  value={wholesalePrice}
  onChange={(e) => setWholesalePrice(e.target.value)}
  placeholder="Optional"
  className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
/>
          </div>
        </div>

        {/* Stock / Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Stock Qty
            </label>

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="50"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        {/* Sizes / Colors / Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Sizes
            </label>

            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="S, M, L, XL"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Colors
            </label>

            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="Red, Blue, Black"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">
              Tags
            </label>

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="shirt, cotton, casual"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-3 bg-[#1e222d] p-4 rounded-2xl border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <label className="text-gray-300 font-semibold">
              Product Images
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImageInputType("file")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
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
                className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                  imageInputType === "url"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                Image URL(s)
              </button>
            </div>
          </div>

          {imageInputType === "file" ? (
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 bg-[#161920] border border-gray-800 rounded-xl text-white text-xs"
              />

              {images.length > 0 && (
                <p className="text-[11px] text-purple-400 mt-1">
                  {images.length} file(s) selected
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                placeholder="Paste image URLs separated by comma"
                className="w-full p-3 bg-[#161920] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />

              <p className="text-[10px] text-gray-400 mt-1">
                Example: https://image1.jpg, https://image2.jpg
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-400 mb-1 font-semibold">
            Description
          </label>

          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter product description..."
          />
        </div>

        {/* Featured */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />

          <label htmlFor="isFeatured" className="text-gray-300 font-semibold">
            Mark as Featured Product
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Product"}
        </button>
      </form>
    </div>
  );
}
