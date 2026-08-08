// File Path: backend/controllers/productController.js

import { Product } from "../models/Product.js";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const { category, isFeatured } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

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
      imageUrls,
    } = req.body;

    // ==========================================
    // IMAGES
    // ==========================================
    let images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

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
    // PRICE VALUES
    // ==========================================
    const parsedRetailPrice = Number(retailPrice);

    const parsedDiscountPrice =
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
        ? Number(discountPrice)
        : null;

    // Backend validation
    if (
      parsedDiscountPrice !== null &&
      parsedDiscountPrice >= parsedRetailPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than retail price",
      });
    }

    // ==========================================
    // CREATE
    // ==========================================
    const product = await Product.create({
      name,
      description,

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

      sizes: sizes ? JSON.parse(sizes) : [],

      colors: colors ? JSON.parse(colors) : [],

      tags: tags ? JSON.parse(tags) : [],

      images,

      stock: Number(stock),

      isFeatured: isFeatured === true || isFeatured === "true",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(400).json({
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

    // New uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      images = [...images, ...newImages];
    }

    // Image URLs
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
    // UPDATE DOCUMENT
    // ==========================================
    product.name = name;
    product.description = description;

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

    product.category = category;

    if (sizes !== undefined) {
      product.sizes = sizes ? JSON.parse(sizes) : [];
    }

    if (colors !== undefined) {
      product.colors = colors ? JSON.parse(colors) : [];
    }

    if (tags !== undefined) {
      product.tags = tags ? JSON.parse(tags) : [];
    }

    product.images = images;

    product.stock = Number(stock);

    product.isFeatured = isFeatured === true || isFeatured === "true";

    // ==========================================
    // SAVE
    // ==========================================
    const updatedProduct = await product.save();

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
