// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- 🌟 UPDATED: Static data for Student Council Structure 🌟 ---
// นี่คือโครงสร้างข้อมูลของสภานักเรียนที่เราย้ายเข้ามาไว้ในโค้ด
// "id" จะต้องตรงกับ "id" ที่คุณตั้งไว้ใน Google Sheet `student_council_images`
const STATIC_STUDENT_COUNCIL_DATA = [
    { id: 'president', name: 'ประธานนักเรียน', class: 'ประถมศึกษาปีที่ 6', role: 'ประธานนักเรียน' },
    { id: 'vp_academic', name: 'รองประธานฝ่ายวิชาการ', class: 'ประถมศึกษาปีที่ 5', role: 'รองประธานนักเรียนฝ่ายวิชาการ' },
    { id: 'vp_activities', name: 'รองประธานฝ่ายกิจกรรม', class: 'ประถมศึกษาปีที่ 5', role: 'รองประธานนักเรียนฝ่ายกิจกรรม' },
    { id: 'vp_facilities', name: 'รองประธานฝ่ายอาคารและสถานที่', class: 'ประถมศึกษาปีที่ 6', role: 'รองประธานนักเรียนฝ่ายอาคารและสถานที่' },
    { id: 'vp_discipline', name: 'รองประธานฝ่ายสารวัตรนักเรียน', class: 'ประถมศึกษาปีที่ 6', role: 'รองประธานนักเรียนฝ่ายสารวัตรนักเรียน' },
    { id: 'committee_1', name: 'กรรมการ', class: 'ประถมศึกษาปีที่ 4', role: 'กรรมการ' },
    { id: 'committee_2', name: 'กรรมการ', class: 'ประถมศึกษาปีที่ 4', role: 'กรรมการ' },
    { id: 'committee_3', name: 'กรรมการ', class: 'ประถมศึกษาปีที่ 4', role: 'กรรมการ' },
    { id: 'committee_4', name: 'กรรมการ', class: 'ประถมศึกษาปีที่ 4', role: 'กรรมการ' },
];


// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentCouncilImagesCache = null; 
let teacherAchievementsCache = [];
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    showPage('home');
});

// --- DROPDOWN, NAVIGATION, EVENT LISTENERS, MODAL (No Changes) ---
function setupDropdowns() { /* ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... */ }
function setupNavigation() { /* ... */ }
function showPage(pageId) {
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }
    document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
    }

    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council':
            loadStudentCouncilData(); 
            break;
        case 'teacher-achievements':
            loadTeacherAchievementsData();
            break;
    }
}
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        const councilCard = e.target.closest('.student-council-card');
        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = personnelDataCache[index];
            if (selectedPerson) showPersonnelModal(selectedPerson);
        }
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) showStudentCouncilModal(selectedMember);
        }
    });
}
function setupModal() { /* ... */ }
function getDirectGoogleDriveUrl(url) { /* ... */ }

// --- PERSONNEL PAGE & MODAL (No Changes) ---
async function loadPersonnelData() { /* ... */ }
function renderPersonnelList(personnelList) { /* ... */ }
function showPersonnelModal(person) { /* ... */ }

// --- STUDENT PAGE WITH CHART (No Changes) ---
async function loadStudentData(isRefresh = false) { /* ... */ }
function renderStudentChart(studentList) { /* ... */ }

// --- TEACHER ACHIEVEMENTS PAGE (No Changes) ---
async function loadTeacherAchievementsData() { /* ... */ }
function renderTeacherAchievements(achievementsList) { /* ... */ }


// --- 🌟 UPDATED: STUDENT COUNCIL PAGE with new hybrid data logic 🌟 ---
async function loadStudentCouncilData() {
    renderStudentCouncilList();

    if (studentCouncilImagesCache) {
        renderStudentCouncilImages(studentCouncilImagesCache);
        return;
    }
    
    try {
        if (!API_URL) throw new Error("API_URL is not configured.");
        
        const response = await fetch(`${API_URL}?sheet=student_council_images`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        
        const imageMap = result.data.reduce((acc, item) => {
            if (item.id) acc[item.id] = item.imageUrl;
            return acc;
        }, {});

        studentCouncilImagesCache = imageMap;
        renderStudentCouncilImages(studentCouncilImagesCache);

    } catch (error) {
        console.error('Error loading student council images:', error);
    }
}

function renderStudentCouncilList() {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    const createCard = (member, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = `student-council-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center`;
        cardItem.dataset.index = index;
        cardItem.dataset.id = member.id;

        cardItem.innerHTML = `
            <img src="https://placehold.co/200x200/EBF8FF/3182CE?text=..." alt="รูปภาพของ ${member.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 text-md">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${member.class || ''}</p>
            </div>
        `;
        return cardItem;
    };

    const president = STATIC_STUDENT_COUNCIL_DATA[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8';
        presidentContainer.appendChild(createCard(president, 0));
        container.appendChild(presidentContainer);
    }

    const otherMembers = STATIC_STUDENT_COUNCIL_DATA.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        container.appendChild(othersContainer);
    }
}

function renderStudentCouncilImages(imageMap) {
    const cards = document.querySelectorAll('.student-council-card');
    cards.forEach(card => {
        const id = card.dataset.id;
        const imgEl = card.querySelector('img');
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

        if (imageMap[id] && imgEl) {
            const finalImageUrl = getDirectGoogleDriveUrl(imageMap[id]);
            imgEl.src = finalImageUrl;
            imgEl.onerror = () => { imgEl.src = errorImageUrl; };
        } else if (imgEl) {
            imgEl.src = 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        }
    });
}

function showStudentCouncilModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');

    const imageUrl = studentCouncilImagesCache ? getDirectGoogleDriveUrl(studentCouncilImagesCache[member.id]) : 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${member.role || '-'}</p>
            <p class="text-md text-gray-500 mt-1">${member.class || ''}</p>
        </div>
    `;
    modal.classList.remove('hidden');
}

