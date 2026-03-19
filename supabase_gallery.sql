-- ================================================
-- ระบบแกลลอรี่รูปภาพ — โรงเรียนบ้านก้อจัดสรร
-- ================================================
-- วิธีใช้:
--   STEP 1: รันไฟล์นี้ใน Supabase Dashboard > SQL Editor
--   STEP 2: ไปที่ Storage > สร้าง Bucket ชื่อ "gallery" (ดูคำแนะนำด้านล่าง)
-- ================================================

-- ===== TABLE: gallery_albums =====
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id            bigserial      PRIMARY KEY,
    title         text           NOT NULL,
    description   text,
    category      text           NOT NULL DEFAULT 'activity'
                  CHECK (category IN ('academic','activity','sport','ceremony','other')),
    folder_path   text           NOT NULL UNIQUE,   -- ชื่อโฟลเดอร์ใน Storage เช่น "wai-kru-2568"
    cover_url     text,                              -- URL รูปปกอัลบั้ม (ไม่บังคับ)
    event_date    date,                              -- วันที่จัดกิจกรรม
    academic_year text,                              -- ปีการศึกษา เช่น "2568"
    created_at    timestamptz    DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_gallery_albums"
    ON public.gallery_albums FOR SELECT USING (true);

CREATE POLICY "admin_write_gallery_albums"
    ON public.gallery_albums FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ===== ข้อมูลตัวอย่าง =====
INSERT INTO public.gallery_albums
    (title, description, category, folder_path, event_date, academic_year)
VALUES
    ('วันไหว้ครู ปีการศึกษา 2568',    'กิจกรรมวันไหว้ครูประจำปีการศึกษา 2568', 'ceremony', 'wai-kru-2568',      '2025-06-12', '2568'),
    ('กีฬาสี ประจำปี 2568',             'การแข่งขันกีฬาสีภายในโรงเรียน',          'sport',    'sport-day-2568',    '2025-08-20', '2568'),
    ('วันแม่แห่งชาติ 2568',             'กิจกรรมวันแม่และนิทรรศการ',              'activity', 'mothers-day-2568',  '2025-08-12', '2568'),
    ('กิจกรรมวันวิทยาศาสตร์',          'นิทรรศการและการทดลองวิทยาศาสตร์',       'academic', 'science-day-2568',  '2025-08-18', '2568');

-- ===================================================
-- STEP 2: สร้าง Storage Bucket "gallery"
-- ===================================================
-- ไปที่ Supabase Dashboard > Storage > New Bucket
-- ชื่อ Bucket: gallery
-- Public bucket: เปิด ✅ (เพื่อให้แสดงรูปได้โดยไม่ต้อง login)
--
-- Storage Policy (รันใน SQL Editor หลังสร้าง bucket แล้ว):

-- อ่านได้ทุกคน (Public)
CREATE POLICY "public_read_gallery_storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery');

-- อัปโหลด/ลบได้เฉพาะ Admin ที่ล็อกอิน
CREATE POLICY "admin_upload_gallery_storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

CREATE POLICY "admin_delete_gallery_storage"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- ===================================================
-- วิธีจัดโฟลเดอร์ใน Storage Bucket "gallery"
-- ===================================================
-- gallery/
--   wai-kru-2568/        ← folder_path ของอัลบั้ม "วันไหว้ครู"
--     photo1.jpg
--     photo2.jpg
--     ...
--   sport-day-2568/      ← folder_path ของอัลบั้ม "กีฬาสี"
--     img001.jpg
--     ...
--
-- ขั้นตอนการใช้งาน:
-- 1. สร้างอัลบั้มใน Admin Panel (ระบุ folder_path เช่น "wai-kru-2568")
-- 2. อัปโหลดรูปด้วยปุ่ม "อัปโหลดรูปภาพ" ใน Admin Panel
--    หรืออัปโหลดตรงใน Supabase Dashboard > Storage > gallery
-- 3. รูปทุกรูปในโฟลเดอร์จะแสดงในแกลลอรี่อัตโนมัติ ✅
-- ===================================================

SELECT COUNT(*) AS total_albums FROM public.gallery_albums;
