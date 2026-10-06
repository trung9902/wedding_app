# BÁO CÁO KIỂM THỬ BẢO MẬT & ĐÁNH GIÁ NGUY CƠ TẤN CÔNG (SECURITY AUDIT REPORT)
**Dự án:** Wedding App (Hệ thống Thiệp cưới Online, RSVP & Guestbook)  
**Vai trò:** QA & Security Bot / Lead Security Auditor  
**Phạm vi kiểm toán:** Toàn bộ API Endpoints (`/api/wedding`, `/api/rsvp`, `/api/guestbook`, `/api/admin/login`, `/api/admin/reset`), luồng xác thực và Frontend client.

---

## I. TỔNG QUAN KẾT QUẢ ĐÁNH GIÁ (EXECUTIVE SUMMARY)

Hệ thống thiệp cưới trực tuyến đã xây dựng giao diện hoàn chỉnh và hỗ trợ lưu trữ dữ liệu qua tệp tin JSON cục bộ. Tuy nhiên, qua quá trình kiểm thử hộp trắng (White-box Security Review) và phân tích luồng dữ liệu, chúng tôi phát hiện nhiều lỗ hổng bảo mật nghiêm trọng liên quan đến xác thực, phân quyền, kiểm soát dữ liệu đầu vào (Input Validation), từ chối dịch vụ (DoS) và an toàn xuất file (CSV Injection).

### Bảng tổng hợp lỗ hổng:
| ID | Lỗ hổng | Mức độ nghiêm trọng | CVSS v3.1 | Trạng thái |
|---|---|---|---|---|
| **SEC-01** | **Authentication Bypass (Vượt xác thực) tại `PUT /api/wedding`** | **CRITICAL** | **9.8** | Phát hiện |
| **SEC-02** | **Broken Access Control (Thiếu xác thực) tại `DELETE /api/guestbook`** | **HIGH** | **7.5** | Phát hiện |
| **SEC-03** | **Nguy cơ Brute-force PIN & Thiếu Rate Limiting** | **HIGH** | **7.5** | Phát hiện |
| **SEC-04** | **Denial of Service (DoS): Unbounded Payloads & I/O Event Loop Block** | **HIGH** | **7.5** | Phát hiện |
| **SEC-05** | **CSV / Formula Injection trong tính năng Export RSVP** | **MEDIUM** | **6.1** | Phát hiện |
| **SEC-06** | **Stored XSS & Malicious Protocol Injection (`javascript:`)** | **MEDIUM** | **6.1** | Phát hiện |
| **SEC-07** | **Lưu trữ Secret Plaintext & Timing Attack trên chuỗi so sánh PIN** | **MEDIUM** | **5.3** | Phát hiện |
| **SEC-08** | **Race Condition & Mất dữ liệu khi ghi đồng thời (File I/O)** | **MEDIUM** | **5.3** | Phát hiện |

---

## II. CHI TIẾT CÁC LỖ HỔNG & NGUY CƠ TẤN CÔNG

### 1. Brute-force PIN & Lỗ hổng xác thực (Broken Authentication)
- **Vị trí:**
  - `app/api/admin/login/route.js`
  - `app/api/admin/reset/route.js`
  - `app/api/wedding/route.js`
