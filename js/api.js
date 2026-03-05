// js/api.js - เชื่อมต่อ Supabase

// ⚠️⚠️ ตั้งค่า Supabase ตรงนี้ (เอามาจาก Supabase Dashboard) ⚠️⚠️
const SUPABASE_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; // เปลี่ยนตรงนี้
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';         // เปลี่ยนตรงนี้ (ที่เป็น anon/public)

// สร้าง Client
let _supabase = null;
if (typeof supabase !== 'undefined') {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase library not loaded! Check index.html');
}

export async function fetchData(tableName) {
    if (!_supabase) return [];

    // แปลงชื่อให้ตรงกับ Table ใน Supabase (ต้องตัวพิมพ์เล็กทั้งหมดตามมาตรฐาน Supabase)
    // เช่น 'News' -> 'news'
    const table = tableName.toLowerCase();

    try {
        // ดึงข้อมูลทั้งหมด
        let { data, error } = await _supabase
            .from(table)
            .select('*')
            .order('id', { ascending: true }); // เรียงตาม ID หรือ date ก็ได้

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            return [];
        }
        
        return data;
    } catch (err) {
        console.error("System Error:", err);
        return [];
    }
}
