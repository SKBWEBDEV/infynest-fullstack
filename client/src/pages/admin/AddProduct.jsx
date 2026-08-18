import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();

  // ==================================================
  // BASIC PRODUCT INFO
  // ==================================================

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("spider-man");

  // ==================================================
  // PRICES
  // ==================================================

  const [retailPrice, setRetailPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [minWholesaleQty, setMinWholesaleQty] = useState("1");

  // ==================================================
  // STOCK
  // ==================================================

  const [stock, setStock] = useState("");

  // ==================================================
  // OPTIONS
  // ==================================================

  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [tags, setTags] = useState("");

  // ==================================================
  // PRODUCT DETAILS
  // ==================================================

  const [collection, setCollection] = useState("");
  const [material, setMaterial] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [fit, setFit] = useState("");
  const [fabric, setFabric] = useState("");
  const [composition, setComposition] = useState("");
  const [styleCode, setStyleCode] = useState("");

  // ==================================================
  // FLAGS
  // ==================================================

  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // ==================================================
  // IMAGES
  // ==================================================

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState("");
  const [imageInputType, setImageInputType] =
    useState("file");

  // ==================================================
  // LOADING
  // ==================================================

  const [loading, setLoading] = useState(false);

  // ==================================================
  // GET USER INFO
  // ==================================================

  const getUserInfo = () => {
    try {
      const storedUser =
        localStorage.getItem("userInfo");

      if (!storedUser) {
        return {};
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Invalid userInfo:",
        error,
      );

      return {};
    }
  };

  // ==================================================
  // FILE CHANGE
  // ==================================================

  const handleFileChange = (e) => {
    setImages(
      Array.from(e.target.files || []),
    );
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userInfo = getUserInfo();

    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!userInfo.token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!name.trim()) {
      toast.error(
        "Product name is required.",
      );
      return;
    }

    if (!description.trim()) {
      toast.error(
        "Product description is required.",
      );
      return;
    }

    if (!category.trim()) {
      toast.error(
        "Product category is required.",
      );
      return;
    }

    // --------------------------------------------------
    // PRICE VALIDATION
    // --------------------------------------------------

    if (
      retailPrice === "" ||
      !Number.isFinite(
        Number(retailPrice),
      ) ||
      Number(retailPrice) < 0
    ) {
      toast.error(
        "Please enter a valid retail price.",
      );
      return;
    }

    if (
      costPrice === "" ||
      !Number.isFinite(
        Number(costPrice),
      ) ||
      Number(costPrice) < 0
    ) {
      toast.error(
        "Please enter a valid cost price.",
      );
      return;
    }

    if (
      Number(costPrice) >
      Number(retailPrice)
    ) {
      toast.error(
        "Cost price cannot be greater than retail price.",
      );
      return;
    }

    // --------------------------------------------------
    // DISCOUNT VALIDATION
    // --------------------------------------------------

    if (discountPrice !== "") {
      if (
        !Number.isFinite(
          Number(discountPrice),
        ) ||
        Number(discountPrice) < 0
      ) {
        toast.error(
          "Please enter a valid discount price.",
        );
        return;
      }

      if (
        Number(discountPrice) >=
        Number(retailPrice)
      ) {
        toast.error(
          "Discount price must be less than retail price.",
        );
        return;
      }
    }

    // --------------------------------------------------
    // WHOLESALE VALIDATION
    // --------------------------------------------------

    if (wholesalePrice !== "") {
      if (
        !Number.isFinite(
          Number(wholesalePrice),
        ) ||
        Number(wholesalePrice) < 0
      ) {
        toast.error(
          "Please enter a valid wholesale price.",
        );
        return;
      }

      if (
        Number(wholesalePrice) >=
        Number(retailPrice)
      ) {
        toast.error(
          "Wholesale price must be less than retail price.",
        );
        return;
      }
    }

    // --------------------------------------------------
    // MIN WHOLESALE QTY
    // --------------------------------------------------

    if (
      !Number.isInteger(
        Number(minWholesaleQty),
      ) ||
      Number(minWholesaleQty) < 1
    ) {
      toast.error(
        "Minimum wholesale quantity must be at least 1.",
      );
      return;
    }

    // --------------------------------------------------
    // STOCK
    // --------------------------------------------------

    if (
      stock === "" ||
      !Number.isInteger(
        Number(stock),
      ) ||
      Number(stock) < 0
    ) {
      toast.error(
        "Please enter a valid stock quantity.",
      );
      return;
    }

    // --------------------------------------------------
    // IMAGE VALIDATION
    // --------------------------------------------------

    if (
      imageInputType === "file" &&
      images.length === 0
    ) {
      toast.error(
        "Please upload at least one product image.",
      );
      return;
    }

    if (
      imageInputType === "url" &&
      !imageUrls.trim()
    ) {
      toast.error(
        "Please add at least one image URL.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // ==================================================
      // BASIC DATA
      // ==================================================

      data.append(
        "name",
        name.trim(),
      );

      data.append(
        "description",
        description.trim(),
      );

      data.append(
        "category",
        category.trim(),
      );

      // ==================================================
      // PRICES
      // ==================================================

      data.append(
        "retailPrice",
        String(Number(retailPrice)),
      );

      data.append(
        "costPrice",
        String(Number(costPrice)),
      );

      if (discountPrice !== "") {
        data.append(
          "discountPrice",
          String(Number(discountPrice)),
        );
      }

      if (wholesalePrice !== "") {
        data.append(
          "wholesalePrice",
          String(Number(wholesalePrice)),
        );
      }

      data.append(
        "minWholesaleQty",
        String(
          Number(minWholesaleQty),
        ),
      );

      // ==================================================
      // STOCK
      // ==================================================

      data.append(
        "stock",
        String(Number(stock)),
      );

      // ==================================================
      // SIZES
      // ==================================================

      const sizesArray = sizes
        ? sizes
            .split(",")
            .map((size) =>
              size.trim().toUpperCase(),
            )
            .filter(Boolean)
        : [];

      data.append(
        "sizes",
        JSON.stringify(sizesArray),
      );

      // ==================================================
      // COLORS
      // ==================================================

      const colorsArray = colors
        ? colors
            .split(",")
            .map((color) =>
              color.trim(),
            )
            .filter(Boolean)
        : [];

      data.append(
        "colors",
        JSON.stringify(colorsArray),
      );

      // ==================================================
      // TAGS
      // ==================================================

      const tagsArray = tags
        ? tags
            .split(",")
            .map((tag) =>
              tag.trim(),
            )
            .filter(Boolean)
        : [];

      data.append(
        "tags",
        JSON.stringify(tagsArray),
      );

      // ==================================================
      // PRODUCT DETAILS
      // ==================================================

      const details = {
        collection:
          collection.trim(),

        material:
          material.trim(),

        sleeve:
          sleeve.trim(),

        fit:
          fit.trim(),

        fabric:
          fabric.trim(),

        composition:
          composition.trim(),

        styleCode:
          styleCode.trim(),
      };

      data.append(
        "details",
        JSON.stringify(details),
      );

      // ==================================================
      // FLAGS
      // ==================================================

      data.append(
        "isFeatured",
        String(isFeatured),
      );

      data.append(
        "isNewArrival",
        String(isNewArrival),
      );

      // ==================================================
      // IMAGE URLS
      // ==================================================

      if (
        imageInputType === "url" &&
        imageUrls.trim()
      ) {
        const urlsArray = imageUrls
          .split(",")
          .map((url) =>
            url.trim(),
          )
          .filter(Boolean);

        data.append(
          "imageUrls",
          JSON.stringify(urlsArray),
        );
      }

      // ==================================================
      // IMAGE FILES
      // ==================================================

      if (
        imageInputType === "file" &&
        images.length > 0
      ) {
        images.forEach((image) => {
          data.append(
            "images",
            image,
          );
        });
      }

      // ==================================================
      // CREATE PRODUCT
      // ==================================================

      await API.post(
        "/products",
        data,
      );

      toast.success(
        "Product created successfully!",
      );

      navigate(
        "/admin/products",
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error,
      );

      toast.error(
        error?.response?.data
          ?.message ||
          error?.response?.data
            ?.error ||
          "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // COMMON INPUT CLASS
  // ==================================================

  const inputClass =
    "w-full p-3.5 bg-[#1e222d] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition";

  // ==================================================
  // RETURN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products",
              )
            }
            className="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-[#1e222d] border border-gray-800 text-gray-300 hover:text-white hover:bg-[#252a36] transition"
          >
            <ArrowLeft size={17} />

            <span className="text-sm font-semibold">
              Back to Products
            </span>
          </button>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Add New Product
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Add a new product to your store
          </p>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <div className="bg-[#161920] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-6 text-xs"
          >

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <div>
              <h2 className="text-sm font-bold text-white mb-4">
                Basic Product Information
              </h2>

              <div className="space-y-4">

                {/* NAME */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value,
                      )
                    }
                    required
                    placeholder="e.g. Premium Oversized T-Shirt"
                    className={inputClass}
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Description
                  </label>

                  <textarea
                    rows="5"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value,
                      )
                    }
                    required
                    placeholder="Enter product description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value,
                      )
                    }
                    required
                    className={`${inputClass} cursor-pointer`}
                  >
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
            </div>

            {/* ==================================================
                PRICES
            ================================================== */}

            <div>
              <h2 className="text-sm font-bold text-white mb-4">
                Pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* RETAIL */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Retail Price (৳)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) =>
                      setRetailPrice(
                        e.target.value,
                      )
                    }
                    required
                    placeholder="999"
                    className={inputClass}
                  />
                </div>

                {/* COST */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Cost Price (৳)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) =>
                      setCostPrice(
                        e.target.value,
                      )
                    }
                    required
                    placeholder="500"
                    className={inputClass}
                  />

                  <p className="text-[10px] text-gray-500 mt-1.5">
                    Your product purchase/production cost.
                  </p>
                </div>

                {/* DISCOUNT */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Discount Price (৳)
                    <span className="text-gray-600 ml-1 font-normal">
                      Optional
                    </span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) =>
                      setDiscountPrice(
                        e.target.value,
                      )
                    }
                    placeholder="799"
                    className={inputClass}
                  />

                  {discountPrice &&
                    retailPrice &&
                    Number(discountPrice) <
                      Number(
                        retailPrice,
                      ) && (
                      <p className="text-green-400 text-[11px] mt-1.5 font-semibold">
                        {Math.round(
                          ((Number(
                            retailPrice,
                          ) -
                            Number(
                              discountPrice,
                            )) /
                            Number(
                              retailPrice,
                            )) *
                            100,
                        )}
                        % OFF
                      </p>
                    )}
                </div>

                {/* WHOLESALE */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Wholesale Price (৳)
                    <span className="text-gray-600 ml-1 font-normal">
                      Optional
                    </span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={wholesalePrice}
                    onChange={(e) =>
                      setWholesalePrice(
                        e.target.value,
                      )
                    }
                    placeholder="699"
                    className={inputClass}
                  />
                </div>

                {/* MIN WHOLESALE */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Minimum Wholesale Qty
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      minWholesaleQty
                    }
                    onChange={(e) =>
                      setMinWholesaleQty(
                        e.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>

                {/* STOCK */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Initial Stock Qty
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) =>
                      setStock(
                        e.target.value,
                      )
                    }
                    required
                    placeholder="50"
                    className={inputClass}
                  />

                  <p className="text-[10px] text-gray-500 mt-1.5">
                    This becomes the initial stock automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                PRODUCT DETAILS
            ================================================== */}

            <div className="bg-[#1e222d] border border-gray-800 rounded-2xl p-4 sm:p-5">

              <div className="mb-4">
                <h2 className="text-sm font-bold text-white">
                  Product Details
                </h2>

                <p className="text-[10px] text-gray-500 mt-1">
                  Add additional product specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* COLLECTION */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Collection
                  </label>

                  <input
                    type="text"
                    value={collection}
                    onChange={(e) =>
                      setCollection(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Summer 2026"
                    className={inputClass}
                  />
                </div>

                {/* MATERIAL */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Material
                  </label>

                  <input
                    type="text"
                    value={material}
                    onChange={(e) =>
                      setMaterial(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Cotton"
                    className={inputClass}
                  />
                </div>

                {/* SLEEVE */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Sleeve
                  </label>

                  <input
                    type="text"
                    value={sleeve}
                    onChange={(e) =>
                      setSleeve(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Half Sleeve"
                    className={inputClass}
                  />
                </div>

                {/* FIT */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Fit
                  </label>

                  <input
                    type="text"
                    value={fit}
                    onChange={(e) =>
                      setFit(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Oversized"
                    className={inputClass}
                  />
                </div>

                {/* FABRIC */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Fabric
                  </label>

                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) =>
                      setFabric(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 220 GSM"
                    className={inputClass}
                  />
                </div>

                {/* COMPOSITION */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Composition
                  </label>

                  <input
                    type="text"
                    value={composition}
                    onChange={(e) =>
                      setComposition(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 100% Cotton"
                    className={inputClass}
                  />
                </div>

                {/* STYLE CODE */}

                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Style Code
                  </label>

                  <input
                    type="text"
                    value={styleCode}
                    onChange={(e) =>
                      setStyleCode(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. INF-TS-001"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                SIZES COLORS TAGS
            ================================================== */}

            <div>
              <h2 className="text-sm font-bold text-white mb-4">
                Product Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* SIZES */}

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Sizes
                  </label>

                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) =>
                      setSizes(
                        e.target.value,
                      )
                    }
                    placeholder="S, M, L, XL"
                    className={inputClass}
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
                    onChange={(e) =>
                      setColors(
                        e.target.value,
                      )
                    }
                    placeholder="Black, White, Navy"
                    className={inputClass}
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
                    onChange={(e) =>
                      setTags(
                        e.target.value,
                      )
                    }
                    placeholder="tshirt, cotton, anime"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                IMAGES
            ================================================== */}

            <div className="space-y-4 bg-[#1e222d] p-4 sm:p-5 rounded-2xl border border-gray-800">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Product Images
                  </h2>

                  <p className="text-[10px] text-gray-500 mt-1">
                    Upload image files or use image URLs.
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setImageInputType(
                        "file",
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition ${
                      imageInputType ===
                      "file"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Upload size={13} />

                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setImageInputType(
                        "url",
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition ${
                      imageInputType ===
                      "url"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon size={13} />

                    Image URL(s)
                  </button>
                </div>
              </div>

              {imageInputType ===
              "file" ? (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                      handleFileChange
                    }
                    className="w-full p-2.5 bg-[#161920] border border-gray-800 rounded-xl text-white text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />

                  {images.length >
                    0 && (
                    <p className="text-[11px] text-purple-400 mt-2 font-medium">
                      {
                        images.length
                      }{" "}
                      file(s) selected
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={imageUrls}
                    onChange={(e) =>
                      setImageUrls(
                        e.target.value,
                      )
                    }
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className={`${inputClass} bg-[#161920]`}
                  />

                  <p className="text-[10px] text-gray-500 mt-1.5">
                    Separate multiple image URLs with commas.
                  </p>
                </div>
              )}
            </div>

            {/* ==================================================
                FLAGS
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* FEATURED */}

              <div className="bg-[#1e222d] border border-gray-800 rounded-xl p-4">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      isFeatured
                    }
                    onChange={(e) =>
                      setIsFeatured(
                        e.target.checked,
                      )
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

              {/* NEW ARRIVAL */}

              <div className="bg-[#1e222d] border border-gray-800 rounded-xl p-4">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      isNewArrival
                    }
                    onChange={(e) =>
                      setIsNewArrival(
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />

                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Mark as New Arrival
                    </p>

                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Show this product as a new arrival.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/products",
                  )
                }
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[150px] py-3.5 px-6 bg-[#1e222d] border border-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-[#252a36] hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading
                  ? "Publishing..."
                  : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}