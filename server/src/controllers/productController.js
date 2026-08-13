// File Path: backend/controllers/productController.js

import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const { category, isFeatured, isNewArrival } = req.query;

    // ==========================================
    // BUILD QUERY
    // ==========================================
    const query = {};

    // CATEGORY FILTER
    if (category) {
      query.category = category;
    }

    // FEATURED FILTER
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // NEW ARRIVAL FILTER
    if (isNewArrival !== undefined) {
      query.isNewArrival = isNewArrival === "true";
    }

    // ==========================================
    // GET PRODUCTS
    // ==========================================
    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT
// ==========================================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CREATE PRODUCT
// ==========================================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      discountPrice,
      wholesalePrice,
      minWholesaleQty,
      category,
      sizes,
      colors,
      tags,
      stock,
      isFeatured,
      isNewArrival,
      imageUrls,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    const parsedRetailPrice = Number(retailPrice);

    if (Number.isNaN(parsedRetailPrice) || parsedRetailPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid retail price",
      });
    }

    const parsedDiscountPrice =
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
        ? Number(discountPrice)
        : null;

    if (
      parsedDiscountPrice !== null &&
      (Number.isNaN(parsedDiscountPrice) ||
        parsedDiscountPrice >= parsedRetailPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than retail price",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================

    let images = [];

    // ==========================================
    // UPLOAD FILES TO CLOUDINARY
    // ==========================================

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "infynest/products",

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
                }
              );

              uploadStream.end(file.buffer);
            })
        )
      );

      images = uploadedImages.map((result) => result.secure_url);
    }

    // ==========================================
    // IMAGE URLS
    // ==========================================

    if (imageUrls) {
      try {
        const parsedUrls = JSON.parse(imageUrls);

        if (Array.isArray(parsedUrls)) {
          images = [...images, ...parsedUrls];
        }
      } catch (error) {
        console.error("Invalid imageUrls:", error);
      }
    }

    // ==========================================
    // PARSE ARRAYS
    // ==========================================

    let parsedSizes = [];
    let parsedColors = [];
    let parsedTags = [];

    try {
      parsedSizes = sizes ? JSON.parse(sizes) : [];
      parsedColors = colors ? JSON.parse(colors) : [];
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid product array data",
      });
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const product = await Product.create({
      name: name.trim(),

      description: description.trim(),

      retailPrice: parsedRetailPrice,

      discountPrice: parsedDiscountPrice,

      wholesalePrice:
        wholesalePrice !== undefined && wholesalePrice !== ""
          ? Number(wholesalePrice)
          : null,

      minWholesaleQty:
        minWholesaleQty !== undefined && minWholesaleQty !== ""
          ? Number(minWholesaleQty)
          : 1,

      category,

      sizes: parsedSizes,

      colors: parsedColors,

      tags: parsedTags,

      images,

      stock: Number(stock),

      isFeatured:
        isFeatured === true || isFeatured === "true",

      isNewArrival:
        isNewArrival === true || isNewArrival === "true",
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ==========================================
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      discountPrice,
      wholesalePrice,
      minWholesaleQty,
      category,
      sizes,
      colors,
      tags,
      stock,
      isFeatured,
      isNewArrival,
      imageUrls,
    } = req.body;

    // ==========================================
    // FIND PRODUCT
    // ==========================================
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================================
    // PARSE PRICES
    // ==========================================
    const parsedRetailPrice = Number(retailPrice);

    let parsedDiscountPrice = null;

    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      parsedDiscountPrice = Number(discountPrice);
    }

    // ==========================================
    // PRICE VALIDATION
    // ==========================================
    if (
      parsedDiscountPrice !== null &&
      (Number.isNaN(parsedDiscountPrice) ||
        parsedDiscountPrice >= parsedRetailPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than retail price",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================
    let images = Array.isArray(product.images) ? [...product.images] : [];

    // ==========================================
    // NEW UPLOADED FILES
    // ==========================================
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      images = [...images, ...newImages];
    }

    // ==========================================
    // IMAGE URLS
    // ==========================================
    if (imageUrls) {
      try {
        const parsedUrls = JSON.parse(imageUrls);

        if (Array.isArray(parsedUrls)) {
          images = parsedUrls;
        }
      } catch (error) {
        console.error("Invalid imageUrls:", error);
      }
    }

    // ==========================================
    // UPDATE PRODUCT DATA
    // ==========================================
    product.name = name?.trim();

    product.description = description?.trim();

    product.retailPrice = parsedRetailPrice;

    product.discountPrice = parsedDiscountPrice;

    product.wholesalePrice =
      wholesalePrice !== undefined && wholesalePrice !== ""
        ? Number(wholesalePrice)
        : null;

    product.minWholesaleQty =
      minWholesaleQty !== undefined && minWholesaleQty !== ""
        ? Number(minWholesaleQty)
        : 1;

    // CATEGORY
    product.category = category;

    // ==========================================
    // SIZES
    // ==========================================
    if (sizes !== undefined) {
      product.sizes = sizes ? JSON.parse(sizes) : [];
    }

    // ==========================================
    // COLORS
    // ==========================================
    if (colors !== undefined) {
      product.colors = colors ? JSON.parse(colors) : [];
    }

    // ==========================================
    // TAGS
    // ==========================================
    if (tags !== undefined) {
      product.tags = tags ? JSON.parse(tags) : [];
    }

    // ==========================================
    // IMAGES
    // ==========================================
    product.images = images;

    // ==========================================
    // STOCK
    // ==========================================
    product.stock = Number(stock);

    // ==========================================
    // FEATURED
    // ==========================================
    product.isFeatured = isFeatured === true || isFeatured === "true";

    // ==========================================
    // NEW ARRIVAL
    // ==========================================
    product.isNewArrival = isNewArrival === true || isNewArrival === "true";

    // ==========================================
    // SAVE
    // ==========================================
    const updatedProduct = await product.save();

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE PRODUCT
// ==========================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
