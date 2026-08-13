// File Path: backend/controllers/bannerController.js

import { Banner } from "../models/Banner.js";
import cloudinary from "../config/cloudinary.js";

// ======================================================
// GET ALL BANNERS
// ======================================================
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Get banners error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ACTIVE BANNERS
// ======================================================
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Get active banners error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CREATE BANNER
// ======================================================
export const createBanner = async (req, res) => {
  try {
    const { link, order, isActive } = req.body;

    // ==================================================
    // CHECK IMAGE
    // ==================================================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    // ==================================================
    // UPLOAD TO CLOUDINARY
    // ==================================================
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "infynest/banners",
          resource_type: "image",

          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },

        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    // ==================================================
    // CREATE BANNER
    // ==================================================
    const banner = await Banner.create({
      image: result.secure_url,

      link:
        typeof link === "string" && link.trim()
          ? link.trim()
          : "/shop",

      order:
        order !== undefined && order !== ""
          ? Number(order)
          : 0,

      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",
    });

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create banner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE BANNER
// ======================================================
export const updateBanner = async (req, res) => {
  try {
    const { link, order, isActive } = req.body;

    // ==================================================
    // FIND BANNER
    // ==================================================
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // ==================================================
    // UPDATE IMAGE
    // ==================================================
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "infynest/banners",
            resource_type: "image",

            transformation: [
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },

          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(req.file.buffer);
      });

      banner.image = result.secure_url;
    }

    // ==================================================
    // UPDATE LINK
    // ==================================================
    if (link !== undefined) {
      banner.link =
        typeof link === "string" && link.trim()
          ? link.trim()
          : "/shop";
    }

    // ==================================================
    // UPDATE ORDER
    // ==================================================
    if (order !== undefined && order !== "") {
      banner.order = Number(order);
    }

    // ==================================================
    // UPDATE ACTIVE STATUS
    // ==================================================
    if (isActive !== undefined) {
      banner.isActive =
        isActive === true || isActive === "true";
    }

    // ==================================================
    // SAVE
    // ==================================================
    const updatedBanner = await banner.save();

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Update banner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE BANNER
// ======================================================
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // ==================================================
    // DELETE IMAGE FROM CLOUDINARY
    // ==================================================
    if (banner.image) {
      try {
        const imageUrl = banner.image;

        const uploadIndex = imageUrl.indexOf("/upload/");

        if (uploadIndex !== -1) {
          const afterUpload = imageUrl.substring(
            uploadIndex + "/upload/".length,
          );

          const pathParts = afterUpload.split("/");

          // Remove transformation/version parts
          const versionIndex = pathParts.findIndex((part) =>
            /^v\d+$/.test(part),
          );

          const publicParts =
            versionIndex !== -1
              ? pathParts.slice(versionIndex + 1)
              : pathParts;

          publicParts[publicParts.length - 1] =
            publicParts[publicParts.length - 1].replace(
              /\.[^/.]+$/,
              "",
            );

          const publicId = publicParts.join("/");

          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        }
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary banner delete error:",
          cloudinaryError,
        );
      }
    }

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};