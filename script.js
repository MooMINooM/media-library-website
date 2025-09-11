// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

let personnelDataCache = [];
let studentDataCache = []; // 🌟 NEW: Cache for student data

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

    // --- 🌟 UPDATED: Load data for the specific page ---
    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students': // 🌟 NEW
            loadStudentData();
            break;
        case 'teacher-achievements':
            console.log("Loading Teacher Achievements...");
            break;
        case 'student-achievements':
            console.log("Loading Student Achievements...");
            break;
        case 'school-achievements':
            console.log("Loading School Achievements...");
            break;
    }
}

// --- MODAL & UTILITY FUNCTIONS ---
function setupModal() { /* ... No changes ... */ }
function showPersonnelModal(person) { /* ... No changes ... */ }
function getDirectGoogleDriveUrl(url) { /* ... No changes ... */ }


// --- PERSONNEL PAGE ---
async function loadPersonnelData() { /* ... No changes ... */ }
function renderPersonnelList(personnelList) { /* ... No changes ... */ }


// --- 🌟 NEW: STUDENT PAGE 🌟 ---
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
        if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
            throw new Error("กรุณาตั้งค่า API_URL ในไฟล์ script.js ก่อน");
        }
        
        const response = await fetch(`${API_URL}?sheet=students`);
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

    // Create table structure
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
        <tbody class="bg-white divide-y divide-gray-200">
            <!-- Data rows will be inserted here -->
        </tbody>
    `;

    const tableBody = table.querySelector('tbody');

    studentList.forEach(studentClass => {
        // Handle multiple teachers
        const teachers = studentClass.teacher ? studentClass.teacher.split('\n').join('<br>') : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${studentClass.grade || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.class || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.boys || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studentClass.girls || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${studentClass.total || '0'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${teachers}</td>
        `;
        tableBody.appendChild(row);
    });

    tableContainer.appendChild(table);
}

