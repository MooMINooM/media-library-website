const API_URL = 'https://script.google.com/macros/s/AKfycbxdQD269SiCnYGEFo4P_da7_QrCXLRKb8YtP7mS-14MvshthK3pZxRovT0CBd7iMr6G1w/exec';

export async function fetchFromSheet(sheetName) {
    try {
        const response = await fetch(`${API_URL}?action=getData&sheet=${sheetName}`);
        const result = await response.json();
        return result;
    } catch (e) {
        console.error("Fetch Error:", e);
        return [];
    }
}
