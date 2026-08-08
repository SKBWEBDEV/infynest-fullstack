import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    retailPrice: {
      type: Number,
      required: [true, 'Retail price is required'],

    },



    // ✅ Optional Discount Price
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: function (value) {
          return value === null || value < this.retailPrice;
        },
        message: 'Discount price must be less than retail price',
      },
    },



    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Men', 'Women', 'Kids', 'Accessories'],
    },

    sizes: [
      {
        type: String,
        enum: ['S', 'X', 'M', 'L', 'XL', 'XXL', 'Free Size'],
      },
    ],

    colors: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model('Product', productSchema);