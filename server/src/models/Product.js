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
    wholesalePrice: {
      type: Number,
      required: [true, 'Wholesale price is required'],
    },
    minWholesaleQty: {
      type: Number,
      default: 10, // সর্বনিম্ন ১০টা কিনলে পাইকারি দাম প্রযোজ্য হবে
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Men', 'Women', 'Kids', 'Accessories'],
    },
    sizes: [
      {
        type: String,
        enum: ['S','X', 'M', 'L', 'XL', 'XXL', 'Free Size'],
      },
    ],
    colors: [{ type: String }],
    images: [{ type: String }], // ইমেজ ইউআরএল বা ক্লাউডিনারি লিংক
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);