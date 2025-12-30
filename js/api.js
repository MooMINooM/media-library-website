// ใส่ URL ของ Google Apps Script ที่ Deploy ล่าสุด
const API_URL = 'https://script.google.com/macros/s/AKfycbz8FQ_Y05PRYEJJrYULFPYDUdpWJssiTgz2UTrq1gz11hVpEqE9xPqjmIaKM8xp67eUXA/exec';

export async function fetchData(sheetName) {
    if (!API_URL) return [];
    try {
        const response = await fetch(`${API_URL}?action=getData&sheet=${sheetName}`);
        const data = await response.json();
        return data.error ? [] : data;
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}