- **Cơ chế & Nguy cơ:**
  1. **Không giới hạn tần suất (No Rate Limiting / Delay):** Hệ thống không triển khai rate limit hoặc CAPTCHA. Kẻ tấn công có thể chạy script brute-force hàng nghìn mã PIN/giây.
  2. **Mã PIN mặc định yếu & Plaintext:** Mặc định là `admin123`, lưu trực tiếp dạng plaintext trong `data/wedding.json`.
  3. **Lỗ hổng Logic Authentication Bypass (Nghiêm trọng nhất):**
     Tại `app/api/wedding/route.js` dòng 29:
     ```javascript
     if (body.pin && body.pin !== currentData.adminPin) {
       return NextResponse.json({ success: false, error: 'Sai mã PIN quản trị!' }, { status: 401 });
     }
     ```
     👉 **Phân tích:** Nếu request không gửi thuộc tính `pin` (`body.pin` là `undefined`), điều kiện `body.pin && ...` sẽ trả về `false`. Do đó, kẻ tấn công hoàn toàn có thể gửi request `PUT /api/wedding` không có PIN mà vẫn cập nhật thành công toàn bộ dữ liệu đám cưới, số tài khoản ngân hàng nhận tiền mừng, thậm chí đổi luôn `adminPin` qua trường `newPin`!
  4. **Timing Attack:** Sử dụng so sánh chuỗi thông thường (`===`) thay vì so sánh an toàn `crypto.timingSafeEqual`.
  5. **Lưu trữ PIN ở `localStorage`:** Frontend lưu mã PIN trực tiếp vào `localStorage.setItem('wedding_admin_pin', inputPin)`, nếu bị dính XSS thì toàn bộ quyền admin bị chiếm đoạt.

---

### 2. SQL Injection / NoSQL & Data Injection
- **Vị trí:** `app/api/wedding/route.js`, `app/api/rsvp/route.js`, `app/api/guestbook/route.js`
- **Cơ chế & Nguy cơ:**
  1. Hiện tại hệ thống dùng file JSON cục bộ (`fs.readFileSync`/`fs.writeFileSync`) nên không bị lỗi SQL Injection truyền thống.
  2. **Mass Assignment / Prototype Pollution:** Tại `PUT /api/wedding`, `...currentData, ...body.data` cho phép client ghi đè bất kỳ trường dữ liệu tùy ý mà không qua schema validation.
  3. **Rủi ro khi chuyển sang CSDL quan hệ (SQL Migration):** Nếu sau này chuyển sang SQLite/PostgreSQL/MySQL mà nối chuỗi thô (raw query string) thay vì parameterized query, các trường `name`, `phone`, `note`, `message` sẽ trực tiếp tạo thành lỗ hổng SQLi nghiêm trọng.

---

### 3. XSS (Cross-Site Scripting) trong Guestbook & URL Injection
- **Vị trí:**
  - `app/page.js`
  - `app/admin/page.js`
  - `app/api/guestbook/route.js`
- **Cơ chế & Nguy cơ:**
  1. **React JSX Auto-escaping:** React mặc định escape các chuỗi string khi render trong `{item.name}` và `{item.message}`. Tuy nhiên, dữ liệu trong `data/wishes.json` lưu trữ nguyên văn các payload HTML/Script độc hại mà không được sanitize tại backend.
  2. **Link / Protocol Injection (`javascript:`):**
     Trong `app/page.js`:
     ```jsx
     <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
     ```
     Nếu trường `mapUrl`, `groom.avatar`, hoặc `media.coverImage` bị sửa thành `javascript:alert(document.domain)` (thông qua lỗ hổng bypass `PUT /api/wedding`), người dùng bấm vào xem bản đồ sẽ bị thực thi mã JavaScript ngay trên trình duyệt (Stored DOM XSS).
  3. **DOM XSS khi mở rộng:** Bất kỳ tính năng nào sau này hiển thị lời chúc sử dụng `dangerouslySetInnerHTML` hoặc thư viện HTML renderer bên thứ ba sẽ bị khai thác ngay lập tức.

---

### 4. DoS Payload (Từ chối dịch vụ) & Resource Exhaustion
- **Vị trí:**
  - `app/api/guestbook/route.js`
  - `app/api/rsvp/route.js`
  - `app/api/wedding/route.js`
