'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, Save, RefreshCw, Trash2, Download, CheckCircle, 
  AlertCircle, Users, Heart, Image as ImageIcon, Music, CreditCard, 
  Calendar, Eye, LogOut, Plus, ExternalLink, Share2, Copy, Check, Link as LinkIcon
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

  // Auto login check from localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem('wedding_admin_pin');
    if (savedPin) {
      verifyPin(savedPin);
    }
  }, []);

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
        setLoginError('Mã PIN không đúng!');
        localStorage.removeItem('wedding_admin_pin');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối máy chủ!');
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
        setStatusMsg({ type: 'success', text: 'Đã lưu toàn bộ thay đổi thành công!' });
        if (newPin.trim()) {
          setPin(newPin.trim());
          localStorage.setItem('wedding_admin_pin', newPin.trim());
          setNewPin('');
        }
      } else {
        setStatusMsg({ type: 'error', text: result.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Có lỗi xảy ra khi lưu!' });
    } finally {
      setLoading(false);
    }
  };

  // Reset RSVPs & Wishes for new wedding
  const handleResetForNewWedding = async () => {
    const confirm = window.confirm(
      'CẢNH BÁO: Thao tác này sẽ XÓA SẠCH toàn bộ danh sách khách RSVP và Lời chúc của đám cưới cũ để chuẩn bị cho Đám Cưới Mới. Bạn có chắc chắn không?'
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
        alert(result.message);
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
    if (!window.confirm('Bạn muốn xóa lời chúc này?')) return;
    try {
      const res = await fetch(`/api/guestbook?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setWishes(wishes.filter(w => w.id !== id));
      }
    } catch (err) {
      alert('Lỗi khi xóa');
    }
  };

  // Add photo to gallery
  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    const currentList = wedding.media.gallery || [];
    setWedding({
      ...wedding,
      media: {
        ...wedding.media,
        gallery: [...currentList, newGalleryUrl.trim()]
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

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl border border-gold-300">
          <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4 text-gold-700">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-center text-stone-900 mb-1">Quản Trị Thiệp Cưới</h1>
          <p className="text-center text-xs text-stone-500 mb-6">Nhập mã PIN để truy cập bảng điều khiển</p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Mã PIN Quản Trị</label>
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Mặc định: admin123"
                className="w-full px-4 py-3 rounded-xl border border-gold-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-700 text-white font-bold rounded-xl shadow hover:shadow-lg transition text-sm uppercase tracking-wider"
            >
              Đăng Nhập
            </button>

            <p className="text-center text-[11px] text-stone-400 mt-2">
              (Gợi ý mã PIN mặc định khởi tạo: <span className="font-mono text-stone-600">admin123</span>)
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <RefreshCw className="w-8 h-8 text-gold-600 animate-spin" />
      </div>
    );
  }

  const attendingCount = rsvps.filter(r => r.attending === 'yes').reduce((sum, r) => sum + (r.guestCount || 1), 0);

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-stone-800 font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gold-200 px-4 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gold-600 text-white flex items-center justify-center font-bold">
              💍
            </div>
            <div>
              <h1 className="font-serif font-bold text-stone-900 text-base leading-tight">Admin Thiệp Cưới</h1>
              <span className="text-[11px] text-emerald-600 font-medium">● Đang hoạt động ({wedding.groom.shortName} & {wedding.bride.shortName})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Xem Thiệp Mời</span>
            </a>

            <button
              onClick={handleSaveWedding}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Status Alert Notification */}
      {statusMsg && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-2xl text-sm flex items-center space-x-2 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          {[
            { id: 'couple', label: '1. Cô Dâu & Chú Rể', icon: Heart },
            { id: 'event', label: '2. Thời Gian & Địa Điểm', icon: Calendar },
            { id: 'media', label: '3. Ảnh & Âm Nhạc', icon: ImageIcon },
            { id: 'bank', label: '4. STK Mừng Cưới (VietQR)', icon: CreditCard },
            { id: 'links', label: '5. Tạo Link Mời Riêng', icon: Share2 },
            { id: 'rsvps', label: `6. Khách RSVP (${rsvps.length})`, icon: Users },
            { id: 'reset', label: '⚡ Đám Cưới Mới', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 shrink-0 transition ${
                  activeTab === tab.id
                    ? 'bg-stone-900 text-white shadow'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CÔ DÂU & CHÚ RỂ */}
        {/* ========================================================= */}
        {activeTab === 'couple' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chú Rể */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Thông Tin Chú Rể</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-sans">Nhà Trai</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Họ và tên đầy đủ</label>
                <input
                  type="text"
                  value={wedding.groom.fullName}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, fullName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tên thường gọi (Hiển thị thiệp)</label>
                <input
                  type="text"
                  value={wedding.groom.shortName}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, shortName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Thân phụ (Bố)</label>
                  <input
                    type="text"
                    value={wedding.groom.father}
                    onChange={e => setWedding({
                      ...wedding,
                      groom: { ...wedding.groom, father: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Thân mẫu (Mẹ)</label>
                  <input
                    type="text"
                    value={wedding.groom.mother}
                    onChange={e => setWedding({
                      ...wedding,
                      groom: { ...wedding.groom, mother: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Ảnh đại diện</label>
                <input
                  type="text"
                  value={wedding.groom.avatar}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, avatar: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Mô tả ngắn / Lời giới thiệu</label>
                <textarea
                  rows="2"
                  value={wedding.groom.description}
                  onChange={e => setWedding({
                    ...wedding,
                    groom: { ...wedding.groom, description: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                ></textarea>
              </div>
            </div>

            {/* Cô Dâu */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Thông Tin Cô Dâu</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-sans">Nhà Gái</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Họ và tên đầy đủ</label>
                <input
                  type="text"
                  value={wedding.bride.fullName}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, fullName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tên thường gọi (Hiển thị thiệp)</label>
                <input
                  type="text"
                  value={wedding.bride.shortName}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, shortName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Thân phụ (Bố)</label>
                  <input
                    type="text"
                    value={wedding.bride.father}
                    onChange={e => setWedding({
                      ...wedding,
                      bride: { ...wedding.bride, father: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Thân mẫu (Mẹ)</label>
                  <input
                    type="text"
                    value={wedding.bride.mother}
                    onChange={e => setWedding({
                      ...wedding,
                      bride: { ...wedding.bride, mother: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Ảnh đại diện</label>
                <input
                  type="text"
                  value={wedding.bride.avatar}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, avatar: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Mô tả ngắn / Lời giới thiệu</label>
                <textarea
                  rows="2"
                  value={wedding.bride.description}
                  onChange={e => setWedding({
                    ...wedding,
                    bride: { ...wedding.bride, description: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: THỜI GIAN & ĐỊA ĐIỂM */}
        {/* ========================================================= */}
        {activeTab === 'event' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-5 max-w-3xl mx-auto">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
              Thông Tin Sự Kiện & Địa Điểm Tổ Chức
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tiêu đề buổi lễ</label>
              <input
                type="text"
                value={wedding.event.title}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, title: e.target.value }
                })}
                placeholder="VD: LỄ THÀNH HÔN hoặc LỄ VU QUY"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Ngày giờ dương lịch (Cho bộ đếm)</label>
                <input
                  type="datetime-local"
                  value={wedding.event.weddingDate ? wedding.event.weddingDate.slice(0, 16) : ''}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, weddingDate: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Ngày âm lịch (Dạng chữ)</label>
                <input
                  type="text"
                  value={wedding.event.lunarDate}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, lunarDate: e.target.value }
                  })}
                  placeholder="VD: 04 Tháng 11 Năm Bính Ngọ"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Giờ làm lễ thành hôn</label>
                <input
                  type="text"
                  value={wedding.event.ceremonyTime}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, ceremonyTime: e.target.value }
                  })}
                  placeholder="VD: 11:00"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Giờ khai tiệc chiêu đãi</label>
                <input
                  type="text"
                  value={wedding.event.partyTime}
                  onChange={e => setWedding({
                    ...wedding,
                    event: { ...wedding.event, partyTime: e.target.value }
                  })}
                  placeholder="VD: 11:30"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tên địa điểm / Trung tâm tiệc cưới</label>
              <input
                type="text"
                value={wedding.event.venueName}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, venueName: e.target.value }
                })}
                placeholder="VD: Trung tâm Tiệc cưới Trống Đồng Palace"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                value={wedding.event.venueAddress}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, venueAddress: e.target.value }
                })}
                placeholder="VD: Số 72 Quán Sứ, Hoàn Kiếm, Hà Nội"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Bản đồ Google Maps</label>
              <input
                type="text"
                value={wedding.event.mapUrl}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, mapUrl: e.target.value }
                })}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Lời ngỏ / Thông điệp mời</label>
              <textarea
                rows="3"
                value={wedding.event.message}
                onChange={e => setWedding({
                  ...wedding,
                  event: { ...wedding.event, message: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              ></textarea>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ẢNH & ÂM NHẠC */}
        {/* ========================================================= */}
        {activeTab === 'media' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6 max-w-4xl mx-auto">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
              Quản Lý Hình Ảnh & Nhạc Nền
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Ảnh Bìa Chính (Cover Hero)</label>
              <input
                type="text"
                value={wedding.media.coverImage}
                onChange={e => setWedding({
                  ...wedding,
                  media: { ...wedding.media, coverImage: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm mb-2"
              />
              {wedding.media.coverImage && (
                <div className="w-48 h-28 rounded-xl overflow-hidden border border-stone-200">
                  <img src={wedding.media.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Bài Hát Nhạc Nền (.mp3)</label>
              <input
                type="text"
                value={wedding.media.musicUrl}
                onChange={e => setWedding({
                  ...wedding,
                  media: { ...wedding.media, musicUrl: e.target.value }
                })}
                placeholder="https://.../music.mp3"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            {/* Gallery Images List */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Album Ảnh Cưới</label>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  placeholder="Dán link ảnh muốn thêm vào album..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2.5 bg-stone-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Ảnh</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wedding.media.gallery?.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 h-32 bg-stone-100">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STK MỪNG CƯỚI & VIETQR */}
        {/* ========================================================= */}
        {activeTab === 'bank' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chú Rể Bank */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="font-serif font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">
                Tài Khoản Mừng Chú Rể
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Ngân hàng</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Số tài khoản</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              {/* VietQR Preview */}
              <div className="pt-2 border-t border-stone-100 text-center">
                <span className="text-xs text-stone-400 block mb-2">Xem trước mã VietQR tự động:</span>
                <img
                  src={`https://img.vietqr.io/image/${wedding.groom.bank.bankCode}-${wedding.groom.bank.accountNo}-compact2.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(wedding.groom.shortName)}&accountName=${encodeURIComponent(wedding.groom.bank.accountName)}`}
                  alt="QR Chú Rể"
                  className="w-40 h-40 mx-auto rounded-xl border border-stone-200 p-2 object-contain"
                />
              </div>
            </div>

            {/* Cô Dâu Bank */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="font-serif font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">
                Tài Khoản Mừng Cô Dâu
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Ngân hàng</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Số tài khoản</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              {/* VietQR Preview */}
              <div className="pt-2 border-t border-stone-100 text-center">
                <span className="text-xs text-stone-400 block mb-2">Xem trước mã VietQR tự động:</span>
                <img
                  src={`https://img.vietqr.io/image/${wedding.bride.bank.bankCode}-${wedding.bride.bank.accountNo}-compact2.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(wedding.bride.shortName)}&accountName=${encodeURIComponent(wedding.bride.bank.accountName)}`}
                  alt="QR Cô Dâu"
                  className="w-40 h-40 mx-auto rounded-xl border border-stone-200 p-2 object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TẠO LINK MỜI RIÊNG TỪNG KHÁCH */}
        {/* ========================================================= */}
        {activeTab === 'links' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Tạo Link Thiệp Mời Riêng Từng Khách (Cá Nhân Hóa)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Nhập danh sách tên khách mời hoặc cách xưng hô (mỗi dòng 1 tên). Hệ thống sẽ tự động tạo link thiệp riêng kèm lời mời trang trọng để gửi qua Zalo / Messenger / SMS.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase">
                Danh sách khách mời (Mỗi người một dòng)
              </label>
              <textarea
                rows={5}
                value={guestListInput}
                onChange={e => setGuestListInput(e.target.value)}
                placeholder={"Ví dụ:\nAnh Nam (Đồng nghiệp)\nGia đình Bác Hùng\nBạn Lan & Người thương\nChú Ba"}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:border-stone-900 font-mono"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateLinks}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  ✨ Tạo Danh Sách Link Mời
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
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
                >
                  Nạp mẫu thử nghiệm
                </button>
              </div>
            </div>

            {generatedLinks.length > 0 && (
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase">
                    Đã tạo {generatedLinks.length} đường link mời riêng:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const all = generatedLinks.map(g => `${g.name}: ${g.link}`).join('\n');
                      navigator.clipboard.writeText(all);
                      alert('Đã copy toàn bộ danh sách link vào clipboard!');
                    }}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Copy toàn bộ danh sách
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                      <tr>
                        <th className="p-3 font-semibold">Tên khách mời</th>
                        <th className="p-3 font-semibold">Link thiệp mời riêng</th>
                        <th className="p-3 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {generatedLinks.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50 transition">
                          <td className="p-3 font-bold text-stone-900 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px] truncate max-w-xs">
                            {item.link}
                          </td>
                          <td className="p-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.link, idx)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                copiedLinkIndex === idx
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                            >
                              {copiedLinkIndex === idx ? '✓ Đã Copy' : 'Copy Link'}
                            </button>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold inline-block"
                            >
                              Xem thử ↗
                            </a>
                            <a
                              href={`https://zalo.me`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                navigator.clipboard.writeText(`Trân trọng kính mời ${item.name} đến tham dự lễ thành hôn của chúng tôi tại: ${item.link}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold inline-block"
                              title="Tự động copy lời mời kèm link và mở Zalo"
                            >
                              Gửi Zalo
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
        {/* TAB 6: DANH SÁCH RSVP & LỜI CHÚC */}
        {/* ========================================================= */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6">
            {/* Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-500 font-semibold uppercase block">Tổng phản hồi</span>
                <span className="font-serif text-3xl font-bold text-stone-900 mt-1 block">{rsvps.length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-500 font-semibold uppercase block">Khách dự kiến tham dự</span>
                <span className="font-serif text-3xl font-bold text-emerald-600 mt-1 block">{attendingCount} người</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-xs text-stone-500 font-semibold uppercase block">Tổng Lời chúc</span>
                <span className="font-serif text-3xl font-bold text-gold-700 mt-1 block">{wishes.length}</span>
              </div>
            </div>

            {/* RSVP Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-serif font-bold text-stone-900 text-lg">Danh Sách Khách Xác Nhận (RSVP)</h3>
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất File Excel/CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-xs uppercase font-bold text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">STT</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Số người</th>
                      <th className="py-3 px-4">Ghi chú</th>
                      <th className="py-3 px-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {rsvps.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-stone-400 italic">Chưa có khách nào đăng ký.</td>
                      </tr>
                    ) : (
                      rsvps.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-stone-50">
                          <td className="py-3.5 px-4 font-mono text-xs">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">{r.name}</td>
                          <td className="py-3.5 px-4 font-mono">{r.phone || '—'}</td>
                          <td className="py-3.5 px-4">
                            {r.attending === 'yes' ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">Tham dự</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs">Không tham dự</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">{r.guestCount} người</td>
                          <td className="py-3.5 px-4 text-xs italic">{r.note || '—'}</td>
                          <td className="py-3.5 px-4 text-xs text-stone-400">{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wishes Manager */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
              <h3 className="font-serif font-bold text-stone-900 text-lg mb-4">Quản Lý Lời Chúc (Sổ Lưu Bút)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {wishes.length === 0 ? (
                  <p className="text-stone-400 text-xs italic">Chưa có lời chúc nào.</p>
                ) : (
                  wishes.map(w => (
                    <div key={w.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-stone-800 text-sm">{w.name}</span>
                          <span className="text-[11px] text-stone-400">{new Date(w.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-stone-600 text-xs mt-1">{w.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWish(w.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                        title="Xóa lời chúc này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ĐÁM CƯỚI MỚI & CÀI ĐẶT BẢO MẬT */}
        {/* ========================================================= */}
        {activeTab === 'reset' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Reset for New Wedding Box */}
            <div className="bg-rose-50 border border-rose-200 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h2 className="font-serif text-xl font-bold text-rose-900 mb-2 flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 text-rose-600" />
                <span>Bắt Đầu Đám Cưới Mới (1-Click Reset)</span>
              </h2>
              <p className="text-xs text-rose-800 leading-relaxed mb-6">
                Khi đám cưới hiện tại đã kết thúc và bạn muốn chuyển sang làm thiệp cho một cặp đôi khác:
                Nhấn nút bên dưới để <strong>xóa sạch toàn bộ danh sách khách RSVP và các lời chúc cũ</strong>. 
                Sau đó bạn chỉ cần vào Tab 1 - Tab 4 đổi lại Tên, Ngày giờ, Ảnh và STK của đám cưới mới là xong!
              </p>

              <button
                type="button"
                onClick={handleResetForNewWedding}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wider uppercase shadow-md transition"
              >
                🔄 Xóa Dữ Liệu Cũ & Sẵn Sàng Cho Đám Cưới Mới
              </button>
            </div>

            {/* Change Admin PIN */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="font-serif font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">
                Đổi Mã PIN Quản Trị
              </h3>
              <p className="text-xs text-stone-500">
                Để bảo vệ quyền quản trị khi bàn giao cho người khác, bạn có thể đổi mã PIN tại đây.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Mã PIN mới</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="Nhập mã PIN mới (VD: 9999)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveWedding}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Cập Nhật Mã PIN
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
