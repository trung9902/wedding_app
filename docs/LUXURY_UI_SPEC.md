# 👑 LUXURY WEDDING INVITATION — DESIGN SYSTEM & UI/UX SPECIFICATION
> **Document Version:** 2.0.0-ROYAL  
> **Author:** Lead UI/UX Designer Bot (`@designer`)  
> **Target Audience:** Lead Developer (`@dev`), QA/Security (`@qa`), Product Owner (`@po`)  
> **Status:** APPROVED FOR IMPLEMENTATION  

---

## 📜 1. EXECUTIVE SUMMARY & DESIGN MANIFESTO

### 1.1. Triết Lý Thiết Kế (Design Philosophy)
Chuyển đổi toàn bộ giao diện từ phong cách công nghệ / modern app sang phong cách **"Royal Heritage & Timeless Romance" (Đẳng Cấp Hoàng Gia & Tình Yêu Vĩnh Cửu)** mang đậm vẻ đẹp thiệp cưới thủ công cao cấp (Haute Couture Wedding Stationery):
- **Loại bỏ triệt để:** Toàn bộ icon mang tính chất tech/AI (Sparkles, flash badge, gradient neon, chip điện tử, tag xanh dương/hồng gắt).
- **Tôn vinh chất liệu cổ điển:** Kỹ thuật ép kim vàng (Gold Foil Stamping), con dấu sáp niêm phong hoàng gia (Wax Seal), hoa văn ren cổ điển (Vintage Filigree & Floral Ornaments), khung vòm cung điện (Royal Arches), và nền giấy mỹ thuật vân lụa (Silk & Parchment texture).
- **Trải nghiệm xúc cảm:** Mỗi tương tác (mở bao thư, lật album, gửi lời chúc) đều như một nghi thức trang trọng tại buổi tiệc hoàng gia.

---

## 🎨 2. LUXURY DESIGN SYSTEM (COLOR & TOKENS)

### 2.1. Bảng Màu Hoàng Gia (Royal Color Palette)

