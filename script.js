// ------------------- 🎯 CONFIGURATION -------------------
// ❗️ กรุณานำ "Web app URL" ที่ได้จากการ Deploy ใน Apps Script มาวางที่นี่
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------


// --- Global Variables ---
let personnelDataCache = []; // Cache to store personnel data


// --- MAIN SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModal();
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

    if (pageId === 'personnel') {
        loadPersonnelData();
    }
}

// --- 🌟 NEW: MODAL (POP-UP) SYSTEM 🌟 ---
function setupModal() {
    const modal = document.getElementById('personnel-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    // Close modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking on the background overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function showPersonnelModal(person) {
    const modal = document.getElementById('personnel-modal');
    const modalContent = document.getElementById('modal-content');

    const imageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    
    const educationList = person.education 
        ? person.education.split('\n').map(edu => `<li>${edu.trim()}</li>`).join('') 
        : '<li>-</li>';

    modalContent.innerHTML = `
        <div class="text-center">
            <img 
                src="${imageUrl}" 
                alt="รูปภาพของ ${person.name}" 
                class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${person.role || '-'}</p>
            <p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p>
        </div>
        <hr class="my-4">
        <div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start">
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
    
    modal.classList.remove('hidden');
}

// --- UTILITY FUNCTION ---
function getDirectGoogleDriveUrl(url) {
    if (!url || !url.includes('drive.google.com')) return url;
    try {
        const parts = url.split('/');
        const idIndex = parts.findIndex(part => part === 'd') + 1;
        if (idIndex > 0 && idIndex < parts.length) {
            const fileId = parts[idIndex];
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return url;
    } catch (e) {
        return url;
    }
}

// --- PERSONNEL PAGE ---
async function loadPersonnelData() {
    // Use cache if available to avoid re-fetching
    if (personnelDataCache.length > 0) {
        renderPersonnelList(personnelDataCache);
        return;
    }
    
    const listContainer = document.getElementById('personnel-list');
    const loadingEl = document.getElementById('personnel-loading');

    loadingEl.classList.remove('hidden');
    listContainer.innerHTML = '';
    
    try {
        if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
            throw new Error("กรุณาตั้งค่า API_URL ในไฟล์ script.js ก่อน");
        }
        
        const response = await fetch(`${API_URL}?sheet=personnel`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        
        personnelDataCache = result.data; // Save to cache
        renderPersonnelList(personnelDataCache);

    } catch (error) {
        console.error('Error loading personnel data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderPersonnelList(personnelList) {
    const listContainer = document.getElementById('personnel-list');
    const loadingEl = document.getElementById('personnel-loading');
    
    loadingEl.classList.add('hidden');
    listContainer.innerHTML = '';

    if (!personnelList || personnelList.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }

    personnelList.forEach((person, index) => {
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'block bg-gray-50 p-3 rounded-lg hover:bg-blue-100 transition-colors duration-200';
        listItem.dataset.index = index; // Use index as identifier
        
        listItem.innerHTML = `
            <h4 class="font-bold text-blue-800">${person.name || 'N/A'}</h4>
            <p class="text-sm text-gray-600">${person.role || '-'}</p>
        `;

        listItem.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedIndex = e.currentTarget.dataset.index;
            const selectedPerson = personnelDataCache[clickedIndex];
            if(selectedPerson) {
                showPersonnelModal(selectedPerson);
            }
        });

        listContainer.appendChild(listItem);
    });
}

