'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface Slide {
  id: string;
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: 'amber' | 'rose' | 'emerald' | 'violet' | 'teal';
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  
  const themeColors = {
    amber: 'bg-amber-500 hover:bg-amber-600 text-white',
    rose: 'bg-rose-500 hover:bg-rose-600 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    violet: 'bg-violet-500 hover:bg-violet-600 text-white',
    teal: 'bg-teal-500 hover:bg-teal-600 text-white',
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[3rem] shadow-2xl h-[450px] md:h-[550px] lg:h-[650px] group">
      {/* Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-10 text-white pointer-events-none">
        <div className="max-w-2xl transform transition-all duration-700 pointer-events-auto">
          <h1 key={`title-${currentSlide.id}`} className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-lg animate-in slide-in-from-bottom-8 fade-in duration-700">
            {currentSlide.title}
          </h1>
          {currentSlide.description && (
            <p key={`desc-${currentSlide.id}`} className="text-lg md:text-2xl font-medium mb-8 text-slate-100 drop-shadow-md leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
              {currentSlide.description}
            </p>
          )}
          {currentSlide.ctaText && currentSlide.ctaLink && (
            <Link
              key={`cta-${currentSlide.id}`}
              href={currentSlide.ctaLink}
              className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 ${
                themeColors[currentSlide.theme || 'amber']
              }`}
            >
              {currentSlide.ctaText}
            </Link>
          )}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={nextSlide} // RTL next is left
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-20"
        aria-label="التالي"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={prevSlide} // RTL prev is right
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-20"
        aria-label="السابق"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 rtl:space-x-reverse z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`الذهاب للشريحة ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
