# TÀI LIỆU KIẾN TRÚC & HƯỚNG DẪN TRIỂN KHAI MIỄN PHÍ 100% (DEPLOYMENT GUIDE)
**Dự án:** Thiệp Cưới Online & Quản Trị Khách Mời (Luxury Gold Wedding App)  
**Công nghệ:** Next.js 16 (App Router), React 18, Tailwind CSS, Lucide Icons  
**Vai trò:** Chief System Architect & Tech Lead (@architect)  
**Trạng thái:** Sẵn sàng bàn giao cho @dev và Người dùng  

---

## 1. PHÂN TÍCH TỔNG QUAN KIẾN TRÚC & BÀI TOÁN LƯU TRỮ

### 1.1. Hiện trạng kiến trúc hiện tại
Dự án đang vận hành với kiến trúc Node.js Local File Storage:
- `data/wedding.json`: Lưu thông tin cô dâu chú rể, sự kiện tiệc cưới, tài khoản ngân hàng mừng cưới, album ảnh, mã PIN admin.
- `data/rsvps.json`: Lưu danh sách phản hồi tham dự từ khách mời (RSVP).
- `data/wishes.json`: Lưu danh sách lời chúc của bạn bè, người thân vào Sổ lưu bút (Guestbook).
- Các API route (`/api/wedding`, `/api/rsvp`, `/api/guestbook`, `/api/admin/login`, `/api/admin/reset`) sử dụng module `fs` của Node.js để đọc/ghi trực tiếp vào ổ đĩa.

### 1.2. Thách thức cốt tử khi deploy lên Cloud Free Tier (Serverless vs Container vs Local Tunnel)

| Nền tảng | Bản chất hạ tầng | Hành vi lưu trữ File JSON (`fs.writeFile`) | Chi phí | Tốc độ / Uptime | Đánh giá kiến trúc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Tunnel / Ngrok** | Máy cá nhân làm Server qua Reverse Proxy | **Ghi trực tiếp vào ổ đĩa máy tính** (Data bảo toàn 100%, không bị mất) | 100% Free | Tùy thuộc máy tính & mạng gia đình | **Nhanh nhất, chạy ngay trong 1 phút, không cần sửa code.** |
| **Vercel / Netlify** | Serverless Functions (AWS Lambda) | **Ephemeral/Read-Only Filesystem**. Khi hàm restart hoặc redeploy, dữ liệu ghi qua `fs.writeFile` sẽ bị xóa sạch hoặc lỗi `EROFS: read-only`. | 100% Free Vĩnh viễn | CDN toàn cầu, load < 1s, Uptime 99.99% | **Tốt nhất cho Web Production**, nhưng cần tách Data sang Cloud Database (Supabase/Upstash). |
| **Render.com / Koyeb** | Container PaaS (Docker/Node instance) | Ghi được vào container disk, nhưng **bị reset về trạng thái ban đầu mỗi khi Redeploy/Restart**. Free tier sẽ "ngủ" (spin-down) sau 15 phút idle (mất ~50s khởi động lại). | 100% Free | Cold start ~50s khi thức dậy | Phù hợp thử nghiệm, không tối ưu cho thiệp cưới gửi hàng loạt khách mời. |

---

## 2. BA PHƯƠNG ÁN TRIỂN KHAI CHI TIẾT

```
                               ┌──────────────────────────────────────────────────────────┐
                               │     LỰA CHỌN PHƯƠNG ÁN DEPLOY MIỄN PHÍ 100%              │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
            ┌───────────────────────────────────────────────┼───────────────────────────────────────────────┐
            │                                               │                                               │
            ▼                                               ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐               ┌───────────────────────────────┐
│         PHƯƠNG ÁN 1           │               │         PHƯƠNG ÁN 2           │               │         PHƯƠNG ÁN 3           │
│   CLOUDFLARE TUNNEL / NGROK   │               │     VERCEL PRODUCTION CDN     │               │   SUPABASE / UPSTASH CLOUD    │
├───────────────────────────────┤               ├───────────────────────────────┤               ├───────────────────────────────┤
│ • 1 phút dùng ngay            │               │ • Tốc độ siêu tốc toàn cầu    │               │ • Dữ liệu vĩnh viễn 100%      │
│ • Không cần sửa code          │               │ • Có domain .vercel.app       │               │ • Tích hợp API chuẩn REST/SQL │
│ • Lưu data thẳng vào ổ cứng   │               │ • Uptime 99.99% không tắt     │               │ • Khách gửi RSVP không bao    │
│ • Cần giữ máy tính bật        │               │ • Cần kết hợp Database Cloud  │               │   giờ bị mất khi server reboot│
└───────────────────────────────┘               └───────────────────────────────┘               └───────────────────────────────┘
```

