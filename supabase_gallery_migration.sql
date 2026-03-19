-- ================================================
-- Migration: เพิ่มคอลัมน์ album_url ใน gallery_albums
-- วิธีใช้: ไปที่ Supabase Dashboard > SQL Editor > วางโค้ดนี้แล้วกด Run
-- ================================================

-- เพิ่มคอลัมน์ album_url (เก็บ link อัลบั้ม Google Photos / Drive ฯลฯ)
ALTER TABLE public.gallery_albums
    ADD COLUMN IF NOT EXISTS album_url text;

-- (ไม่บังคับ) ลบคอลัมน์ folder_path ที่ไม่ใช้แล้ว
-- หากยังมีข้อมูลเก่าที่ต้องการเก็บ ให้ comment บรรทัดนี้ไว้ก่อน
-- ALTER TABLE public.gallery_albums DROP COLUMN IF EXISTS folder_path;

-- ตรวจสอบโครงสร้างตารางใหม่
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_albums'
ORDER BY ordinal_position;
