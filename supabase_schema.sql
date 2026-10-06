-- ==========================================================
-- SUPABASE DATABASE SCHEMA FOR WEDDING APP (24/7 CLOUD READY)
-- ==========================================================
-- Hướng dẫn:
-- 1. Đăng nhập vào Supabase Dashboard: https://supabase.com
-- 2. Chọn Project của bạn -> Vào mục "SQL Editor" (ở thanh bên trái)
-- 3. Bấm "New Query", sao chép toàn bộ nội dung file này dán vào và bấm "Run"
-- ==========================================================

-- 1. BẢNG CẤU HÌNH ĐÁM CƯỚI (wedding_config)
CREATE TABLE IF NOT EXISTS public.wedding_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    admin_pin TEXT NOT NULL DEFAULT 'admin123',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG XÁC NHẬN THAM DỰ (rsvps)
CREATE TABLE IF NOT EXISTS public.rsvps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    attending TEXT DEFAULT 'yes',
    guest_count INTEGER DEFAULT 1,
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index tối ưu sắp xếp theo thời gian mới nhất
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps (created_at DESC);

-- 3. BẢNG SỔ LƯU BÚT / LỜI CHÚC (wishes)
CREATE TABLE IF NOT EXISTS public.wishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index tối ưu sắp xếp theo thời gian mới nhất
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON public.wishes (created_at DESC);

-- ==========================================================
-- 4. BẬT ROW LEVEL SECURITY (RLS) & PHÂN QUYỀN BẢO MẬT
-- ==========================================================

ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp policies cũ nếu chạy lại script
DROP POLICY IF EXISTS "Allow public read access on wedding_config" ON public.wedding_config;
DROP POLICY IF EXISTS "Allow public write on wedding_config" ON public.wedding_config;
DROP POLICY IF EXISTS "Allow all on wedding_config" ON public.wedding_config;

DROP POLICY IF EXISTS "Allow public read on rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public insert on rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Allow all on rsvps" ON public.rsvps;

DROP POLICY IF EXISTS "Allow public read on wishes" ON public.wishes;
DROP POLICY IF EXISTS "Allow public insert on wishes" ON public.wishes;
DROP POLICY IF EXISTS "Allow all on wishes" ON public.wishes;

-- 4.1 Policies cho wedding_config
-- Cho phép đọc cấu hình công khai (Next.js backend sẽ lọc bỏ admin_pin trước khi trả về client)
CREATE POLICY "Allow public read access on wedding_config"
    ON public.wedding_config FOR SELECT
    USING (true);

-- 4.2 Policies cho rsvps (Khách mời có thể xem danh sách và gửi xác nhận tham dự)
CREATE POLICY "Allow public read on rsvps"
    ON public.rsvps FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on rsvps"
    ON public.rsvps FOR INSERT
    WITH CHECK (true);

-- 4.3 Policies cho wishes (Khách mời có thể xem và gửi lời chúc lưu bút)
CREATE POLICY "Allow public read on wishes"
    ON public.wishes FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on wishes"
    ON public.wishes FOR INSERT
    WITH CHECK (true);

-- Lưu ý bảo mật: Các thao tác nhạy cảm (Cập nhật cấu hình, Đổi mã PIN, Xóa lời chúc, Đặt lại dữ liệu)
-- được thực hiện qua Next.js Server-Side API Routes sử dụng SUPABASE_SERVICE_ROLE_KEY (tự động bypass RLS an toàn sau khi xác thực mã PIN).

-- ==========================================================
-- 5. KHỞI TẠO DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==========================================================

