'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Save, RefreshCw, Trash2, Download, CheckCircle, 
  AlertCircle, Users, Heart, Image as ImageIcon, Music, CreditCard, 
  Calendar, Eye, LogOut, Plus, ExternalLink, Share2, Copy, Check, 
  Settings, Sparkles, QrCode, ArrowLeft, MessageSquare, ShieldCheck,
  ChevronRight, Laptop, Smartphone, FileSpreadsheet, Send, Upload, FileUp
} from 'lucide-react';

const POPULAR_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ICB', name: 'VietinBank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'VIB', name: 'VIB' },
];

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('couple');

  const [wedding, setWedding] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // New gallery input
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newPin, setNewPin] = useState('');

  // Guest invitation link generator state
  const [guestListInput, setGuestListInput] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // File input refs for uploading photos from computer
  const groomAvatarRef = useRef(null);
  const brideAvatarRef = useRef(null);
  const coverImageRef = useRef(null);
  const galleryImageRef = useRef(null);
  const csvImportRef = useRef(null);

  // Auto login check from localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem('wedding_admin_pin');
    if (savedPin) {
      verifyPin(savedPin);
    }
  }, []);

  // Keyboard shortcut Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isAuthenticated && wedding) {
          handleSaveWedding();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, wedding, pin, newPin]);

  const verifyPin = async (inputPin) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPin(inputPin);
        localStorage.setItem('wedding_admin_pin', inputPin);
        loadAdminData();
      } else {
        setLoginError('Mã PIN không chính xác. Vui lòng kiểm tra lại!');
        localStorage.removeItem('wedding_admin_pin');
      }
    } catch (err) {
      setLoginError('Không thể kết nối đến máy chủ xác thực.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    verifyPin(pin);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    localStorage.removeItem('wedding_admin_pin');
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resWedding, resRsvps, resWishes] = await Promise.all([
        fetch('/api/wedding').then(r => r.json()),
        fetch('/api/rsvp').then(r => r.json()),
        fetch('/api/guestbook').then(r => r.json())
      ]);

      if (resWedding.success) setWedding(resWedding.data);
      if (resRsvps.success) setRsvps(resRsvps.data);
      if (resWishes.success) setWishes(resWishes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle local file upload to Base64
  const handleLocalImageUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Import guest list from local CSV file
  const handleCsvImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        // If CSV has header, skip it or take first column
        const names = lines.map(line => {
          const parts = line.split(',');
          return parts[0].replace(/^["']|["']$/g, '').trim();
        }).filter(n => n.toLowerCase() !== 'tên' && n.toLowerCase() !== 'họ và tên' && n.toLowerCase() !== 'stt');
        
        const combined = names.join('\n');
        setGuestListInput(combined);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setGeneratedLinks(names.map(name => ({
          name,
          link: `${origin}/?to=${encodeURIComponent(name)}`
        })));
        setStatusMsg({ type: 'success', text: `Đã nạp ${names.length} khách mời từ file thành công!` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Save all changes
  const handleSaveWedding = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/wedding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          data: wedding,
          newPin: newPin.trim() ? newPin.trim() : undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMsg({ type: 'success', text: 'Đã lưu và đồng bộ toàn bộ dữ liệu thành công!' });
        if (newPin.trim()) {
          setPin(newPin.trim());
          localStorage.setItem('wedding_admin_pin', newPin.trim());
          setNewPin('');
        }
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ type: 'error', text: result.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Có lỗi xảy ra khi lưu dữ liệu!' });
    } finally {
      setLoading(false);
    }
  };

  // Reset RSVPs & Wishes for new wedding
  const handleResetForNewWedding = async () => {
    const confirm = window.confirm(
      'XÁC NHẬN BẮT ĐẦU ĐÁM CƯỚI MỚI:\n\nThao tác này sẽ xóa toàn bộ danh sách RSVP và lời chúc của đám cưới cũ để bắt đầu cho sự kiện tiếp theo.\n\nBạn có chắc chắn muốn thực hiện không?'
    );
    if (!confirm) return;

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMsg({ type: 'success', text: 'Đã thiết lập lại dữ liệu thành công cho đám cưới mới!' });
        loadAdminData();
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (err) {
      alert('Không thể thực hiện reset!');
    }
  };

  // Delete individual wish
  const handleDeleteWish = async (id) => {
    if (!window.confirm('Xóa lời chúc này khỏi sổ lưu bút?')) return;
    try {
      const res = await fetch(`/api/guestbook?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setWishes(wishes.filter(w => w.id !== id));
      }
    } catch (err) {
      alert('Lỗi khi xóa lời chúc');
    }
  };

  // Add photo to gallery
  const handleAddGalleryImage = (urlToAdd) => {
    const targetUrl = (urlToAdd || newGalleryUrl).trim();
    if (!targetUrl) return;
    const currentList = wedding.media.gallery || [];
    setWedding({
      ...wedding,
      media: {
        ...wedding.media,
        gallery: [...currentList, targetUrl]
      }
    });
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index) => {
    const updated = [...wedding.media.gallery];
    updated.splice(index, 1);
    setWedding({
      ...wedding,
      media: {
        ...wedding.media,
        gallery: updated
      }
    });
  };

  // Export RSVPs to CSV
  const handleExportCsv = () => {
    if (rsvps.length === 0) return alert('Chưa có khách nào đăng ký!');
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'STT,Họ và tên,Số điện thoại,Trạng thái,Số người đi cùng,Ghi chú,Thời gian\n';

    const sanitizeCsvCell = (val) => {
      let str = String(val ?? '');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = "'" + str;
      }
      return '"' + str.replace(/"/g, '""') + '"';
    };

    rsvps.forEach((r, idx) => {
      csvContent += `${sanitizeCsvCell(idx + 1)},${sanitizeCsvCell(r.name)},${sanitizeCsvCell(r.phone || '—')},${sanitizeCsvCell(r.attending === 'yes' ? 'Tham dự' : 'Không tham dự')},${sanitizeCsvCell(r.guestCount)},${sanitizeCsvCell(r.note || '—')},${sanitizeCsvCell(new Date(r.createdAt).toLocaleString('vi-VN'))}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_rsvp_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate personalized invitation links
  const handleGenerateLinks = () => {
    if (!guestListInput.trim()) return;
    const lines = guestListInput.split('\n').map(l => l.trim()).filter(Boolean);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const results = lines.map(name => {
      const link = `${origin}/?to=${encodeURIComponent(name)}`;
      return { name, link };
    });
    setGeneratedLinks(results);
  };

  const handleCopyLink = (link, idx) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkIndex(idx);
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  const handleCopyAllLinks = () => {
    if (generatedLinks.length === 0) return;
    const all = generatedLinks.map(g => `${g.name}: ${g.link}`).join('\n');
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // =========================================================================
  // 1. MODERN SAAS AUTHENTICATION GATE (Minimalist & Precision)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 text-slate-800 font-sans antialiased">
        {/* Top Navbar Brand */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              W
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              Wedding Suite <span className="text-slate-400 font-normal">Workspace</span>
            </span>
          </div>

          <a 
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang thiệp khách mời</span>
          </a>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-sm mx-auto my-auto">
          <div className="bg-white p-7 sm:p-8 rounded-xl border border-slate-200/90 shadow-sm">
            <div className="mb-6">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 mb-3">
                Console v2.4
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Đăng nhập quản trị
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Nhập mã PIN bảo mật để cấu hình thiệp cưới và quản lý danh sách khách mời.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mã PIN xác thực
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Nhập mã PIN bảo mật"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer select-none"
                  >
                    {showPin ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Truy Cập Bảng Điều Khiển</span>
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Mã mặc định hệ thống:</span>
                <button
                  type="button"
                  onClick={() => setPin('admin123')}
                  className="font-mono text-slate-700 hover:text-slate-900 underline underline-offset-2 font-medium cursor-pointer"
                >
                  admin123
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-400 py-2">
          © 2026 Wedding Suite Enterprise • End-to-end Wedding Management System
        </div>
      </div>
    );
  }

  // Loading State
  if (!wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-600">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-900 mb-3" />
        <p className="text-xs font-medium text-slate-500">Đang đồng bộ dữ liệu thiệp cưới...</p>
      </div>
    );
  }

  const attendingCount = rsvps.filter(r => r.attending === 'yes').reduce((sum, r) => sum + (r.guestCount || 1), 0);

  // =========================================================================
  // 2. MODERN SAAS APPLICATION WORKSPACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-28">
      
      {/* SaaS Application Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Left: Breadcrumbs & Project Status */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              W
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-900 tracking-tight">Studio</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium tracking-tight truncate max-w-[180px] sm:max-w-none">
                {wedding.groom.shortName} &amp; {wedding.bride.shortName}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1.5 transition shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Xem Thiệp Khách</span>
            </a>

            <button
              onClick={handleSaveWedding}
              disabled={loading}
              className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              <span className="hidden md:inline text-[10px] text-slate-400 pl-1 font-mono">⌘S</span>
            </button>

            <button
              onClick={handleLogout}
              className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              title="Đăng xuất khỏi bảng điều khiển"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Status Notification Toast */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-xs font-medium flex items-center space-x-2.5 border ${
            statusMsg.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-800' 
              : 'bg-red-600 text-white border-red-700'
          }`}>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Navigation Underline Tab Strip (Vercel / Linear Style) */}
        <div className="border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 sm:space-x-2">
            {[
              { id: 'couple', label: 'Cô Dâu & Chú Rể', icon: Heart },
              { id: 'event', label: 'Thời Gian & Địa Điểm', icon: Calendar },
              { id: 'media', label: 'Ảnh & Nhạc Nền', icon: ImageIcon },
              { id: 'bank', label: 'STK & VietQR', icon: CreditCard },
              { id: 'links', label: 'Tạo Link Mời Riêng', icon: Share2, badge: 'Hot' },
              { id: 'rsvps', label: 'Khách RSVP', icon: Users, count: rsvps.length },
              { id: 'reset', label: 'Cài Đặt & Reset', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3.5 text-xs font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-slate-900 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CÔ DÂU & CHÚ RỂ */}
        {/* ========================================================= */}
        {activeTab === 'couple' && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Chú Rể */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900">Thông tin Chú Rể</h2>
                  <p className="text-xs text-slate-500">Đại diện họ nhà Trai trên thiệp cưới</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Tân Lang
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Họ và tên đầy đủ</label>
                <input
                  type="text"
                  value={wedding.groom.fullName}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, fullName: e.target.value }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên thường gọi (Hiển thị nổi bật)</label>
                <input
                  type="text"
                  value={wedding.groom.shortName}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, shortName: e.target.value }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thân phụ (Bố)</label>
                  <input
                    type="text"
                    value={wedding.groom.father}
                    onChange={e => setWedding({
                      ...wedding,
                      groom: { ...wedding.groom, father: e.target.value }
                    })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thân mẫu (Mẹ)</label>
                  <input
                    type="text"
                    value={wedding.groom.mother}
                    onChange={e => setWedding({
                      ...wedding,
                      groom: { ...wedding.groom, mother: e.target.value }
                    })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Ảnh chân dung Chú Rể</label>
                  <input 
                    type="file" 
                    ref={groomAvatarRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleLocalImageUpload(e, (dataUrl) => {
                      setWedding({ ...wedding, groom: { ...wedding.groom, avatar: dataUrl } });
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => groomAvatarRef.current?.click()}
                    className="text-[11px] text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                </div>
                <div className="flex space-x-3 items-center">
                  <input
                    type="text"
                    value={wedding.groom.avatar}
                    onChange={e => setWedding({
                      ...wedding,
                      groom: { ...wedding.groom, avatar: e.target.value }
                    })}
                    placeholder="URL ảnh hoặc bấm tải lên..."
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {wedding.groom.avatar && (
                    <img 
                      src={wedding.groom.avatar} 
                      alt="Avatar Chú Rể" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" 
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lời ngỏ / Giới thiệu</label>
                <textarea
                  rows={2}
                  value={wedding.groom.description}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, description: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Cô Dâu */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900">Thông tin Cô Dâu</h2>
                  <p className="text-xs text-slate-500">Đại diện họ nhà Gái trên thiệp cưới</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Tân Nương
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Họ và tên đầy đủ</label>
                <input
                  type="text"
                  value={wedding.bride.fullName}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, fullName: e.target.value }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên thường gọi (Hiển thị nổi bật)</label>
                <input
                  type="text"
                  value={wedding.bride.shortName}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, shortName: e.target.value }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thân phụ (Bố)</label>
                  <input
                    type="text"
                    value={wedding.bride.father}
                    onChange={e => setWedding({
                      ...wedding,
                      bride: { ...wedding.bride, father: e.target.value }
                    })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thân mẫu (Mẹ)</label>
                  <input
                    type="text"
                    value={wedding.bride.mother}
                    onChange={e => setWedding({
                      ...wedding,
                      bride: { ...wedding.bride, mother: e.target.value }
                    })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Ảnh chân dung Cô Dâu</label>
                  <input 
                    type="file" 
                    ref={brideAvatarRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleLocalImageUpload(e, (dataUrl) => {
                      setWedding({ ...wedding, bride: { ...wedding.bride, avatar: dataUrl } });
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => brideAvatarRef.current?.click()}
                    className="text-[11px] text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                </div>
                <div className="flex space-x-3 items-center">
                  <input
                    type="text"
                    value={wedding.bride.avatar}
                    onChange={e => setWedding({
                      ...wedding,
                      bride: { ...wedding.bride, avatar: e.target.value }
                    })}
                    placeholder="URL ảnh hoặc bấm tải lên..."
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {wedding.bride.avatar && (
                    <img 
                      src={wedding.bride.avatar} 
                      alt="Avatar Cô Dâu" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" 
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lời ngỏ / Giới thiệu</label>
                <textarea
                  rows={2}
                  value={wedding.bride.description}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, description: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: THỜI GIAN & ĐỊA ĐIỂM */}
        {/* ========================================================= */}
        {activeTab === 'event' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-5 max-w-3xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Chi tiết Hôn Lễ &amp; Tiệc Mừng</h2>
              <p className="text-xs text-slate-500">Cấu hình thời gian, bản đồ chỉ đường và thông điệp gửi khách</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề buổi lễ</label>
              <input
                type="text"
                value={wedding.event.title}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, title: e.target.value }
                })}
                placeholder="VD: LỄ THÀNH HÔN hoặc LỄ VU QUY"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngày giờ dương lịch (Cho bộ đếm)</label>
                <input
                  type="datetime-local"
                  value={wedding.event.weddingDate ? wedding.event.weddingDate.slice(0, 16) : ''}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, weddingDate: e.target.value }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngày âm lịch</label>
                <input
                  type="text"
                  value={wedding.event.lunarDate}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, lunarDate: e.target.value }
                  })}
                  placeholder="VD: 04 Tháng 11 Năm Bính Ngọ"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Giờ làm lễ thành hôn</label>
                <input
                  type="text"
                  value={wedding.event.ceremonyTime}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, ceremonyTime: e.target.value }
                  })}
                  placeholder="VD: 11:00"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Giờ khai tiệc chiêu đãi</label>
                <input
                  type="text"
                  value={wedding.event.partyTime}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, partyTime: e.target.value }
                  })}
                  placeholder="VD: 11:30"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tên địa điểm / Trung tâm tiệc cưới</label>
              <input
                type="text"
                value={wedding.event.venueName}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, venueName: e.target.value }
                })}
                placeholder="VD: Trung tâm Hội nghị Quốc gia"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ cụ thể</label>
              <input
                type="text"
                value={wedding.event.venueAddress}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, venueAddress: e.target.value }
                })}
                placeholder="VD: Số 72 Quán Sứ, Hoàn Kiếm, Hà Nội"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Đường dẫn Google Maps</label>
              <input
                type="text"
                value={wedding.event.mapUrl}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, mapUrl: e.target.value }
                })}
                placeholder="https://maps.google.com/..."
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lời ngỏ / Thông điệp mời</label>
              <textarea
                rows={3}
                value={wedding.event.message}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, message: e.target.value }
                })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ẢNH & NHẠC NỀN */}
        {/* ========================================================= */}
        {activeTab === 'media' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 max-w-4xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Quản Lý Media &amp; Album</h2>
              <p className="text-xs text-slate-500">Tùy biến ảnh bìa chính, file nhạc nền MP3 và bộ sưu tập ảnh cưới</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Ảnh bìa chính (Hero Arch Photo)</label>
                <input 
                  type="file" 
                  ref={coverImageRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleLocalImageUpload(e, (dataUrl) => {
                    setWedding({ ...wedding, media: { ...wedding.media, coverImage: dataUrl } });
                  })}
                />
                <button
                  type="button"
                  onClick={() => coverImageRef.current?.click()}
                  className="text-[11px] text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh từ máy tính</span>
                </button>
              </div>
              <div className="flex space-x-3 items-center">
                <input
                  type="text"
                  value={wedding.media.coverImage}
                  onChange={e => setWedding({
                    ...wedding,
                    media: { ...wedding.media, coverImage: e.target.value }
                  })}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {wedding.media.coverImage && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                    <img src={wedding.media.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Đường dẫn file nhạc nền MP3</label>
              <input
                type="text"
                value={wedding.media.musicUrl}
                onChange={e => setWedding({
                  ...wedding,
                  media: { ...wedding.media, musicUrl: e.target.value }
                })}
                placeholder="https://.../music.mp3"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Gallery Images List */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-slate-700">
                  Album Ảnh Cưới ({wedding.media.gallery?.length || 0} ảnh)
                </label>
                <input 
                  type="file" 
                  ref={galleryImageRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleLocalImageUpload(e, (dataUrl) => {
                    handleAddGalleryImage(dataUrl);
                  })}
                />
                <button
                  type="button"
                  onClick={() => galleryImageRef.current?.click()}
                  className="text-[11px] text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh lên album</span>
                </button>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  placeholder="Dán link ảnh cần thêm vào album..."
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleAddGalleryImage()}
                  className="h-9 px-4 bg-slate-900 text-white font-medium rounded-lg text-xs flex items-center space-x-1.5 hover:bg-slate-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm URL</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wedding.media.gallery?.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100 shadow-2xs">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STK & VIETQR */}
        {/* ========================================================= */}
        {activeTab === 'bank' && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Chú Rể Bank */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">Tài khoản Chú Rể</h3>
                  <p className="text-xs text-slate-500">Mã VietQR mừng chú rể</p>
                </div>
                <QrCode className="w-4 h-4 text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngân hàng thụ hưởng</label>
                <select
                  value={wedding.groom.bank.bankCode}
                  onChange={e => {
                    const found = POPULAR_BANKS.find(b => b.code === e.target.value);
                    setWedding({
                      ...wedding,
                      groom: {
                        ...wedding.groom,
                        bank: {
                          ...wedding.groom.bank,
                          bankCode: e.target.value,
                          bankName: found ? found.name : e.target.value
                        }
                      }
                    });
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  value={wedding.groom.bank.accountNo}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: {
                      ...wedding.groom,
                      bank: { ...wedding.groom.bank, accountNo: e.target.value }
                    }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={wedding.groom.bank.accountName}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: {
                      ...wedding.groom,
                      bank: { ...wedding.groom.bank, accountName: e.target.value.toUpperCase() }
                    }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* VietQR Preview */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-4">
                <div className="w-24 h-24 rounded-lg border border-slate-200 p-1.5 bg-white shrink-0">
                  <img
                    src={`https://img.vietqr.io/image/${wedding.groom.bank.bankCode}-${wedding.groom.bank.accountNo}-compact2.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(wedding.groom.shortName)}&accountName=${encodeURIComponent(wedding.groom.bank.accountName)}`}
                    alt="QR Chú Rể"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-900 block">Mã VietQR tự động</span>
                  <p>Hệ thống tự động đồng bộ theo chuẩn Napas 24/7 khi khách quét mã.</p>
                </div>
              </div>
            </div>

            {/* Cô Dâu Bank */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">Tài khoản Cô Dâu</h3>
                  <p className="text-xs text-slate-500">Mã VietQR mừng cô dâu</p>
                </div>
                <QrCode className="w-4 h-4 text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngân hàng thụ hưởng</label>
                <select
                  value={wedding.bride.bank.bankCode}
                  onChange={e => {
                    const found = POPULAR_BANKS.find(b => b.code === e.target.value);
                    setWedding({
                      ...wedding,
                      bride: {
                        ...wedding.bride,
                        bank: {
                          ...wedding.bride.bank,
                          bankCode: e.target.value,
                          bankName: found ? found.name : e.target.value
                        }
                      }
                    });
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  value={wedding.bride.bank.accountNo}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: {
                      ...wedding.bride,
                      bank: { ...wedding.bride.bank, accountNo: e.target.value }
                    }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={wedding.bride.bank.accountName}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: {
                      ...wedding.bride,
                      bank: { ...wedding.bride.bank, accountName: e.target.value.toUpperCase() }
                    }
                  })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* VietQR Preview */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-4">
                <div className="w-24 h-24 rounded-lg border border-slate-200 p-1.5 bg-white shrink-0">
                  <img
                    src={`https://img.vietqr.io/image/${wedding.bride.bank.bankCode}-${wedding.bride.bank.accountNo}-compact2.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(wedding.bride.shortName)}&accountName=${encodeURIComponent(wedding.bride.bank.accountName)}`}
                    alt="QR Cô Dâu"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-900 block">Mã VietQR tự động</span>
                  <p>Hệ thống tự động đồng bộ theo chuẩn Napas 24/7 khi khách quét mã.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TẠO LINK MỜI RIÊNG TỪNG KHÁCH */}
        {/* ========================================================= */}
        {activeTab === 'links' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Bộ Tạo Link Thiệp Cá Nhân Hóa (Dynamic Link Generator)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập danh sách tên khách mời (mỗi dòng một người). Hệ thống sẽ sinh đường dẫn riêng hiển thị tên đích danh từ ngoài phong bì tới mẫu xác nhận RSVP.
                </p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                1-Click Zalo Share
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Danh sách khách mời (Mỗi người một dòng)
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="file" 
                    ref={csvImportRef} 
                    className="hidden" 
                    accept=".csv,.txt"
                    onChange={handleCsvImport}
                  />
                  <button
                    type="button"
                    onClick={() => csvImportRef.current?.click()}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <FileUp className="w-3 h-3 text-slate-500" />
                    <span>Nhập từ file CSV/TXT</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={guestListInput}
                onChange={e => setGuestListInput(e.target.value)}
                placeholder={"Ví dụ:\nAnh Nam (Đồng nghiệp)\nGia đình Bác Hùng\nBạn Lan & Người thương\nChú Ba"}
                className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateLinks}
                  className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sinh Danh Sách Link Mời</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = "Anh Nam (Đồng nghiệp)\nGia đình Bác Hùng\nBạn Lan & Người thương\nChú Ba";
                    setGuestListInput(sample);
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    setGeneratedLinks(sample.split('\n').map(name => ({
                      name,
                      link: `${origin}/?to=${encodeURIComponent(name)}`
                    })));
                  }}
                  className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  Nạp danh sách mẫu
                </button>
              </div>
            </div>

            {generatedLinks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Đã tạo {generatedLinks.length} đường link mời:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAllLinks}
                    className="text-xs text-slate-900 font-medium hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? 'Đã sao chép toàn bộ!' : 'Sao chép toàn bộ danh sách'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <tr>
                        <th className="py-2.5 px-3">Tên Khách Mời</th>
                        <th className="py-2.5 px-3">Link Cá Nhân Hóa</th>
                        <th className="py-2.5 px-3 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {generatedLinks.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                            {item.link}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.link, idx)}
                              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                copiedLinkIndex === idx
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {copiedLinkIndex === idx ? 'Đã chép' : 'Sao chép'}
                            </button>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 px-2.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium inline-flex items-center space-x-1"
                            >
                              <span>Xem</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                            <a
                              href="https://zalo.me"
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                const groomName = wedding?.groom?.shortName || 'chúng tôi';
                                const brideName = wedding?.bride?.shortName || '';
                                const couple = brideName ? `${groomName} & ${brideName}` : groomName;
                                navigator.clipboard.writeText(`Trân trọng kính mời ${item.name} đến tham dự lễ thành hôn của ${couple} tại: ${item.link}`);
                              }}
                              className="h-7 px-2.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-medium inline-flex items-center space-x-1"
                              title="Tự động copy lời mời kèm link và mở Zalo"
                            >
                              <Send className="w-3 h-3" />
                              <span>Gửi Zalo</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: KHÁCH RSVP & LỜI CHÚC */}
        {/* ========================================================= */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6">
            
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium uppercase block">Tổng phản hồi</span>
                <span className="text-2xl font-semibold text-slate-900 mt-1 block tracking-tight">{rsvps.length}</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium uppercase block">Dự kiến tham dự</span>
                <span className="text-2xl font-semibold text-emerald-600 mt-1 block tracking-tight">{attendingCount} người</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 font-medium uppercase block">Lời chúc đã gửi</span>
                <span className="text-2xl font-semibold text-slate-900 mt-1 block tracking-tight">{wishes.length}</span>
              </div>
            </div>

            {/* RSVP Data Table */}
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">Danh Sách Khách Xác Nhận (RSVP)</h3>
                  <p className="text-xs text-slate-500">Phản hồi tham dự thời gian thực từ khách mời</p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất File CSV / Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Họ và tên</th>
                      <th className="py-2.5 px-4">Số điện thoại</th>
                      <th className="py-2.5 px-4">Trạng thái</th>
                      <th className="py-2.5 px-4">Số người</th>
                      <th className="py-2.5 px-4">Ghi chú</th>
                      <th className="py-2.5 px-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rsvps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                          Chưa có phản hồi nào từ khách mời.
                        </td>
                      </tr>
                    ) : (
                      rsvps.map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                          <td className="py-3 px-4 font-mono">{r.phone || '—'}</td>
                          <td className="py-3 px-4">
                            {r.attending === 'yes' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Tham dự
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                Không tham dự
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium">{r.guestCount} người</td>
                          <td className="py-3 px-4 italic text-slate-500">{r.note || '—'}</td>
                          <td className="py-3 px-4 text-slate-400">{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guestbook Messages */}
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">Quản Lý Sổ Lưu Bút Online</h3>
                <p className="text-xs text-slate-500">Các lời chúc của khách gửi tới cô dâu chú rể</p>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {wishes.length === 0 ? (
                  <p className="text-slate-400 text-xs italic py-4 text-center">Chưa có lời chúc nào.</p>
                ) : (
                  wishes.map(w => (
                    <div key={w.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 text-xs">{w.name}</span>
                          <span className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{w.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWish(w.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                        title="Xóa lời chúc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: CÀI ĐẶT & RESET ĐÁM CƯỚI MỚI */}
        {/* ========================================================= */}
        {activeTab === 'reset' && (
          <div className="space-y-6 max-w-2xl">
            
            {/* Change Admin PIN */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">Bảo Mật &amp; Đổi Mã PIN Quản Trị</h3>
                <p className="text-xs text-slate-500">Thay đổi mã PIN bảo vệ không gian làm việc này</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã PIN mới</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="Nhập mã PIN mới (VD: 8888)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveWedding}
                className="h-8 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer"
              >
                Cập Nhật Mã PIN
              </button>
            </div>

            {/* Danger Zone: Reset for New Wedding */}
            <div className="bg-white p-6 rounded-xl border border-red-200 shadow-2xs space-y-3">
              <div className="border-b border-red-100 pb-3">
                <h2 className="text-sm font-semibold tracking-tight text-red-900 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Khu Vực Nguy Hiểm (Danger Zone)</span>
                </h2>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  Khi đám cưới hiện tại đã hoàn tất và bạn muốn bàn giao ứng dụng cho một cặp đôi khác:
                  Nhấn nút bên dưới để <strong>xóa sạch toàn bộ dữ liệu phản hồi RSVP và sổ lưu bút cũ</strong>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetForNewWedding}
                  className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Xóa Dữ Liệu Cũ &amp; Bắt Đầu Sự Kiện Mới</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
