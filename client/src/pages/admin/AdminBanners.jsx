import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import { Link } from "react-router-dom";

export default function AdminBanners() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [editingBanner, setEditingBanner] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  const [formData, setFormData] = useState({
    link: "/shop",
    order: 0,
    isActive: true,
  });

  // =====================================================
  // FETCH BANNERS
  // =====================================================

  const fetchBanners = async () => {
    try {
      setFetching(true);

      const response = await API.get("/banners");

      const data =
        response?.data?.data ||
        response?.data?.banners ||
        [];

      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch banners error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load banners",
      );

      setBanners([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // =====================================================
  // CLEANUP PREVIEW URLS
  // =====================================================

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      if (editPreview) {
        URL.revokeObjectURL(editPreview);
      }
    };
  }, []);

  // =====================================================
  // SELECT MULTIPLE IMAGES
  // =====================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    // Maximum 5 images
    if (files.length > 5) {
      toast.error("You can upload maximum 5 images at a time.");
      e.target.value = "";
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image.`);
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} must be less than 5MB.`);
        e.target.value = "";
        return;
      }
    }

    // Remove old previews
    previews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setImages(files);

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file),
    );

    setPreviews(newPreviews);
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // UPLOAD BANNERS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length) {
      toast.error("Please select banner images.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      // IMPORTANT:
      // Backend field name = images
      images.forEach((image) => {
        data.append("images", image);
      });

      data.append(
        "link",
        formData.link.trim() || "/shop",
      );

      data.append(
        "order",
        String(Number(formData.order) || 0),
      );

      data.append(
        "isActive",
        String(formData.isActive),
      );

      const response = await API.post(
        "/banners",
        data,
      );

      toast.success(
        response?.data?.message ||
          "Banners uploaded successfully",
      );

      // Reset
      previews.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      setImages([]);
      setPreviews([]);

      setFormData({
        link: "/shop",
        order: 0,
        isActive: true,
      });

      const fileInput =
        document.getElementById("banner-images");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchBanners();
    } catch (error) {
      console.error("Banner upload error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to upload banners",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE BANNER
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/banners/${id}`);

      toast.success("Banner deleted successfully.");

      setBanners((prev) =>
        prev.filter(
          (banner) => banner._id !== id,
        ),
      );
    } catch (error) {
      console.error("Delete banner error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete banner",
      );
    }
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleEdit = (banner) => {
    setEditingBanner(banner);

    setFormData({
      link: banner.link || "/shop",
      order: banner.order ?? 0,
      isActive:
        banner.isActive !== false,
    });

    setEditImage(null);
    setEditPreview("");
  };

  // =====================================================
  // EDIT IMAGE
  // =====================================================

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image must be less than 5MB.",
      );
      return;
    }

    if (editPreview) {
      URL.revokeObjectURL(editPreview);
    }

    setEditImage(file);

    setEditPreview(
      URL.createObjectURL(file),
    );
  };

  // =====================================================
  // UPDATE BANNER
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingBanner) return;

    try {
      setLoading(true);

      const data = new FormData();

      if (editImage) {
        data.append("image", editImage);
      }

      data.append(
        "link",
        formData.link.trim() || "/shop",
      );

      data.append(
        "order",
        String(Number(formData.order) || 0),
      );

      data.append(
        "isActive",
        String(formData.isActive),
      );

      const response = await API.put(
        `/banners/${editingBanner._id}`,
        data,
      );

      toast.success(
        response?.data?.message ||
          "Banner updated successfully.",
      );

      setEditingBanner(null);
      setEditImage(null);

      if (editPreview) {
        URL.revokeObjectURL(editPreview);
      }

      setEditPreview("");

      await fetchBanners();
    } catch (error) {
      console.error("Update banner error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update banner",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              Banner Management
            </h1>

            <p className="text-xs text-gray-500 mt-2">
              Upload and manage your website promotional banners.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="
              px-4
              py-2.5
              rounded-xl
              bg-[#1e222d]
              border
              border-gray-700
              text-xs
              font-semibold
              text-gray-300
              hover:bg-gray-800
              hover:text-white
              transition
            "
          >
            ← Back to Dashboard
          </Link>

        </div>

        {/* =================================================
            ADD BANNER
        ================================================= */}

        <div className="bg-[#161920] border border-gray-800/60 rounded-2xl p-5 md:p-6">

          <h2 className="text-sm font-bold mb-5">
            Add New Banners
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* IMAGE UPLOAD */}

              <div>

                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Banner Images
                </label>

                <label
                  htmlFor="banner-images"
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    w-full
                    min-h-[220px]
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

                  {previews.length > 0 ? (

                    <div className="grid grid-cols-2 gap-2 p-3 w-full">

                      {previews.map(
                        (preview, index) => (
                          <div
                            key={preview}
                            className="relative aspect-[16/7] rounded-lg overflow-hidden"
                          >

                            <img
                              src={preview}
                              alt={`Banner ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            <span
                              className="
                                absolute
                                top-2
                                left-2
                                bg-black/70
                                text-white
                                text-[9px]
                                font-bold
                                px-2
                                py-1
                                rounded
                              "
                            >
                              {index + 1}
                            </span>

                          </div>
                        ),
                      )}

                    </div>

                  ) : (

                    <div className="text-center px-5">

                      <div className="text-3xl mb-2">
                        🖼️
                      </div>

                      <p className="text-xs font-semibold text-gray-300">
                        Click to upload banners
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        Select 1–5 images • PNG, JPG, WEBP • Max 5MB each
                      </p>

                    </div>

                  )}

                  <input
                    id="banner-images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

                {images.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    {images.length} image
                    {images.length > 1 ? "s" : ""} selected
                  </p>
                )}

              </div>

              {/* SETTINGS */}

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
                    Starting Display Order
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

                  <p className="text-[9px] text-gray-600 mt-1">
                    Selected images will be shown in this order.
                  </p>

                </div>

                {/* ACTIVE */}

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 accent-purple-600"
                  />

                  <span className="text-xs text-gray-300">
                    Active Banners
                  </span>

                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    py-3
                    rounded-xl
                    bg-purple-600
                    hover:bg-purple-700
                    disabled:bg-purple-900
                    disabled:cursor-not-allowed
                    text-white
                    text-xs
                    font-bold
                    transition
                  "
                >
                  {loading
                    ? "Uploading..."
                    : "Upload Banners"}
                </button>

              </div>

            </div>

          </form>

        </div>

        {/* =================================================
            EXISTING BANNERS
        ================================================= */}

        <div className="mt-8">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-lg font-bold">
                Existing Banners
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                These banners will appear in your Hero Slider.
              </p>
            </div>

            <span className="text-xs text-gray-500">
              {banners.length} banner
              {banners.length !== 1 ? "s" : ""}
            </span>

          </div>

          {fetching ? (

            <div className="bg-[#161920] rounded-2xl p-10 text-center">

              <div className="w-7 h-7 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />

              <p className="text-xs text-gray-500 mt-3">
                Loading banners...
              </p>

            </div>

          ) : banners.length === 0 ? (

            <div className="bg-[#161920] border border-gray-800/60 rounded-2xl p-10 text-center">

              <p className="text-xs text-gray-500">
                No banners uploaded yet.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {banners
                .sort(
                  (a, b) =>
                    (a.order || 0) -
                    (b.order || 0),
                )
                .map((banner, index) => (

                  <div
                    key={banner._id}
                    className="
                      bg-[#161920]
                      border
                      border-gray-800/60
                      rounded-2xl
                      overflow-hidden
                    "
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[16/7] bg-[#111319]">

                      <img
                        src={
                          banner.image ||
                          banner.imageUrl ||
                          banner.url
                        }
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* ORDER */}

                      <span
                        className="
                          absolute
                          top-2
                          left-2
                          bg-black/70
                          text-white
                          text-[9px]
                          font-bold
                          px-2
                          py-1
                          rounded
                        "
                      >
                        #{banner.order ?? 0}
                      </span>

                      {/* ACTIVE */}

                      <span
                        className={`
                          absolute
                          top-2
                          right-2
                          px-2
                          py-1
                          rounded
                          text-[9px]
                          font-bold
                          ${
                            banner.isActive
                              ? "bg-emerald-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }
                        `}
                      >
                        {banner.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    {/* INFO */}

                    <div className="p-4">

                      <p className="text-[10px] text-gray-500 mb-3 truncate">
                        Link:{" "}
                        {banner.link || "/shop"}
                      </p>

                      <div className="grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(banner)
                          }
                          className="
                            py-2.5
                            rounded-lg
                            bg-blue-500/10
                            border
                            border-blue-500/20
                            text-blue-400
                            text-[10px]
                            font-bold
                            hover:bg-blue-500/20
                            transition
                          "
                        >
                          Update
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              banner._id,
                            )
                          }
                          className="
                            py-2.5
                            rounded-lg
                            bg-red-500/10
                            border
                            border-red-500/20
                            text-red-400
                            text-[10px]
                            font-bold
                            hover:bg-red-500/20
                            transition
                          "
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editingBanner && (

        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-[#161920] border border-gray-800 rounded-2xl p-5 md:p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-sm font-bold">
                Update Banner
              </h2>

              <button
                type="button"
                onClick={() =>
                  setEditingBanner(null)
                }
                className="text-gray-500 hover:text-white text-lg"
              >
                ✕
              </button>

            </div>

            {/* CURRENT IMAGE */}

            <div className="rounded-xl overflow-hidden aspect-[16/7] bg-[#111319] mb-4">

              <img
                src={
                  editPreview ||
                  editingBanner.image ||
                  editingBanner.imageUrl ||
                  editingBanner.url
                }
                alt="Current banner"
                className="w-full h-full object-cover"
              />

            </div>

            {/* NEW IMAGE */}

            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Change Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleEditImageChange}
              className="
                w-full
                text-xs
                text-gray-400
                mb-5
              "
            />

            {/* LINK */}

            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Banner Link
            </label>

            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
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
                mb-4
                focus:outline-none
                focus:border-purple-500
              "
            />

            {/* ORDER */}

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
                mb-4
                focus:outline-none
                focus:border-purple-500
              "
            />

            {/* ACTIVE */}

            <label className="flex items-center gap-3 cursor-pointer mb-6">

              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-600"
              />

              <span className="text-xs text-gray-300">
                Active Banner
              </span>

            </label>

            {/* ACTIONS */}

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setEditingBanner(null)
                }
                className="
                  py-3
                  rounded-xl
                  bg-[#1e222d]
                  border
                  border-gray-700
                  text-gray-300
                  text-xs
                  font-bold
                  hover:bg-gray-800
                  transition
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="
                  py-3
                  rounded-xl
                  bg-purple-600
                  hover:bg-purple-700
                  disabled:bg-purple-900
                  text-white
                  text-xs
                  font-bold
                  transition
                "
              >
                {loading
                  ? "Updating..."
                  : "Update Banner"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}