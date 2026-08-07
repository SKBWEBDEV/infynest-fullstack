// File Path: src/pages/Cart.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../services/api';
import toast from 'react-hot-toast';
import { HiTrash, HiShoppingBag, HiArrowLeft, HiCheck, HiPlus, HiMinus } from 'react-icons/hi';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); 
  
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) setName(user.name);
        if (user.phone) setPhone(user.phone);
        if (user.address) setAddress(user.address);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleQuantityChange = (cartId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty > 0 && newQty <= (maxStock || 10)) {
      updateQuantity(cartId, newQty);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 0 ? 100 : 0; 
  const totalAmount = subtotal + deliveryCharge;

const handlePlaceOrder = async (e) => {
  e.preventDefault();

  if (!name || !phone || !address) {
    toast.error('Please fill in all delivery details!');
    return;
  }

  if (cart.length === 0) {
    toast.error('Your cart is empty.');
    return;
  }

  if (
    (paymentMethod === 'bKash' || paymentMethod === 'Nagad') &&
    (!senderNumber || !transactionId)
  ) {
    toast.error(
      `Please provide your ${paymentMethod} Number and Transaction ID!`
    );
    return;
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo?.token) {
    toast.error('Please login first to place an order!');
    navigate('/login');
    return;
  }

  const orderData = {
    customerName: name,
    phone: phone,
    shippingAddress: address,

    orderItems: cart.map((item) => ({
      product: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),

    totalAmount,
    shippingFee: deliveryCharge,
    paymentMethod,

    senderNumber:
      paymentMethod !== 'Cash on Delivery' ? senderNumber : '',

    transactionId:
      paymentMethod !== 'Cash on Delivery' ? transactionId : '',
  };

  try {
    setLoading(true);

    const response = await API.post('/orders', orderData);

    if (response.data) {
      toast.success('Order placed successfully!');
      setOrderSuccess(true);
      clearCart();
    }
  } catch (error) {
    console.error('Order placement error:', error);

    toast.error(
      error.response?.data?.message ||
        'Failed to place order. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-center px-6 text-gray-200">
        <div className="w-16 h-16 bg-purple-600/20 border border-purple-500 rounded-full flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-600/30">
          <HiCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Order Placed Successfully!</h2>
        <p className="text-xs text-gray-400 max-w-sm mb-6">Thank you for your purchase. We have received your order and will contact you soon for confirmation.</p>
        <Link to="/shop" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
          >
            <HiArrowLeft size={16} /> Back
          </button>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <HiShoppingBag className="text-purple-400" /> Shopping Cart ({cart.length})
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-sm text-gray-400">Your cart is currently empty.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.cartId} 
                  className="bg-[#161920] border border-gray-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img 
  src={getImageUrl(item.image)}
  alt={item.name}
  className="w-20 h-20 object-cover rounded-xl bg-gray-900 border border-gray-800 shrink-0"/>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-purple-400 font-bold">৳{item.price}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        {item.size && item.size !== 'N/A' && <span>Size: <strong className="text-gray-200">{item.size}</strong></span>}
                        {item.color && item.color !== 'N/A' && <span>Color: <strong className="text-gray-200">{item.color}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => handleQuantityChange(item.cartId, item.quantity, -1, item.stock)}
                        className="px-2.5 py-1.5 text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        <HiMinus size={12} />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.cartId, item.quantity, 1, item.stock)}
                        className="px-2.5 py-1.5 text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        <HiPlus size={12} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                      title="Remove item"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#161920] border border-gray-800/80 p-6 rounded-3xl space-y-6 h-fit shadow-xl">
              <h2 className="text-base font-black text-white border-b border-gray-800 pb-3">Order Summary</h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charge</span>
                  <span className="text-white font-bold">৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-purple-400 pt-2 border-t border-gray-800">
                  <span>Total</span>
                  <span>৳{totalAmount}</span>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-300">Shipping Details</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="01XXXXXXXXX" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Delivery Address</label>
                  <textarea 
                    rows="2"
                    placeholder="House, Area, City" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-gray-400">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center text-center transition cursor-pointer ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md'
                          : 'bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span>Cash on Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                        paymentMethod === 'bKash'
                          ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-md'
                          : 'bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-pink-400">bKash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                        paymentMethod === 'Nagad'
                          ? 'bg-orange-600/20 border-orange-500 text-orange-300 shadow-md'
                          : 'bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-orange-400">Nagad</span>
                    </button>
                  </div>
                </div>

                {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                  <div className="space-y-3 p-3.5 bg-[#0f1115] border border-gray-800 rounded-2xl">
                    <p className="text-[11px] text-purple-400 font-bold leading-relaxed">
                      Please Send Money (৳{totalAmount}) to our {paymentMethod} Personal Number: <strong className="text-white">01711223344</strong> and fill up below:
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400">Your {paymentMethod} Number</label>
                      <input 
                        type="tel" 
                        placeholder="01XXXXXXXXX" 
                        value={senderNumber} 
                        onChange={(e) => setSenderNumber(e.target.value)}
                        required
                        className="w-full bg-[#161920] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400">Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 9H7K3L2M" 
                        value={transactionId} 
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                        className="w-full bg-[#161920] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition cursor-pointer mt-3"
                >
                  {loading ? 'Processing Order...' : `Place Order (${paymentMethod})`}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}