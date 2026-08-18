// server/src/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC PRODUCT INFO
    // ==================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // PRODUCT DETAILS
    // ==================================================

    details: {
      collection: {
        type: String,
        default: "",
        trim: true,
      },

      material: {
        type: String,
        default: "",
        trim: true,
      },

      sleeve: {
        type: String,
        default: "",
        trim: true,
      },

      fit: {
        type: String,
        default: "",
        trim: true,
      },

      fabric: {
        type: String,
        default: "",
        trim: true,
      },

      composition: {
        type: String,
        default: "",
        trim: true,
      },

      styleCode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==================================================
    // PRICES
    // ==================================================

    retailPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    wholesalePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    minWholesaleQty: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==================================================
    // CATEGORY
    // ==================================================

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // PRODUCT OPTIONS
    // ==================================================

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    // ==================================================
    // IMAGES
    // ==================================================

    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // ==================================================
    // CURRENT STOCK
    // ==================================================

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ==================================================
    // INITIAL STOCK
    // ==================================================

    initialStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ==================================================
    // SOLD QUANTITY
    // ==================================================

    soldQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ==================================================
    // FLAGS
    // ==================================================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model(
  "Product",
  productSchema,
);