# HƯỚNG DẪN CẤU HÌNH SUPABASE CLOUD & DEPLOY VERCEL 24/7 (FREE TIER)

Tài liệu hướng dẫn chi tiết từng bước thiết lập Supabase Database và triển khai ứng dụng Thiệp Cưới Online (Wedding App) lên Vercel với kiến trúc lưu trữ Cloud vĩnh viễn 100% miễn phí.

---

## 🌟 TỔNG QUAN KIẾN TRÚC HYBRID ADAPTER

Hệ thống sử dụng module `lib/db.js` với cơ chế **Hybrid Database Adapter**:
- **Khi ở môi trường Local (không có biến môi trường Supabase):** Tự động đọc/ghi dữ liệu vào các file `data/wedding.json`, `data/rsvps.json`, `data/wishes.json`.
- **Khi ở môi trường Cloud / Vercel (đã cấu hình Supabase):** Tự động kết nối Supabase Cloud PostgreSQL, đảm bảo dữ liệu RSVP, Sổ lưu bút và Cấu hình tiệc cưới được bảo toàn vĩnh viễn 24/7 mà không bị ảnh hưởng bởi serverless read-only filesystem.

---

## 🚀 BƯỚC 1: TẠO PROJECT TRÊN SUPABASE (100% MIỄN PHÍ)

1. Truy cập [https://supabase.com](https://supabase.com) và bấm **Start your project** (Đăng nhập bằng tài khoản GitHub).
2. Nhấn nút **New Project**.
3. Điền thông tin dự án:
   - **Name:** `wedding-app-db` (hoặc tên tùy thích).
   - **Database Password:** Đặt mật khẩu an toàn và lưu lại.
   - **Region:** Chọn `Southeast Asia (Singapore)` để có tốc độ truy xuất nhanh nhất cho khách mời tại Việt Nam.
   - **Pricing Plan:** Chọn `Free plan` ($0/tháng).
4. Nhấn **Create new project** và chờ khoảng 1 - 2 phút để Supabase khởi tạo database.

---

## 💾 BƯỚC 2: CHẠY SCRIPT TẠO DATABASE SCHEMA

1. Tại Supabase Dashboard, nhìn vào menu thanh bên trái và bấm chọn **SQL Editor** (biểu tượng `>_` hoặc SQL).
2. Bấm nút **+ New query**.
3. Mở file `supabase_schema.sql` trong mã nguồn dự án, sao chép toàn bộ nội dung và dán vào ô soạn thảo của SQL Editor.
4. Bấm nút **Run** (màu xanh lá cây ở góc dưới bên phải) để thực thi.
5. Khi thấy thông báo `Success. No rows returned` (hoặc kết quả thành công), 3 bảng sau đã được tạo và phân quyền bảo mật RLS đầy đủ:
   - `public.wedding_config`: Lưu trữ theme, thông tin cô dâu chú rể, sự kiện, ảnh, tài khoản ngân hàng, timeline, mã PIN admin.
   - `public.rsvps`: Lưu danh sách khách mời xác nhận tham dự.
   - `public.wishes`: Lưu danh sách lời chúc mừng hạnh phúc.

---

## 🔑 BƯỚC 3: LẤY THÔNG TIN KẾT NỐI API KEYS

1. Tại Supabase Dashboard, bấm vào biểu tượng **Project Settings** (bánh răng ở menu trái) -> chọn mục **API**.
2. Tìm và sao chép 2 giá trị sau:
   - **Project URL:** Ví dụ `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **service_role (secret) key:** Chuỗi token bí mật dùng cho Backend API Routes (bỏ qua RLS một cách an toàn từ server-side).  
     *(Hoặc bạn cũng có thể sử dụng `anon (public) key`, schema đã được cấu hình RLS policies hỗ trợ cả hai).*

---

## 🌐 BƯỚC 4: CẤU HÌNH VÀ DEPLOY LÊN VERCEL

### 4.1. Đẩy mã nguồn lên GitHub
```bash
git add .
git commit -m "feat: complete supabase cloud database adapter"
git push origin main
```

### 4.2. Import Project vào Vercel
1. Đăng nhập [https://vercel.com](https://vercel.com) bằng GitHub.
2. Bấm **Add New...** -> **Project** -> Chọn repository `wedding_app` -> Bấm **Import**.
3. Tại phần **Environment Variables**, bấm mở rộng và thêm các biến môi trường sau:

| Tên biến (Key) | Giá trị (Value) | Mô tả |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | Đường dẫn Project URL từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Khóa bí mật service_role từ Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | (Tùy chọn) URL công khai |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | (Tùy chọn) Anon key từ Supabase |

4. Bấm **Deploy**.
5. Sau ~1 phút, website đám cưới của bạn đã online 24/7 tại địa chỉ `https://<ten-project>.vercel.app`!

---

## 🧪 BƯỚC 5: KIỂM THỬ VẬN HÀNH

1. **Trang chủ thiệp cưới:**
   - Mở đường link website trên điện thoại và máy tính.
   - Gửi thử 1 phản hồi tham dự (RSVP).
   - Gửi thử 1 lời chúc mừng vào Sổ lưu bút (Guestbook).
2. **Trang quản trị Admin (`/admin`):**
   - Đăng nhập bằng mã PIN mặc định: `admin123`.
   - Kiểm tra tab **Khách Mời (RSVP)**: dữ liệu vừa gửi lập tức hiển thị.
   - Kiểm tra tab **Sổ Lưu Bút**: lời chúc hiển thị đầy đủ, có thể bấm nút Xóa để test tính năng xóa.
   - Thử chỉnh sửa thông tin tiệc cưới hoặc đổi mã PIN mới -> Bấm Lưu cấu hình.
   - Mở Supabase Dashboard -> **Table Editor** để thấy dữ liệu cập nhật trực tiếp theo thời gian thực!

---

## 🔄 CHẠY THỬ LOCAL VỚI SUPABASE (TÙY CHỌN)

Nếu muốn kết nối trực tiếp với Supabase khi chạy local trên máy tính:
1. Tạo file `.env.local` tại thư mục gốc của dự án:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```
2. Chạy ứng dụng:
```bash
npm run dev
```
3. Mọi thao tác trên `http://localhost:3000` sẽ trực tiếp đồng bộ với Supabase Cloud.
