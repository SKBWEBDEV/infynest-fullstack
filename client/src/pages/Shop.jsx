// File Path: src/pages/Shop.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import { HiEye, HiShoppingBag } from 'react-icons/hi';
import toast from 'react-hot-toast'; // 👈 টোস্ট ইমپور্ট করা হলো

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
  try {
    setLoading(true);

    const { data } = await API.get('/products');

    const productList = Array.isArray(data)
      ? data
      : data.products || data.data || [];

    setProducts(productList);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching products:', error);
    setLoading(false);
  }
};
    fetchProducts();
  }, []);



 // 🛒 শপ পেজ থেকে Buy এ ক্লিক করলে লগইন চেক করার ফাংশন
  const handleBuyClick = (productId) => {
    const userInfo = localStorage.getItem('userInfo');

    // যদি ইউজার লগইন করা না থাকে
    if (!userInfo) {
      toast.error('প্রথমে লগইন করুন!', {
        style: {
          background: '#161920',
          color: '#fff',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          fontSize: '12px',
        },
      });
      navigate('/login'); // লগইন পেজে পাঠিয়ে দিবে
      return;
    }

    // ইউজার লগইন করা থাকলে আগের মতো মেসেজ দেখাবে (বা চাইলে ডিটেইলস পেজে পাঠাতে পারেন)
    toast('আগে Details-এ যান, সেখান থেকে Size ও Color সিলেক্ট করে Add to Cart করুন!', {
      icon: '🛍️',
      style: {
        background: '#161920',
        color: '#fff',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        fontSize: '12px',
      },
    });

    // চাইলে সরাসরি ডিটেইলস পেজে পাঠাতে চাইলে নিচের আনকমেন্ট করতে পারেন:
    // navigate(`/product/${productId}`);
  };

  const categories = ['All', 'Men', 'Women'];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(item => item.category?.trim().toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Explore Our Products</h1>
          <p className="text-xs text-gray-400 mt-1">Browse through our latest collection of items.</p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                  : 'bg-[#161920] text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {filteredProducts.map((item) => {
    const itemImg = item?.images?.[0] || item?.image;
    const formattedImg = getImageUrl(itemImg);

    return (
      <div
        key={item._id}
        className="bg-[#161920] border border-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-purple-500/50 transition duration-300 flex flex-col justify-between group p-2.5 sm:p-3 md:p-4 shadow-xl"
      >
        <div>
          {/* Product Image */}
          <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 mb-3">
            <img
              src={formattedImg}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
            />

            {item.category && (
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-purple-400 text-[8px] sm:text-[10px] font-bold px-2 py-1 rounded-md sm:rounded-lg uppercase">
                {item.category}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-purple-400 transition">
            {item.name}
          </h3>

          <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 mt-1">
            {item.description || "Best quality product for you."}
          </p>
        </div>

        {/* Bottom */}
        <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-black text-purple-400 whitespace-nowrap">
            ৳{item.retailPrice || item.price}
          </span>

          <div className="flex items-center gap-1.5">

            <Link
              to={`/product/${item._id}`}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-[9px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center gap-1"
            >
              <HiEye size={12} />
              <span className="hidden sm:inline">Details</span>
            </Link>

            <button
              onClick={() => handleBuyClick(item._id)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-[9px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center gap-1 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <HiShoppingBag size={12} />
              <span className="hidden sm:inline">Buy</span>
            </button>

          </div>
        </div>
      </div>
    );
  })}
</div>

      </div>
    </div>
  );
}