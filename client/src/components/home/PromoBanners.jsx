import React from 'react';

export default function PromoBanners() {
  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&auto=format&fit=crop&q=80", // Women's Salwar Kameez
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1400&auto=format&fit=crop&q=80", // Men's Panjabi & Pajama /
    }
  ];

  return (
    <section className="w-full py-8 bg-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="relative group overflow-hidden rounded-2xl shadow-md h-[1300px] bg-gray-100 w-full"
            >
              {/* ১৩০০ পিক্সেল হাইট এবং মুখের অংশ সঠিক রাখতে object-top ব্যবহার করা হয়েছে */}
              <img 
                src={banner.image} 
                alt="Fashion Model" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}