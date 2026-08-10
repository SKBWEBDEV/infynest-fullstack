import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import heroImage from "../../assets/banner-one.png";
import heroImageTwo from "../../assets/banner-two.png";
import heroImageThree from "../../assets/banner-three.png";

export default function HeroSlider() {
  const slides = [
    {
      id: 1,
      title: "Elegance In Every Single Thread.",
      subtitle: "New Arrival 2026",
      description:
        "Explore our latest premium collection designed for your absolute comfort and style.",
      image: heroImage,
      link: "/shop",
    },
    {
      id: 2,
      title: "Elegance In Every Single Thread.",
      subtitle: "New Arrival 2026",
      description:
        "Explore our latest premium collection designed for your absolute comfort and style.",
      image: heroImageTwo,
      link: "/shop",
    },
    {
      id: 3,
      title: "Elegance In Every Single Thread.",
      subtitle: "New Arrival 2026",
      description:
        "Explore our latest premium collection designed for your absolute comfort and style.",
      image: heroImageThree,
      link: "/shop",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[520px] sm:h-[560px] md:h-[620px] overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* =========================================
              BACKGROUND IMAGE
          ========================================= */}

          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* =========================================
              DARK OVERLAY
          ========================================= */}

          <div className="absolute inset-0 bg-black/0" />

          {/* =========================================
              EXTRA GRADIENT
          ========================================= */}

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

          {/* =========================================
              MOBILE BOTTOM GRADIENT
          ========================================= */}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent md:hidden" />

          {/* =========================================
              CONTENT
          ========================================= */}

          <div className="relative z-10 h-full flex items-center">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
              <div className="max-w-2xl">
                {/* SUBTITLE */}

                <div className="inline-flex items-center mb-4 sm:mb-5">
                  <span className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-lg shadow-indigo-900/30">
                    {slide.subtitle}
                  </span>
                </div>

                {/* TITLE */}

                <h1 className="text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
                  {slide.title}
                </h1>

                {/* DESCRIPTION */}

                <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/90 font-medium drop-shadow-lg">
                  {slide.description}
                </p>

                {/* BUTTON */}

                <div className="mt-6 sm:mt-8">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Shop Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* =========================================
          SLIDER DOTS
      ========================================= */}

      <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-indigo-500"
                : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
