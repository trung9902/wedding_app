'use client';

import React from 'react';

/**
 * A. Hoa Văn Phân Cách Hoàng Gia (Baroque Gold Divider)
 */
export function BaroqueDivider({ className = "w-48 sm:w-64 h-6 mx-auto text-[#C5A059]" }) {
  return (
    <svg viewBox="0 0 240 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 12H90M150 12H230" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
      <circle cx="98" cy="12" r="2.5" fill="currentColor" />
      <circle cx="142" cy="12" r="2.5" fill="currentColor" />
      <path d="M120 3C114 8 108 12 120 21C132 12 126 8 120 3Z" fill="currentColor" />
      <path d="M110 12C106 8 100 9 96 12C100 15 106 16 110 12Z" fill="currentColor" fillOpacity="0.75"/>
      <path d="M130 12C134 8 140 9 144 12C140 15 134 16 130 12Z" fill="currentColor" fillOpacity="0.75"/>
      <circle cx="120" cy="12" r="1.5" fill="#FAF5E8" />
    </svg>
  );
}

/**
 * B. Góc Hoa Văn Cổ Điển (Corner Filigree Flourish)
 */
export function CornerFlourish({ position = "top-left", className = "w-8 h-8 text-[#C5A059]" }) {
  const rotateClass = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position] || "";

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${rotateClass}`}>
      <path d="M3 37V12C3 7.02944 7.02944 3 12 3H37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 37V14C7 10.134 10.134 7 14 7H37" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
      <path d="M18 3C15 7 15 11 18 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M3 18C7 15 11 15 15 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M8 8L16 16" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4"/>
    </svg>
  );
}

/**
 * C. Con Dấu Sáp Hoàng Gia (Royal Monogram Wax Seal)
 */
export function RoyalWaxSeal({ initials = "M & Q", onClick, isPulsing = true, size = "large" }) {
  const sizeClasses = size === "large" 
    ? "w-24 h-24 sm:w-28 sm:h-28" 
    : "w-16 h-16 sm:w-20 sm:h-20";

  const fontSizes = size === "large"
    ? "text-2xl sm:text-3xl"
    : "text-lg sm:text-xl";

  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer group select-none ${isPulsing ? 'animate-wax-pulse' : ''}`}
      title="Chạm để mở thiệp cưới"
    >
      {/* Vành sáp viền gợn sóng tự nhiên */}
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-[#852233] via-[#5E121E] to-[#36070D] p-1.5 shadow-[0_12px_28px_rgba(94,18,30,0.55),inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_16px_36px_rgba(94,18,30,0.7)]`}>
        {/* Viền kim loại dập nổi phía trong */}
        <div className="w-full h-full rounded-full border-2 border-dashed border-[#ECC880]/80 flex flex-col items-center justify-center bg-gradient-to-br from-[#7A1626] to-[#450912] shadow-inner relative overflow-hidden">
          {/* Vòng hoa nguyệt quế dập chìm */}
          <div className="absolute inset-1.5 border border-[#ECC880]/30 rounded-full pointer-events-none"></div>
          
          <span className="font-serif text-[8px] sm:text-[9px] tracking-[0.25em] text-[#ECC880] uppercase font-bold mb-0.5 opacity-90">
            OFFICIAL
          </span>
          <span className={`font-cursive ${fontSizes} text-[#FAF5E8] font-bold tracking-wide drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]`}>
            {initials}
          </span>
          <span className="font-serif text-[7px] sm:text-[8px] tracking-[0.2em] text-[#ECC880] uppercase opacity-85 mt-0.5">
            INVITATION
          </span>
        </div>
      </div>

      {/* Ruy băng lụa buông rủ bên dưới con dấu */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 pointer-events-none">
        <div className="w-3.5 h-6 bg-[#5E121E] shadow-lg transform -rotate-12 rounded-b-sm border-b-2 border-[#ECC880]/60"></div>
        <div className="w-3.5 h-6 bg-[#6B1724] shadow-lg transform rotate-12 rounded-b-sm border-b-2 border-[#ECC880]/60"></div>
      </div>
    </div>
  );
}

/**
 * D. Nhành Nguyệt Quế Hoàng Gia (Laurel Branch)
 */
