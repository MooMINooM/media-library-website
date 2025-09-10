// ------------------- 🎯 CONFIGURATION -------------------
// ❗️ กรุณานำ "Web app URL" ที่ได้จากการ Deploy ใน Apps Script มาวางที่นี่
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------


// --- MAIN SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    showPage('home'); 
});


// --- NAVIGATION SYSTEM ---
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
        }
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) {
        activePage.classList.remove('hidden');
    }

    document.querySelectorAll('#main-nav a[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // --- Load data for the specific page ---
    if (pageId === 'personnel') {
        loadPersonnelData();
    }
}


// --- PERSONNEL PAGE ---
async function loadPersonnelData() {
    const container = document.getElementById('personnel-container');
    const loadingEl = document.getElementById('personnel-loading');

    // Show loading message
    loadingEl.classList.remove('hidden');
    container.innerHTML = ''; // Clear old content
    container.appendChild(loadingEl);
    
    try {
        if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
            throw new Error("กรุณาตั้งค่า API_URL ในไฟล์ script.js ก่อน");
        }
        
        // Fetch data from our Google Sheet API
        const response = await fetch(`${API_URL}?sheet=personnel`);
        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }
        
        renderPersonnel(result.data);

    } catch (error) {
        console.error('Error loading personnel data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderPersonnel(personnelList) {
    const container = document.getElementById('personnel-container');
    const loadingEl = document.getElementById('personnel-loading');
    
    // Hide loading and clear container
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!personnelList || personnelList.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }

    personnelList.forEach(person => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition-transform duration-300 flex flex-col';
        
        // Fallback image if imageUrl is empty
        const imageUrl = person.imageUrl || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';

        card.innerHTML = `
            <div class="flex-grow">
                <img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100">
                <h3 class="text-lg font-bold text-blue-800">${person.name || 'N/A'}</h3>
                <p class="text-gray-600">${person.role || '-'}</p>
                <p class="text-sm text-gray-500 mt-2">${person.academicStanding || ''}</p>
            </div>
            <hr class="my-3">
            <div class="text-xs text-left grid grid-cols-2 gap-x-2">
                <strong class="text-gray-600 justify-self-end">วุฒิการศึกษา:</strong>
                <span class="text-gray-500">${person.education || '-'}</span>
                
                <strong class="text-gray-600 justify-self-end">ห้องประจำชั้น:</strong>
                <span class="text-gray-500">${person.class || '-'}</span>

                <strong class="text-gray-600 justify-self-end">โทร:</strong>
                <span class="text-gray-500">${person.tel || '-'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

