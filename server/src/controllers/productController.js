// File Path: backend/controllers/productController.js

import { Product } from "../models/Product.js";

// @desc    Get all products
// @route   GET /api/v1/products
export const getProducts = async (req, res) => {
  try {
    const { category, isFeatured } = req.query;

    let query = {};

    if (category) query.category = category;

    if (isFeatured) {
      query.isFeatured = isFeatured === "true";
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/v1/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      discountPrice, // ✅ ADDED
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

    let images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // ==========================================
    // IMAGE URLS
    // ==========================================
    if (imageUrls) {
      try {
        const parsedUrls = JSON.parse(imageUrls);

        if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
          images = [...images, ...parsedUrls];
        }
      } catch (err) {
        console.error("Invalid imageUrls:", err);
      }
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================
    const product = await Product.create({
      name,
      description,
      retailPrice,

      // ✅ DISCOUNT PRICE
      discountPrice:
        discountPrice !== undefined &&
        discountPrice !== null &&
        discountPrice !== ""
          ? Number(discountPrice)
          : null,

      wholesalePrice,
      minWholesaleQty,

      category,

      sizes: sizes ? JSON.parse(sizes) : [],

      colors: colors ? JSON.parse(colors) : [],

      tags: tags ? JSON.parse(tags) : [],

      images,

      stock,

      isFeatured,
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

// @desc    Update a product (Admin only)
// @route   PUT /api/v1/products/:id
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      discountPrice, // ✅ ADDED
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
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================
    let images = product.images;

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (imageUrls) {
      try {
        const parsedUrls = JSON.parse(imageUrls);

        if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
          images = parsedUrls;
        }
      } catch (err) {
        console.error("Invalid imageUrls:", err);
      }
    }

    // ==========================================
    // DISCOUNT PRICE
    // ==========================================
    let updatedDiscountPrice = product.discountPrice;

    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      updatedDiscountPrice = Number(discountPrice);
    } else if (discountPrice === "") {
      updatedDiscountPrice = null;
    }

    // ==========================================
    // UPDATE PRODUCT
    // ==========================================
    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        retailPrice,

        // ✅ DISCOUNT PRICE FIX
        discountPrice: updatedDiscountPrice,

        wholesalePrice,
        minWholesaleQty,

        category,

        sizes: sizes ? JSON.parse(sizes) : product.sizes,

        colors: colors ? JSON.parse(colors) : product.colors,

        tags: tags ? JSON.parse(tags) : product.tags,

        images,

        stock,

        isFeatured,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
