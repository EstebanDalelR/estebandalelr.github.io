'use client';
import { useState } from 'react';
import Image from "next/image";
import author from "../public/estebandalelr.jpg";

export default function IndexPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const turnPage = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      if (direction === 'next' && currentPage < 2) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-8"
         style={{
           background: 'radial-gradient(circle at center, #3a2f2f 0%, #1a1410 100%)',
         }}>

      {/* Book Container */}
      <div className="relative" style={{
        width: '800px',
        height: '600px',
        perspective: '2000px',
      }}>

        {/* Book Cover/Spine Shadow */}
        <div className="absolute inset-0 rounded-lg shadow-2xl"
             style={{
               background: 'linear-gradient(to right, #4a3425 0%, #5c4033 5%, #6d4c3a 50%, #5c4033 95%, #4a3425 100%)',
               boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
             }}>
        </div>

        {/* Left Page Decoration (binding shadow) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/30 to-transparent pointer-events-none z-10 rounded-l-lg"></div>

        {/* Right Page Decoration (binding shadow) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/30 to-transparent pointer-events-none z-10 rounded-r-lg"></div>

        {/* Book Pages Container */}
        <div className="absolute inset-0 flex">

          {/* Left Page */}
          <div className="w-1/2 p-12 flex flex-col justify-between relative"
               style={{
                 background: 'linear-gradient(to right, #f4e8d0 0%, #faf6ed 100%)',
                 borderRight: '2px solid #d4c4a8',
                 boxShadow: 'inset -20px 0 30px -20px rgba(0,0,0,0.2)',
                 borderTopLeftRadius: '8px',
                 borderBottomLeftRadius: '8px',
               }}>

            <div className={`transition-opacity duration-1000 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {currentPage === 0 && (
                <div className="h-full flex flex-col justify-center items-center space-y-6">
                  <div className="text-center space-y-3">
                    <div className="text-sm tracking-widest text-amber-900/60 font-serif">A MEMOIR</div>
                    <h1 className="text-5xl font-serif text-amber-950" style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: 'Georgia, serif'
                    }}>
                      Life Stories
                    </h1>
                    <div className="w-24 h-px bg-amber-900/40 mx-auto mt-4"></div>
                  </div>
                </div>
              )}

              {currentPage === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-amber-950 border-b border-amber-900/30 pb-2">Chapter I</h2>
                  <div className="text-amber-950/90 leading-relaxed font-serif space-y-4" style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}>
                    <p className="first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-amber-900">
                      I was born in the vibrant city of Miami, where the sun kissed the ocean and the air was thick with humidity and promise.
                    </p>
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-amber-950 border-b border-amber-900/30 pb-2">Links</h2>
                  <div className="space-y-3 font-serif">
                    <a href="https://twitter.com/EstebanDalelR" className="block text-amber-900 hover:text-amber-700 transition-colors duration-500">Twitter</a>
                    <a href="https://github.com/estebandalelr/" className="block text-amber-900 hover:text-amber-700 transition-colors duration-500">GitHub</a>
                    <a href="https://www.linkedin.com/in/estebandalelr/" className="block text-amber-900 hover:text-amber-700 transition-colors duration-500">LinkedIn</a>
                  </div>
                </div>
              )}
            </div>

            {/* Page number */}
            <div className="text-center text-amber-900/50 text-sm font-serif mt-4">
              {currentPage * 2 || ''}
            </div>
          </div>

          {/* Right Page */}
          <div className="w-1/2 p-12 flex flex-col justify-between relative"
               style={{
                 background: 'linear-gradient(to left, #f4e8d0 0%, #faf6ed 100%)',
                 boxShadow: 'inset 20px 0 30px -20px rgba(0,0,0,0.2)',
                 borderTopRightRadius: '8px',
                 borderBottomRightRadius: '8px',
               }}>

            <div className={`transition-opacity duration-1000 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {currentPage === 0 && (
                <div className="h-full flex flex-col justify-center items-center">
                  <Image
                    className="rounded-full shadow-lg border-4 border-amber-900/20"
                    placeholder="blur"
                    alt="picture of esteban"
                    width={180}
                    height={180}
                    priority
                    src={author}
                  />
                  <h3 className="text-3xl font-serif text-amber-950 mt-6" style={{
                    fontFamily: 'Georgia, serif'
                  }}>
                    Esteban Dalel R
                  </h3>
                  <p className="text-amber-900/70 italic mt-2 font-serif">Author & Developer</p>
                </div>
              )}

              {currentPage === 1 && (
                <div className="space-y-4">
                  <div className="text-amber-950/90 leading-relaxed font-serif space-y-4" style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}>
                    <p>
                      The palm trees swayed in the tropical breeze, and the sounds of Spanish and English mingled in the streets.
                    </p>
                    <p>
                      But my story truly began when I grew up in Ireland, where emerald hills replaced sandy beaches, and rain became my constant companion.
                    </p>
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3 font-serif">
                    <a href="https://www.youtube.com/@estebandalelr" className="block text-amber-900 hover:text-amber-700 transition-colors duration-500">YouTube</a>
                    <a href="https://blog.estebandalelr.co" className="block text-amber-900 hover:text-amber-700 transition-colors duration-500">Blog</a>
                  </div>
                  <div className="mt-8 text-amber-900/60 italic text-sm font-serif">
                    "I make good software and tell bad jokes"
                  </div>
                </div>
              )}
            </div>

            {/* Page number */}
            <div className="text-center text-amber-900/50 text-sm font-serif mt-4">
              {currentPage * 2 + 1}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => turnPage('prev')}
          disabled={currentPage === 0 || isAnimating}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-900/20 hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center text-amber-950"
          style={{ zIndex: 20 }}
        >
          ←
        </button>

        <button
          onClick={() => turnPage('next')}
          disabled={currentPage === 2 || isAnimating}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-900/20 hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center text-amber-950"
          style={{ zIndex: 20 }}
        >
          →
        </button>
      </div>
    </div>
  );
}