export function LaurelBranch({ direction = "left", className = "w-6 h-6 text-[#C5A059]" }) {
  const transform = direction === "right" ? "scale-x-[-1]" : "";
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${transform}`}>
      <path d="M12 21C12 21 12 11 19 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M14 17C12 16 10 17 9 19C9 17 11 15 13 15" fill="currentColor" fillOpacity="0.75"/>
      <path d="M16 12C14 11 12 12 11 14C11 12 13 10 15 10" fill="currentColor" fillOpacity="0.75"/>
      <path d="M17 7C15 6 13 7 12 9C12 7 14 5 16 5" fill="currentColor" fillOpacity="0.75"/>
      <path d="M19 4C18 3 16 3 15 4C16 5 18 5 19 4Z" fill="currentColor"/>
    </svg>
  );
}

/**
 * E. Nhẫn Cưới Song Hỷ Đan Cài (Interlocking Rings Crest)
 */
export function InterlockingRingsIcon({ className = "w-6 h-6 text-[#C5A059]" }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Vòng nhẫn trái */}
      <circle cx="15" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
      {/* Vòng nhẫn phải đan cài */}
      <circle cx="25" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
      {/* Viên kim cương lấp lánh */}
      <polygon points="15,1 18,5 15,9 12,5" fill="#ECC880" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

/**
 * F. Bút Lông Vũ Quý Tộc (Calligraphy Quill Icon)
 */
export function QuillPenIcon({ className = "w-5 h-5 text-currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 3C15 3 10 7 8 12C7 14.5 6 17 3 21C7 20 9.5 19 12 18C17 16 21 11 21 6C21 4.5 20.5 3 20 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 8L9 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M3 21L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * G. La Bàn Hoàng Gia Cổ Điển (Compass Rose Icon)
 */
export function RoyalCompassIcon({ className = "w-5 h-5 text-currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="12,5 14,11 12,13 10,11" fill="#ECC880" stroke="currentColor" strokeWidth="0.8" />
      <polygon points="12,19 14,13 12,11 10,13" fill="currentColor" stroke="currentColor" strokeWidth="0.8" fillOpacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill="#2C2018" />
      <path d="M12 2.5V4M12 20V21.5M2.5 12H4M20 12H21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * H. Đĩa Than Mạ Vàng Cổ Điển (Gold Gramophone Disc)
 */
export function GramophoneDisc({ isPlaying, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 group select-none focus:outline-none"
      title={isPlaying ? 'Tạm dừng nhạc hòa tấu' : 'Phát nhạc hòa tấu'}
    >
      <div className="relative flex items-center justify-center">
        {/* Vòng sóng âm thanh tỏa sáng khi đang phát */}
        {isPlaying && (
          <span className="absolute -inset-2 rounded-full bg-[#ECC880]/30 animate-ping opacity-60 pointer-events-none"></span>
        )}
        
        {/* Đĩa than mạ vàng */}
        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#2C2018] via-[#1A0F0D] to-[#3D2808] p-1 shadow-[0_8px_25px_rgba(44,32,24,0.4),0_0_0_1px_rgba(236,200,128,0.5)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95 ${isPlaying ? 'animate-spin-slow' : ''}`}>
          {/* Rãnh đĩa than */}
          <div className="w-full h-full rounded-full border border-[#ECC880]/40 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(236,200,128,0.15)_31%,_transparent_32%,_transparent_60%,_rgba(236,200,128,0.15)_61%,_transparent_62%)]">
            {/* Nhãn tâm đĩa vàng */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#AA7A2B] via-[#ECC880] to-[#C5A059] flex items-center justify-center shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2C2018]"></div>
            </div>
          </div>
        </div>

        {/* Trâm cài / Kim đĩa than */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FAF5E8] rounded-full shadow border border-[#AA7A2B] flex items-center justify-center pointer-events-none">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#852233] animate-pulse' : 'bg-stone-400'}`}></span>
        </div>
      </div>
    </button>
  );
}

/**
 * I. Hộp Quà / Phong Thư Mạ Vàng (Gold Foil Gift Envelope)
 */
export function GoldFoilGiftBox({ className = "w-8 h-8 text-[#C5A059]" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="10" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 15L16 23L29 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 3L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6C12 4 14 3 16 3C18 3 20 4 20 6C20 8 16 10 16 10C16 10 12 8 12 6Z" fill="#ECC880" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * J. Biểu Tượng Bông Hoa Hồng Cổ Điển (Vintage Rose Flourish)
 */
export function VintageRoseIcon({ className = "w-5 h-5 text-[#852233]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 4C9 4 7 6 7 9C7 13 12 17 12 17C12 17 17 13 17 9C17 6 15 4 12 4Z" fill="currentColor" fillOpacity="0.8" />
      <path d="M12 7C10.5 7 9.5 8 9.5 9.5C9.5 11.5 12 14 12 14C12 14 14.5 11.5 14.5 9.5C14.5 8 13.5 7 12 7Z" fill="#FAF5E8" fillOpacity="0.4" />
      <path d="M9 16C7 17 5 19 4 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 16C17 17 19 19 20 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
