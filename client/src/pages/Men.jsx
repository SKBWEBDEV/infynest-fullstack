// File Path: src/pages/Men.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 👈 useNavigate ইমপোর্ট করা হলো
import axios from 'axios';
import { HiShoppingBag, HiEye, HiHeart } from 'react-icons/hi';
import toast from 'react-hot-toast'; // 👈 টোস্ট ইমপোর্ট করা হলো

export default function Men() {
  const navigate = useNavigate(); // 👈 হুক ডিক্লেয়ার করা হলো
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchMenProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/products');
        
        const productList = Array.isArray(data) 
          ? data 
          : data.products || data.data || [];
        
        const menProducts = productList.filter((product) => {
          const category = product?.category?.trim().toLowerCase() || '';
          return category === 'men';
        });

        setProducts(menProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching men products:', error);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchMenProducts();
  }, []);

  // Wishlist toggle handler
  const toggleWishlist = (productId, e) => {
    e.preventDefault();
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // 🛒 Buy বাটনে ক্লিক করলে লগইন চেক করার ফাংশন
  const handleBuyClick = (product) => {
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
      navigate('/login'); // লগইন পেজে রিডাইরেক্ট করবে
      return;
    }

    // ইউজার লগইন করা থাকলে মেসেজ দেখাবে
    toast('আগে Details-এ যান, সেখান থেকে Size ও Color সিলেক্ট করে Add to Cart করুন!', {
      icon: '🛍️',
      style: {
        background: '#161920',
        color: '#fff',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        fontSize: '12px',
      },
    });
  };

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'low-high') return (a.retailPrice || 0) - (b.retailPrice || 0);
    if (sortBy === 'high-low') return (b.retailPrice || 0) - (a.retailPrice || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Men's Collection</h1>
            <p className="text-xs text-gray-400 mt-1">
              Explore our latest exclusive collection for men ({sortedProducts.length} items available)
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#161920] border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Loading men's products...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            No products found in Men's collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const rawImage = product?.images?.[0] || product?.image;
              const productImage = rawImage 
                ? (rawImage.startsWith('http') ? rawImage : `http://localhost:5000/${rawImage}`)
                : 'https://via.placeholder.com/300';

              const isWishlisted = wishlist.includes(product._id);

              return (
                <div 
                  key={product._id} 
                  className="bg-[#161920] border border-gray-800/80 rounded-3xl overflow-hidden shadow-md hover:border-purple-500/50 transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image & Wishlist Button */}
                    <div className="relative h-52 overflow-hidden bg-gray-900">
                      <Link to={`/product/${product._id}`} className="block w-full h-full">
                        <img 
                          src={productImage} 
                          alt={product?.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      </Link>

                      {/* Wishlist Heart Icon */}
                      <button 
                        onClick={(e) => toggleWishlist(product._id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                          isWishlisted 
                            ? 'bg-purple-600 text-white shadow-lg' 
                            : 'bg-black/50 text-gray-300 hover:text-white'
                        }`}
                      >
                        <HiHeart size={16} />
                      </button>

                      {product?.stock <= 0 && (
                        <span className="absolute bottom-3 left-3 bg-red-600/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 space-y-2">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition">
                          {product?.name}
                        </h3>
                      </Link>

                      <p className="text-[11px] text-gray-400 line-clamp-2">
                        {product?.description}
                      </p>

                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-sm font-black text-white">৳{product?.retailPrice || 0}</span>
                        {product?.wholesalePrice && (
                          <span className="text-[11px] text-gray-500 line-through">৳{product.wholesalePrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Link 
                      to={`/product/${product._id}`}
                      className="py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <HiEye size={16} /> Details
                    </Link>
                    <button 
                      onClick={() => handleBuyClick(product)}
                      disabled={product?.stock <= 0}
                      className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        product?.stock > 0
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <HiShoppingBag size={16} /> Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}