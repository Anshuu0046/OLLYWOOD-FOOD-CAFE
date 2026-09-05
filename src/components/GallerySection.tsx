import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/menuData';

export const GallerySection: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const showPrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
    }
  };

  const showNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % GALLERY_ITEMS.length);
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Visual Plates & Archives / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Culinary Archive
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              A documentary photographic inspection of our charcoal tandoor fires, earthen handis, and dining quarters.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">06</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Plates</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GALLERY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              id={`gallery-item-${item.id}`}
              onClick={() => openLightbox(index)}
              className="group cursor-pointer border border-[#1A1A1A] p-2 bg-[#FDFCFB] hover:bg-[#E8E6E1]/30 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-[#E8E6E1]">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-[#1A1A1A]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="w-8 h-8 border border-white bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-3 pb-1 px-1 flex items-center justify-between font-mono text-[10px]">
                <span className="truncate pr-2 font-serif italic text-[#1A1A1A] font-bold">
                  {item.title}
                </span>
                <span className="opacity-50 shrink-0">
                  FIG. 0{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          id="gallery-lightbox"
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            id="close-lightbox-btn"
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 border border-white/40 text-white hover:bg-white hover:text-[#1A1A1A] transition-colors z-10 font-mono text-xs uppercase"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Controls */}
          <button
            id="lightbox-prev-btn"
            onClick={showPrevPhoto}
            className="absolute left-4 sm:left-8 p-3 border border-white/30 text-white hover:bg-white hover:text-[#1A1A1A] transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            id="lightbox-next-btn"
            onClick={showNextPhoto}
            className="absolute right-4 sm:right-8 p-3 border border-white/30 text-white hover:bg-white hover:text-[#1A1A1A] transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image & Caption Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center border border-white/20 p-4 bg-[#1A1A1A]"
          >
            <img
              src={GALLERY_ITEMS[selectedPhotoIndex].image}
              alt={GALLERY_ITEMS[selectedPhotoIndex].alt}
              className="max-w-full max-h-[70vh] object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 block">
                PLATE {selectedPhotoIndex + 1} OF {GALLERY_ITEMS.length}
              </span>
              <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#FDFCFB] mt-1">
                {GALLERY_ITEMS[selectedPhotoIndex].title}
              </h3>
              <p className="text-xs text-[#D1CFCA] mt-0.5 max-w-md">
                {GALLERY_ITEMS[selectedPhotoIndex].alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