| Mã Màu | Hex Code | Tên Quy Chuẩn | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Gold Primary** | `#C5A059` | Champagne Gold | Màu vàng kim chủ đạo, viền thẻ, nút bấm chính, hoa văn |
| **Gold Light** | `#ECC880` | Light Shimmer Gold | Điểm sáng ánh kim (metallic highlight), dải chuyển màu foil |
| **Gold Deep** | `#8C621E` | Antique Bronze Gold | Chữ nhấn quan trọng, viền đậm, bóng đổ vàng |
| **Gold Cream** | `#FAF5E8` | Gold Tint Mist | Nền thẻ phụ, badge hoàng gia, hộp ghi chú |
| **Ivory Warm** | `#FAF7F2` | Warm Ivory | Màu nền tổng thể trang web (thay cho nền trắng trơn) |
| **Silk Nude** | `#F4EBE1` | Nude Silk Parchment | Nền các khối nội dung, thẻ tương tác xen kẽ |
| **Bordeaux Rich** | `#5E121E` | Deep Bordeaux | Điểm nhấn cô dâu, dấu sáp con dấu (Wax Seal), tiêu đề tình yêu |
| **Bordeaux Soft** | `#852233` | Royal Wine Rose | Nút gửi lời chúc, icon hoa hồng cổ điển |
| **Charcoal Dark** | `#2C2018` | Antique Espresso | Màu chữ chính (thay cho #000000 để tạo nét ấm áp quý tộc) |
| **Muted Stone** | `#6B5B52` | Sepia Stone | Màu chữ phụ, mô tả, chú thích phụ |

### 2.2. Metallic Gold Foil Gradients (Hiệu Ứng Ép Kim)
```css
/* Gold Foil Gradient Thường Dùng */
--gold-gradient: linear-gradient(135deg, #ECC880 0%, #D4AF37 40%, #AA7A2B 75%, #ECC880 100%);
--gold-border-gradient: linear-gradient(to right, #FAF5E8, #C5A059, #ECC880, #C5A059, #FAF5E8);
--wax-seal-gradient: radial-gradient(circle at 35% 35%, #852233 0%, #5E121E 65%, #36070D 100%);
--parchment-glass: rgba(253, 251, 247, 0.94);
```

### 2.3. Cấu Hình Tailwind CSS Token (`tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        royal: {
          gold: {
            50: '#FAF5E8',
            100: '#F4E7CE',
            200: '#ECC880',
            300: '#DEB05B',
            400: '#D4AF37',
            500: '#C5A059',
            600: '#AA7A2B',
            700: '#8C621E',
            800: '#644413',
            900: '#3D2808',
          },
          bordeaux: {
            50: '#FBF0F1',
            100: '#F6D9DC',
            200: '#EDB0B8',
            300: '#DF7B8B',
            400: '#B83A4B',
            500: '#852233',
            600: '#6B1724',
            700: '#5E121E',
            800: '#420B13',
            900: '#2A050A',
          },
          ivory: {
            light: '#FDFBF7',
            base: '#FAF7F2',
            dark: '#F4EBE1',
            silk: '#EAD8C7',
          },
          charcoal: {
            heading: '#2C2018',
            body: '#4A3B32',
            muted: '#736154',
          }
        }
      },
      fontFamily: {
        cursive: ['"Great Vibes"', 'cursive'],
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

---

## 🖋️ 3. ROYAL TYPOGRAPHY SYSTEM

| Phân Loại | Font Family | Trọng Lượng (Weight) | Ứng Dụng |
| :--- | :--- | :--- | :--- |
| **Cursive Calligraphy** | `Great Vibes` | Regular 400 | Tên cô dâu & chú rể, chữ lồng Monogram, lời cảm ơn "Thank You", ký tự `&` |
| **Royal Display** | `Cormorant Garamond` | SemiBold 600, Bold 700 | Tiêu đề các mục lớn (Hôn Lễ, Tiệc Mừng, Lịch Trình), Con số Countdown |
| **Classic Editorial Serif** | `Playfair Display` | Regular 400, Italic, Bold 700 | Tên địa điểm, thông tin phụ huynh, câu trích dẫn song ngữ, ngày tháng |
| **Refined Sans** | `Montserrat` | Regular 400, Medium 500, SemiBold 600 | Văn bản nội dung, nhãn nhập liệu, nút bấm, hướng dẫn bản đồ (Tracking: `0.15em` - `0.25em`) |

### Quy Chuẩn Hierarchy:
- **Hero Couple Names:** `Great Vibes` 56px - 84px, color `#2C2018` với chữ `&` màu `#852233` bordeaux sang trọng.
- **Section Badges:** `Montserrat` 11px, `uppercase`, `tracking-[0.25em]`, nền `#FAF5E8`, viền `#ECC880`.
- **Section Headings:** `Cormorant Garamond` 32px - 44px, `font-bold`, color `#2C2018`.
- **Body Text:** `Montserrat` 14px - 15px, `leading-relaxed`, color `#4A3B32`.

---

## ⚜️ 4. ORNAMENT & ICON SYSTEM (LOẠI BỎ TECH/AI)

### 4.1. Ma Trận Thay Thế Icon (Icon Migration Matrix)

| Vị Trí Cũ | Icon Cũ (Cấm Dùng) | Họa Tiết Thay Thế Mới (Luxury Royal) | Lý Do Thiết Kế |
| :--- | :--- | :--- | :--- |
| Mở thiệp cưới | `Sparkles` | Con dấu sáp đỏ rượu viền vàng (`WaxSealCrest`) | Tạo cảm giác bóc phong bì hoàng gia thật |
| Tag Lễ Thành Hôn | `Sparkles` | Họa tiết nhành nguyệt quế/ô-liu vàng (`LaurelBranch`) | Biểu tượng vương giả và hôn nhân vĩnh hằng |
| Giới tính Chú rể | Tag `bg-blue-50 text-blue-800` | Tag lụa vàng cát viền vàng kim `#FAF5E8 / #AA7A2B` | Xóa bỏ màu xanh giao diện admin/dashboard |
| Giới tính Cô dâu | Tag `bg-rose-50 text-rose-800` | Tag lụa rượu vang quý phái `#FBF0F1 / #852233` | Màu Bordeaux đằm thắm quý phái |
| Khối Countdown | Hộp số xám viền phẳng | Thẻ số ép kim hoa văn 4 góc (`GildedCardPod`) | Giống đồng hồ cơ vintage châu Âu |
| Hộp mừng cưới | Icon `Gift` phẳng | Rương quà mạ vàng hoặc Phong thư ép kim (`GoldFoilEnvelope`) | Lịch lãm, trang nhã, không mang tính thương mại |
| Nút gửi RSVP/Wish | Icon `Send` kiểu chatbox | Con dấu đóng dấu sáp `StampMark` hoặc Bồ câu đưa thư | Đậm chất thiệp cưới truyền thống |
| Phân cách mục | Gạch ngang đơn điệu | Dải hoa văn uốn lượn cổ điển (`BaroqueDivider`) | Nâng tầm thẩm mỹ phong cách Pháp thế kỷ 19 |

---

### 4.2. Bộ SVG Ornaments Chuẩn Đoán Sẵn Dành Cho Code (`app/components/RoyalOrnaments.js`)

#### A. Hoa Văn Phân Cách Hoàng Gia (Baroque Gold Divider)
```jsx
export function BaroqueDivider({ className = "w-48 h-6 mx-auto text-royal-gold-500" }) {
  return (
    <svg viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 12H75M125 12H190" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
      <circle cx="85" cy="12" r="2" fill="currentColor" />
      <circle cx="115" cy="12" r="2" fill="currentColor" />
      <path d="M100 4C96 8 92 12 100 20C108 12 104 8 100 4Z" fill="currentColor" />
      <path d="M93 12C90 9 86 10 83 12C86 14 90 15 93 12Z" fill="currentColor" fillOpacity="0.7"/>
      <path d="M107 12C110 9 114 10 117 12C114 14 110 15 107 12Z" fill="currentColor" fillOpacity="0.7"/>
    </svg>
  );
}
```

#### B. Góc Hoa Văn Cổ Điển (Corner Filigree Flourish)
```jsx
export function CornerFlourish({ position = "top-left", className = "w-8 h-8 text-royal-gold-400" }) {
  const rotateClass = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position];

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${rotateClass}`}>
      <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 38V14C6 9.58172 9.58172 6 14 6H38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.5"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <path d="M18 2C15 6 15 10 18 14" stroke="currentColor" strokeWidth="1"/>
      <path d="M2 18C6 15 10 15 14 18" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
}
```

#### C. Con Dấu Sáp Hoàng Gia (Royal Monogram Wax Seal)
```jsx
export function RoyalWaxSeal({ initials = "M & Q", onClick, isPulsing = true }) {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer group select-none ${isPulsing ? 'animate-pulse-glow' : ''}`}
      title="Chạm để mở thiệp cưới"
    >
      {/* Vành sáp viền gợn sóng tự nhiên */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#852233] via-[#5E121E] to-[#36070D] p-1.5 shadow-[0_10px_25px_rgba(94,18,30,0.45),inset_0_2px_4px_rgba(255,255,255,0.25)] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
        {/* Viền kim loại dập nổi phía trong */}
        <div className="w-full h-full rounded-full border-2 border-dashed border-[#ECC880]/70 flex flex-col items-center justify-center bg-radial-to-br from-[#731524] to-[#4A0A14] shadow-inner relative overflow-hidden">
          {/* Vòng hoa nguyệt quế dập chìm */}
          <div className="absolute inset-2 border border-[#ECC880]/30 rounded-full pointer-events-none"></div>
          
          <span className="font-serif text-[10px] tracking-[0.2em] text-[#ECC880] uppercase font-bold mb-0.5 opacity-90">
            OFFICIAL
          </span>
          <span className="font-cursive text-2xl sm:text-3xl text-[#FAF5E8] font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {initials}
          </span>
          <span className="font-serif text-[9px] tracking-[0.15em] text-[#ECC880] uppercase opacity-80 mt-0.5">
            INVITATION
          </span>
        </div>
      </div>
      {/* Ruy băng lụa buông rủ bên dưới con dấu */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 pointer-events-none">
        <div className="w-3 h-5 bg-[#5E121E] shadow-md transform -rotate-12 rounded-b-sm border-b border-[#ECC880]/40"></div>
        <div className="w-3 h-5 bg-[#6B1724] shadow-md transform rotate-12 rounded-b-sm border-b border-[#ECC880]/40"></div>
      </div>
    </div>
  );
}
```

---

## 🏛️ 5. CHI TIẾT BỐ CỤC REDESIGN TỪNG PHẦN

### 5.1. Màn Hình Mở Phong Bao Thư (Royal Envelope Opening Overlay)
* **Bối cảnh:** Không gian phòng tiệc dạ vũ tối màu (`#1A0D0F` đến `#2D1619`) với họa tiết damask chìm sang trọng.
* **Phong bì thư:** Tỷ lệ phong thư khổ ngang hoàng gia, chất liệu giấy mỹ thuật vân hạt ngọc trai, nắp phong thư gập hình tam giác đính kèm **Con dấu sáp đỏ rượu khắc chữ lồng Monogram (M & Q)**.
* **Hiệu ứng:** Khi click vào con dấu sáp:
  1. Con dấu rung nhẹ haptic (scale 0.95 -> 1.1).
  2. Nắp phong thư mở lật lên 3D (`perspective: 1000px, rotateX(180deg)`).
  3. Thiệp mời lướt từ trong phong thư bay ra, nhạc hòa tấu acoustic cất lên, hoa hồng và bột vàng rơi nhẹ.

---

### 5.2. Banner Trang Trọng & Lưu Lại Ngày Cưới (Hero Section)
* **Khung viền ảnh:** Cặp đôi được lồng trong **Khung vòm Cung Điện Hoàng Gia (Royal Palace Arch Frame)** với 2 lớp viền mạ vàng kép (`double gold-filigree border`).
* **Họa tiết:**
  - 4 góc ảnh đính 4 hoa văn góc `CornerFlourish`.
  - Phía trên tiêu đề: Badge *"LỄ THÀNH HÔN"* với 2 nhành nguyệt quế đối xứng.
  - Tên cô dâu & chú rể viết bằng font `Great Vibes` siêu thực, kích thước lớn, màu than cổ điển kết hợp ánh vàng.
  - Lịch dương và Lịch âm đặt trang trọng trong khung dải lụa `Nude Silk`.

---

### 5.3. Đếm Ngược Ngày Hạnh Phúc (Vintage Clockwork Countdown)
* **Thay đổi cốt lõi:** Thay thế các ô vuông phẳng xám bằng **4 Thẻ Huy Hiệu Hoàng Gia (Royal Crest Pods)**.
* **Chi tiết mỗi ô:**
  - Nền: Giấy ngà `Warm Ivory` (`#FAF7F2`) với viền chỉ vàng kim 1px.
  - Con số: Font `Playfair Display` hoặc `Cormorant Garamond` màu vàng đồng `#8C621E`, dập bóng mờ nhẹ.
  - Nhãn đơn vị (NGÀY, GIỜ, PHÚT, GIÂY): Font `Montserrat` 11px, `tracking-[0.25em]`, màu `#736154`.
  - Dấu chấm phân cách hoặc hoa văn Baroque ngăn giữa các ô.

---

### 5.4. Giới Thiệu Tân Lang, Tân Nương & Hai Họ (The Royal Couple)
* **Chân dung Cô Dâu - Chú Rể:**
  - Avatar dạng khung Oval cổ điển viền vàng kép (`Double Oval Gold Border`).
  - Chú Rể: Badge danh xưng *"TÂN LANG"* bằng lụa cát viền vàng kim `#AA7A2B` (Bỏ hẳn màu xanh dương tech).
  - Cô Dâu: Badge danh xưng *"TÂN NƯƠNG"* bằng lụa rượu vang `#852233` (Bỏ hẳn màu hồng pastel neon).
* **Đại diện hai họ (Nhà Trai & Nhà Gái):**
  - Trình bày dạng văn bia khánh tiết: Tên đấng sinh thành đặt trang trọng với chữ viết hoa thanh nhã `Playfair Display`.
* **Hộp thông điệp gửi gắm:** Đặt trong khung viền hoa văn mạ vàng với biểu tượng nhẫn cưới song hỷ cổ điển.

---

### 5.5. Thông Tin Hôn Lễ & Tiệc Mừng (Palace Venue & Directions)
* **Khối Địa Điểm:** Thiết kế như một tấm sảnh đón khách tại khách sạn 5 sao:
  - Giờ cử hành hôn lễ & Giờ khai tiệc: Chia 2 cột cân xứng với biểu tượng mặt trời & ánh trăng ép kim.
  - Nút xem bản đồ: Bo tròn thanh lịch, nền than trầm `#2C2018`, viền chỉ vàng `#ECC880`, chữ in hoa sắc nét kèm biểu tượng la bàn mạ vàng cổ điển.

---

### 5.6. Lịch Trình Hôn Lễ (Royal Timeline)
* **Trục thời gian:** Sợi chỉ vàng `Royal Gold Thread` chạy dọc thân trang.
* **Mốc thời gian:** Từng nút mốc là con dấu mặt trời hoặc bông hoa hồng nhỏ.
* **Nội dung mốc:** Giờ được đặt trong tag bo tròn dập nổi màu vàng champagne, tiêu đề in font serif chuẩn quý tộc.

---

### 5.7. Album Ảnh Cưới Nghệ Thuật (Fine-Art Gallery & Lightbox)
* **Bố cục:** Grid 2-3 cột đan xen nhịp nhàng, bo góc 16px.
* **Hiệu ứng ảnh:**
  - Viền mạ vàng 1px siêu mảnh tựa khung tranh sơn dầu tại bảo tàng.
  - Khi hover: Ảnh zoom 1.05 nhẹ nhàng, phủ một lớp kính mờ vàng champagne kèm nút *"Thưởng Lãm"* (thay cho *"Xem ảnh lớn"* thô sơ).
* **Lightbox:** Nền tối nhung huyền bí (`#12080A/95`), khung ảnh có viền vàng nổi bật, nút đóng cách điệu cánh hoa.

---

### 5.8. Hộp Mừng Cưới & VietQR Tinh Tế (Gửi Quà Chúc Phúc)
* **Tab Chuyển Đổi:**
  - Thiết kế dạng dải lụa đôi: *"Mừng Chú Rể"* (Champagne Gold) và *"Mừng Cô Dâu"* (Bordeaux Velvet).
* **Khung QR Code:**
  - Trình bày như một hộp quà trang sức cao cấp: Mã QR nằm trên nền trắng giấy mỹ thuật sạch sẽ, bao bọc bởi 4 góc hoa văn `CornerFlourish`.
  - Khối thông tin số tài khoản: Hiển thị font Monospace thanh mảnh, nút sao chép hình chiếc trâm cài hoặc con dấu xác nhận vàng, báo hiệu *"Đã sao chép vào bộ nhớ"* trang trọng.

---

### 5.9. Sổ Lưu Bút & Xác Nhận Tham Dự RSVP (Royal Guestbook & RSVP)
* **Form RSVP:**
  - Input field: Nền giấy lụa ngà `#FDFBF7`, viền vàng kim khi focus (`border-royal-gold-500`, `ring-1 ring-royal-gold-400`), font chữ thanh lịch.
  - Nút bấm *"Xác Nhận Tham Dự"*: Gradient vàng kim lấp lánh (Shimmer Gold Button), đổ bóng mềm mại.
* **Sổ lưu bút Online:**
  - Mỗi lời chúc của khách mời được hiển thị dưới dạng một **Tấm Thiệp Cảm Ơn Nhỏ (Parchment Note)** có dấu dập hoa hồng ở góc và ngày gửi viết theo lối thư từ cổ điển.

---

### 5.10. Chân Trang & Bộ Điều Khiển Âm Nhạc (Footer & Music Disc)
* **Bộ điều khiển nhạc:** Nút tròn đĩa than mạ vàng (Gold Gramophone Disc) quay chậm `animate-spin-slow`, có gợn sóng âm thanh tỏa ra viền ngoài.
* **Footer:** Màu nền rượu vang trầm kết hợp chữ dát vàng, dòng chữ *"Thank You"* bằng font `Great Vibes`, kèm liên kết bảo mật nhẹ nhàng sang trang quản trị.

---

## ✨ 6. HIỆU ỨNG CHUYỂN ĐỘNG & HẠT BỤI VÀNG (MOTION & PARTICLES)

### 6.1. Hạt Rơi (Petal & Gold Dust Canvas System)
- **Tỉ lệ hạt:** 60% cánh hoa hồng pastel nhung mềm + 40% hạt bụi vàng li ti lấp lánh (Gold Dust sparkles physics).
- **Vận tốc:** Rơi chậm mềm mại (tốc độ Y: `0.8` đến `1.8`, lắc lư X: `-0.6` đến `0.6`), tạo không gian lãng mạn như tiệc cưới ngoài trời mùa thu.

### 6.2. CSS Keyframes Cần Thiết
```css
/* Ánh kim lướt qua nút bấm */
@keyframes goldShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.btn-royal-gold {
  background: linear-gradient(90deg, #AA7A2B 0%, #ECC880 25%, #C5A059 50%, #ECC880 75%, #AA7A2B 100%);
  background-size: 200% 100%;
  color: #2C2018;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-royal-gold:hover {
  background-position: right center;
  box-shadow: 0 6px 20px rgba(197, 160, 89, 0.45);
  transform: translateY(-1px);
}
```

---

## 📱 7. QUY CHUẨN ĐÁP ỨNG THIẾT BỊ (RESPONSIVE SPECIFICATIONS)

| Màn Hình | Độ Rộng (Viewport) | Quy Cách Trình Bày |
| :--- | :--- | :--- |
| **Mobile (Ưu tiên số 1)** | `360px - 430px` (iPhone/Android) | Bố cục 1 cột cuộn mượt mà; Khoảng cách lề `px-4`; Vùng chạm (Touch Target) của nút bấm tối thiểu 48px; Font chữ đọc rõ không cần zoom. |
| **Tablet** | `768px - 1024px` (iPad) | Bố cục 2 cột cho phần Chú Rể / Cô Dâu và Lịch Trình; Album ảnh dạng lưới 2 cột lớn. |
| **Desktop** | `>= 1024px` | Khung trang căn giữa chuẩn kích thước thiệp mời danh giá tối đa `max-w-4xl` hoặc `max-w-5xl`, nền ngoài trang trải hoa văn lụa hoàng gia. |

---

## 🛠️ 8. KẾ HOẠCH BÀN GIAO & TRIỂN KHAI CHO @dev (DEVELOPER HANDOFF)

### Danh sách các bước triển khai cụ thể:
1. **Cập nhật Font chữ (`app/layout.js`):**
   - Thêm font `Cormorant Garamond` từ Google Fonts cùng với `Playfair Display`, `Great Vibes`, `Montserrat`.
2. **Cập nhật Bảng màu & Token (`tailwind.config.js`):**
   - Thay thế hoàn toàn bảng màu `gold` và `rose` cũ bằng bảng màu `royal-gold`, `royal-bordeaux`, `royal-ivory`, `royal-charcoal`.
3. **Thêm Component Hoa Văn Cổ Điển (`app/components/RoyalOrnaments.js`):**
   - Tạo file chứa các component SVG: `BaroqueDivider`, `CornerFlourish`, `RoyalWaxSeal`, `LaurelBranch`.
4. **Tái cấu trúc giao diện chính (`app/page.js`):**
   - Thay toàn bộ icon `Sparkles`, `UserCheck`, `Gift`, `Clock`, `Send` kiểu tech bằng hoa văn hoặc icon tinh giản trang nhã.
   - Thay giao diện màn hình bao thư thành phong thư sáp dập 3D.
   - Đổi kiểu dáng Countdown sang Thẻ Đồng Hồ Hoàng Gia.
   - Tinh chỉnh tab VietQR và Sổ lưu bút theo phong cách giấy da mỹ thuật.
5. **Kiểm tra độ tương phản & Accessibility:**
   - Đảm bảo màu chữ `#2C2018` và `#8C621E` trên nền kem `#FAF7F2` đạt chuẩn WCAG AA về độ tương phản.

---

*Tài liệu được lập bởi Lead UI/UX Designer Bot (@designer) — Đã duyệt và sẵn sàng chuyển tiếp sang Lead Developer (@dev) để thực thi.*
