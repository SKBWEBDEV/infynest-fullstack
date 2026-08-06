import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function SaleProducts() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const saleProducts = [
    { 
      id: 1, 
      name: 'Luxury Formal Blazer', 
      price: '৳5,500', 
      oldPrice: '৳7,500', 
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1490114838077-c335452d663e?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 2, 
      name: 'Classic Casual Chinos', 
      price: '৳1,650', 
      oldPrice: '৳2,200', 
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 3, 
      name: 'Designer Party Wear Kurti', 
      price: '৳2,100', 
      oldPrice: '৳2,900', 
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 4, 
      name: 'Comfy Cotton Hoodies', 
      price: '৳1,950', 
      oldPrice: '৳2,600', 
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 1, 
      name: 'Luxury Formal Blazer', 
      price: '৳5,500', 
      oldPrice: '৳7,500', 
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1490114838077-c335452d663e?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 2, 
      name: 'Classic Casual Chinos', 
      price: '৳1,650', 
      oldPrice: '৳2,200', 
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 3, 
      name: 'Designer Party Wear Kurti', 
      price: '৳2,100', 
      oldPrice: '৳2,900', 
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80'
    },
    { 
      id: 4, 
      name: 'Comfy Cotton Hoodies', 
      price: '৳1,950', 
      oldPrice: '৳2,600', 
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=80'
    },
  ];

  // ইনফিনিট লুপের জন্য ডেটা ৩ বার ট্রিপল করা হয়েছে
  const infiniteProducts = [...saleProducts, ...saleProducts, ...saleProducts];

  // কম্পোনেন্ট লোড হওয়ার পর মাঝের সেকশনে পজিশন সেট করা
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      const cardWidth = 320 + 24; // কার্ডের উইডথ + গ্যাপ (space-x-6 = 24px)
      container.scrollLeft = cardWidth * saleProducts.length;
    }
  }, [saleProducts.length]);

  // অটো স্লাইডিং ইফেক্ট (ডান থেকে বামে চলার জন্য মাইনাস ভ্যালু দেওয়া হয়েছে)
  useEffect(() => {
    if (isPaused) return;
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const cardWidth = 320 + 24;
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, saleProducts.length]);

  // নিরবচ্ছিন্ন ইনফিনিট স্ক্রল লুপ হ্যান্ডলার
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 320 + 24;
    const singleSetWidth = cardWidth * saleProducts.length;

    if (container.scrollLeft >= singleSetWidth * 2) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= singleSetWidth;
      container.style.scrollBehavior = 'smooth';
    } else if (container.scrollLeft <= 0) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft += singleSetWidth;
      container.style.scrollBehavior = 'smooth';
    }
  };

  const handlePrev = () => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24;
      scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24;
      scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-12 bg-white overflow-hidden">
      {/* হেডার অংশ এবং নেভিগেশন বাটন */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Special Sale & Offers</h2>
          <p className="text-gray-500 mt-1 text-sm">Grab your favorite items at discounted prices</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button 
              onClick={handlePrev}
              className="p-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition shadow-sm cursor-pointer"
              aria-label="Previous Slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="p-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition shadow-sm cursor-pointer"
              aria-label="Next Slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <Link to="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            View All &rarr;
          </Link>
        </div>
      </div>

      {/* ফুল উইডথ ইনফিনিট স্লাইডার কন্টেইনার */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex space-x-6 overflow-x-auto px-4 sm:px-8 py-4 scroll-smooth no-scrollbar w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {infiniteProducts.map((product, index) => (
          <div 
            key={`${product.id}-${index}`} 
            className="group flex-none w-[280px] sm:w-[320px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
          >
            {/* ইমেজ কন্টেইনার (SALE ব্যাজ ও হোভার অল্টারনেট ইমেজ সহ) */}
            <div className="relative h-72 overflow-hidden bg-gray-100">
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded z-20">SALE</span>
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-in-out group-hover:opacity-0 z-10"
              />
              <img 
                src={product.hoverImage} 
                alt={`${product.name} alternate view`} 
                className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105 z-10"
              />
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-lg font-bold text-gray-900">{product.price}</p>
                  <p className="text-sm text-gray-400 line-through">{product.oldPrice}</p>
                </div>
              </div>
              <button 
                onClick={() => alert(`Added ${product.name} to cart!`)}
                className="mt-4 w-full bg-gray-900 text-white py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-600 transition cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}