INSERT INTO public.wedding_config (id, admin_pin, config)
VALUES (
    'default',
    'admin123',
    '{
      "theme": {
        "current": "luxury-gold",
        "presets": {
          "luxury-gold": {
            "id": "luxury-gold",
            "name": "Luxury Gold",
            "vietnameseName": "Hoàng Kim Sang Trọng",
            "tagline": "Cổ điển, Quý phái & Vĩnh cửu",
            "description": "Tông màu vàng hoàng kim vương giả kết hợp sắc kem champagne ấm áp, mang vẻ đẹp hoàng gia bất hủ và đẳng cấp.",
            "colors": {
              "primary": "#C58C4F",
              "primaryHover": "#AA7238",
              "primaryDark": "#643F1D",
              "primaryLight": "#F5ECE0",
              "secondary": "#DEBD99",
              "accent": "#D4AF37",
              "background": "#FAF7F2",
              "cardBg": "rgba(255, 255, 255, 0.92)",
              "text": "#3E2713",
              "textMuted": "#875628",
              "border": "#EBD6BF",
              "gradient": "from-amber-600 via-amber-500 to-amber-700",
              "gradientStyle": "linear-gradient(135deg, #C58C4F 0%, #D4AF37 50%, #AA7238 100%)",
              "petalColor": "#DEBD99"
            },
            "cssVariables": {
              "--primary": "#C58C4F",
              "--primary-hover": "#AA7238",
              "--primary-dark": "#643F1D",
              "--primary-light": "#F5ECE0",
              "--secondary": "#DEBD99",
              "--accent": "#D4AF37",
              "--bg-color": "#FAF7F2",
              "--text-color": "#3E2713",
              "--text-muted": "#875628",
              "--border-color": "#EBD6BF"
            }
          }
        }
      },
      "groom": {
        "fullName": "Trần Anh Dũng",
        "shortName": "Anh Dũng",
        "father": "Trần Quốc Tuấn",
        "mother": "Nguyễn Thị Mai",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "description": "Kỹ sư công nghệ, đam mê âm nhạc và luôn yêu thương, trân trọng gia đình.",
        "bank": {
          "bankName": "Vietcombank (VCB)",
          "bankCode": "VCB",
          "accountNo": "0011004382910",
          "accountName": "TRAN ANH DUNG"
        }
      },
      "bride": {
        "fullName": "Lê Mai Phương",
        "shortName": "Mai Phương",
        "father": "Lê Văn Hùng",
        "mother": "Phạm Thị Lan",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        "description": "Nhà thiết kế thời trang, yêu cái đẹp và nụ cười luôn nở trên môi.",
        "bank": {
          "bankName": "MB Bank (MB)",
          "bankCode": "MB",
          "accountNo": "0988776655",
          "accountName": "LE MAI PHUONG"
        }
      },
      "event": {
        "title": "LỄ THÀNH HÔN",
        "weddingDate": "2026-12-12T11:30:00",
        "lunarDate": "04 Tháng 11 Năm Bính Ngọ",
        "ceremonyTime": "11:00",
        "partyTime": "11:30",
        "venueName": "Trung tâm Hội nghị & Tiệc cưới Trống Đồng Palace",
        "venueAddress": "Số 72 Quán Sứ, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội",
        "mapUrl": "https://maps.google.com/?q=Trung+tam+Tiec+cuoi+Trong+Dong+Palace+72+Quan+Su+Ha+Noi",
        "message": "Tình yêu là một hành trình kỳ diệu mà ở đó hai tâm hồn tìm thấy nhau và cùng hòa chung một nhịp đập. Chúng tôi vô cùng hạnh phúc và trân trọng kính mời bạn cùng gia đình đến chung vui trong ngày đặc biệt này."
      },
      "media": {
        "coverImage": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
        "musicUrl": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=until-i-found-you-piano-112191.mp3",
        "gallery": [
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      "timeline": [
        {
          "time": "08:30",
          "title": "Lễ Đón Dâu (Rước dâu)",
          "desc": "Nghi thức rước dâu truyền thống tại tư gia nhà gái."
        },
        {
          "time": "10:30",
          "title": "Lễ Thành Hôn & Đón Khách",
          "desc": "Chào đón quan khách và chụp ảnh lưu niệm tại sảnh tiệc chính."
        },
        {
          "time": "11:30",
          "title": "Khai Tiệc Chiêu Đãi",
          "desc": "Nâng ly chúc mừng hạnh phúc lứa đôi và thưởng thức tiệc cưới."
        },
        {
          "time": "13:00",
          "title": "Trò Chơi & Cảm Ơn",
          "desc": "Mini game vui nhộn cùng bạn bè và gửi lời triân đến quý khách."
        }
      ]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Khởi tạo dữ liệu mẫu cho RSVPs
INSERT INTO public.rsvps (id, name, phone, attending, guest_count, note, created_at)
VALUES 
    ('rsvp-1', 'Nguyễn Hoàng Long', '0912345678', 'yes', 2, 'Chúc hai bạn trăm năm hạnh phúc, sớm sinh quý tử nhé!', '2026-10-01T14:20:00.000Z'),
    ('rsvp-2', 'Trần Thu Hà', '0987654321', 'yes', 1, 'Rất vinh dự được đến chung vui cùng Mai Phương và Anh Dũng!', '2026-10-02T09:15:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Khởi tạo dữ liệu mẫu cho Lời chúc (Wishes)
INSERT INTO public.wishes (id, name, message, created_at)
VALUES 
    ('wish-1', 'Minh & Trang', 'Chúc hai bạn mãi mãi yêu thương nhau như ngày đầu, cùng nhau xây đắp một gia đình ngập tràn tiếng cười và hạnh phúc!', '2026-10-01T15:30:00.000Z'),
    ('wish-2', 'Anh Tuấn (Team Tech)', 'Chúc chú rể Dũng và cô dâu Phương bách niên giai lão, cuộc sống luôn viên mãn ngọt ngào!', '2026-10-02T10:00:00.000Z'),
    ('wish-3', 'Hội bạn thân cấp 3', 'Cuối cùng ngày này cũng tới! Chúc đôi bạn trẻ sớm có tin vui và luôn đồng hành cùng nhau nhé!', '2026-10-03T18:45:00.000Z')
ON CONFLICT (id) DO NOTHING;
