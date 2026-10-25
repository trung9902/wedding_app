'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  MapPin, Clock, Copy, Check, X
} from 'lucide-react';
import {
  BaroqueDivider,
  CornerFlourish,
  RoyalWaxSeal,
  LaurelBranch,
  InterlockingRingsIcon,
  QuillPenIcon,
  RoyalCompassIcon,
  GramophoneDisc,
  GoldFoilGiftBox,
  VintageRoseIcon
} from './components/RoyalOrnaments';

export default function WeddingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [isEnvelopeOpening, setIsEnvelopeOpening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeBankTab, setActiveBankTab] = useState('groom');
  const [copiedBank, setCopiedBank] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // RSVP Form State
  const [rsvpForm, setRsvpForm] = useState({ name: '', phone: '', attending: 'yes', guestCount: 1, note: '' });
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState(null);

  // Personalized Guest State (?to=... or ?guest=...)
  const [guestName, setGuestName] = useState('');

  // Extract personalized guest name from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const to = params.get('to') || params.get('guest') || params.get('k') || '';
      if (to.trim()) {
        const decoded = decodeURIComponent(to.trim());
        setGuestName(decoded);
        setRsvpForm(prev => ({ ...prev, name: decoded }));
      }
    }
  }, []);

  // Guestbook State
  const [wishes, setWishes] = useState([]);
  const [wishForm, setWishForm] = useState({ name: '', message: '' });
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishMessage, setWishMessage] = useState(null);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch wedding data and guestbook wishes
  useEffect(() => {
    async function loadData() {
      try {
        const [resWedding, resWishes] = await Promise.all([
          fetch('/api/wedding').then(r => r.json()),
          fetch('/api/guestbook').then(r => r.json())
        ]);
        if (resWedding.success) setData(resWedding.data);
        if (resWishes.success) setWishes(resWishes.data);
      } catch (err) {
        console.error('Error loading wedding data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown timer calculation
  useEffect(() => {
    if (!data?.event?.weddingDate) return;
    const target = new Date(data.event.weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data]);

  // Falling Rose Petals & Gold Dust Canvas Animation
  useEffect(() => {
    if (!isOpened) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle System: 60% rose petals, 40% royal gold dust
    const particleCount = 38;
    const particles = Array.from({ length: particleCount }).map(() => {
      const isGoldDust = Math.random() < 0.4;
      return {
        isGoldDust,
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: isGoldDust ? Math.random() * 2.5 + 1.2 : Math.random() * 8 + 6,
        speedX: Math.random() * 1.2 - 0.6,
        speedY: isGoldDust ? Math.random() * 1.2 + 0.6 : Math.random() * 1.4 + 0.8,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 1.5 - 0.75,
        opacity: isGoldDust ? Math.random() * 0.7 + 0.3 : Math.random() * 0.4 + 0.45,
        color: isGoldDust 
          ? '#ECC880' 
          : (Math.random() > 0.5 ? '#DF7B8B' : '#ECC880')
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (p.isGoldDust) {
          // Sparkling golden dust circle
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Romantic rose petal ellipse
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 1.8, 0, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpened]);

  // Open envelope ritual & initiate background music & confetti celebration
  const handleOpenEnvelope = () => {
    if (isEnvelopeOpening || isOpened) return;
    setIsEnvelopeOpening(true);

    // Golden Sparkle Confetti Burst
    try {
      confetti({
        particleCount: 55,
        spread: 80,
        origin: { y: 0.58 },
        colors: ['#ECC880', '#D4AF37', '#852233', '#FAF5E8', '#C5A059'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.1,
      });
    } catch (e) {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Audio autoplay policy prevented sound:', err);
      });
    }

    setTimeout(() => {
      setIsOpened(true);
    }, 750);
  };

  // Scroll Reveal Observer for cinematic section entrances
  useEffect(() => {
    if (!isOpened) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const revealElements = document.querySelectorAll(
      '.reveal-on-scroll, .reveal-from-left, .reveal-from-right, .reveal-zoom-in'
    );
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isOpened]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const copyBankNo = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2800);
  };

  // Submit RSVP
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setRsvpSubmitting(true);
    setRsvpMessage(null);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpForm)
      });
      const result = await res.json();
      if (result.success) {
        setRsvpMessage({ type: 'success', text: result.message || 'Trân trọng cảm ơn sự hồi đáp quý báu của quý khách!' });
        setRsvpForm({ name: '', phone: '', attending: 'yes', guestCount: 1, note: '' });
      } else {
        setRsvpMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra, vui lòng thử lại!' });
      }
    } catch (err) {
      setRsvpMessage({ type: 'error', text: 'Có lỗi kết nối, vui lòng thử lại sau giây lát!' });
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Submit Guestbook Wish
  const handleWishSubmit = async (e) => {
    e.preventDefault();
    setWishSubmitting(true);
    setWishMessage(null);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishForm)
      });
      const result = await res.json();
      if (result.success) {
        setWishMessage({ type: 'success', text: 'Lời chúc phúc chân thành của quý khách đã được lưu lại trang trọng!' });
        setWishes([result.data, ...wishes]);
        setWishForm({ name: '', message: '' });
      } else {
        setWishMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setWishMessage({ type: 'error', text: 'Có lỗi kết nối, xin vui lòng gửi lại!' });
    } finally {
      setWishSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-[#2C2018]">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#C5A059] border-t-[#5E121E] animate-spin"></div>
        <p className="mt-6 font-display font-semibold text-[#8C621E] tracking-[0.25em] text-sm uppercase">
          Đang Chuẩn Bị Thiệp Cưới Hoàng Gia...
        </p>
      </div>
    );
  }

  const { groom, bride, event, media, timeline } = data;
  const coupleMonogram = `${groom.shortName?.[0] || 'M'} & ${bride.shortName?.[0] || 'Q'}`;
  const activeBank = activeBankTab === 'groom' ? groom.bank : bride.bank;
  const activePersonName = activeBankTab === 'groom' ? groom.shortName : bride.shortName;
  const vietQrUrl = `https://img.vietqr.io/image/${activeBank.bankCode}-${activeBank.accountNo}-compact2.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(activePersonName)}&accountName=${encodeURIComponent(activeBank.accountName)}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#2C2018] font-sans antialiased selection:bg-[#ECC880]/30 selection:text-[#5E121E]">
      
      {/* Background Audio */}
      {media.musicUrl && (
        <audio ref={audioRef} src={media.musicUrl} loop preload="auto" />
      )}

      {/* Falling Canvas for Rose Petals & Golden Dust */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* Floating Music Gramophone Player Disc */}
      {isOpened && (
        <GramophoneDisc isPlaying={isPlaying} onClick={toggleMusic} />
      )}

      {/* ========================================================= */}
      {/* 1. ROYAL ENVELOPE OPENING OVERLAY (Nắp Phong Thư Sáp Hoàng Gia) */}
      {/* ========================================================= */}
      {!isOpened && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#181614] px-4 transition-all duration-700 ${isEnvelopeOpening ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}>
          {/* Subtle Warm Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>

          <div className="relative z-10 max-w-lg w-full text-center">
            
            {/* Stationery Wedding Envelope Outer Card */}
            <div className="relative envelope-cotton-paper p-8 sm:p-12 rounded-2xl overflow-hidden">
              
              <span className="font-sans text-[#8A725A] uppercase tracking-[0.35em] text-[10px] font-semibold block mb-3">
                THIỆP MỜI THÀNH HÔN
              </span>

              {/* Couple Names - Unified Horizontal Rhythm */}
              <div className="my-3 font-display italic text-3xl sm:text-4xl text-[#1C1A17] font-normal tracking-wide flex items-center justify-center flex-wrap">
                <span>{groom.shortName}</span>
                <span className="font-serif italic text-[#73202B] mx-2.5 font-light">&amp;</span>
                <span>{bride.shortName}</span>
              </div>

              {/* Minimalist Hairline Divider */}
              <div className="w-12 h-px bg-[#D6CEBF] mx-auto my-4"></div>

              {/* Personalized Guest Invitation - Clean & Floating (No Clunky Box) */}
              {guestName ? (
                <div className="my-6 text-center">
                  <span className="text-[10px] text-[#8A725A] uppercase tracking-[0.3em] font-semibold block mb-1">
                    TRÂN TRỌNG KÍNH MỜI
                  </span>
                  <span className="font-serif font-normal text-2xl sm:text-3xl text-[#1C1A17] block tracking-wide">
                    {guestName}
                  </span>
                  <span className="text-[12px] text-[#7D776F] font-serif italic block mt-1.5">
                    Đến chung vui cùng gia đình chúng tôi
                  </span>
                </div>
              ) : (
                <p className="font-serif italic text-[#4A4641] text-sm sm:text-base max-w-sm mx-auto mb-6 leading-relaxed">
                  Trân trọng kính mời quý khách và gia quyến đến tham dự lễ thành hôn của chúng tôi
                </p>
              )}

              {/* Central Wax Seal Button */}
              <div className="flex flex-col items-center justify-center my-3">
                <RoyalWaxSeal 
                  initials={coupleMonogram} 
                  onClick={handleOpenEnvelope} 
                  isPulsing={true}
                  size="large"
                />
                <button
                  onClick={handleOpenEnvelope}
                  className="mt-6 text-[11px] uppercase tracking-[0.25em] font-medium text-[#7D776F] hover:text-[#1C1A17] transition duration-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Chạm con dấu sáp để mở thiệp</span>
                </button>
              </div>
            </div>

            <p className="text-[#FAF7F2]/40 text-[11px] mt-6 tracking-[0.2em] uppercase font-sans">
              Âm nhạc hòa tấu sẽ tự động cất lên khi mở thiệp
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN ROYAL WEDDING INVITATION PAGE */}
      {/* ========================================================= */}
      <main className={`transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* ========================================================= */}
        {/* HERO SECTION (Banner Cung Điện & Khung Vòm Hoàng Gia) */}
        {/* ========================================================= */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 bg-[#FAF7F2]">
          
          <div className="max-w-3xl mx-auto z-10 w-full">
            {/* Top Royal Tagline */}
            <div className="mb-4">
              <span className="font-sans text-[#8A725A] text-[11px] tracking-[0.35em] uppercase font-semibold">
                {event.title || 'LỄ THÀNH HÔN'}
              </span>
            </div>

            {/* Couple Main Typography Title - Clean High-Fashion Editorial */}
            <div className="my-6">
              <h1 className="font-display italic text-5xl sm:text-7xl md:text-8xl text-[#1C1A17] font-normal tracking-wide leading-tight">
                {groom.fullName}
              </h1>
              <div className="font-serif italic text-3xl sm:text-4xl text-[#73202B] my-2 font-light">
                và
              </div>
              <h1 className="font-display italic text-5xl sm:text-7xl md:text-8xl text-[#1C1A17] font-normal tracking-wide leading-tight">
                {bride.fullName}
              </h1>
            </div>

            {/* Subtle Minimalist Hairline */}
            <div className="w-16 h-px bg-[#D6CEBF] mx-auto my-6"></div>

            {/* Personalized Guest Badge inside invitation */}
            {guestName && (
              <div className="mb-8 py-3.5 px-6 max-w-sm mx-auto rounded-xl bg-white border border-[#E5DFD5] shadow-xs text-center">
                <span className="text-[10px] text-[#8A725A] uppercase tracking-[0.25em] font-medium block">
                  Kính Gửi Quý Khách
                </span>
                <span className="font-serif font-bold text-2xl text-[#1C1A17] block mt-1 tracking-wide">
                  {guestName}
                </span>
                <p className="text-[12px] text-[#7D776F] font-serif italic mt-1">
                  Sự hiện diện của bạn là niềm vinh hạnh lớn nhất cho gia đình chúng tôi
                </p>
              </div>
            )}

            {/* Couple Palace Arch Photo Frame - Clean Architectural Gallery */}
            <div className="relative mx-auto w-72 h-[420px] sm:w-88 sm:h-[500px] md:w-[400px] md:h-[560px] mb-10 p-2.5 bg-white rounded-t-full rounded-b-2xl border border-[#E5DFD5] shadow-xl group">
              <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden relative border border-[#EAE4DA]">
                <img 
                  src={media.coverImage} 
                  alt="Ảnh cưới tân lang và tân nương" 
                  className="w-full h-full object-cover object-top transform group-hover:scale-102 transition-transform duration-700 ease-out" 
                />
              </div>
            </div>

            {/* Save The Date Card */}
            <div className="max-w-md mx-auto bg-white py-5 px-6 rounded-xl border border-[#E5DFD5] shadow-xs">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-medium mb-1">
                SAVE OUR SPECIAL DATE
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-[#1C1A17] font-semibold tracking-wide">
                {new Date(event.weddingDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[#7D776F] italic font-serif text-xs mt-1">
                (Tức ngày {event.lunarDate})
              </p>
            </div>

            {/* Smooth Scroll Down Indicator */}
            <div 
              className="mt-12 animate-scroll-bounce cursor-pointer inline-flex flex-col items-center select-none"
              onClick={() => {
                const nextEl = document.getElementById('countdown-section');
                if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Cuộn xuống khám phá"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-medium mb-2 font-sans">
                Cuộn xuống để khám phá
              </span>
              <div className="w-7 h-7 rounded-full bg-white border border-[#E5DFD5] flex items-center justify-center shadow-xs">
                <svg className="w-3.5 h-3.5 text-[#1C1A17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. EDITORIAL MINIMALIST COUNTDOWN SECTION */}
        {/* ========================================================= */}
        <section id="countdown-section" className="py-16 bg-[#F5EFE6]/60 px-4 border-y border-[#E5DFD5] reveal-on-scroll">
          <div className="max-w-xl mx-auto text-center">
            
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
              ĐẾM NGƯỢC THỜI GIAN
            </span>

            <h2 className="font-display italic text-3xl sm:text-4xl text-[#1C1A17] font-normal mb-8">
              Cùng Chờ Đón Khoảnh Khắc Hạnh Phúc
            </h2>

            {/* 4 Clean Divided Columns */}
            <div className="grid grid-cols-4 divide-x divide-[#E5DFD5] py-6 bg-white/90 backdrop-blur rounded-2xl border border-[#E5DFD5] shadow-xs">
              {[
                { label: 'NGÀY', value: timeLeft.days },
                { label: 'GIỜ', value: timeLeft.hours },
                { label: 'PHÚT', value: timeLeft.minutes },
                { label: 'GIÂY', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="px-2 text-center">
                  <span className="font-display font-light text-3xl sm:text-5xl text-[#1C1A17] block">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] tracking-[0.25em] text-[#8A725A] font-semibold uppercase mt-1 block font-sans">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. COUPLE & PARENTS INTRODUCTION (Tân Lang & Tân Nương) */}
        {/* ========================================================= */}
        <section className="py-20 px-4 max-w-5xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
              NHÂN VẬT CHÍNH
            </span>
            <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal">
              Cô Dâu &amp; Chú Rể
            </h2>
            <div className="w-16 h-px bg-[#D6CEBF] mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Chú Rể (Tân Lang) */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl text-center border border-[#E5DFD5] shadow-xs reveal-from-left">
              {/* Circular Portrait */}
              <div className="w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border border-[#DCD2C3] mb-5">
                <img 
                  src={groom.avatar} 
                  alt={groom.fullName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8A725A] font-semibold block mb-1">
                CHÚ RỂ
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#1C1A17] mb-2">
                {groom.fullName}
              </h3>
              
              <p className="text-[#4A4641] text-sm mb-6 leading-relaxed">
                {groom.description}
              </p>
              
              {/* Nhà Trai */}
              <div className="border-t border-[#E5DFD5] pt-5 text-xs text-[#7D776F] space-y-1 font-sans">
                <p className="font-semibold text-[#8A725A] tracking-[0.2em] uppercase">ĐẠI DIỆN NHÀ TRAI</p>
                <p>Thân phụ: <span className="font-serif font-bold text-[#1C1A17] text-sm">{groom.father}</span></p>
                <p>Thân mẫu: <span className="font-serif font-bold text-[#1C1A17] text-sm">{groom.mother}</span></p>
              </div>
            </div>

            {/* Cô Dâu (Tân Nương) */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl text-center border border-[#E5DFD5] shadow-xs reveal-from-right">
              {/* Circular Portrait */}
              <div className="w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border border-[#E0D7C9] mb-5">
                <img 
                  src={bride.avatar} 
                  alt={bride.fullName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              <span className="text-[10px] tracking-[0.3em] uppercase text-[#73202B] font-semibold block mb-1">
                CÔ DÂU
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#1C1A17] mb-2">
                {bride.fullName}
              </h3>
              
              <p className="text-[#4A4641] text-sm mb-6 leading-relaxed">
                {bride.description}
              </p>
              
              {/* Nhà Gái */}
              <div className="border-t border-[#E5DFD5] pt-5 text-xs text-[#7D776F] space-y-1 font-sans">
                <p className="font-semibold text-[#73202B] tracking-[0.2em] uppercase">ĐẠI DIỆN NHÀ GÁI</p>
                <p>Thân phụ: <span className="font-serif font-bold text-[#1C1A17] text-sm">{bride.father}</span></p>
                <p>Thân mẫu: <span className="font-serif font-bold text-[#1C1A17] text-sm">{bride.mother}</span></p>
              </div>
            </div>

          </div>

          {/* Invitation Message Box */}
          <div className="mt-16 bg-white/80 backdrop-blur p-8 sm:p-12 rounded-2xl text-center max-w-2xl mx-auto border border-[#E5DFD5] shadow-xs reveal-zoom-in">
            <p className="font-display italic text-[#1C1A17] text-lg sm:text-xl leading-relaxed">
              "{event.message}"
            </p>
            <div className="w-12 h-px bg-[#D6CEBF] mx-auto mt-6"></div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* 5. VENUE & DIRECTIONS SECTION */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#F5EFE6]/50 px-4 border-y border-[#E5DFD5] reveal-on-scroll">
          <div className="max-w-4xl mx-auto text-center">
            
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
              THỜI GIAN &amp; ĐỊA ĐIỂM
            </span>

            <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal mb-10">
              Tiệc Mừng Hạnh Phúc
            </h2>

            <div className="bg-white p-8 sm:p-14 rounded-2xl shadow-xs border border-[#E5DFD5] max-w-2xl mx-auto text-center relative reveal-zoom-in">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center mx-auto mb-6 text-[#1C1A17]">
                <MapPin className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] mb-3">
                {event.venueName}
              </h3>
              
              <p className="text-[#4A4641] text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto">
                {event.venueAddress}
              </p>

              {/* Ceremony & Party Dual Times */}
              <div className="grid grid-cols-2 gap-4 py-5 border-y border-[#E5DFD5] mb-8 bg-[#FAF7F2] rounded-xl px-4">
                <div className="border-r border-[#E5DFD5] pr-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A725A] font-semibold block mb-1">
                    Lễ Thành Hôn
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1A17]">
                    {event.ceremonyTime}
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#73202B] font-semibold block mb-1">
                    Khai Tiệc Mừng
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-semibold text-[#73202B]">
                    {event.partyTime}
                  </span>
                </div>
              </div>

              {/* Map Button */}
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-[#1C1A17] text-[#FAF7F2] rounded-full hover:bg-[#383530] transition-all duration-300 shadow-sm text-xs font-semibold tracking-[0.15em] uppercase"
              >
                <span>Xem Bản Đồ Chỉ Đường (Google Maps) ↗</span>
              </a>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. ROYAL TIMELINE SECTION (Lịch Trình Hôn Lễ) */}
        {/* ========================================================= */}
        {timeline && timeline.length > 0 && (
          <section className="py-20 px-4 max-w-3xl mx-auto reveal-on-scroll">
            
            <div className="text-center mb-16">
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
                CHƯƠNG TRÌNH HÔN LỄ
              </span>
              <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal">
                Lịch Trình Đón Tiếp
              </h2>
              <div className="w-16 h-px bg-[#D6CEBF] mx-auto mt-4"></div>
            </div>

            {/* Vertical Fine Thread */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 sm:before:left-1/2 before:-translate-x-1/2 before:w-[1px] before:bg-[#E5DFD5]">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-center justify-between sm:odd:flex-row-reverse group reveal-on-scroll">
                  <div className="w-full sm:w-1/2 pl-16 sm:pl-0 sm:group-odd:pr-10 sm:group-even:pl-10">
                    <div className="bg-white p-6 rounded-xl shadow-xs border border-[#E5DFD5] hover:border-[#D6CEBF] transition-all">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8A725A] border border-[#E5DFD5] font-semibold text-[11px] tracking-wider mb-2 font-sans">
                        {item.time}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#1C1A17]">{item.title}</h4>
                      <p className="text-[#4A4641] text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Node */}
                  <div className="absolute left-8 sm:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-[#D6CEBF] shadow-xs flex items-center justify-center text-[#1C1A17]">
                    <Clock className="w-3.5 h-3.5 text-[#8A725A]" />
                  </div>
                </div>
              ))}
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* 7. FINE-ART GALLERY & LIGHTBOX SECTION */}
        {/* ========================================================= */}
        {media.gallery && media.gallery.length > 0 && (
          <section className="py-20 bg-[#FAF7F2] px-4 border-t border-[#E5DFD5] reveal-on-scroll">
            <div className="max-w-5xl mx-auto">
              
              <div className="text-center mb-16">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
                  KHOẢNH KHẮC NGỌT NGÀO
                </span>
                <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal">
                  Album Ảnh Cưới
                </h2>
                <div className="w-16 h-px bg-[#D6CEBF] mx-auto mt-4"></div>
              </div>

              {/* Gallery Grid with Clean Hairline Borders */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {media.gallery.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImg(imgUrl)}
                    className="group relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-xs cursor-pointer border border-[#E5DFD5] bg-white reveal-zoom-in"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Khoảnh khắc ảnh cưới ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Hover Champagne Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C2018]/70 via-[#2C2018]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <span className="text-[#FAF5E8] text-[11px] uppercase tracking-[0.25em] px-4 py-2 rounded-full bg-[#2C2018]/80 border border-[#ECC880] backdrop-blur font-semibold">
                        Thưởng Lãm
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* LIGHTBOX MODAL */}
        {lightboxImg && (
          <div 
            className="fixed inset-0 z-50 bg-[#12080A]/95 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setLightboxImg(null)}
          >
            <button 
              className="absolute top-6 right-6 text-[#ECC880] p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
              title="Đóng xem ảnh"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="p-2 bg-gradient-to-b from-[#ECC880] via-[#C5A059] to-[#8C621E] rounded-2xl shadow-2xl max-w-4xl max-h-[90vh]">
              <img 
                src={lightboxImg} 
                alt="Ảnh phóng to chi tiết" 
                className="max-w-full max-h-[85vh] rounded-xl object-contain" 
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. HỘP MỪNG CƯỚI & VIETQR */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#F5EFE6]/50 px-4 border-y border-[#E5DFD5] reveal-on-scroll">
          <div className="max-w-xl mx-auto text-center">
            
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
              GỬI QUÀ CHÚC PHÚC
            </span>

            <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal mt-1 mb-3">
              Hộp Mừng Cưới
            </h2>

            <p className="text-[#4A4641] text-sm mb-8 leading-relaxed">
              Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh to lớn cho gia đình chúng tôi.
            </p>

            {/* Clean Tab Switcher */}
            <div className="flex rounded-full bg-[#EAE4DA] p-1 mb-8 max-w-xs mx-auto border border-[#E0D7C9]">
              <button
                onClick={() => setActiveBankTab('groom')}
                className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 font-sans ${
                  activeBankTab === 'groom' 
                    ? 'bg-[#1C1A17] text-[#FAF7F2] shadow-xs' 
                    : 'text-[#7D776F] hover:text-[#1C1A17]'
                }`}
              >
                Mừng Chú Rể
              </button>
              <button
                onClick={() => setActiveBankTab('bride')}
                className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 font-sans ${
                  activeBankTab === 'bride' 
                    ? 'bg-[#73202B] text-white shadow-xs' 
                    : 'text-[#7D776F] hover:text-[#1C1A17]'
                }`}
              >
                Mừng Cô Dâu
              </button>
            </div>

            {/* VietQR Card Styled as Fine Stationery Box */}
            <div className="bg-white p-8 rounded-2xl shadow-xs border border-[#E5DFD5] relative reveal-zoom-in">
              <div className="w-52 h-52 mx-auto bg-white p-2 rounded-xl border border-[#E5DFD5] mb-6 flex items-center justify-center">
                <img 
                  src={vietQrUrl} 
                  alt={`VietQR ${activePersonName}`} 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div className="space-y-1.5 text-sm text-[#4A4641] font-sans">
                <p>Ngân hàng: <span className="font-bold text-[#1C1A17]">{activeBank.bankName}</span></p>
                <p>Chủ tài khoản: <span className="font-bold text-[#1C1A17] font-serif">{activeBank.accountName}</span></p>
                
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <span className="font-mono text-base font-bold bg-[#FAF7F2] px-4 py-1.5 rounded-lg text-[#1C1A17] border border-[#E5DFD5]">
                    {activeBank.accountNo}
                  </span>
                  <button
                    onClick={() => copyBankNo(activeBank.accountNo)}
                    className="p-2 px-3 rounded-lg bg-[#1C1A17] text-[#FAF7F2] hover:bg-[#383530] transition-colors flex items-center space-x-1.5 text-xs font-medium"
                    title="Sao chép số tài khoản"
                  >
                    {copiedBank ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBank ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. FORM RSVP */}
        {/* ========================================================= */}
        <section className="py-20 px-4 max-w-xl mx-auto reveal-on-scroll">
          
          <div className="text-center mb-10">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
              XÁC NHẬN THAM DỰ
            </span>
            
            <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal mt-1">
              Hồi Đáp RSVP
            </h2>
            
            <p className="text-[#7D776F] text-sm mt-3 leading-relaxed">
              Để gia đình chúng tôi chuẩn bị tiệc đón tiếp chu đáo nhất, xin vui lòng gửi xác nhận trước ngày cưới.
            </p>
          </div>

          <form onSubmit={handleRsvpSubmit} className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-[#E5DFD5] space-y-4 relative reveal-zoom-in">
            {rsvpMessage && (
              <div className={`p-4 rounded-xl text-sm ${rsvpMessage.type === 'success' ? 'bg-[#F5EFE6] text-[#1C1A17] border border-[#E0D7C9]' : 'bg-[#FBF0F1] text-[#73202B] border border-[#EDB0B8]'}`}>
                {rsvpMessage.text}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7D776F] mb-1 font-sans">
                Họ và tên của quý khách *
              </label>
              <input
                type="text"
                required
                value={rsvpForm.name}
                onChange={e => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7D776F] mb-1 font-sans">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={rsvpForm.phone}
                onChange={e => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                placeholder="VD: 0912345678"
                className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7D776F] mb-1 font-sans">
                  Xác nhận tham dự
                </label>
                <select
                  value={rsvpForm.attending}
                  onChange={e => setRsvpForm({ ...rsvpForm, attending: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17]"
                >
                  <option value="yes">Chắc chắn tham dự</option>
                  <option value="no">Không thể tham dự</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7D776F] mb-1 font-sans">
                  Số người tham dự
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rsvpForm.guestCount}
                  onChange={e => setRsvpForm({ ...rsvpForm, guestCount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7D776F] mb-1 font-sans">
                Lời nhắn gửi đến cô dâu &amp; chú rể
              </label>
              <textarea
                rows="3"
                value={rsvpForm.note}
                onChange={e => setRsvpForm({ ...rsvpForm, note: e.target.value })}
                placeholder="Ghi chú thêm cho cô dâu & chú rể..."
                className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17] resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={rsvpSubmitting}
              className="w-full py-3.5 bg-[#1C1A17] hover:bg-[#383530] text-[#FAF7F2] rounded-xl shadow-xs uppercase text-xs font-semibold tracking-[0.2em] transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {rsvpSubmitting ? 'Đang Gửi Xác Nhận...' : 'Gửi Xác Nhận Ngay'}
            </button>
          </form>
        </section>

        {/* ========================================================= */}
        {/* 10. GUESTBOOK / SỔ LƯU BÚT */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#FAF7F2] px-4 border-t border-[#E5DFD5] reveal-on-scroll">
          <div className="max-w-2xl mx-auto">
            
            <div className="text-center mb-12">
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A725A] font-semibold block mb-2">
                SỔ LƯU BÚT ONLINE
              </span>
              <h2 className="font-display italic text-4xl sm:text-5xl text-[#1C1A17] font-normal">
                Gửi Lời Chúc Phúc
              </h2>
              <div className="w-16 h-px bg-[#D6CEBF] mx-auto mt-4"></div>
            </div>

            {/* Wish Submit Form */}
            <form onSubmit={handleWishSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#E5DFD5] mb-12 space-y-4 relative reveal-zoom-in">
              {wishMessage && (
                <div className={`p-3 rounded-xl text-sm ${wishMessage.type === 'success' ? 'bg-[#F5EFE6] text-[#1C1A17] border border-[#E0D7C9]' : 'bg-[#FBF0F1] text-[#73202B] border border-[#EDB0B8]'}`}>
                  {wishMessage.text}
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  value={wishForm.name}
                  onChange={e => setWishForm({ ...wishForm, name: e.target.value })}
                  placeholder="Tên của bạn hoặc cách xưng hô thân mật..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17]"
                />
              </div>

              <div>
                <textarea
                  rows="3"
                  required
                  value={wishForm.message}
                  onChange={e => setWishForm({ ...wishForm, message: e.target.value })}
                  placeholder="Viết lời chúc yêu thương của bạn gửi đến đôi uyên ương..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#1C1A17] text-sm text-[#1C1A17] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={wishSubmitting}
                className="w-full py-3.5 bg-[#73202B] hover:bg-[#8C2835] text-white rounded-xl shadow-xs uppercase tracking-[0.2em] text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              >
                <span>{wishSubmitting ? 'Đang Gửi Lời Chúc...' : 'Ký Tên & Gửi Lời Chúc'}</span>
              </button>
            </form>

            {/* Wishes Feed */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {wishes.length === 0 ? (
                <p className="text-center text-[#7D776F] italic py-8 font-serif">
                  Hãy là người đầu tiên gửi những lời chúc tốt đẹp nhất đến đôi uyên ương nhé!
                </p>
              ) : (
                wishes.map(item => (
                  <div key={item.id} className="bg-white p-5 sm:p-6 rounded-xl border border-[#E5DFD5] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif font-bold text-[#1C1A17] text-base">{item.name}</h4>
                      <span className="text-[11px] text-[#7D776F] font-sans">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-[#4A4641] text-sm leading-relaxed font-sans">{item.message}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 11. FOOTER */}
        {/* ========================================================= */}
        <footer className="py-14 text-center bg-[#181614] text-[#FAF7F2] px-4 border-t border-[#2C2926] relative">
          <p className="font-display italic text-4xl sm:text-5xl text-[#FAF7F2] mb-3 tracking-wide">
            Thank You!
          </p>
          <div className="w-12 h-px bg-[#4A4641] mx-auto mb-4"></div>
          <p className="text-xs text-[#A8A29E] max-w-md mx-auto leading-relaxed mb-6 font-sans">
            Chân thành cảm ơn sự hiện diện, tình cảm và những lời chúc phúc quý báu của quý khách dành cho chúng tôi trong ngày vui trọng đại này.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-[#78716C] font-sans">
            <span>© 2026 Wedding Invitation</span>
            <span>•</span>
            <a href="/admin" className="text-[#D6CEBF] hover:underline font-medium">
              Quản Trị (/admin)
            </a>
          </div>
        </footer>

      </main>
    </div>
  );
}
