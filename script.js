// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentChartInstance = null; // To hold the chart object
let studentDataInterval = null; // To hold the interval timer

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    showPage('home');
});

// --- DROPDOWN & NAVIGATION SYSTEMS (No Changes) ---
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(menu);
            menu.classList.toggle('hidden');
        });
    });
    window.addEventListener('click', () => closeAllDropdowns());
}

function closeAllDropdowns(exceptMenu = null) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== exceptMenu) menu.classList.add('hidden');
    });
}

function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
            closeAllDropdowns();
        }
    });
}

function showPage(pageId) {
    // Clear any existing interval when changing pages
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }

    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    // Highlighting logic
    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) {
            parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
        }
    }

    // --- 🌟 UPDATED: Load data for the specific page ---
    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students':
            loadStudentData(); // Load data immediately
            // Refresh data every 5 minutes (300,000 milliseconds)
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        // ... other cases
    }
}

// --- MODAL & UTILITY & PERSONNEL FUNCTIONS (No Changes) ---
function setupModal() {
    const modal = document.getElementById('personnel-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}
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
    } catch (e) { return url; }
}
async function loadPersonnelData() {
    if (personnelDataCache.length > 0) {
        renderPersonnelList(personnelDataCache);
        return;
    }
    const listContainer = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.remove('hidden');
    listContainer.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}?sheet=personnel`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        personnelDataCache = result.data;
        renderPersonnelList(personnelDataCache);
    } catch (error) {
        console.error('Error loading personnel data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}
function renderPersonnelList(personnelList) {
    const listContainer = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.add('hidden');
    listContainer.innerHTML = '';
    if (!personnelList || personnelList.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }
    personnelList.forEach((person, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4';
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="text-center mt-2"><h4 class="font-bold text-blue-800 text-md">${person.name || 'N/A'}</h4><p class="text-sm text-gray-600">${person.role || '-'}</p><p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p></div>`;
        cardItem.addEventListener('click', (e) => {
            const clickedIndex = e.currentTarget.dataset.index;
            const selectedPerson = personnelDataCache[clickedIndex];
            if(selectedPerson) showPersonnelModal(selectedPerson);
        });
        listContainer.appendChild(cardItem);
    });
}
function showPersonnelModal(person) {
    const modal = document.getElementById('personnel-modal');
    const modalContent = document.getElementById('modal-content');
    const imageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    const educationList = person.education ? person.education.split('\n').map(edu => `<li>${edu.trim()}</li>`).join('') : '<li>-</li>';
    modalContent.innerHTML = `<div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${person.role || '-'}</p><p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p></div><hr class="my-4"><div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start"><strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong><ul class="text-gray-500 list-disc list-inside">${educationList}</ul><strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong><span class="text-gray-500">${person.class || '-'}</span><strong class="text-gray-600 text-right">โทร:</strong><span class="text-gray-500">${person.tel || '-'}</span></div>`;
    modal.classList.remove('hidden');
}


// --- 🌟 NEW & UPDATED: STUDENT PAGE WITH CHART 🌟 ---
async function loadStudentData(isRefresh = false) {
    const loadingEl = document.getElementById('students-loading');
    
    // Only show loading message on initial load
    if (!isRefresh) {
        loadingEl.textContent = 'กำลังโหลดข้อมูล...';
        loadingEl.classList.remove('hidden');
    }
    
    try {
        // Add a cache-busting parameter to the URL for refreshing
        const url = `${API_URL}?sheet=students&v=${new Date().getTime()}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        
        studentDataCache = result.data;
        renderStudentChart(studentDataCache);

    } catch (error) {
        console.error('Error loading student data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderStudentChart(studentList) {
    const loadingEl = document.getElementById('students-loading');
    const summaryContainer = document.getElementById('student-summary-container');
    const ctx = document.getElementById('studentChart').getContext('2d');
    
    loadingEl.classList.add('hidden');
    summaryContainer.innerHTML = '';

    if (!studentList || studentList.length === 0) {
        summaryContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลนักเรียน</p>';
        return;
    }

    // 1. Process data for the chart
    const labels = studentList.map(s => `${s.grade || ''}${s.class ? ' ห้อง ' + s.class : ''}`.trim());
    const boysData = studentList.map(s => parseInt(s.boys) || 0);
    const girlsData = studentList.map(s => parseInt(s.girls) || 0);

    // 2. Calculate summary statistics
    const totalBoys = boysData.reduce((sum, count) => sum + count, 0);
    const totalGirls = girlsData.reduce((sum, count) => sum + count, 0);
    const grandTotal = totalBoys + totalGirls;

    // 3. Render summary cards
    summaryContainer.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-blue-800">${totalBoys.toLocaleString()}</h3>
            <p class="text-sm text-blue-600">นักเรียนชาย</p>
        </div>
        <div class="bg-pink-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-pink-800">${totalGirls.toLocaleString()}</h3>
            <p class="text-sm text-pink-600">นักเรียนหญิง</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-800">${grandTotal.toLocaleString()}</h3>
            <p class="text-sm text-gray-600">นักเรียนทั้งหมด</p>
        </div>
    `;

    // 4. Destroy the old chart if it exists
    if (studentChartInstance) {
        studentChartInstance.destroy();
    }

    // 5. Create the new chart
    studentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'นักเรียนชาย',
                    data: boysData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'นักเรียนหญิง',
                    data: girlsData,
                    backgroundColor: 'rgba(236, 72, 153, 0.7)', // pink-500
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนนักเรียน (คน)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'ระดับชั้น'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'จำนวนนักเรียนแยกตามเพศและระดับชั้น'
                }
            }
        }
    });
}

