import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function TrendingProducts() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const trendingProducts = [
    { 
      id: 1, 
      name: 'Premium Cotton Slim Fit Shirt', 
      price: '৳1,850', 
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 2, 
      name: 'Festive Designer Panjabi', 
      price: '৳3,200', 
      image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 3, 
      name: 'Casual Summer Polo Shirt', 
      price: '৳1,250', 
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 4, 
      name: 'Modern Stylish Jacket', 
      price: '৳4,500', 
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 5, 
      name: 'Classic Formal Trouser', 
      price: '৳1,950', 
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1490114838077-c335452d663e?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 6, 
      name: 'Luxury Summer Panjabi', 
      price: '৳3,500', 
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 1, 
      name: 'Premium Cotton Slim Fit Shirt', 
      price: '৳1,850', 
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 2, 
      name: 'Festive Designer Panjabi', 
      price: '৳3,200', 
      image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 3, 
      name: 'Casual Summer Polo Shirt', 
      price: '৳1,250', 
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 4, 
      name: 'Modern Stylish Jacket', 
      price: '৳4,500', 
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 5, 
      name: 'Classic Formal Trouser', 
      price: '৳1,950', 
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1490114838077-c335452d663e?w=500&auto=format&fit=crop&q=80' 
    },
    { 
      id: 6, 
      name: 'Luxury Summer Panjabi', 
      price: '৳3,500', 
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&auto=format&fit=crop&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=80' 
    },
  ];

  // নিখুঁত ইনফিনিট লুপ তৈরির জন্য ডেটা ৩ বার ট্রিপল করা হয়েছে
  const infiniteProducts = [...trendingProducts, ...trendingProducts, ...trendingProducts];

  // কম্পোনেন্ট লোড হওয়ার সাথে সাথে মাঝের সেকশনে পজিশন সেট করা
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      const singleSetWidth = container.scrollWidth / 3;
      container.scrollLeft = singleSetWidth;
    }
  }, []);

  // অটো স্লাইডিং ইফেক্ট
  useEffect(() => {
    if (isPaused) return;
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // নিরবচ্ছিন্ন ইনফিনিট স্ক্রল হ্যান্ডলার (লুপ বজায় রাখার জন্য)
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 3;

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
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className=" py-12 bg-white overflow-hidden">
      {/* হেডার অংশ এবং নেভিগেশন বাটন */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Trending Products</h2>
          <p className="text-gray-500 mt-1 text-sm">Infinite circular loop with smooth navigation controls</p>
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

      {/* ইনফিনিট স্লাইডার কন্টেইনার */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex space-x-6 overflow-x-auto px-4 sm:px-8 py-4 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {infiniteProducts.map((product, index) => (
          <div 
            key={`${product.id}-${index}`} 
            className="group flex-none w-[280px] sm:w-[320px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
          >
            {/* ইমেজ কন্টেইনার (হোভার অল্টারনেট স্টাইল সহ) */}
            <div className="relative h-72 overflow-hidden bg-gray-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-in-out group-hover:opacity-0"
              />
              <img 
                src={product.hoverImage} 
                alt={`${product.name} alternate view`} 
                className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
              />
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
                <p className="text-lg font-bold text-gray-900 mt-2">{product.price}</p>
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