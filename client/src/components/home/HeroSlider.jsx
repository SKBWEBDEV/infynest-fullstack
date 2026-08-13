import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import heroImage from "../../assets/banner-one.webp";
import heroImageTwo from "../../assets/banner-two.webp";
import heroImageThree from "../../assets/banner-three.webp";

const slides = [
  {
    id: 1,
    image: heroImage,
    link: "/shop",
  },
  {
    id: 2,
    image: heroImageTwo,
    link: "/shop",
  },
  {
    id: 3,
    image: heroImageThree,
    link: "/shop",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // ==========================================
  // AUTO SLIDE
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // GO TO SLIDE
  // ==========================================
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="
        relative
        w-full
        h-[220px]
        sm:h-[320px]
        md:h-[450px]
        lg:h-[560px]
        xl:h-[620px]
        overflow-hidden
        bg-black
      "
      aria-label="INFYNEST promotional banners"
    >
      {/* ========================================
          SLIDES
      ======================================== */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;

        return (
          <div
            key={slide.id}
            className={`
              absolute
              inset-0
              transition-opacity
              duration-1000
              ease-in-out
              ${
                isActive
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }
            `}
          >
            {/* ====================================
                HERO IMAGE
            ==================================== */}
            <img
              src={slide.image}
              alt={`INFYNEST banner ${index + 1}`}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
                object-center
                select-none
              "
              draggable="false"
            />

            {/* ====================================
                DARK OVERLAY
            ==================================== */}
            <div
              className="
                absolute
                inset-0
                bg-black/20
              "
            />

            {/* ====================================
                LEFT GRADIENT
            ==================================== */}
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/65
                via-black/25
                to-transparent
              "
            />

            {/* ====================================
                MOBILE BOTTOM GRADIENT
            ==================================== */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-1/2
                bg-gradient-to-t
                from-black/55
                to-transparent
                md:hidden
              "
            />

            {/* ====================================
                CONTENT CONTAINER
            ==================================== */}

            <div
  className="
    relative
    z-20
    h-full
    max-w-7xl
    mx-auto
    px-5
    sm:px-8
    md:px-10
    lg:px-12
    xl:px-16
    flex
    items-center
  "
>
  <Link
    to={slide.link}
    className="
      inline-flex
      items-center
      justify-center

      px-4
      py-2
      sm:px-5
      sm:py-2.5
      md:px-6
      md:py-3
      lg:px-7
      lg:py-3.5

      rounded-lg
      md:rounded-xl

      bg-indigo-600
      hover:bg-indigo-700

      text-white
      text-[10px]
      sm:text-xs
      md:text-sm
      font-semibold

      shadow-lg
      shadow-indigo-900/30

      transition-all
      duration-200

      hover:scale-[1.02]
      active:scale-95

      whitespace-nowrap

      focus:outline-none
      focus:ring-2
      focus:ring-indigo-400

      translate-y-8
      sm:translate-y-10
      md:translate-y-12
      lg:translate-y-14
    "
  >
    Shop Collection
  </Link>
</div>
            
          </div>
        );
      })}

      {/* ========================================
          SLIDER DOTS
      ======================================== */}
      <div
        className="
          absolute
          bottom-4
          sm:bottom-6
          md:bottom-7
          left-1/2
          -translate-x-1/2
          z-30
          flex
          items-center
          gap-1.5
          sm:gap-2
        "
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isActive ? "true" : "false"}
              className={`
                h-2
                sm:h-2.5
                rounded-full
                transition-all
                duration-300
                focus:outline-none
                focus:ring-2
                focus:ring-white/70
                ${
                  isActive
                    ? "w-6 sm:w-8 bg-indigo-500"
                    : "w-2 sm:w-2.5 bg-white/60 hover:bg-white"
                }
              `}
            />
          );
        })}
      </div>
    </section>
  );
}