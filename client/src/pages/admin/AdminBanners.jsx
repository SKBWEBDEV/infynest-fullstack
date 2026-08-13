import React, { useState } from "react";
import toast from "react-hot-toast";

export default function AdminBanners() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    link: "/shop",
    order: 0,
    isActive: true,
  });

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Image validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Size validation - 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImage(file);

    // Preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select a banner image");
      return;
    }

    console.log("Banner image:", image);
    console.log("Banner data:", formData);

    toast.success("Banner form ready");
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black">
            Banner Management
          </h1>

          <p className="text-xs text-gray-500 mt-2">
            Upload and manage your website promotional banners.
          </p>
        </div>

        {/* ==========================================
            CREATE BANNER
        ========================================== */}

        <div className="bg-[#161920] border border-gray-800/60 rounded-2xl p-5 md:p-6">

          <h2 className="text-sm font-bold mb-5">
            Add New Banner
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ======================================
                  IMAGE
              ====================================== */}

              <div>

                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Banner Image
                </label>

                <label
                  htmlFor="banner-image"
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    w-full
                    aspect-[16/7]
                    rounded-xl
                    border
                    border-dashed
                    border-gray-700
                    bg-[#111319]
                    hover:border-purple-500
                    transition
                    cursor-pointer
                    overflow-hidden
                  "
                >

                  {preview ? (
                    <img
                      src={preview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center px-5">

                      <div className="text-3xl mb-2">
                        🖼️
                      </div>

                      <p className="text-xs font-semibold text-gray-300">
                        Click to upload banner
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        PNG, JPG, WEBP — Max 5MB
                      </p>

                    </div>
                  )}

                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

                {image && (
                  <p className="text-[10px] text-gray-500 mt-2 truncate">
                    Selected: {image.name}
                  </p>
                )}

              </div>

              {/* ======================================
                  SETTINGS
              ====================================== */}

              <div className="space-y-5">

                {/* LINK */}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Banner Link
                  </label>

                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="/shop"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-[#111319]
                      border
                      border-gray-800
                      text-sm
                      text-white
                      placeholder-gray-600
                      focus:outline-none
                      focus:border-purple-500
                    "
                  />
                </div>

                {/* ORDER */}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-[#111319]
                      border
                      border-gray-800
                      text-sm
                      text-white
                      focus:outline-none
                      focus:border-purple-500
                    "
                  />
                </div>

                {/* ACTIVE */}

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="
                      w-4
                      h-4
                      accent-purple-600
                    "
                  />

                  <span className="text-xs text-gray-300">
                    Active Banner
                  </span>

                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="
                    w-full
                    py-3
                    rounded-xl
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    text-xs
                    font-bold
                    transition
                  "
                >
                  Upload Banner
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}