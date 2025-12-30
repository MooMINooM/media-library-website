// js/api.js
// ⚠️ เปลี่ยน URL ตรงนี้เป็น URL ล่าสุดที่คุณเพิ่ง Deploy แบบ "Anyone"
const API_URL = 'https://script.google.com/macros/s/AKfycbx0JR74pvjdbcSu8GfHRQQudUb4IO-rDQsJkkZQnL704LXm2PLW_DSJcm34LjCteFBD8g/exec'; 

// ฟังก์ชันอื่นๆ คงเดิม...
export async function fetchData(sheetName) {
    if (!API_URL) throw new Error("API_URL is not configured.");
    const response = await fetch(`${API_URL}?action=getData&sheet=${sheetName}`); // แก้ URL parameter ให้ตรงกับ Code.gs
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result; // แก้การ return ให้ตรงกับโครงสร้างข้อมูล
}
