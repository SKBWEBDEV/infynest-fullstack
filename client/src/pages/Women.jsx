import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import { HiShoppingBag, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Women() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWomenProducts = async () => {
      try {
        const { data } = await API.get('/products');

        const productList = Array.isArray(data)
          ? data
          : data.data || data.products || [];

        const womenProducts = productList.filter(
          (product) =>
            product?.category?.trim().toLowerCase() === 'women'
        );

        setProducts(womenProducts);
      } catch (error) {
        console.error('Error fetching women products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWomenProducts();
  }, []);

  const handleBuyClick = (product) => {
    const userInfo = localStorage.getItem('userInfo');

    if (!userInfo) {
      toast.error('প্রথমে লগইন করুন!', {
        style: {
          background: '#161920',
          color: '#fff',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          fontSize: '12px',
        },
      });

      navigate('/login');
      return;
    }

    toast(
      'আগে Details-এ যান, সেখান থেকে Size ও Color সিলেক্ট করে Add to Cart করুন!',
      {
        icon: '🛍️',
        style: {
          background: '#161920',
          color: '#fff',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          fontSize: '12px',
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-black text-white">Women's Collection</h1>
          <p className="text-xs text-gray-400 mt-1">Explore our latest exclusive collection for women.</p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Loading women's products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            No products found in Women's collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              // ইমেজ লিংক ইউআরএল নাকি লোকাল ফাইল তা হ্যান্ডেল করা হচ্ছে
              const rawImage = product?.images?.[0] || product?.image;
              const productImage = getImageUrl(rawImage);

              return (
                <div 
                  key={product._id} 
                  className="bg-[#161920] border border-gray-800/80 rounded-3xl overflow-hidden shadow-md hover:border-purple-500/50 transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-900">
                      <img 
                        src={productImage} 
                        alt={product?.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition">
                        {product?.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2">
                        {product?.description}
                      </p>

                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-sm font-black text-white">৳{product?.retailPrice || 0}</span>
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
                      className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer"
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