- **Cơ chế & Nguy cơ:**
  1. **Không giới hạn độ dài trường dữ liệu (Unbounded String Length):** Các trường `name`, `message`, `phone`, `note` không có ràng buộc `max_length`. Kẻ tấn công có thể gửi payload dung lượng 10MB - 50MB trong mỗi request.
  2. **Nghẽn luồng xử lý Node.js (Event Loop Starvation):** Các API sử dụng hàm đồng bộ `fs.readFileSync` và `fs.writeFileSync`. Khi file dữ liệu lớn hoặc có hàng trăm request đồng thời, việc đọc/ghi và parse/stringify JSON đồng bộ sẽ làm nghẽn toàn bộ Event Loop của Node.js, khiến server bị đơ (freeze) và từ chối toàn bộ người dùng khác.
  3. **Rủi ro cạn kiệt dung lượng đĩa (Disk Flooding):** Kẻ tấn công có thể spam hàng triệu lời chúc / RSVP rác làm đầy ổ cứng máy chủ.
  4. **Unvalidated Integers trong RSVP:** Trường `guestCount: parseInt(body.guestCount) || 1` cho phép truyền số âm (ví dụ `-1000`) hoặc số khổng lồ (`999999999`), làm sai lệch hoàn toàn thống kê khách mời.

---

### 5. CSV / Formula Injection (CWE-1236)
- **Vị trí:** `app/admin/page.js` hàm `handleExportCsv`
- **Cơ chế & Nguy cơ:**
  - Code hiện tại:
    ```javascript
    csvContent += `"${idx + 1}","${r.name}","${r.phone}","${r.attending === 'yes' ? 'Tham dự' : 'Không tham dự'}","${r.guestCount}","${r.note}","${new Date(r.createdAt).toLocaleString('vi-VN')}"\n`;
    ```
  - Nếu khách nhập tên hoặc ghi chú RSVP bắt đầu bằng `=cmd|' /C calc'!A0`, `=HYPERLINK(...)`, `@`, `+`, `-`: Khi Admin tải file `.csv` về mở bằng Microsoft Excel hoặc Google Sheets, công thức độc hại sẽ tự động thực thi trên máy của Admin (Remote Command Execution / Data Exfiltration).

---

### 6. Broken Access Control trên API Xóa Lời Chúc
- **Vị trí:** `app/api/guestbook/route.js` hàm `DELETE`
- **Cơ chế & Nguy cơ:**
  - API `DELETE /api/guestbook?id=...` không kiểm tra bất kỳ quyền hạn nào (không có mã PIN, không có token). Bất kỳ ai biết hoặc đoán được ID lời chúc (`wish-xxx`) đều có thể xóa vĩnh viễn lời chúc của người khác.

---

## III. GIẢI PHÁP VÁ LỖI CHI TIẾT (REMEDIATION BLUEPRINT)

Dưới đây là phương án và mã nguồn đề xuất để khắc phục triệt để từng lỗ hổng.

### 1. Vá lỗ hổng Authentication & Access Control
- Sửa điều kiện kiểm tra mã PIN bắt buộc tại `PUT /api/wedding`.
- Thêm bảo vệ xác thực cho `DELETE /api/guestbook`.
- Sử dụng hàm băm mật khẩu `bcryptjs` hoặc `crypto.scryptSync` + `timingSafeEqual`.

### 2. Triển khai Rate Limiting & Input Sanitization
- Thêm middleware hoặc helper kiểm soát tần suất request theo IP (ví dụ tối đa 5 lần thử PIN/phút, tối đa 10 RSVP/phút).
- Validate kiểu dữ liệu và độ dài chuỗi tối đa (`name`: 100 chars, `message`: 500 chars, `note`: 300 chars, `guestCount`: 1 đến 10).
- Sanitize HTML bằng thư viện hoặc encode ký tự đặc biệt (`<`, `>`, `&`, `"`, `'`).
- Chặn protocol `javascript:` / `data:` trên tất cả các link URL.

### 3. Vá lỗi CSV Formula Injection
- Thêm ký tự nháy đơn `'` hoặc tab trước các ký tự công thức (`=`, `+`, `-`, `@`, `\t`, `\r`) và escape dấu nháy kép `"` thành `""`.

### 4. Tối ưu I/O bất đồng bộ & Khóa tệp tránh Race Condition
- Sử dụng `fs.promises.readFile` / `fs.promises.writeFile`.
- Giới hạn kích thước tối đa của body parser.

---

*Báo cáo được khởi tạo tự động bởi QA & Security Bot theo tiêu chuẩn OWASP ASVS & Top 10 Web Application Security Risks.*
