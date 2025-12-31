import { fetchData } from './js/api.js';
import * as UI from './js/ui.js';

const cache = {};

// 1. Music Player Script (Global)
let isMusicPlaying = false;
window.toggleMusic = function() {
    const audio = document.getElementById('school-song');
    const btnIcon = document.getElementById('music-icon');
    const indicator = document.getElementById('music-indicator');
    if (!audio || !audio.src) return; 

    if (isMusicPlaying) {
        audio.pause();
        btnIcon.classList.remove('fa-pause');
        btnIcon.classList.add('fa-play');
        if(indicator) indicator.classList.add('hidden');
    } else {
        audio.play().catch(e => {
            alert("กรุณาคลิกที่หน้าเว็บหนึ่งครั้งเพื่อให้เสียงเริ่มเล่นได้ครับ");
            console.error(e);
        });
        btnIcon.classList.remove('fa-play');
        btnIcon.classList.add('fa-pause');
        if(indicator) indicator.classList.remove('hidden');
    }
    isMusicPlaying = !isMusicPlaying;
};

// 2. Main Logic
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    showPage('home');
    // โหลดข้อมูลโรงเรียนทันที เพื่อให้ VTR/Song/Footer มาก่อน
    loadData('school_info', UI.renderSchoolInfo);
});

function setupNavigation() {
    document.addEventListener('click', handleMenuClick);
}

function handleMenuClick(e) {
    const link = e.target.closest('a[data-page]');
    if (link) {
        e.preventDefault();
        showPage(link.dataset.page);
        UI.closeAllDropdowns();
        const mobileMenu = document.getElementById('mobile-menu');
        if(mobileMenu) mobileMenu.classList.add('hidden');
        return;
    }
    const card = e.target.closest('div[data-page-link]');
    if(card) { e.preventDefault(); showPage(card.dataset.pageLink); return; }
    const button = e.target.closest('button[data-page-link]');
    if(button) { e.preventDefault(); showPage(button.dataset.pageLink); return; }
}

async function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeLink = document.querySelector(`a[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // โหลดข้อมูลตามหน้า
    switch (pageId) {
        case 'home': await loadData('news', UI.renderHomeNews); break;
        case 'news': await loadData('news', UI.renderNews); break;
        // ใช้ renderPersonGrid ที่แก้ Logic แล้ว
        case 'personnel-list': await loadData('personnel', (data) => UI.renderPersonGrid(data, 'personnel-list-container')); break;
        case 'school-board': await loadData('school_board', (data) => UI.renderPersonGrid(data, 'school-board-container')); break;
        case 'student-council': await loadData('student_council', (data) => UI.renderPersonGrid(data, 'student-council-container')); break;
        case 'students': await loadData('student_data', UI.renderStudentChart); break;
        // ✅ หน้า History ต้องโหลด school_info
        case 'history': await loadData('school_info', UI.renderSchoolInfo); break;
        // อื่นๆ
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
    // ส่งข้อมูลไป render
    if (typeof renderCallback === 'function') renderCallback(cache[tableName]);
}
