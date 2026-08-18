// server/src/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
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

details: {
  type: String,
  default: "",
  trim: true,
},

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

    category: {
      type: String,
      required: true,
      trim: true,
    },

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
    //
    // Product create করার সময় যত stock ছিল।
    // Admin update করলে এটা automatically change হবে না।
    //

    initialStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ==================================================
    // SOLD QUANTITY
    // ==================================================
    //
    // Confirmed order হলে বাড়বে।
    // Cancel করলে আবার কমবে।
    //

    soldQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },

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