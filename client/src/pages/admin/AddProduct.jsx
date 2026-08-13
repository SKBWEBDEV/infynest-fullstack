import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();

  // ==========================================
  // PRODUCT STATES
  // ==========================================
const [name, setName] = useState("");
const [retailPrice, setRetailPrice] = useState("");
const [costPrice, setCostPrice] = useState("");
const [discountPrice, setDiscountPrice] = useState("");

const [wholesalePrice, setWholesalePrice] = useState("");
const [minWholesaleQty, setMinWholesaleQty] = useState("1");

const [stock, setStock] = useState("");

const [category, setCategory] = useState("regular-fit");
const [isNewArrival, setIsNewArrival] = useState(false);

const [sizes, setSizes] = useState("");
const [colors, setColors] = useState("");
const [tags, setTags] = useState("");
const [description, setDescription] = useState("");

const [isFeatured, setIsFeatured] = useState(false);

  // ==========================================
  // IMAGE STATES
  // ==========================================
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState("");
  const [imageInputType, setImageInputType] = useState("file");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // GET USER INFO
  // ==========================================
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

  // ==========================================
  // FILE CHANGE
  // ==========================================
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  // ==========================================
  // SUBMIT PRODUCT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // USER CHECK
    // ==========================================
    const userInfo = getUserInfo();

    if (!userInfo.token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    // ==========================================
    // BASIC VALIDATION
    // ==========================================
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (
      retailPrice === "" ||
      Number.isNaN(Number(retailPrice)) ||
      Number(retailPrice) < 0
    ) {
      toast.error("Please enter a valid retail price.");
      return;
    }

    if (
      stock === "" ||
      Number.isNaN(Number(stock)) ||
      Number(stock) < 0
    ) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    // ==========================================
// COST PRICE VALIDATION
// ==========================================
if (
  costPrice === "" ||
  Number.isNaN(Number(costPrice)) ||
  Number(costPrice) < 0
) {
  toast.error("Please enter a valid cost price.");
  return;
}

if (Number(costPrice) > Number(retailPrice)) {
  toast.error(
    "Cost price cannot be greater than retail price.",
  );
  return;
}


// ==========================================
// WHOLESALE PRICE VALIDATION
// ==========================================
if (wholesalePrice !== "") {
  const wholesale = Number(wholesalePrice);
  const retail = Number(retailPrice);

  if (Number.isNaN(wholesale) || wholesale < 0) {
    toast.error("Please enter a valid wholesale price.");
    return;
  }

  if (wholesale >= retail) {
    toast.error("Wholesale price should be less than retail price.");
    return;
  }
}

// ==========================================
// MIN WHOLESALE QUANTITY VALIDATION
// ==========================================
if (
  minWholesaleQty === "" ||
  Number.isNaN(Number(minWholesaleQty)) ||
  Number(minWholesaleQty) < 1
) {
  toast.error("Minimum wholesale quantity must be at least 1.");
  return;
}

    // ==========================================
    // DISCOUNT VALIDATION
    // ==========================================
    if (discountPrice !== "") {
      const retail = Number(retailPrice);
      const discount = Number(discountPrice);

      if (Number.isNaN(discount) || discount < 0) {
        toast.error("Discount price cannot be negative.");
        return;
      }

      if (discount >= retail) {
        toast.error("Discount price must be less than retail price.");
        return;
      }
    }

    // ==========================================
    // IMAGE VALIDATION
    // ==========================================
    if (imageInputType === "file" && images.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    if (imageInputType === "url" && !imageUrls.trim()) {
      toast.error("Please add at least one image URL.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // ==========================================
      // BASIC PRODUCT DATA
      // ==========================================
      data.append("name", name.trim());

      data.append("description", description.trim());

      data.append("retailPrice", Number(retailPrice));

      data.append("costPrice", Number(costPrice));

      // ==========================================
// WHOLESALE DATA
// ==========================================
if (wholesalePrice !== "") {
  data.append("wholesalePrice", Number(wholesalePrice));
}

data.append(
  "minWholesaleQty",
  Number(minWholesaleQty),
);

      data.append("category", category);

      data.append("stock", Number(stock));

      data.append("isFeatured", String(isFeatured));

      data.append("isNewArrival", String(isNewArrival));

      // ==========================================
      // DISCOUNT PRICE
      // ==========================================
      if (discountPrice !== "") {
        data.append("discountPrice", Number(discountPrice));
      }

      // ==========================================
      // SIZES
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

      data.append("sizes", JSON.stringify(sizesArray));

      // ==========================================
      // COLORS
      // ==========================================
      const colorsArray = colors
        ? colors
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean)
        : [];

      data.append("colors", JSON.stringify(colorsArray));

      // ==========================================
      // TAGS
      // ==========================================
      const tagsArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      data.append("tags", JSON.stringify(tagsArray));

      // ==========================================
      // IMAGE URLS
      // ==========================================
      if (imageInputType === "url" && imageUrls.trim()) {
        const urlsArray = imageUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);

        if (urlsArray.length > 0) {
          data.append("imageUrls", JSON.stringify(urlsArray));
        }
      }

      // ==========================================
      // IMAGE FILES
      // ==========================================
      if (imageInputType === "file" && images.length > 0) {
        images.forEach((image) => {
          data.append("images", image);
        });
      }

      // ==========================================
      // DEBUG FOR FORMDATA
      // ==========================================
      console.log("========== CREATE PRODUCT ==========");

      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else {
          console.log(key, value);
        }
      }

      // ==========================================
      // CREATE PRODUCT
      // ==========================================
      const response = await API.post("/products", data);

      console.log("CREATE PRODUCT RESPONSE:", response.data);

      // ==========================================
      // SUCCESS
      // ==========================================
      toast.success("Product created successfully!");

      navigate("/admin/products");
    } catch (error) {
      // ==========================================
      // ERROR DEBUG
      // ==========================================
      console.error("Create product error:", error);

      console.log("STATUS:", error?.response?.status);

      console.log("DATA:", error?.response?.data);

      console.log("MESSAGE:", error?.message);

      console.log("FULL ERROR:", error);

      // ==========================================
      // ERROR MESSAGE
      // ==========================================
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RETURN
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-5xl mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="mb-7">

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-[#1e222d] border border-gray-800 text-gray-300 hover:text-white hover:bg-[#252a36] transition"
          >
            <ArrowLeft size={17} />

            <span className="text-sm font-semibold">
              Back to Products
            </span>
          </button>

          {/* TITLE */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Add New Product
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Add a new product to your store
            </p>
          </div>
        </div>

        {/* ==========================================
            MAIN FORM CARD
        ========================================== */}
        <div className="bg-[#161920] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">

            {/* ==========================================
                PRODUCT NAME
            ========================================== */}
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Product Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Spider Man Marvel Black T-Shirt"
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

          {/* ==========================================
    PRICES
========================================== */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

  {/* RETAIL PRICE */}
  <div>
    <label className="block text-gray-300 mb-2 font-semibold">
      Retail Price (৳)
    </label>

    <input
      type="number"
      min="0"
      step="1"
      value={retailPrice}
      onChange={(e) => setRetailPrice(e.target.value)}
      required
      placeholder="699"
      className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
    />
  </div>

  {/* COST PRICE */}
  <div>
    <label className="block text-gray-300 mb-2 font-semibold">
      Cost Price (৳)
    </label>

    <input
      type="number"
      min="0"
      step="1"
      value={costPrice}
      onChange={(e) => setCostPrice(e.target.value)}
      required
      placeholder="350"
      className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
    />

    {costPrice &&
      retailPrice &&
      Number(costPrice) <= Number(retailPrice) && (
        <p className="text-blue-400 text-[11px] mt-1.5 font-semibold">
          Gross profit: ৳
          {Number(retailPrice) - Number(costPrice)}
        </p>
      )}
  </div>

  {/* DISCOUNT PRICE */}
  <div>
    <label className="block text-gray-300 mb-2 font-semibold">
      Discount Price (৳)
    </label>

    <input
      type="number"
      min="0"
      step="1"
      value={discountPrice}
      onChange={(e) => setDiscountPrice(e.target.value)}
      placeholder="599"
      className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
    />
  </div>

  {/* WHOLESALE PRICE */}
  <div>
    <label className="block text-gray-300 mb-2 font-semibold">
      Wholesale Price (৳)
    </label>

    <input
      type="number"
      min="0"
      step="1"
      value={wholesalePrice}
      onChange={(e) => setWholesalePrice(e.target.value)}
      placeholder="500"
      className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
    />
  </div>

  {/* MIN WHOLESALE QTY */}
  <div>
    <label className="block text-gray-300 mb-2 font-semibold">
      Min Wholesale Qty
    </label>

    <input
      type="number"
      min="1"
      step="1"
      value={minWholesaleQty}
      onChange={(e) => setMinWholesaleQty(e.target.value)}
      placeholder="5"
      className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
    />
  </div>

</div>


            {/* ==========================================
                STOCK + CATEGORY
            ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* STOCK */}
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Stock Qty
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  placeholder="50"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* DESIGN CATEGORY */}
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Design Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
                >
                  <option value="regular-fit">
                    Regular Fit
                  </option>

                  <option value="oversized">
                    Oversized
                  </option>

                  <option value="spider-man">
                    Spider-Man
                  </option>

                  <option value="chainsaw-man">
                    Chainsaw Man
                  </option>

                  <option value="stranger-things">
                    Stranger Things
                  </option>

                  <option value="ghost-rider">
                    Ghost Rider
                  </option>

                  <option value="essentials">
                    Essentials
                  </option>

                  <option value="anime">
                    Anime
                  </option>

                  <option value="venom">
                    Venom
                  </option>
                </select>
              </div>
            </div>

            {/* ==========================================
                SIZES / COLORS / TAGS
            ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SIZES */}
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Sizes
                </label>

                <input
                  type="text"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* COLORS */}
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Colors
                </label>

                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="Black, White, Navy"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* TAGS */}
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Tags
                </label>

                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tshirt, cotton, marvel"
                  className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* ==========================================
                PRODUCT IMAGES
            ========================================== */}
            <div className="space-y-4 bg-[#1e222d] p-4 sm:p-5 rounded-2xl border border-gray-800">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Product Images
                  </h2>

                  <p className="text-[10px] text-gray-500 mt-1">
                    Upload product images or add image URLs.
                  </p>
                </div>

                {/* IMAGE TYPE BUTTONS */}
                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() => setImageInputType("file")}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition ${
                      imageInputType === "file"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Upload size={13} />

                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputType("url")}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition ${
                      imageInputType === "url"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon size={13} />

                    Image URL(s)
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
                    className="w-full p-2.5 bg-[#161920] border border-gray-800 rounded-xl text-white text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />

                  {images.length > 0 && (
                    <p className="text-[11px] text-purple-400 mt-2 font-medium">
                      {images.length} file(s) selected
                    </p>
                  )}
                </div>
              ) : (
                /* IMAGE URL */
                <div>

                  <input
                    type="text"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className="w-full p-3.5 bg-[#161920] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                  />

                  <p className="text-[10px] text-gray-500 mt-1.5">
                    Add multiple image URLs separated by commas.
                  </p>
                </div>
              )}
            </div>

            {/* ==========================================
                DESCRIPTION
            ========================================== */}
            <div>

              <label className="block text-gray-300 mb-2 font-semibold">
                Description
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Enter product description..."
                className="w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* ==========================================
                FEATURED
            ========================================== */}
            <div className="bg-[#1e222d] border border-gray-800 rounded-xl p-4">

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  id="isFeatured"
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

            {/* ==========================================
                NEW ARRIVAL
            ========================================== */}
            <div className="bg-[#1e222d] border border-gray-800 rounded-xl p-4">

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  id="isNewArrival"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />

                <div>

                  <p className="text-xs font-semibold text-gray-200">
                    Mark as New Arrival
                  </p>

                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Show this product in the New Arrivals section on Home.
                  </p>
                </div>
              </label>
            </div>

            {/* ==========================================
                ACTION BUTTONS
            ========================================== */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[150px] py-3.5 px-6 bg-[#1e222d] border border-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-[#252a36] hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>

              {/* PUBLISH */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Publishing..." : "Publish Product"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}