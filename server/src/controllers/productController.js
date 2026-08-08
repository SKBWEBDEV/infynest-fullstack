// File Path: backend/controllers/productController.js

import { Product } from "../models/Product.js";

// ======================================================
// GET ALL PRODUCTS
// ======================================================
// @desc    Get all products
// @route   GET /api/v1/products
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

// ======================================================
// GET SINGLE PRODUCT
// ======================================================
// @desc    Get single product details
// @route   GET /api/v1/products/:id
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

// ======================================================
// CREATE PRODUCT
// ======================================================
// @desc    Create a product (Admin only)
// @route   POST /api/v1/products
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
    // PRICE VALIDATION
    // ==========================================
    const retail = Number(retailPrice);

    let discount = null;

    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      discount = Number(discountPrice);

      if (discount >= retail) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be less than retail price.",
        });
      }
    }

    // ==========================================
    // IMAGES
    // ==========================================
    let images = [];

    // Uploaded files
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Image URLs
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
    // CREATE PRODUCT
    // ==========================================
    const product = await Product.create({
      name,
      description,

      retailPrice: retail,

      discountPrice: discount,

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

      isFeatured: isFeatured === "true" || isFeatured === true,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================
// @desc    Update a product (Admin only)
// @route   PUT /api/v1/products/:id
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
    // PRICE VALIDATION
    // ==========================================
    const retail = Number(retailPrice);

    let updatedDiscountPrice = null;

    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      updatedDiscountPrice = Number(discountPrice);

      if (updatedDiscountPrice >= retail) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be less than retail price.",
        });
      }
    }

    // ==========================================
    // EXISTING IMAGES
    // ==========================================
    let images = Array.isArray(product.images) ? [...product.images] : [];

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
    // NEW UPLOADED IMAGES
    // ==========================================
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      images = [...images, ...newImages];
    }

    // ==========================================
    // UPDATE DATA
    // ==========================================
    const updateData = {
      name,
      description,

      retailPrice: retail,

      discountPrice: updatedDiscountPrice,

      wholesalePrice:
        wholesalePrice !== undefined && wholesalePrice !== ""
          ? Number(wholesalePrice)
          : null,

      minWholesaleQty:
        minWholesaleQty !== undefined && minWholesaleQty !== ""
          ? Number(minWholesaleQty)
          : 1,

      category,

      sizes: sizes ? JSON.parse(sizes) : product.sizes,

      colors: colors ? JSON.parse(colors) : product.colors,

      tags: tags ? JSON.parse(tags) : product.tags,

      images,

      stock: Number(stock),

      isFeatured: isFeatured === "true" || isFeatured === true,
    };

    // ==========================================
    // SAVE
    // ==========================================
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================
// @desc    Delete product (Admin only)
// @route   DELETE /api/v1/products/:id
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
