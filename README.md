# 💍 Ứng Dụng Thiệp Cưới Online & Quản Trị Tái Sử Dụng

Ứng dụng thiệp cưới trực tuyến hiện đại, sang trọng, tích hợp bảng quản trị linh hoạt cho phép **thay đổi toàn bộ nội dung từ đám cưới này sang đám cưới khác và tái sử dụng không giới hạn**.

---

## 🌟 Tính Năng Nổi Bật

### 💖 1. Giao Diện Khách Mời (Public Invitation)
- **Mở phong bao thư tương tác:** Hiệu ứng sáp niêm phong và mở thiệp 3D chân thực.
- **Nhạc nền du dương:** Tự động/nút bật tắt nhạc du dương (Floating Music Player).
- **Hiệu ứng cánh hoa rơi (Petals Canvas):** Cánh hoa hồng nhẹ nhàng bay trong không gian.
- **Giới thiệu Cô Dâu & Chú Rể:** Đại diện hai bên gia đình, ảnh chân dung và lời ngỏ.
- **Bộ đếm ngược thời gian thực (Countdown):** Đếm lùi ngày - giờ - phút - giây đến lễ cưới.
- **Thời gian & Địa điểm:** Tích hợp nút xem trực tiếp trên **Google Maps**.
- **Lịch trình hôn lễ:** Lễ đón dâu, thành hôn, khai tiệc, giao lưu.
- **Album ảnh cưới tương tác:** Phóng to xem ảnh sắc nét với popup Lightbox.
- **Hộp Mừng Cưới & Quét Mã VietQR:** Tự động tạo mã VietQR chuẩn cho Chú rể và Cô dâu kèm nút sao chép STK 1-chạm.
- **Xác nhận tham dự (RSVP):** Khách gửi xác nhận số người đi kèm và lời nhắn.
- **Sổ lưu bút online:** Khách gửi lời chúc yêu thương và xem danh sách lời chúc.

### ⚙️ 2. Bảng Quản Trị Tái Sử Dụng (/admin)
- **Mã PIN bảo mật:** Đăng nhập an toàn (Mặc định: `admin123`).
- **Tab 1 - Thông tin Cô dâu & Chú rể:** Sửa tên, họ hàng hai bên, ảnh đại diện, tiểu sử.
- **Tab 2 - Thời gian & Địa điểm:** Đổi ngày dương lịch, ngày âm lịch, địa điểm, link Google Maps, lời ngỏ.
- **Tab 3 - Hình ảnh & Âm nhạc:** Đổi ảnh bìa chính, link nhạc nền MP3, thêm/xóa ảnh trong Album.
- **Tab 4 - STK Mừng Cưới & VietQR:** Chọn ngân hàng, nhập STK & Tên chủ thẻ (Xem trước mã VietQR tự động ngay lập tức).
- **Tab 5 - Quản lý Khách RSVP & Lời Chúc:** Xem tổng số khách tham dự, danh sách chi tiết, xuất file Excel/CSV, xóa lời chúc rác.
- **Tab 6 - Bắt Đầu Đám Cưới Mới (1-Click Reset):** Xóa sạch toàn bộ RSVP và lời chúc của đám cưới cũ để sẵn sàng cho cặp đôi tiếp theo chỉ với 1 cú click!

---

## 🚀 Hướng Dẫn Chạy & Sử Dụng

### 1. Chạy ứng dụng:
Ứng dụng đang chạy sẵn tại:
- **Trang Thiệp Mời Cưới:** [http://localhost:3005](http://localhost:3005)
- **Trang Quản Trị:** [http://localhost:3005/admin](http://localhost:3005/admin) (Mã PIN: `admin123`)

### 2. Lệnh khởi động lại (Nếu cần):
```bash
cd C:\Users\trung\software_studio\projects\wedding_app
npm run dev
# Hoặc chạy bản Production:
npm run build
npm run start -- -p 3005
```

---

## 📁 Cấu Trúc Dự Án

```text
wedding_app/
├── app/
│   ├── layout.js          # Google Fonts, Metadata & Root layout
│   ├── globals.css        # Tailwind CSS & Custom keyframe animations
│   ├── page.js            # Giao diện Thiệp Mời công khai (Client Interactive)
│   ├── admin/page.js      # Bảng Quản Trị Toàn Năng (/admin)
│   └── api/
│       ├── wedding/       # API lấy & cập nhật nội dung đám cưới
│       ├── rsvp/          # API gửi & lấy danh sách khách xác nhận
│       ├── guestbook/     # API gửi, xem & xóa lời chúc
│       └── admin/         # API Login & 1-Click Reset đám cưới mới
├── data/
│   ├── wedding.json       # File dữ liệu cấu hình đám cưới hiện tại
│   ├── rsvps.json         # File lưu trữ danh sách khách phản hồi
│   └── wishes.json        # File lưu trữ sổ lưu bút lời chúc
└── package.json
```