---

### 🟢 PHƯƠNG ÁN 1: DÙNG NGAY TRONG 1 PHÚT (Cloudflare Tunnel / Ngrok)
> **Mục tiêu:** Tạo đường link HTTPS công khai gửi cho bạn bè, khách mời hoặc truy cập `/admin` ngay lập tức từ điện thoại/máy tính khác mà **không cần sửa bất kỳ dòng code nào**, **không lo mất dữ liệu JSON**.

#### Cách 1.1: Sử dụng Cloudflare Tunnel (Khuyên dùng - Không giới hạn băng thông, không cần tài khoản)
Cloudflare cung cấp tính năng **Quick Tunnels** hoàn toàn miễn phí và không giới hạn thời gian.

**Bước 1:** Khởi chạy ứng dụng Next.js trên máy tính của bạn:
```bash
npm run build
npm run start
# Ứng dụng đang chạy tại http://localhost:3000
```

**Bước 2:** Mở một cửa sổ Terminal mới và tải/chạy `cloudflared`:
- **Trên Windows (qua winget hoặc file .exe):**
  ```bash
  winget install --id Cloudflare.cloudflared
  cloudflared tunnel --url http://localhost:3000
  ```
  *(Hoặc tải trực tiếp file `cloudflared-windows-amd64.exe` từ trang chủ Cloudflare, đổi tên thành `cloudflared.exe` và chạy lệnh trên)*.
- **Trên macOS:**
  ```bash
  brew install cloudflared
  cloudflared tunnel --url http://localhost:3000
  ```
- **Trên Linux:**
  ```bash
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i cloudflared.deb
  cloudflared tunnel --url http://localhost:3000
  ```

**Bước 3:** Sao chép đường link xuất hiện trên màn hình có dạng:
`https://random-words-1234.trycloudflare.com`
👉 Gửi link này cho khách mời xem thiệp cưới, hoặc mở `https://random-words-1234.trycloudflare.com/admin` (Mã PIN mặc định: `admin123`) để chỉnh sửa thông tin trực tiếp!

