// File Path: src/pages/ProductDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiShoppingBag, HiArrowLeft, HiCheck, HiHeart, HiEye } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
  `${API_URL}/products/${id}`
);
        
        const productData = data.product || data.data || data;
        setProduct(productData);

        if (productData?.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        } else if (productData?.image) {
          setSelectedImage(productData.image);
        }

        if (productData?.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData?.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        const savedWishlist = JSON.parse(localStorage.getItem('shopbd_wishlist')) || [];
        setIsWishlisted(savedWishlist.includes(id));

        if (productData?.category) {
          const allProductsRes = await axios.get(
  `${API_URL}/products`
);
          const allList = Array.isArray(allProductsRes.data) 
            ? allProductsRes.data 
            : allProductsRes.data.products || allProductsRes.data.data || [];
          
          const filtered = allList.filter(
            item => item.category?.trim().toLowerCase() === productData.category.trim().toLowerCase() && item._id !== id
          );
          setRelatedProducts(filtered.slice(0, 5));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-xs text-gray-400 mt-3 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-lg font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg">
          Back to Shop
        </Link>
      </div>
    );
  }

  const getImageUrl = (img) => {
  if (!img) {
    return 'https://via.placeholder.com/400';
  }

  return img.startsWith('http')
    ? img
    : `${API_URL}/${img}`;
};

  const handleColorSelect = (color, index) => {
    setSelectedColor(color);
    if (product.images && product.images[index]) {
      setSelectedImage(product.images[index]);
    }
  };

  const toggleWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem('shopbd_wishlist')) || [];
    let updatedWishlist;
    if (isWishlisted) {
      updatedWishlist = savedWishlist.filter(item => item !== id);
      setIsWishlisted(false);
    } else {
      updatedWishlist = [...savedWishlist, id];
      setIsWishlisted(true);
    }
    localStorage.setItem('shopbd_wishlist', JSON.stringify(updatedWishlist));
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }

    const cartItem = {
      cartId: `${product._id}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`,
      productId: product._id,
      name: product.name,
      price: product.retailPrice || product.price || 0,
      image: selectedImage,
      size: selectedSize || 'N/A',
      color: selectedColor || 'N/A',
      quantity: quantity,
      stock: product.stock || 10
    };

    addToCart(cartItem);

    setSuccessMessage('Successfully added to cart!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#161920] border border-purple-500/60 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-2xl shadow-purple-600/30 backdrop-blur-md">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <HiCheck size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-purple-400">Cart Updated</span>
              <span className="text-xs text-gray-300 font-medium">{successMessage}</span>
            </div>
            <Link 
              to="/cart" 
              className="ml-4 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-bold rounded-xl transition border border-purple-500/30"
            >
              View Cart
            </Link>
          </div>
        )}

        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
        >
          <HiArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#161920] border border-gray-800/80 p-6 md:p-8 rounded-3xl shadow-xl">
          
          <div className="space-y-4">
            <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <img 
                src={getImageUrl(selectedImage)} 
                alt={product.name} 
                className="w-full h-full object-cover transition duration-300" 
              />
              
              <button 
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  isWishlisted 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                    : 'bg-black/50 text-gray-300 hover:text-white'
                }`}
              >
                <HiHeart size={18} />
              </button>

              {product.category && (
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-purple-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {product.category}
                </span>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedImage === img ? 'border-purple-500 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-black text-white">{product.name}</h1>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-purple-400">৳{product.retailPrice || product.price}</span>
                {product.wholesalePrice && (
                  <span className="text-sm text-gray-500 line-through">৳{product.wholesalePrice}</span>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed border-y border-gray-800/60 py-4">
                {product.description}
              </p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">Select Size:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedSize === size
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500'
                            : 'bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">Color/Pattern:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color, index)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedColor === color
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500'
                            : 'bg-[#0f1115] text-gray-400 border border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-medium pt-1">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800/60">
              <div className="flex items-center gap-4">
  <span className="text-xs font-bold text-gray-300">Quantity:</span>
  <div className="flex items-center bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
    <button 
      type="button"
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
      className="px-3 py-1.5 text-gray-400 hover:text-white transition cursor-pointer">
      -
    </button>
    <span className="px-4 text-xs font-bold text-white">{quantity}</span>
    <button 
      type="button"
      onClick={() => {
        const maxStock = Number(product?.stock) || 99; // স্টক না থাকলেও যেন অন্তত বাড়ানো যায়
        if (quantity < maxStock) {
          setQuantity(quantity + 1);
        }
      }}
      className="px-3 py-1.5 text-gray-400 hover:text-white transition cursor-pointer">
      +
    </button>
  </div>
</div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                  product.stock > 0 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <HiShoppingBag size={18} /> Add to Cart
              </button>
            </div>

          </div>

        </div>

        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-gray-800">
            <h2 className="text-lg font-black text-white">Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((item) => {
                const itemImg = item?.images?.[0] || item?.image;
                const formattedImg = getImageUrl(itemImg);

                return (
                  <Link 
                    key={item._id} 
                    to={`/product/${item._id}`}
                    className="bg-[#161920] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition duration-300 flex flex-col justify-between group p-3"
                  >
                    <div>
                      <div className="relative h-36 rounded-xl overflow-hidden bg-gray-900 mb-3">
                        <img 
                          src={formattedImg} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      </div>
                      <h3 className="font-bold text-white text-xs truncate group-hover:text-purple-400 transition">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-800/60">
                      <span className="text-xs font-black text-purple-400">৳{item.retailPrice || item.price}</span>
                      <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <HiEye size={12} /> View
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}