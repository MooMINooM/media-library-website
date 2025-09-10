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


// --- UTILITY FUNCTION ---
/**
 * แปลงลิงก์ Google Drive sharing URL ให้เป็น Direct Image URL
 * @param {string} url - The original Google Drive URL
 * @returns {string} The direct image URL
 */
function getDirectGoogleDriveUrl(url) {
    if (!url || !url.includes('drive.google.com')) {
        return url; 
    }
    try {
        const fileId = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (e) {
        console.error("Could not parse Google Drive URL:", url);
        return url; 
    }
}


// --- PERSONNEL PAGE ---
async function loadPersonnelData() {
    const container = document.getElementById('personnel-container');
    const loadingEl = document.getElementById('personnel-loading');

    loadingEl.classList.remove('hidden');
    container.innerHTML = ''; 
    container.appendChild(loadingEl);
    
    try {
        if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
            throw new Error("กรุณาตั้งค่า API_URL ในไฟล์ script.js ก่อน");
        }
        
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
    
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!personnelList || personnelList.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }

    personnelList.forEach(person => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition-transform duration-300 flex flex-col';
        
        const finalImageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        
        const educationList = person.education 
            ? person.education.split('\n').map(edu => `<li>${edu.trim()}</li>`).join('') 
            : '<li>-</li>';

        card.innerHTML = `
            <div class="flex-grow">
                <img 
                    src="${finalImageUrl}" 
                    alt="รูปภาพของ ${person.name}" 
                    class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                    onerror="this.onerror=null; this.src='${errorImageUrl}';"
                >
                <h3 class="text-lg font-bold text-blue-800">${person.name || 'N/A'}</h3>
                <p class="text-gray-600">${person.role || '-'}</p>
                <p class="text-sm text-gray-500 mt-2">${person.academicStanding || ''}</p>
            </div>
            <hr class="my-3">
            <div class="text-xs text-left grid grid-cols-[auto_1fr] gap-x-2 items-start">
                <strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong>
                <ul class="text-gray-500 list-disc list-inside">
                    ${educationList}
                </ul>
                
                <strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong>
                <span class="text-gray-500">${person.class || '-'}</span>

                <strong class="text-gray-600 text-right">โทร:</strong>
                <span class="text-gray-500">${person.tel || '-'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