#### Cách 1.2: Sử dụng Ngrok (Lựa chọn thay thế phổ biến)
1. Tải Ngrok tại [ngrok.com](https://ngrok.com) và đăng ký tài khoản miễn phí.
2. Chạy lệnh:
   ```bash
   ngrok http 3000
   ```
3. Nhận link public `https://xxxx.ngrok-free.app` để sử dụng ngay.

---

### 🔵 PHƯƠNG ÁN 2: DEPLOY LÊN VERCEL / RENDER.COM (Chuẩn Web Production)
> **Mục tiêu:** Đưa website lên đám mây 24/7, có tên miền riêng hoặc subdomain miễn phí (`wedding-dung-phuong.vercel.app`), chứng chỉ bảo mật SSL (HTTPS) trọn đời, tốc độ mở trang siêu nhanh trên mọi điện thoại.

#### Cách 2.1: Triển khai lên VERCEL (Tối ưu nhất cho Next.js)

##### Bước 1: Khởi tạo Git & Đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên GitHub (ví dụ: `wedding-app`, chọn chế độ **Private** hoặc **Public**).
2. Tại thư mục dự án trên máy tính, chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "feat: Luxury Gold Wedding Invitation App"
   git branch -M main
   git remote add origin https://github.com/<your-username>/wedding-app.git
   git push -u origin main
   ```

##### Bước 2: Đăng nhập Vercel & Import Dự án
1. Truy cập [https://vercel.com](https://vercel.com) và chọn **Sign Up** bằng tài khoản GitHub.
2. Tại màn hình Dashboard của Vercel, nhấn nút **Add New...** -> **Project**.
3. Tìm và chọn repository `wedding-app` vừa tải lên -> Nhấn **Import**.

##### Bước 3: Cấu hình Build & Deploy
1. **Framework Preset:** Vercel sẽ tự động nhận diện là **Next.js**.
2. **Root Directory:** `./` (hoặc đường dẫn thư mục dự án nếu nằm trong monorepo).
3. **Build Command:** `npm run build` (Mặc định).
4. **Output Directory:** `.next` (Mặc định).
5. Nhấn nút **Deploy**.
6. Quá trình build diễn ra trong khoảng 45 - 90 giây. Khi hoàn tất, Vercel sẽ cung cấp đường link chính thức (Ví dụ: `https://wedding-app-alpha.vercel.app`).

##### Bước 4: Gắn tên miền tùy chỉnh (Custom Domain Miễn Phí)
- Nếu bạn có tên miền riêng (ví dụ: `dungphuongwedding.com` hoặc `damcuoi.info`):
  1. Vào tab **Settings** -> **Domains** trên Vercel.
  2. Nhập tên miền của bạn và nhấn **Add**.
  3. Trỏ bản ghi DNS (CNAME hoặc A record `76.76.21.21`) theo hướng dẫn của Vercel. Vercel tự động cấp chứng chỉ SSL HTTPS miễn phí.

---

#### Cách 2.2: Triển khai lên Render.com (Hỗ trợ Container Miễn Phí)
1. Truy cập [https://render.com](https://render.com), đăng ký tài khoản miễn phí.
2. Nhấn **New +** -> Chọn **Web Service**.
3. Kết nối với GitHub Repository của bạn.
4. Cấu hình các thông số:
   - **Name:** `wedding-app`
   - **Environment:** `Node`
   - **Region:** `Singapore` (để khách truy cập tại Việt Nam có tốc độ nhanh nhất)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free` (512 MB RAM, 0.1 CPU)
5. Nhấn **Create Web Service**. Sau vài phút, bạn sẽ nhận được đường link dạng `https://wedding-app.onrender.com`.

---

### 🟣 PHƯƠNG ÁN 3: LƯU TRỮ DỮ LIỆU VĨNH VIỄN (Supabase / Upstash Cloud Free Tier)
> **Mục tiêu:** Giải quyết triệt để vấn đề mất dữ liệu khi restart hoặc deploy lên Vercel Serverless. Dữ liệu RSVP, Lời chúc, Cấu hình tiệc cưới được lưu trên Cloud Database chuẩn Enterprise, miễn phí trọn đời.

---

#### Tùy Chọn 3.1: Tích hợp SUPABASE (PostgreSQL Cloud Free Tier - Khuyên Dùng Tối Đa)
**Đặc quyền Free Tier của Supabase:**
- 500 MB Database (Đủ lưu hàng triệu lời chúc và danh sách khách mời).
- Dashboard quản lý dữ liệu trực quan bằng giao diện bảng tính (như Excel/Airtable).
- Tự động sao lưu dữ liệu (Daily Backups).

##### Bước 1: Tạo dự án trên Supabase
1. Truy cập [https://supabase.com](https://supabase.com), đăng nhập bằng GitHub.
2. Nhấn **New Project**, đặt tên (ví dụ: `wedding-db`), chọn khu vực `Southeast Asia (Singapore)`.
3. Lưu lại Database Password.

##### Bước 2: Khởi tạo Database Schema (Chạy trong Supabase SQL Editor)
Vào mục **SQL Editor** trong Supabase Dashboard, dán đoạn script SQL sau và nhấn **RUN**:

```sql
-- 1. Bảng lưu trữ cấu hình đám cưới (Wedding Config)
CREATE TABLE IF NOT EXISTS wedding_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_wedding',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng lưu danh sách phản hồi tham dự (RSVP)
CREATE TABLE IF NOT EXISTS rsvps (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  attending VARCHAR(20) DEFAULT 'yes',
  guest_count INTEGER DEFAULT 1,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng lưu Sổ lưu bút & Lời chúc (Guestbook / Wishes)
CREATE TABLE IF NOT EXISTS wishes (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tạo Index để truy vấn nhanh nhất
CREATE INDEX IF NOT EXISTS idx_rsvps_created ON rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at DESC);
```

##### Bước 3: Lấy API Keys của Supabase
1. Vào **Project Settings** -> **API**.
2. Sao chép 2 thông số:
   - `Project URL` (Ví dụ: `https://xyzcompany.supabase.co`)
   - `anon public key` (Hoặc `service_role secret key` để bảo mật trong Backend API Route).

##### Bước 4: Mã nguồn Adapter Database cho @dev (`lib/db.js`)
Tạo file `lib/db.js` trong thư mục dự án để tự động chuyển đổi thông minh giữa Local JSON (khi phát triển máy nhà) và Supabase (khi deploy Vercel):

```javascript
// lib/db.js
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isCloudDbEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Helper Supabase Fetch
async function supabaseRequest(endpoint, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers,
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Error: ${res.status} ${errorText}`);
  }
  return res.json();
}

