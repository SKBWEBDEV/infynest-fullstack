import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HeroSlider() {
  const slides = [
    {
      id: 1,
      title: "Elegance In Every Single Thread.",
      subtitle: "New Arrival 2026",
      description: "Explore our latest premium collection designed for your absolute comfort and style.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
      link: "/shop"
    },
    {
      id: 2,
      title: "Festive Elegance & Tradition.",
      subtitle: "Exclusive Panjabi Collection",
      description: "Discover handcrafted ethnic wear tailored perfectly for your special occasions.",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1600&auto=format&fit=crop&q=80",
      link: "/shop"
    },
    {
      id: 3,
      title: "Modern Trends For Summer.",
      subtitle: "Casual & Smart Wear",
      description: "Upgrade your everyday wardrobe with breathable fabrics and trendy styles.",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=crop&q=80",
      link: "/shop"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden h-[500px] md:h-[600px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover opacity-40 transform scale-105 transition-transform duration-1000"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-start justify-center">
            <span className="text-indigo-400 font-semibold tracking-widest uppercase text-sm mb-3">
              {slide.subtitle}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight">
              {slide.title}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-xl">
              {slide.description}
            </p>
            <div className="mt-8">
              <Link 
                to={slide.link} 
                className="bg-white text-gray-900 px-8 py-3.5 font-medium hover:bg-gray-100 transition shadow-lg inline-block"
              >
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-indigo-500 w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}