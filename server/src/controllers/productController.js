// File Path: backend/controllers/productController.js

import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const { category, isFeatured, isNewArrival } = req.query;

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

    // ==========================================
    // RETAIL PRICE
    // ==========================================

    const parsedRetailPrice = Number(retailPrice);

    if (
      retailPrice === undefined ||
      retailPrice === "" ||
      Number.isNaN(parsedRetailPrice) ||
      parsedRetailPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid retail price",
      });
    }

    // ==========================================
    // COST PRICE
    // ==========================================

    const parsedCostPrice = Number(costPrice);

    if (
      costPrice === undefined ||
      costPrice === "" ||
      Number.isNaN(parsedCostPrice) ||
      parsedCostPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cost price is required and must be valid",
      });
    }

    if (parsedCostPrice > parsedRetailPrice) {
      return res.status(400).json({
        success: false,
        message: "Cost price cannot be greater than retail price",
      });
    }

    // ==========================================
    // DISCOUNT PRICE
    // ==========================================

    const parsedDiscountPrice =
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
        ? Number(discountPrice)
        : null;

    if (
      parsedDiscountPrice !== null &&
      (Number.isNaN(parsedDiscountPrice) ||
        parsedDiscountPrice < 0 ||
        parsedDiscountPrice >= parsedRetailPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than retail price",
      });
    }

    // ==========================================
    // WHOLESALE PRICE
    // ==========================================

    const parsedWholesalePrice =
      wholesalePrice !== undefined &&
      wholesalePrice !== null &&
      wholesalePrice !== ""
        ? Number(wholesalePrice)
        : null;

    if (
      parsedWholesalePrice !== null &&
      (Number.isNaN(parsedWholesalePrice) || parsedWholesalePrice < 0)
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
        message: "Wholesale price must be less than retail price",
      });
    }

    // ==========================================
    // MIN WHOLESALE QUANTITY
    // ==========================================

    const parsedMinWholesaleQty =
      minWholesaleQty !== undefined &&
      minWholesaleQty !== null &&
      minWholesaleQty !== ""
        ? Number(minWholesaleQty)
        : 1;

    if (
      Number.isNaN(parsedMinWholesaleQty) ||
      parsedMinWholesaleQty < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum wholesale quantity must be at least 1",
      });
    }

    // ==========================================
    // STOCK
    // ==========================================

    const parsedStock = Number(stock);

    if (
      stock === undefined ||
      stock === "" ||
      Number.isNaN(parsedStock) ||
      parsedStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity",
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

      costPrice: parsedCostPrice,

      discountPrice: parsedDiscountPrice,

      wholesalePrice: parsedWholesalePrice,

      minWholesaleQty: parsedMinWholesaleQty,

      category,

      sizes: parsedSizes,

      colors: parsedColors,

      tags: parsedTags,

      images,

      stock: parsedStock,

      isFeatured:
        isFeatured === true ||
        isFeatured === "true",

      isNewArrival:
        isNewArrival === true ||
        isNewArrival === "true",
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
    // RETAIL PRICE
    // ==========================================

    const parsedRetailPrice = Number(retailPrice);

    if (
      retailPrice === undefined ||
      retailPrice === "" ||
      Number.isNaN(parsedRetailPrice) ||
      parsedRetailPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid retail price",
      });
    }

    // ==========================================
    // COST PRICE
    // ==========================================

    const parsedCostPrice = Number(costPrice);

    if (
      costPrice === undefined ||
      costPrice === "" ||
      Number.isNaN(parsedCostPrice) ||
      parsedCostPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cost price is required and must be valid",
      });
    }

    if (parsedCostPrice > parsedRetailPrice) {
      return res.status(400).json({
        success: false,
        message: "Cost price cannot be greater than retail price",
      });
    }

    // ==========================================
    // DISCOUNT PRICE
    // ==========================================

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
      (Number.isNaN(parsedDiscountPrice) ||
        parsedDiscountPrice < 0 ||
        parsedDiscountPrice >= parsedRetailPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than retail price",
      });
    }

    // ==========================================
    // WHOLESALE PRICE
    // ==========================================

    const parsedWholesalePrice =
      wholesalePrice !== undefined &&
      wholesalePrice !== null &&
      wholesalePrice !== ""
        ? Number(wholesalePrice)
        : null;

    if (
      parsedWholesalePrice !== null &&
      (Number.isNaN(parsedWholesalePrice) ||
        parsedWholesalePrice < 0)
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
        message: "Wholesale price must be less than retail price",
      });
    }

    // ==========================================
    // MIN WHOLESALE QUANTITY
    // ==========================================

    const parsedMinWholesaleQty =
      minWholesaleQty !== undefined &&
      minWholesaleQty !== null &&
      minWholesaleQty !== ""
        ? Number(minWholesaleQty)
        : 1;

    if (
      Number.isNaN(parsedMinWholesaleQty) ||
      parsedMinWholesaleQty < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum wholesale quantity must be at least 1",
      });
    }

    // ==========================================
    // STOCK
    // ==========================================

    const parsedStock = Number(stock);

    if (
      stock === undefined ||
      stock === "" ||
      Number.isNaN(parsedStock) ||
      parsedStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================

    let images = Array.isArray(product.images)
      ? [...product.images]
      : [];

    // ==========================================
    // NEW FILE UPLOADS
    // ==========================================

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
    // UPDATE BASIC DATA
    // ==========================================

    product.name = name?.trim();

    product.description = description?.trim();

    product.retailPrice = parsedRetailPrice;

    product.costPrice = parsedCostPrice;

    product.discountPrice = parsedDiscountPrice;

    product.wholesalePrice = parsedWholesalePrice;

    product.minWholesaleQty = parsedMinWholesaleQty;

    product.category = category;

    // ==========================================
    // SIZES
    // ==========================================

    if (sizes !== undefined) {
      try {
        product.sizes = sizes
          ? JSON.parse(sizes)
          : [];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid sizes data",
        });
      }
    }

    // ==========================================
    // COLORS
    // ==========================================

    if (colors !== undefined) {
      try {
        product.colors = colors
          ? JSON.parse(colors)
          : [];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid colors data",
        });
      }
    }

    // ==========================================
    // TAGS
    // ==========================================

    if (tags !== undefined) {
      try {
        product.tags = tags
          ? JSON.parse(tags)
          : [];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid tags data",
        });
      }
    }

    // ==========================================
    // IMAGES
    // ==========================================

    product.images = images;

    // ==========================================
    // STOCK
    // ==========================================

    product.stock = parsedStock;

    // ==========================================
    // FEATURED
    // ==========================================

    product.isFeatured =
      isFeatured === true ||
      isFeatured === "true";

    // ==========================================
    // NEW ARRIVAL
    // ==========================================

    product.isNewArrival =
      isNewArrival === true ||
      isNewArrival === "true";

    // ==========================================
    // SAVE
    // ==========================================

    const updatedProduct = await product.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(400).json({
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
    const product = await Product.findByIdAndDelete(
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
      message: error.message,
    });
  }
};