// ==================== 1. WEDDING DATA ====================
export async function getWeddingData() {
  if (isCloudDbEnabled) {
    try {
      const data = await supabaseRequest('wedding_config?id=eq.main_wedding&select=*');
      if (data && data.length > 0) return data[0].data;
    } catch (e) {
      console.error('Lỗi đọc Supabase, fallback về JSON local:', e.message);
    }
  }
  const file = fs.readFileSync(path.join(process.cwd(), 'data', 'wedding.json'), 'utf8');
  return JSON.parse(file);
}

export async function saveWeddingData(updatedData) {
  if (isCloudDbEnabled) {
    return supabaseRequest('wedding_config', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=representation',
      body: JSON.stringify({ id: 'main_wedding', data: updatedData, updated_at: new Date().toISOString() })
    });
  }
  const dataPath = path.join(process.cwd(), 'data', 'wedding.json');
  fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2), 'utf8');
}

// ==================== 2. RSVPS ====================
export async function getRsvps() {
  if (isCloudDbEnabled) {
    try {
      return await supabaseRequest('rsvps?select=*&order=created_at.desc');
    } catch (e) {
      console.error('Lỗi đọc RSVPs Supabase:', e.message);
    }
  }
  const rsvpPath = path.join(process.cwd(), 'data', 'rsvps.json');
  if (!fs.existsSync(rsvpPath)) return [];
  return JSON.parse(fs.readFileSync(rsvpPath, 'utf8'));
}

