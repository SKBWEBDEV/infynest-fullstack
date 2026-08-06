// File Path: src/pages/Products.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  HiSearch, 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiChevronDown,
  HiViewGrid,
  HiLogout,
  HiMenuAlt2,
  HiChevronLeft
} from 'react-icons/hi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStock, setSelectedStock] = useState('All Stock');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  // ব্যাকএন্ড থেকে প্রোডাক্ট ফেচ করার ফাংশন
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/v1/products');
      // আপনার ব্যাকএন্ড কন্ট্রোলারের রেসপন্স স্ট্রাকচার অনুযায়ী data.data ব্যবহার করা হয়েছে
      setProducts(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products from server');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // প্রোডাক্ট ডিলিট করার ফাংশন
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };
        await axios.delete(`http://localhost:5000/api/v1/products/${id}`, config);
        setProducts(products.filter((item) => item._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  // সার্চ এবং ফিল্টার লজিক
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    let matchesStock = true;
    const stockQty = Number(product.stock) || 0;
    if (selectedStock === 'Out of Stock') matchesStock = stockQty === 0;
    if (selectedStock === 'In Stock') matchesStock = stockQty > 10;
    if (selectedStock === 'Low Stock') matchesStock = stockQty > 0 && stockQty <= 10;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="flex h-screen bg-[#0f1115] text-gray-200 font-sans overflow-hidden">
      
      {/* 1. Left Sidebar */}
      <aside className={`bg-[#161920] border-r border-gray-800/60 flex flex-col py-6 justify-between z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64 px-6' : 'w-20 px-3'}`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                  <span className="text-white font-black text-sm">EB</span>
                </div>
                <span className="text-white font-black text-lg tracking-wide">EcoBazer</span>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-black text-sm">EB</span>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition cursor-pointer"
            >
              {isSidebarOpen ? <HiChevronLeft size={20} /> : <HiMenuAlt2 size={20} />}
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            <Link 
              to="/admin/dashboard" 
              className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition cursor-pointer"
            >
              <HiViewGrid size={22} className="flex-shrink-0" />
              {isSidebarOpen && <span className="text-xs">Dashboard</span>}
            </Link>

            <Link 
              to="/admin/products" 
              className="flex items-center gap-4 p-3 rounded-xl bg-purple-600/20 text-purple-400 font-semibold transition cursor-pointer"
            >
              <HiViewGrid size={22} className="flex-shrink-0" />
              {isSidebarOpen && <span className="text-xs">Products</span>}
            </Link>

            <Link 
              to="/admin/add-product" 
              className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition cursor-pointer"
            >
              <HiPlus size={22} className="flex-shrink-0 text-purple-400" />
              {isSidebarOpen && <span className="text-xs">Add Product</span>}
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              localStorage.removeItem('userInfo');
              navigate('/login');
            }} 
            className="flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/25 transition cursor-pointer"
          >
            <HiLogout size={22} className="flex-shrink-0" />
            {isSidebarOpen && <span className="text-xs">Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-gray-800/60 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-white">Products</h1>
            <p className="text-xs text-gray-400">Manage your EcoBazer product catalog.</p>
          </div>

          <Link 
            to="/admin/add-product"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <HiPlus size={18} /> Add Product
          </Link>
        </header>

        {/* Content Body */}
        <main className="p-8 space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <HiSearch size={18} />
              </span>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#161920] border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#161920] border border-gray-800 text-gray-300 px-4 py-2.5 pr-10 rounded-xl text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">Accessories</option>
              </select>
              <HiChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
            </div>

            <div className="relative">
              <select 
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="appearance-none bg-[#161920] border border-gray-800 text-gray-300 px-4 py-2.5 pr-10 rounded-xl text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option>All Stock</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <HiChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#161920] border border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-xs text-gray-400 mt-3 font-medium">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No products found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800/80 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Retail Price</th>
                      <th className="py-4 px-6">Wholesale Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40 text-xs">
                    {filteredProducts.map((product) => {
                      // ইমেজ পাথ হ্যান্ডেল করার জন্য (লোকাল আপলোড নাকি এক্সটার্নাল URL)
                      const imageUrl = product.images?.[0] 
                        ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`)
                        : 'https://via.placeholder.com/40';

                      const stockQty = Number(product.stock) || 0;

                      return (
                        <tr key={product._id} className="hover:bg-gray-800/20 transition">
                          <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                            <img 
                              src={imageUrl} 
                              alt={product.name} 
                              className="w-10 h-10 rounded-xl object-cover bg-gray-800 border border-gray-700" 
                            />
                            <span className="font-bold text-gray-200">{product.name}</span>
                          </td>
                          <td className="py-4 px-6 text-gray-400">{product.category}</td>
                          <td className="py-4 px-6 text-gray-300">BDT {product.retailPrice}</td>
                          <td className="py-4 px-6 text-gray-300">BDT {product.wholesalePrice}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span className={`w-2 h-2 rounded-full ${
                                stockQty === 0 
                                  ? 'bg-red-500' 
                                  : stockQty <= 10 
                                  ? 'bg-yellow-500' 
                                  : 'bg-emerald-500'
                              }`} />
                              <span className={
                                stockQty === 0 
                                  ? 'text-red-400' 
                                  : stockQty <= 10 
                                  ? 'text-yellow-400' 
                                  : 'text-emerald-400'
                              }>
                                {stockQty === 0 ? 'Out of Stock' : `${stockQty} • In Stock`}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition cursor-pointer"
                                title="Edit Product"
                              >
                                <HiPencil size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition cursor-pointer"
                                title="Delete Product"
                              >
                                <HiTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

    </div>
  );
}