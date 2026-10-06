'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  // Open envelope ritual & initiate background music
  const handleOpenEnvelope = () => {
    if (isEnvelopeOpening || isOpened) return;
    setIsEnvelopeOpening(true);

    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Audio autoplay policy prevented sound:', err);
      });
    }

    setTimeout(() => {
      setIsOpened(true);
    }, 700);
  };

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
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#1F0C10] via-[#150709] to-[#0D0406] px-4 transition-all duration-700 ${isEnvelopeOpening ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}>
          {/* Subtle Damask Glow Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,200,128,0.12)_0%,_rgba(94,18,30,0.18)_50%,_transparent_100%)] pointer-events-none"></div>

          <div className="relative z-10 max-w-lg w-full text-center">
            
            {/* Top Royal Invitation Crest */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 text-[#ECC880] text-[10px] tracking-[0.3em] uppercase font-semibold">
                <LaurelBranch direction="left" className="w-5 h-5 text-[#ECC880]" />
                <span>Thiệp Mời Khánh Tiệc</span>
                <LaurelBranch direction="right" className="w-5 h-5 text-[#ECC880]" />
              </div>
            </div>

            {/* Haute Couture Envelope Outer Card */}
            <div className="relative bg-[#FAF7F2] p-8 sm:p-12 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-2 border-[#ECC880]/70 overflow-hidden">
              {/* Corner Ornaments */}
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-8 h-8 text-[#C5A059]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-8 h-8 text-[#C5A059]" />
              <CornerFlourish position="bottom-left" className="absolute bottom-3 left-3 w-8 h-8 text-[#C5A059]" />
              <CornerFlourish position="bottom-right" className="absolute bottom-3 right-3 w-8 h-8 text-[#C5A059]" />

              {/* Gold Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FAF5E8] via-[#C5A059] to-[#FAF5E8]"></div>

              <span className="font-sans text-[#AA7A2B] uppercase tracking-[0.3em] text-[11px] font-bold block mb-2">
                ROYAL WEDDING INVITATION
              </span>

              {/* Couple Names */}
              <h1 className="font-cursive text-5xl sm:text-6xl text-[#2C2018] mt-2 mb-2 leading-tight">
                {groom.shortName} <span className="text-[#852233] font-cursive">&</span> {bride.shortName}
              </h1>

              {/* Baroque Gold Divider */}
              <BaroqueDivider className="w-40 h-5 mx-auto my-3 text-[#C5A059]" />

              <p className="font-serif italic text-[#4A3B32] text-sm sm:text-base max-w-sm mx-auto mb-8 leading-relaxed">
                Trân trọng kính mời quý khách và gia quyến đến tham dự lễ thành hôn của chúng tôi
              </p>

              {/* Central Wax Seal Button */}
              <div className="flex flex-col items-center justify-center my-2">
                <RoyalWaxSeal 
                  initials={coupleMonogram} 
                  onClick={handleOpenEnvelope} 
                  isPulsing={true}
                  size="large"
                />
                <button
                  onClick={handleOpenEnvelope}
                  className="mt-6 text-xs uppercase tracking-[0.25em] font-semibold text-[#8C621E] hover:text-[#5E121E] transition duration-300 flex items-center space-x-1 underline underline-offset-4 cursor-pointer"
                >
                  <span>Chạm con dấu sáp để mở thiệp</span>
                </button>
              </div>
            </div>

            <p className="text-[#ECC880]/70 text-[11px] mt-6 tracking-[0.2em] uppercase font-sans">
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
            {/* Top Royal Tagline Badge with Laurel Branches */}
            <div className="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-full bg-[#FAF5E8] border border-[#ECC880] shadow-sm mb-6">
              <LaurelBranch direction="left" className="w-4 h-4 text-[#AA7A2B]" />
              <span className="font-sans text-[#8C621E] text-xs tracking-[0.25em] uppercase font-bold">
                {event.title || 'LỄ THÀNH HÔN'}
              </span>
              <LaurelBranch direction="right" className="w-4 h-4 text-[#AA7A2B]" />
            </div>

            {/* Couple Main Typography Title */}
            <div className="space-y-1 my-4">
              <h1 className="font-cursive text-6xl sm:text-7xl md:text-8xl text-[#2C2018] leading-tight tracking-wide drop-shadow-sm">
                {groom.fullName}
              </h1>
              <div className="font-cursive text-4xl sm:text-5xl md:text-6xl text-[#852233] my-1">
                &amp;
              </div>
              <h1 className="font-cursive text-6xl sm:text-7xl md:text-8xl text-[#2C2018] leading-tight tracking-wide drop-shadow-sm">
                {bride.fullName}
              </h1>
            </div>

            {/* Baroque Divider */}
            <BaroqueDivider className="w-52 sm:w-64 h-6 mx-auto my-6 text-[#C5A059]" />

            {/* Couple Palace Arch Photo Frame */}
            <div className="relative mx-auto w-72 h-[400px] sm:w-80 sm:h-[460px] md:w-96 md:h-[520px] mb-10 group">
              {/* Outer Golden Arch Frame */}
              <div className="royal-arch-frame w-full h-full relative overflow-hidden shadow-[0_20px_50px_rgba(44,32,24,0.25)]">
                
                {/* 4 Corner Flourishes */}
                <CornerFlourish position="top-left" className="absolute top-4 left-4 z-10 w-7 h-7 text-[#FAF5E8] drop-shadow" />
                <CornerFlourish position="top-right" className="absolute top-4 right-4 z-10 w-7 h-7 text-[#FAF5E8] drop-shadow" />
                <CornerFlourish position="bottom-left" className="absolute bottom-4 left-4 z-10 w-7 h-7 text-[#FAF5E8] drop-shadow" />
                <CornerFlourish position="bottom-right" className="absolute bottom-4 right-4 z-10 w-7 h-7 text-[#FAF5E8] drop-shadow" />

                {/* Inner Image Container with Arch */}
                <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden relative border-2 border-[#FAF5E8]">
                  <img 
                    src={media.coverImage} 
                    alt="Ảnh cưới tân lang và tân nương" 
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out" 
                  />
                  {/* Subtle inner gold vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2018]/30 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Save The Date & Lunar Date Badge */}
            <div className="max-w-md mx-auto parchment-card py-5 px-6 rounded-2xl border border-[#ECC880]/80 shadow-md">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#8C621E] font-bold mb-1">
                SAVE OUR SPECIAL DATE
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-[#2C2018] font-bold tracking-wide">
                {new Date(event.weddingDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[#6B5B52] italic font-serif text-sm mt-1">
                (Tức ngày {event.lunarDate})
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. VINTAGE CLOCKWORK COUNTDOWN SECTION */}
        {/* ========================================================= */}
        <section className="py-16 bg-gradient-to-b from-[#FAF7F2] via-[#F4EBE1] to-[#FAF7F2] px-4 border-y border-[#ECC880]/40">
          <div className="max-w-2xl mx-auto text-center">
            
            <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <LaurelBranch direction="left" className="w-3.5 h-3.5" />
              <span>Đếm Ngược Thời Gian</span>
              <LaurelBranch direction="right" className="w-3.5 h-3.5" />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-[#2C2018] font-bold mb-2">
              Cùng Chờ Đón Khoảnh Khắc Hạnh Phúc
            </h2>
            
            <BaroqueDivider className="w-36 h-4 mx-auto mb-8 text-[#C5A059]" />

            {/* 4 Clockwork Pods */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: 'NGÀY', value: timeLeft.days },
                { label: 'GIỜ', value: timeLeft.hours },
                { label: 'PHÚT', value: timeLeft.minutes },
                { label: 'GIÂY', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="clockwork-pod p-3.5 sm:p-6 rounded-2xl text-center relative group">
                  <span className="font-display text-3xl sm:text-5xl font-bold text-[#8C621E] block drop-shadow-sm">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#736154] font-bold uppercase mt-1 block font-sans">
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
            <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <LaurelBranch direction="left" className="w-3.5 h-3.5" />
              <span>Tân Lang &amp; Tân Nương</span>
              <LaurelBranch direction="right" className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold">
              Cô Dâu &amp; Chú Rể
            </h2>
            <BaroqueDivider className="w-44 h-5 mx-auto mt-3 text-[#C5A059]" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Chú Rể (Tân Lang) */}
            <div className="parchment-card p-8 sm:p-10 rounded-3xl text-center relative border border-[#ECC880]">
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-6 h-6 text-[#C5A059]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-6 h-6 text-[#C5A059]" />

              {/* Oval Gold Border Frame */}
              <div className="w-40 h-40 mx-auto rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-[#AA7A2B] via-[#ECC880] to-[#C5A059] shadow-lg mb-5">
                <img 
                  src={groom.avatar} 
                  alt={groom.fullName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              {/* Silk Sand Badge for Groom */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#FAF5E8] text-[#8C621E] border border-[#ECC880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">
                TÂN LANG
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2018] mb-2">
                {groom.fullName}
              </h3>
              
              <p className="text-[#4A3B32] text-sm sm:text-base mb-6 leading-relaxed">
                {groom.description}
              </p>
              
              {/* Nhà Trai */}
              <div className="border-t border-[#ECC880]/60 pt-5 text-xs sm:text-sm text-[#736154] space-y-1.5 font-sans">
                <p className="font-bold text-[#8C621E] tracking-[0.15em] uppercase">ĐẠI DIỆN NHÀ TRAI</p>
                <p>Thân phụ: <span className="font-serif font-bold text-[#2C2018] text-sm">{groom.father}</span></p>
                <p>Thân mẫu: <span className="font-serif font-bold text-[#2C2018] text-sm">{groom.mother}</span></p>
              </div>
            </div>

            {/* Cô Dâu (Tân Nương) */}
            <div className="parchment-card p-8 sm:p-10 rounded-3xl text-center relative border border-[#EDB0B8]">
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-6 h-6 text-[#852233]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-6 h-6 text-[#852233]" />

              {/* Oval Wine Rose Border Frame */}
              <div className="w-40 h-40 mx-auto rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-[#852233] via-[#EDB0B8] to-[#5E121E] shadow-lg mb-5">
                <img 
                  src={bride.avatar} 
                  alt={bride.fullName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              {/* Bordeaux Silk Badge for Bride */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#FBF0F1] text-[#852233] border border-[#EDB0B8] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">
                TÂN NƯƠNG
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2018] mb-2">
                {bride.fullName}
              </h3>
              
              <p className="text-[#4A3B32] text-sm sm:text-base mb-6 leading-relaxed">
                {bride.description}
              </p>
              
              {/* Nhà Gái */}
              <div className="border-t border-[#EDB0B8]/60 pt-5 text-xs sm:text-sm text-[#736154] space-y-1.5 font-sans">
                <p className="font-bold text-[#852233] tracking-[0.15em] uppercase">ĐẠI DIỆN NHÀ GÁI</p>
                <p>Thân phụ: <span className="font-serif font-bold text-[#2C2018] text-sm">{bride.father}</span></p>
                <p>Thân mẫu: <span className="font-serif font-bold text-[#2C2018] text-sm">{bride.mother}</span></p>
              </div>
            </div>

          </div>

          {/* Invitation Message Box */}
          <div className="mt-14 parchment-panel p-8 sm:p-12 rounded-3xl text-center max-w-2xl mx-auto border border-[#ECC880] shadow-lg relative">
            <CornerFlourish position="top-left" className="absolute top-3 left-3 w-7 h-7 text-[#C5A059]" />
            <CornerFlourish position="bottom-right" className="absolute bottom-3 right-3 w-7 h-7 text-[#C5A059]" />

            <InterlockingRingsIcon className="w-10 h-6 mx-auto mb-4 text-[#AA7A2B]" />
            
            <p className="font-serif italic text-[#2C2018] text-base sm:text-lg leading-relaxed">
              "{event.message}"
            </p>

            <BaroqueDivider className="w-32 h-4 mx-auto mt-4 text-[#C5A059]" />
          </div>

        </section>

        {/* ========================================================= */}
        {/* 5. PALACE VENUE & DIRECTIONS SECTION */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#F4EBE1]/70 px-4 border-y border-[#ECC880]/30">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <LaurelBranch direction="left" className="w-3.5 h-3.5" />
              <span>Thời Gian &amp; Địa Điểm</span>
              <LaurelBranch direction="right" className="w-3.5 h-3.5" />
            </div>

            <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold mt-1 mb-12">
              Tiệc Mừng Hạnh Phúc
            </h2>

            <div className="parchment-card p-8 sm:p-14 rounded-3xl shadow-xl border border-[#ECC880] max-w-2xl mx-auto text-center relative">
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-7 h-7 text-[#C5A059]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-7 h-7 text-[#C5A059]" />
              <CornerFlourish position="bottom-left" className="absolute bottom-3 left-3 w-7 h-7 text-[#C5A059]" />
              <CornerFlourish position="bottom-right" className="absolute bottom-3 right-3 w-7 h-7 text-[#C5A059]" />

              <div className="w-16 h-16 rounded-full bg-[#FAF5E8] border border-[#ECC880] flex items-center justify-center mx-auto mb-6 text-[#8C621E] shadow-sm">
                <MapPin className="w-8 h-8" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2018] mb-3">
                {event.venueName}
              </h3>
              
              <p className="text-[#4A3B32] text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto">
                {event.venueAddress}
              </p>

              {/* Ceremony & Party Dual Times */}
              <div className="grid grid-cols-2 gap-4 py-5 border-y border-[#ECC880]/70 mb-8 bg-[#FAF5E8]/60 rounded-xl px-4">
                <div className="border-r border-[#ECC880]/50 pr-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#736154] font-bold block mb-1">
                    Lễ Thành Hôn
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-[#8C621E]">
                    {event.ceremonyTime}
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#736154] font-bold block mb-1">
                    Khai Tiệc Mừng
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-[#852233]">
                    {event.partyTime}
                  </span>
                </div>
              </div>

              {/* Map Button */}
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#2C2018] text-[#FAF5E8] border border-[#ECC880] rounded-full hover:bg-[#8C621E] transition-all duration-300 shadow-xl text-xs sm:text-sm font-bold tracking-[0.15em] uppercase hover:scale-[1.02] active:scale-[0.98]"
              >
                <RoyalCompassIcon className="w-5 h-5 text-[#ECC880]" />
                <span>Xem Bản Đồ Chỉ Đường (Google Maps)</span>
              </a>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. ROYAL TIMELINE SECTION (Lịch Trình Hôn Lễ) */}
        {/* ========================================================= */}
        {timeline && timeline.length > 0 && (
          <section className="py-20 px-4 max-w-3xl mx-auto">
            
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
                <LaurelBranch direction="left" className="w-3.5 h-3.5" />
                <span>Chương Trình Hôn Lễ</span>
                <LaurelBranch direction="right" className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold">
                Lịch Trình Đón Tiếp
              </h2>
              <BaroqueDivider className="w-40 h-5 mx-auto mt-3 text-[#C5A059]" />
            </div>

            {/* Vertical Royal Gold Thread */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 sm:before:left-1/2 before:-translate-x-1/2 before:w-[2px] before:bg-gradient-to-b before:from-[#ECC880] before:via-[#C5A059] before:to-[#ECC880]">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-center justify-between sm:odd:flex-row-reverse group">
                  <div className="w-full sm:w-1/2 pl-16 sm:pl-0 sm:group-odd:pr-10 sm:group-even:pl-10">
                    <div className="parchment-card p-6 rounded-2xl shadow-sm border border-[#ECC880]/60 hover:shadow-md transition-all">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-[#FAF5E8] text-[#8C621E] border border-[#ECC880] font-bold text-xs tracking-wider mb-2 font-sans">
                        {item.time}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#2C2018]">{item.title}</h4>
                      <p className="text-[#4A3B32] text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Gold Node */}
                  <div className="absolute left-8 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#ECC880] via-[#C5A059] to-[#8C621E] border-2 border-[#FAF5E8] shadow-md flex items-center justify-center text-[#FAF5E8]">
                    <Clock className="w-4 h-4" />
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
          <section className="py-20 bg-[#FAF7F2] px-4 border-t border-[#ECC880]/30">
            <div className="max-w-5xl mx-auto">
              
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
                  <LaurelBranch direction="left" className="w-3.5 h-3.5" />
                  <span>Khoảnh Khắc Ngọt Ngào</span>
                  <LaurelBranch direction="right" className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold">
                  Album Ảnh Cưới Nghệ Thuật
                </h2>
                <BaroqueDivider className="w-44 h-5 mx-auto mt-3 text-[#C5A059]" />
              </div>

              {/* Gallery Grid with Museum Gold Foil Borders */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {media.gallery.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImg(imgUrl)}
                    className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-[#ECC880]/70 bg-[#F4EBE1]"
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
        {/* 8. HỘP MỪNG CƯỚI & VIETQR (Gửi Quà Chúc Phúc) */}
        {/* ========================================================= */}
        <section className="py-20 bg-gradient-to-b from-[#FAF7F2] via-[#F4EBE1] to-[#FAF7F2] px-4 border-y border-[#ECC880]/30">
          <div className="max-w-xl mx-auto text-center">
            
            <div className="w-16 h-16 rounded-full bg-[#FAF5E8] border border-[#ECC880] flex items-center justify-center mx-auto mb-4 text-[#8C621E] shadow-md">
              <GoldFoilGiftBox className="w-8 h-8 text-[#8C621E]" />
            </div>

            <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <LaurelBranch direction="left" className="w-3.5 h-3.5" />
              <span>Gửi Quà Chúc Phúc</span>
              <LaurelBranch direction="right" className="w-3.5 h-3.5" />
            </div>

            <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold mt-1 mb-3">
              Hộp Mừng Cưới
            </h2>

            <p className="text-[#4A3B32] text-sm sm:text-base mb-8 leading-relaxed">
              Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh to lớn cho gia đình chúng tôi. Nếu quý khách muốn gửi quà mừng trực tiếp, có thể quét mã VietQR bên dưới.
            </p>

            {/* Dual Silk Tab Switcher */}
            <div className="flex rounded-full bg-[#FAF5E8] p-1.5 shadow-inner border border-[#ECC880] mb-8 max-w-xs mx-auto">
              <button
                onClick={() => setActiveBankTab('groom')}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition duration-300 font-sans ${
                  activeBankTab === 'groom' 
                    ? 'btn-royal-gold shadow-md' 
                    : 'text-[#736154] hover:text-[#2C2018]'
                }`}
              >
                Mừng Chú Rể
              </button>
              <button
                onClick={() => setActiveBankTab('bride')}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition duration-300 font-sans ${
                  activeBankTab === 'bride' 
                    ? 'btn-royal-bordeaux shadow-md' 
                    : 'text-[#736154] hover:text-[#2C2018]'
                }`}
              >
                Mừng Cô Dâu
              </button>
            </div>

            {/* VietQR Card Styled as Fine Jewelry Box */}
            <div className="parchment-card p-8 rounded-3xl shadow-xl border border-[#ECC880] relative">
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-6 h-6 text-[#C5A059]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-6 h-6 text-[#C5A059]" />
              <CornerFlourish position="bottom-left" className="absolute bottom-3 left-3 w-6 h-6 text-[#C5A059]" />
              <CornerFlourish position="bottom-right" className="absolute bottom-3 right-3 w-6 h-6 text-[#C5A059]" />

              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-inner border border-[#ECC880]/50 mb-6 flex items-center justify-center">
                <img 
                  src={vietQrUrl} 
                  alt={`VietQR ${activePersonName}`} 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div className="space-y-2 text-sm text-[#4A3B32] font-sans">
                <p>Ngân hàng: <span className="font-bold text-[#2C2018]">{activeBank.bankName}</span></p>
                <p>Chủ tài khoản: <span className="font-bold text-[#2C2018] font-serif">{activeBank.accountName}</span></p>
                
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <span className="font-mono text-base font-bold bg-[#FAF5E8] px-4 py-1.5 rounded-xl text-[#8C621E] border border-[#ECC880]">
                    {activeBank.accountNo}
                  </span>
                  <button
                    onClick={() => copyBankNo(activeBank.accountNo)}
                    className="p-2.5 px-3.5 rounded-xl bg-[#2C2018] text-[#FAF5E8] hover:bg-[#8C621E] transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                    title="Sao chép số tài khoản"
                  >
                    {copiedBank ? <Check className="w-4 h-4 text-[#ECC880]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBank ? 'Đã sao chép!' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. FORM RSVP (Xác Nhận Tham Dự Hoàng Gia) */}
        {/* ========================================================= */}
        <section className="py-20 px-4 max-w-xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <LaurelBranch direction="left" className="w-3.5 h-3.5" />
              <span>Xác Nhận Tham Dự</span>
              <LaurelBranch direction="right" className="w-3.5 h-3.5" />
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold mt-1">
              Hồi Đáp RSVP
            </h2>
            
            <p className="text-[#4A3B32] text-sm mt-3 leading-relaxed">
              Để gia đình chúng tôi chuẩn bị tiệc đón tiếp chu đáo nhất, xin vui lòng gửi xác nhận trước ngày cưới.
            </p>
          </div>

          <form onSubmit={handleRsvpSubmit} className="parchment-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-[#ECC880] space-y-4 relative">
            <CornerFlourish position="top-left" className="absolute top-3 left-3 w-6 h-6 text-[#C5A059]" />
            <CornerFlourish position="top-right" className="absolute top-3 right-3 w-6 h-6 text-[#C5A059]" />

            {rsvpMessage && (
              <div className={`p-4 rounded-xl text-sm ${rsvpMessage.type === 'success' ? 'bg-[#FAF5E8] text-[#8C621E] border border-[#ECC880]' : 'bg-[#FBF0F1] text-[#852233] border border-[#EDB0B8]'}`}>
                {rsvpMessage.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#736154] mb-1 font-sans">
                Họ và tên của quý khách *
              </label>
              <input
                type="text"
                required
                value={rsvpForm.name}
                onChange={e => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#736154] mb-1 font-sans">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={rsvpForm.phone}
                onChange={e => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                placeholder="VD: 0912345678"
                className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#736154] mb-1 font-sans">
                  Xác nhận tham dự
                </label>
                <select
                  value={rsvpForm.attending}
                  onChange={e => setRsvpForm({ ...rsvpForm, attending: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018]"
                >
                  <option value="yes">Chắc chắn tham dự</option>
                  <option value="no">Không thể tham dự</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#736154] mb-1 font-sans">
                  Số người tham dự
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rsvpForm.guestCount}
                  onChange={e => setRsvpForm({ ...rsvpForm, guestCount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#736154] mb-1 font-sans">
                Lời nhắn gửi đến cô dâu &amp; chú rể
              </label>
              <textarea
                rows="3"
                value={rsvpForm.note}
                onChange={e => setRsvpForm({ ...rsvpForm, note: e.target.value })}
                placeholder="Ghi chú thêm cho cô dâu & chú rể..."
                className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018] resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={rsvpSubmitting}
              className="w-full py-4 btn-royal-gold rounded-xl shadow-lg uppercase text-xs font-bold tracking-[0.2em] transition-transform duration-300 disabled:opacity-50 cursor-pointer"
            >
              {rsvpSubmitting ? 'Đang Gửi Xác Nhận...' : 'Gửi Xác Nhận Ngay'}
            </button>
          </form>
        </section>

        {/* ========================================================= */}
        {/* 10. GUESTBOOK / SỔ LƯU BÚT HOÀNG GIA */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#FAF7F2] px-4 border-t border-[#ECC880]/30">
          <div className="max-w-2xl mx-auto">
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 text-[#AA7A2B] text-xs uppercase tracking-[0.25em] font-bold mb-2">
                <LaurelBranch direction="left" className="w-3.5 h-3.5" />
                <span>Sổ Lưu Bút Online</span>
                <LaurelBranch direction="right" className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#2C2018] font-bold">
                Gửi Lời Chúc Phúc
              </h2>
              <BaroqueDivider className="w-40 h-5 mx-auto mt-3 text-[#C5A059]" />
            </div>

            {/* Wish Submit Form */}
            <form onSubmit={handleWishSubmit} className="parchment-panel p-6 sm:p-8 rounded-3xl shadow-lg border border-[#ECC880] mb-12 space-y-4 relative">
              <CornerFlourish position="top-left" className="absolute top-3 left-3 w-5 h-5 text-[#C5A059]" />
              <CornerFlourish position="top-right" className="absolute top-3 right-3 w-5 h-5 text-[#C5A059]" />

              {wishMessage && (
                <div className={`p-3 rounded-xl text-sm ${wishMessage.type === 'success' ? 'bg-[#FAF5E8] text-[#8C621E] border border-[#ECC880]' : 'bg-[#FBF0F1] text-[#852233] border border-[#EDB0B8]'}`}>
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
                  className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018]"
                />
              </div>

              <div>
                <textarea
                  rows="3"
                  required
                  value={wishForm.message}
                  onChange={e => setWishForm({ ...wishForm, message: e.target.value })}
                  placeholder="Viết lời chúc yêu thương của bạn gửi đến đôi uyên ương..."
                  className="w-full px-4 py-3 rounded-xl border border-[#ECC880]/70 bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm text-[#2C2018] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={wishSubmitting}
                className="w-full py-3.5 btn-royal-bordeaux rounded-xl shadow-md uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              >
                <QuillPenIcon className="w-4 h-4 text-[#FAF5E8]" />
                <span>{wishSubmitting ? 'Đang Gửi Lời Chúc...' : 'Ký Tên & Gửi Lời Chúc'}</span>
              </button>
            </form>

            {/* Wishes Feed Styled as Parchment Notes */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {wishes.length === 0 ? (
                <p className="text-center text-[#736154] italic py-8 font-serif">
                  Hãy là người đầu tiên gửi những lời chúc tốt đẹp nhất đến tân lang và tân nương nhé!
                </p>
              ) : (
                wishes.map(item => (
                  <div key={item.id} className="parchment-card p-5 sm:p-6 rounded-2xl border border-[#ECC880]/60 shadow-sm relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <VintageRoseIcon className="w-4 h-4 text-[#852233]" />
                        <h4 className="font-serif font-bold text-[#2C2018] text-base">{item.name}</h4>
                      </div>
                      <span className="text-[11px] text-[#736154] font-sans">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-[#4A3B32] text-sm leading-relaxed font-sans">{item.message}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 11. FOOTER (Chân Trang Hoàng Gia) */}
        {/* ========================================================= */}
        <footer className="py-14 text-center bg-[#1A0D0F] text-[#FAF5E8] px-4 border-t-2 border-[#ECC880]/40 relative">
          <p className="font-cursive text-4xl sm:text-5xl text-[#ECC880] mb-2 tracking-wide">
            Thank You!
          </p>
          <BaroqueDivider className="w-32 h-4 mx-auto mb-4 text-[#C5A059]" />
          <p className="text-xs text-[#EAD8C7]/80 max-w-md mx-auto leading-relaxed mb-6 font-sans">
            Chân thành cảm ơn sự hiện diện, tình cảm và những lời chúc phúc quý báu của quý khách dành cho chúng tôi trong ngày vui trọng đại này.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-[#EAD8C7]/60 font-sans">
            <span>© 2026 Royal Wedding Invitation</span>
            <span>•</span>
            <a href="/admin" className="text-[#ECC880] hover:underline font-semibold">
              Quản Trị (/admin)
            </a>
          </div>
        </footer>

      </main>
    </div>
  );
}
