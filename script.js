import { fetchData } from './js/api.js';
import * as UI from './js/ui.js';

const cache = {};

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    showPage('home');
    
    // ✅ โหลดข้อมูลโรงเรียน (VTR, Social) อัตโนมัติ
    loadData('school_info', UI.renderSchoolInfo);
});

function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mainNav) mainNav.addEventListener('click', handleMenuClick);
    if (mobileMenu) mobileMenu.addEventListener('click', handleMenuClick);
}

function handleMenuClick(e) {
    const link = e.target.closest('a[data-page]');
    if (link) {
        e.preventDefault();
        showPage(link.dataset.page);
        UI.closeAllDropdowns();
        document.getElementById('mobile-menu').classList.add('hidden');
    }
    
    // Shortcuts & Links
    const button = e.target.closest('button[data-page-link]');
    if(button) { e.preventDefault(); showPage(button.dataset.pageLink); }
    const card = e.target.closest('div[data-page-link]');
    if(card) { showPage(card.dataset.pageLink); }
}

async function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeLink = document.querySelector(`a[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    switch (pageId) {
        case 'home': await loadData('news', UI.renderHomeNews); break;
        case 'news': await loadData('news', UI.renderNews); break;
        // ✅ ใช้ renderPersonGrid สำหรับบุคลากร
        case 'personnel-list': await loadData('personnel', (data) => UI.renderPersonGrid(data, 'personnel-list-container')); break;
        // ✅ เมนูใหม่
        case 'school-board': await loadData('school_board', (data) => UI.renderPersonGrid(data, 'school-board-container')); break;
        case 'student-council': await loadData('student_council', (data) => UI.renderPersonGrid(data, 'student-council-container')); break;
        case 'students': await loadData('student_data', UI.renderStudentChart); break;
        // เมนูเดิม
        case 'director-history': await loadData('director_history', (data) => UI.renderHistoryTable('director-history-table-body', data)); break;
        case 'personnel-history': await loadData('personnel_history', (data) => UI.renderHistoryTable('personnel-history-table-body', data)); break;
        case 'teacher-achievements': await loadData('teacher_awards', UI.renderTeacherAchievements); break;
        case 'student-achievements': await loadData('student_awards', UI.renderStudentAchievements); break;
        case 'school-achievements': await loadData('school_awards', UI.renderSchoolAchievements); break;
        case 'innovations': await loadData('innovations', UI.renderInnovations); break;
        case 'documents-official': await loadData('documents', (data) => UI.renderDocuments(data, 'documents-official-container')); break;
        case 'documents-forms': await loadData('forms', (data) => UI.renderDocuments(data, 'documents-forms-container')); break;
    }
}

async function loadData(tableName, renderCallback) {
    if (!cache[tableName]) {
        try {
            cache[tableName] = await fetchData(tableName);
        } catch (e) {
            console.error(e);
            cache[tableName] = [];
        }
    }
    if (typeof renderCallback === 'function') renderCallback(cache[tableName]);
}
