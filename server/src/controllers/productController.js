// File Path:
// server/src/controllers/productController.js

import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ======================================================
// HELPER - PARSE ARRAY
// ======================================================

const parseArrayField = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be an array`);
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid ${fieldName} data`);
  }
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      isFeatured,
      isNewArrival,
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    if (isNewArrival !== undefined) {
      query.isNewArrival = isNewArrival === "true";
    }

    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get products",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// GET SINGLE PRODUCT
// ======================================================

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id,
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      costPrice,
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

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

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

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // ==================================================
    // RETAIL PRICE
    // ==================================================

    const parsedRetailPrice = Number(retailPrice);

    if (
      retailPrice === undefined ||
      retailPrice === "" ||
      !Number.isFinite(parsedRetailPrice) ||
      parsedRetailPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid retail price",
      });
    }

    // ==================================================
    // COST PRICE
    // ==================================================

    const parsedCostPrice = Number(costPrice);

    if (
      costPrice === undefined ||
      costPrice === "" ||
      !Number.isFinite(parsedCostPrice) ||
      parsedCostPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost price is required and must be valid",
      });
    }

    if (parsedCostPrice > parsedRetailPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Cost price cannot be greater than retail price",
      });
    }

    // ==================================================
    // DISCOUNT PRICE
    // ==================================================

    const parsedDiscountPrice =
      discountPrice !== undefined &&
        discountPrice !== null &&
        discountPrice !== ""
        ? Number(discountPrice)
        : null;

    if (
      parsedDiscountPrice !== null &&
      (
        !Number.isFinite(parsedDiscountPrice) ||
        parsedDiscountPrice < 0 ||
        parsedDiscountPrice >= parsedRetailPrice
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price must be less than retail price",
      });
    }

    // ==================================================
    // WHOLESALE PRICE
    // ==================================================

    const parsedWholesalePrice =
      wholesalePrice !== undefined &&
        wholesalePrice !== null &&
        wholesalePrice !== ""
        ? Number(wholesalePrice)
        : null;

    if (
      parsedWholesalePrice !== null &&
      (
        !Number.isFinite(parsedWholesalePrice) ||
        parsedWholesalePrice < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid wholesale price",
      });
    }

    if (
      parsedWholesalePrice !== null &&
      parsedWholesalePrice >= parsedRetailPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Wholesale price must be less than retail price",
      });
    }

    // ==================================================
    // MIN WHOLESALE QUANTITY
    // ==================================================

    const parsedMinWholesaleQty =
      minWholesaleQty !== undefined &&
        minWholesaleQty !== null &&
        minWholesaleQty !== ""
        ? Number(minWholesaleQty)
        : 1;

    if (
      !Number.isInteger(parsedMinWholesaleQty) ||
      parsedMinWholesaleQty < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum wholesale quantity must be at least 1",
      });
    }

    // ==================================================
    // STOCK
    // ==================================================

    const parsedStock = Number(stock);

    if (
      stock === undefined ||
      stock === "" ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity",
      });
    }

    // ==================================================
    // IMAGES
    // ==================================================

    let images = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream =
                cloudinary.uploader.upload_stream(
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
                  },
                );

              uploadStream.end(file.buffer);
            }),
        ),
      );

      images = uploadedImages.map(
        (result) => result.secure_url,
      );
    }

    // ==================================================
    // IMAGE URLS
    // ==================================================

    if (imageUrls) {
      try {
        const parsedUrls =
          typeof imageUrls === "string"
            ? JSON.parse(imageUrls)
            : imageUrls;

        if (Array.isArray(parsedUrls)) {
          images = [...images, ...parsedUrls];
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid imageUrls data",
        });
      }
    }

    // ==================================================
    // ARRAYS
    // ==================================================

    let parsedSizes;
    let parsedColors;
    let parsedTags;

    try {
      parsedSizes = parseArrayField(
        sizes,
        "sizes",
      );

      parsedColors = parseArrayField(
        colors,
        "colors",
      );

      parsedTags = parseArrayField(
        tags,
        "tags",
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ==================================================
    // CREATE PRODUCT
    // ==================================================
    //
    // IMPORTANT:
    //
    // initialStock = stock at product creation
    // soldQuantity = 0
    // stock = current stock
    //

    const product = await Product.create({
      name: name.trim(),

      description: description.trim(),

      retailPrice: parsedRetailPrice,

      costPrice: parsedCostPrice,

      discountPrice: parsedDiscountPrice,

      wholesalePrice: parsedWholesalePrice,

      minWholesaleQty: parsedMinWholesaleQty,

      category: category.trim(),

      sizes: parsedSizes,

      colors: parsedColors,

      tags: parsedTags,

      images,

      stock: parsedStock,

      initialStock: parsedStock,

      soldQuantity: 0,

      isFeatured:
        isFeatured === true ||
        isFeatured === "true",

      isNewArrival:
        isNewArrival === true ||
        isNewArrival === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      retailPrice,
      costPrice,
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

    // ==================================================
    // FIND PRODUCT
    // ==================================================

    const product = await Product.findById(
      req.params.id,
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==================================================
    // PRICE VALIDATION
    // ==================================================

    const parsedRetailPrice = Number(retailPrice);

    if (
      retailPrice === undefined ||
      retailPrice === "" ||
      !Number.isFinite(parsedRetailPrice) ||
      parsedRetailPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid retail price",
      });
    }

    const parsedCostPrice = Number(costPrice);

    if (
      costPrice === undefined ||
      costPrice === "" ||
      !Number.isFinite(parsedCostPrice) ||
      parsedCostPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost price is required and must be valid",
      });
    }

    if (parsedCostPrice > parsedRetailPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Cost price cannot be greater than retail price",
      });
    }

    // ==================================================
    // DISCOUNT PRICE
    // ==================================================

    let parsedDiscountPrice = null;

    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      parsedDiscountPrice = Number(discountPrice);
    }

    if (
      parsedDiscountPrice !== null &&
      (
        !Number.isFinite(parsedDiscountPrice) ||
        parsedDiscountPrice < 0 ||
        parsedDiscountPrice >= parsedRetailPrice
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price must be less than retail price",
      });
    }

    // ==================================================
    // WHOLESALE PRICE
    // ==================================================

    const parsedWholesalePrice =
      wholesalePrice !== undefined &&
        wholesalePrice !== null &&
        wholesalePrice !== ""
        ? Number(wholesalePrice)
        : null;

    if (
      parsedWholesalePrice !== null &&
      (
        !Number.isFinite(parsedWholesalePrice) ||
        parsedWholesalePrice < 0 ||
        parsedWholesalePrice >= parsedRetailPrice
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid wholesale price",
      });
    }

    // ==================================================
    // MIN WHOLESALE QTY
    // ==================================================

    const parsedMinWholesaleQty =
      minWholesaleQty !== undefined &&
        minWholesaleQty !== null &&
        minWholesaleQty !== ""
        ? Number(minWholesaleQty)
        : 1;

    if (
      !Number.isInteger(parsedMinWholesaleQty) ||
      parsedMinWholesaleQty < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum wholesale quantity must be at least 1",
      });
    }

    // ==================================================
    // STOCK
    // ==================================================

    const parsedStock = Number(stock);

    if (
      stock === undefined ||
      stock === "" ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity",
      });
    }

    // ==================================================
    // IMAGE HANDLING
    // ==================================================

    let images = Array.isArray(product.images)
      ? [...product.images]
      : [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream =
                cloudinary.uploader.upload_stream(
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
                  },
                );

              uploadStream.end(file.buffer);
            }),
        ),
      );

      const newImages = uploadedImages.map(
        (result) => result.secure_url,
      );

      images = [...images, ...newImages];
    }

    if (imageUrls) {
      try {
        const parsedUrls =
          typeof imageUrls === "string"
            ? JSON.parse(imageUrls)
            : imageUrls;

        if (Array.isArray(parsedUrls)) {
          images = parsedUrls;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid imageUrls data",
        });
      }
    }

    // ==================================================
    // UPDATE BASIC DATA
    // ==================================================

    product.name = name?.trim();

    product.description = description?.trim();

    product.retailPrice = parsedRetailPrice;

    product.costPrice = parsedCostPrice;

    product.discountPrice =
      parsedDiscountPrice;

    product.wholesalePrice =
      parsedWholesalePrice;

    product.minWholesaleQty =
      parsedMinWholesaleQty;

    product.category = category?.trim();

    product.images = images;

    // ==================================================
    // SIZES
    // ==================================================

    if (sizes !== undefined) {
      try {
        product.sizes = parseArrayField(
          sizes,
          "sizes",
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // ==================================================
    // COLORS
    // ==================================================

    if (colors !== undefined) {
      try {
        product.colors = parseArrayField(
          colors,
          "colors",
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // ==================================================
    // TAGS
    // ==================================================

    if (tags !== undefined) {
      try {
        product.tags = parseArrayField(
          tags,
          "tags",
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // ==================================================
    // CURRENT STOCK
    // ==================================================
    //
    // IMPORTANT:
    //
    // Admin manually changes current stock here.
    //
    // initialStock DOES NOT change.
    //
    // soldQuantity DOES NOT change.
    //
    // Example:
    //
    // initialStock = 20
    // soldQuantity = 5
    // stock = 15
    //
    // Admin adds 10 stock:
    //
    // initialStock = 20
    // soldQuantity = 5
    // stock = 25
    //
    // This preserves the original stock history.
    //

    product.stock = parsedStock;

    // ==================================================
    // BACKWARD COMPATIBILITY
    // ==================================================
    //
    // Existing products may not have initialStock.
    //
    // In that case initialize it once.
    //

    if (
      product.initialStock === undefined ||
      product.initialStock === null
    ) {
      product.initialStock =
        parsedStock +
        Number(product.soldQuantity || 0);
    }

    // Existing products may not have soldQuantity.
    //

    if (
      product.soldQuantity === undefined ||
      product.soldQuantity === null
    ) {
      product.soldQuantity = 0;
    }

    // ==================================================
    // FEATURED
    // ==================================================

    product.isFeatured =
      isFeatured === true ||
      isFeatured === "true";

    // ==================================================
    // NEW ARRIVAL
    // ==================================================

    product.isNewArrival =
      isNewArrival === true ||
      isNewArrival === "true";

    // ==================================================
    // SAVE
    // ==================================================

    const updatedProduct =
      await product.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id,
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};