export async function addRsvp(rsvpItem) {
  if (isCloudDbEnabled) {
    const payload = {
      id: rsvpItem.id,
      name: rsvpItem.name,
      phone: rsvpItem.phone,
      attending: rsvpItem.attending,
      guest_count: rsvpItem.guestCount,
      note: rsvpItem.note,
      created_at: rsvpItem.createdAt
    };
    return await supabaseRequest('rsvps', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
  const rsvpPath = path.join(process.cwd(), 'data', 'rsvps.json');
  const rsvps = fs.existsSync(rsvpPath) ? JSON.parse(fs.readFileSync(rsvpPath, 'utf8')) : [];
  rsvps.unshift(rsvpItem);
  fs.writeFileSync(rsvpPath, JSON.stringify(rsvps, null, 2), 'utf8');
  return rsvpItem;
}

// ==================== 3. WISHES ====================
export async function getWishes() {
  if (isCloudDbEnabled) {
    try {
      return await supabaseRequest('wishes?select=*&order=created_at.desc');
    } catch (e) {
      console.error('Lỗi đọc Wishes Supabase:', e.message);
    }
  }
  const wishPath = path.join(process.cwd(), 'data', 'wishes.json');
  if (!fs.existsSync(wishPath)) return [];
  return JSON.parse(fs.readFileSync(wishPath, 'utf8'));
}

export async function addWish(wishItem) {
  if (isCloudDbEnabled) {
    return await supabaseRequest('wishes', {
      method: 'POST',
      body: JSON.stringify({
        id: wishItem.id,
        name: wishItem.name,
        message: wishItem.message,
        created_at: wishItem.createdAt
      })
    });
  }
  const wishPath = path.join(process.cwd(), 'data', 'wishes.json');
  const wishes = fs.existsSync(wishPath) ? JSON.parse(fs.readFileSync(wishPath, 'utf8')) : [];
  wishes.unshift(wishItem);
  fs.writeFileSync(wishPath, JSON.stringify(wishes, null, 2), 'utf8');
  return wishItem;
}

export async function deleteWish(id) {
  if (isCloudDbEnabled) {
    return await supabaseRequest(`wishes?id=eq.${id}`, { method: 'DELETE' });
  }
  const wishPath = path.join(process.cwd(), 'data', 'wishes.json');
  let wishes = fs.existsSync(wishPath) ? JSON.parse(fs.readFileSync(wishPath, 'utf8')) : [];
  wishes = wishes.filter(w => w.id !== id);
  fs.writeFileSync(wishPath, JSON.stringify(wishes, null, 2), 'utf8');
}
```

##### Bước 5: Cấu hình biến môi trường trên Vercel
Vào **Vercel Project Settings** -> **Environment Variables**, thêm 2 biến:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOi...` (Secret Key lấy từ Supabase)

---

#### Tùy Chọn 3.2: Tích hợp UPSTASH REDIS (Serverless KV Free Tier)
Nếu muốn giải pháp cực nhẹ dạng Key-Value (JSON document):
1. Đăng ký tại [https://upstash.com](https://upstash.com) (Miễn phí 10,000 requests/ngày).
2. Tạo Database Redis (chọn vùng `ap-southeast-1` Singapore).
3. Cài đặt thư viện:
   ```bash
   npm install @upstash/redis
   ```
4. Lưu trữ trực tiếp nguyên object JSON:
   - `redis.set('wedding_data', jsonObject)`
   - `redis.lpush('wedding_rsvps', JSON.stringify(newRsvp))`
   - `redis.lpush('wedding_wishes', JSON.stringify(newWish))`
5. Tương thích 100% không lo lỗi filesystem trên Vercel Edge/Serverless.

---

## 3. BẢNG SO SÁNH MA TRẬN & ĐỀ XUẤT LỰA CHỌN TỐI ƯU

| Tiêu chí | Phương Án 1: Cloudflare Tunnel | Phương Án 2: Vercel Static/JSON | Phương Án 3: Vercel + Supabase Free |
| :--- | :--- | :--- | :--- |
| **Thời gian triển khai** | **1 Phút** ⚡ | 3 - 5 Phút | 10 - 15 Phút |
| **Yêu cầu kỹ thuật** | 0 dòng code | Push Git | Tạo bảng Database Supabase + Đổi Adapter |
| **Chi phí hàng tháng** | **0đ (Miễn phí 100%)** | **0đ (Miễn phí 100%)** | **0đ (Miễn phí 100%)** |
| **Khả năng giữ dữ liệu** | **100% (Lưu máy cá nhân)** | ⚠️ Reset khi redeploy Vercel | **100% Vĩnh viễn trên Cloud PostgreSQL** |
| **Tốc độ tải trang** | Tùy mạng máy chủ nhà (~200ms - 1s) | Siêu tốc Edge CDN (<100ms) | Siêu tốc Edge CDN + Cloud DB (<150ms) |
| **Tên miền Public** | `*.trycloudflare.com` / Custom | `*.vercel.app` / Custom | `*.vercel.app` / Custom |
| **Độ ổn định Uptime** | Cần bật máy tính | 99.99% (Không bao giờ tắt) | 99.99% (Không bao giờ tắt) |

---

## 4. CHECKLIST VẬN HÀNH & BÀO VỆ AN TOÀN TRƯỚC KHI GỬI THIỆP

1. **Đổi mã PIN Quản Trị Admin:**
   - Đăng nhập vào trang `/admin` ngay sau khi deploy.
   - Nhập mã PIN cũ (`admin123`) và đổi sang mã PIN bí mật của hai bạn (ví dụ: ngày sinh nhật hoặc ngày kỷ niệm).
2. **Kiểm tra thông tin tài khoản mừng cưới:**
   - Kiểm tra mã QR ngân hàng hiển thị trên giao diện có quét đúng số tài khoản của Chú rể / Cô dâu không.
3. **Thử nghiệm gửi RSVP & Lời chúc:**
   - Dùng điện thoại 4G gửi thử 1 RSVP và 1 lời chúc.
   - Mở trang `/admin` xem danh sách có nhận đủ không và xuất file Excel lưu trữ dự phòng.
4. **Tạo mã QR thiệp cưới in lên phong bì giấy:**
   - Dán đường link website chính thức vào các trang tạo QR miễn phí (như [me-qr.com](https://me-qr.com) hoặc [qr-code-generator.com](https://www.qr-code-generator.com)) để in trực tiếp lên thiệp cưới giấy gửi cho người thân, bạn bè.

---
*Tài liệu được phê duyệt bởi Tech Lead & System Architect Bot (@architect) - Đảm bảo giải pháp đạt tiêu chuẩn miễn phí 100%, an toàn dữ liệu và tối ưu trải nghiệm người dùng.*