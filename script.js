// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches for data ---
let personnelDataCache = [];
let studentDataCache = [];

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    showPage('home');
});

// --- DROPDOWN SYSTEM ---
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

// --- NAVIGATION SYSTEM ---
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
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) {
        activePage.classList.remove('hidden');
    }

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

    // --- Load data for the specific page ---
    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData(); // Restored this function call
            break;
        case 'students':
            loadStudentData();
            break;
        case 'teacher-achievements':
            console.log("Loading Teacher Achievements...");
            break;
        // ... other cases
    }
}

// --- MODAL & UTILITY FUNCTIONS ---
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


// --- PERSONNEL PAGE ---
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
        const response = await fetch(`${API_URL}?sheet=personnel`); // Fetches from 'personnel' sheet
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
        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="text-center mt-2">
                <h4 class="font-bold text-blue-800 text-md">${person.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${person.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p>
            </div>`;
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
    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${person.role || '-'}</p>
            <p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p>
        </div>
        <hr class="my-4">
        <div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start">
            <strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong>
            <ul class="text-gray-500 list-disc list-inside">${educationList}</ul>
            <strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong>
            <span class="text-gray-500">${person.class || '-'}</span>
            <strong class="text-gray-600 text-right">โทร:</strong>
            <span class="text-gray-500">${person.tel || '-'}</span>
        </div>`;
    modal.classList.remove('hidden');
}

// --- STUDENT PAGE ---
async function loadStudentData() {
    if (studentDataCache.length > 0) {
        renderStudentData(studentDataCache);
        return;
    }
    const tableContainer = document.getElementById('students-table-container');
    const loadingEl = document.getElementById('students-loading');
    loadingEl.classList.remove('hidden');
    tableContainer.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}?sheet=students`); // Fetches from 'students' sheet
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        studentDataCache = result.data;
        renderStudentData(studentDataCache);
    } catch (error) {
        console.error('Error loading student data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderStudentData(studentList) {
    const tableContainer = document.getElementById('students-table-container');
    const loadingEl = document.getElementById('students-loading');
    loadingEl.classList.add('hidden');
    tableContainer.innerHTML = '';
    if (!studentList || studentList.length === 0) {
        tableContainer.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลนักเรียน</p>';
        return;
    }
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    table.innerHTML = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับชั้น</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นักเรียนชาย</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นักเรียนหญิง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รวม</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ครูประจำชั้น</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200"></tbody>`;
    const tableBody = table.querySelector('tbody');
    studentList.forEach(studentClass => {
        const teachers = studentClass.teacher ? studentClass.teacher.split('\n').join('<br>') : '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${studentClass.grade || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.class || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.boys || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.girls || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${studentClass.total || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${teachers}</td>`;
        tableBody.appendChild(row);
    });
    tableContainer.appendChild(table);
}

