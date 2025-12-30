const API_URL = 'https://script.google.com/macros/s/AKfycbz8hsStyHFm6Mm4B21N-K8HY1I0o4cIpuDYE9DW8OlbOu4W2rDh7J-i7XNwxodfeikN/exec';

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
