// File Path: backend/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ==========================================
    // PRODUCT NAME
    // ==========================================
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    // ==========================================
    // DESCRIPTION
    // ==========================================
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // ==========================================
    // RETAIL PRICE
    // ==========================================
    retailPrice: {
      type: Number,
      required: [true, "Retail price is required"],
      min: [0, "Retail price cannot be negative"],
    },

    // ==========================================
    // DISCOUNT PRICE
    // ==========================================
    discountPrice: {
      type: Number,
      default: null,
      min: [0, "Discount price cannot be negative"],

      validate: {
        validator: function (value) {
          // Empty/null discount is allowed
          if (value === null || value === undefined) {
            return true;
          }

          // Discount must be lower than retail price
          return value < this.retailPrice;
        },

        message: "Discount price must be less than retail price",
      },
    },

    // ==========================================
    // WHOLESALE PRICE
    // ==========================================
    wholesalePrice: {
      type: Number,
      default: null,
      min: [0, "Wholesale price cannot be negative"],
    },

    // ==========================================
    // MINIMUM WHOLESALE QUANTITY
    // ==========================================
    minWholesaleQty: {
      type: Number,
      default: 1,
      min: [1, "Minimum wholesale quantity must be at least 1"],
    },

    // ==========================================
    // DESIGN / CATEGORY
    // ==========================================
    category: {
      type: String,
      required: [true, "Design category is required"],

      enum: [
        "spider-man",
        "chainsaw-man",
        "stranger-things",
        "ghost-rider",
        "essentials",
        "anime",
        "venom",
      ],

      trim: true,
    },

    // ==========================================
    // SIZES
    // ==========================================
    sizes: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL", "Free Size"],
      },
    ],

    // ==========================================
    // COLORS
    // ==========================================
    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // TAGS
    // ==========================================
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // PRODUCT IMAGES
    // ==========================================
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // STOCK
    // ==========================================
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    // ==========================================
    // FEATURED PRODUCT
    // ==========================================
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

export const Product = mongoose.model("Product", productSchema);
