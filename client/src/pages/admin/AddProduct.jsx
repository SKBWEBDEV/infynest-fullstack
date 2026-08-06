// File Path: src/pages/AddProduct.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minWholesaleQty, setMinWholesaleQty] = useState('10');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Men');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState('');
  const [imageInputType, setImageInputType] = useState('file'); 
  
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('description', description);
      data.append('retailPrice', retailPrice);
      data.append('wholesalePrice', wholesalePrice);
      data.append('minWholesaleQty', minWholesaleQty);
      data.append('category', category);
      data.append('stock', stock);
      data.append('isFeatured', isFeatured);

      const sizesArray = sizes ? sizes.split(',').map(s => s.trim().toUpperCase()) : [];
      const colorsArray = colors ? colors.split(',').map(c => c.trim()) : [];
      const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
      
      data.append('sizes', JSON.stringify(sizesArray));
      data.append('colors', JSON.stringify(colorsArray));
      data.append('tags', JSON.stringify(tagsArray));

      if (imageInputType === 'url' && imageUrls) {
        const urlsArray = imageUrls.split(',').map(u => u.trim());
        data.append('imageUrls', JSON.stringify(urlsArray));
      } 
      else if (imageInputType === 'file' && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          data.append('images', images[i]);
        }
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post('http://localhost:5000/api/v1/products', data, config);
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-[#161920] border border-gray-800 p-8 rounded-3xl shadow-xl">
        <h2 className="text-xl font-black text-white mb-6">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Product Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
              placeholder="e.g. Premium Cotton Shirt" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Retail Price (৳)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={retailPrice} 
                onChange={(e) => setRetailPrice(e.target.value)} 
                required 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="1200" 
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Wholesale Price (৳)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={wholesalePrice} 
                onChange={(e) => setWholesalePrice(e.target.value)} 
                required 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="950" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Min Wholesale Qty</label>
              <input 
                type="number" 
                value={minWholesaleQty} 
                onChange={(e) => setMinWholesaleQty(e.target.value)} 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Stock Qty</label>
              <input 
                type="text"
                inputMode="numeric" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                required 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="50" 
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Sizes (Comma separated)</label>
              <input 
                type="text" 
                value={sizes} 
                onChange={(e) => setSizes(e.target.value)} 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="S, M, L, XL" 
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Colors (Comma separated)</label>
              <input 
                type="text" 
                value={colors} 
                onChange={(e) => setColors(e.target.value)} 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="Red, Blue, Black" 
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Related Tags / Keywords</label>
              <input 
                type="text" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500" 
                placeholder="shirt, cotton, casual" 
              />
            </div>
          </div>

          <div className="space-y-2 bg-[#1e222d] p-4 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center">
              <label className="text-gray-300 font-semibold">Product Images Input Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageInputType('file')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${imageInputType === 'file' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType('url')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${imageInputType === 'url' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Image URL(s)
                </button>
              </div>
            </div>

            {imageInputType === 'file' ? (
              <div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full p-2 bg-[#161920] border border-gray-800 rounded-xl text-white text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer mt-1" 
                />
                {images.length > 0 && (
                  <p className="text-[11px] text-purple-400 mt-1 font-medium">
                    {images.length} file(s) selected
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="Paste image URLs separated by comma (e.g. https://img1.jpg, https://img2.jpg)" 
                  className="w-full p-3 bg-[#161920] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 mt-1"
                />
                <p className="text-[10px] text-gray-400 mt-1">You can add multiple image links separated by commas.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Description</label>
            <textarea 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              className="w-full p-3 bg-[#1e222d] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isFeatured" 
              checked={isFeatured} 
              onChange={(e) => setIsFeatured(e.target.checked)} 
              className="w-4 h-4 accent-purple-600 cursor-pointer" 
            />
            <label htmlFor="isFeatured" className="text-gray-300 font-semibold cursor-pointer">Mark as Featured Product</label>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition cursor-pointer mt-4"
          >
            {loading ? 'Publishing...' : 'Publish Product'}
          </button>
        </form>
      </div>
    </div>
  );
}