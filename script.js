import { fetchData } from './js/api.js';
import * as UI from './js/ui.js';

const cache = {};

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    showPage('home');
});

function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Desktop Click
    if (mainNav) {
        mainNav.addEventListener('click', handleMenuClick);
    }
    // Mobile Click
    if (mobileMenu) {
        mobileMenu.addEventListener('click', handleMenuClick);
    }
}

function handleMenuClick(e) {
    const link = e.target.closest('a[data-page]');
    if (link) {
        e.preventDefault();
        const pageId = link.dataset.page;
        showPage(pageId);
        UI.closeAllDropdowns();
        // ปิดเมนูมือถือ (ถ้าเปิดอยู่)
        document.getElementById('mobile-menu').classList.add('hidden');
    }
    
    // ปุ่มพิเศษอื่นๆ
    const button = e.target.closest('button[data-page-link]');
    if(button) {
         e.preventDefault();
         showPage(button.dataset.pageLink);
    }
    const card = e.target.closest('div[data-page-link]');
    if(card) {
         showPage(card.dataset.pageLink);
    }
}

async function showPage(pageId) {
    // 1. ซ่อนทุกหน้า
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // 2. แสดงหน้าเป้าหมาย
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.remove('hidden');

    // 3. Active Menu State
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeLink = document.querySelector(`a[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // 4. Load Data
    switch (pageId) {
        case 'home':
            await loadData('news', UI.renderHomeNews);
            break;
        case 'news':
            await loadData('news', UI.renderNews);
            break;
        case 'personnel-list':
            await loadData('personnel', UI.renderPersonnelList);
            break;
        case 'director-history':
            await loadData('director_history', (data) => UI.renderHistoryTable('director-history-table-body', data));
            break;
        case 'personnel-history':
            await loadData('personnel_history', (data) => UI.renderHistoryTable('personnel-history-table-body', data));
            break;
        case 'teacher-achievements':
            await loadData('teacher_awards', UI.renderTeacherAchievements);
            break;
        case 'student-achievements':
            await loadData('student_awards', UI.renderStudentAchievements);
            break;
        case 'school-achievements':
            await loadData('school_awards', UI.renderSchoolAchievements);
            break;
        case 'innovations':
            await loadData('innovations', UI.renderInnovations);
            break;
        case 'documents-official':
            await loadData('documents', (data) => UI.renderDocuments(data, 'documents-official-container'));
            break;
        case 'documents-forms':
            await loadData('forms', (data) => UI.renderDocuments(data, 'documents-forms-container'));
            break;
        // ✅ เพิ่มเคสสำหรับนักเรียน
        case 'students':
            await loadData('student_data', UI.renderStudentChart);
            break;
    }
}

async function loadData(tableName, renderCallback) {
    // Show Loading
    const currentSection = document.querySelector('.page-content:not(.hidden)');
    // (Optional: หา Element Loading มาแสดงถ้ามี)

    if (!cache[tableName]) {
        try {
            console.log(`Fetching ${tableName}...`);
            cache[tableName] = await fetchData(tableName);
        } catch (e) {
            console.error(e);
            cache[tableName] = [];
        }
    }

    if (typeof renderCallback === 'function') {
        renderCallback(cache[tableName]);
    }
}
