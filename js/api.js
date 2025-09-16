// This file is responsible for all communication with external APIs, like Google Sheets.

const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';

// A generic function to fetch data from any sheet
async function fetchData(sheetName) {
    if (!API_URL) throw new Error("API_URL is not configured.");
    
    // Add a cache-busting parameter to ensure we get fresh data
    const url = `${API_URL}?sheet=${sheetName}&v=${new Date().getTime()}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.error) throw new Error(result.error);
    
    return result.data;
}

// Specific functions for each data type
export async function loadTeacherAchievementsData() {
    return fetchData('performance');
}

export async function loadInnovationsData() {
    return fetchData('innovations');
}

