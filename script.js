// script.js
import * as UI from './js/ui.js';

// ⚠️⚠️⚠️ ใส่ URL / KEY ตรงนี้ครับ ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;
try {
    supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);
} catch (e) {
    console.error("Supabase init error:", e);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupNavigation();
});

function init() {
    showPage('home');
    setupMobileMenu();
    // โหลดข้อมูลพื้นฐานเสมอ
    loadData('school_info', UI.renderSchoolInfo);
}

function setupNavigation() {
    // 1. จัดการคลิกเมนูหลัก (Desktop)
    document.querySelectorAll('#main-nav a[data-page], .dropdown-menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // 2. จัดการคลิกจากปุ่มอื่นๆ (เช่น ปุ่ม "รู้จักเรา", "ดูทั้งหมด")
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page-link]');
        if (target) {
            e.preventDefault();
            showPage(target.getAttribute('data-page-link'));
        }
    });
}

function setupMobileMenu() {
    // Mobile menu links
    document.querySelectorAll('#mobile-menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
}

// ✅ ฟังก์ชันแสดงหน้า (เพิ่ม Scroll to Top)
async function showPage(pageId) {
    // 1. เด้งขึ้นบนสุดทันทีที่เปลี่ยนหน้า
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. ปิด Dropdown ทั้งหมด
    UI.closeAllDropdowns();

    // 3. ซ่อนทุกหน้า
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // 4. แสดงหน้าเป้าหมาย
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // 5. โหลดข้อมูลตามหน้า
        switch(pageId) {
            case 'home': 
                await loadData('news', UI.renderHomeNews);
                await loadData('school_info', UI.renderSchoolInfo);
                break;
            case 'history': await loadData('school_info', UI.renderSchoolInfo); break;
            case 'school-board': await loadData('school_board', (d) => UI.renderPersonGrid(d, 'school-board-container')); break;
            case 'student-council': await loadData('student_council', (d) => UI.renderPersonGrid(d, 'student-council-container')); break;
            case 'personnel-list': await loadData('personnel', (d) => UI.renderPersonGrid(d, 'personnel-list-container')); break;
            case 'director-history': await loadData('director_history', (d) => UI.renderHistoryTable('director-history-table-body', d)); break;
            case 'personnel-history': await loadData('personnel_history', (d) => UI.renderHistoryTable('personnel-history-table-body', d)); break;
            case 'students': await loadData('student_data', UI.renderStudentChart); break;
            case 'teacher-achievements': await loadData('teacher_awards', UI.renderTeacherAchievements); break;
            case 'student-achievements': await loadData('student_awards', UI.renderStudentAchievements); break;
            case 'school-achievements': await loadData('school_awards', UI.renderSchoolAchievements); break;
            case 'innovations': await loadData('innovations', UI.renderInnovations); break;
            case 'documents-official': await loadData('documents', (d) => UI.renderDocuments(d, 'documents-official-container')); break;
            case 'documents-forms': await loadData('forms', (d) => UI.renderDocuments(d, 'documents-forms-container')); break;
            case 'news': await loadData('news', UI.renderNews); break;
        }
    }
}

async function loadData(tableName, callback) {
    try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        callback(data);
    } catch (err) {
        console.error(`Error loading ${tableName}:`, err);
        callback([]); // ส่ง array ว่างไปถ้า error
    }
}

// Music Player Logic
window.toggleMusic = function() {
    const audio = document.getElementById('school-song');
    const icon = document.getElementById('music-icon');
    const indicator = document.getElementById('music-indicator');
    const controls = document.getElementById('music-player-controls');
    
    if (audio.paused) {
        audio.play().then(() => {
            icon.classList.replace('fa-play', 'fa-pause');
            indicator.classList.remove('hidden');
            controls.classList.remove('hidden');
        }).catch(e => {
            alert("กรุณาคลิกที่หน้าเว็บ 1 ครั้งเพื่อให้เสียงเล่นได้ (นโยบาย Browser)");
        });
    } else {
        audio.pause();
        icon.classList.replace('fa-pause', 'fa-play');
        indicator.classList.add('hidden');
    }
}
