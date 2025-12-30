import { fetchData } from './js/api.js';
import * as UI from './js/ui.js';

// เก็บข้อมูลไว้ไม่ต้องโหลดซ้ำ (Cache)
const cache = {};

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    UI.setupDropdowns(); // ตรวจสอบว่าใน ui.js มีฟังก์ชันนี้
    UI.setupModal();     // ตรวจสอบว่าใน ui.js มีฟังก์ชันนี้
    
    // เริ่มต้นให้โหลดหน้าแรก (ข่าว)
    showPage('home');
});

function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    if (!mainNav) return;

    mainNav.addEventListener('click', (e) => {
        // ใช้ closest เพื่อให้กดโดนไอคอนหรือตัวหนังสือในปุ่ม ก็ยังทำงานได้
        const link = e.target.closest('a[data-page]');
        if (link) {
            e.preventDefault();
            const pageId = link.dataset.page;
            showPage(pageId);
            
            // ปิด Dropdown ทั้งหมดเมื่อเลือกเมนูแล้ว
            document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
        }
    });
}

async function showPage(pageId) {
    // 1. ซ่อนเนื้อหาทุกหน้า
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // 2. แสดงหน้าเป้าหมาย
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.remove('hidden');

    // 3. ปรับสีเมนู (Active State)
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeLink = document.querySelector(`a[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // 4. โหลดข้อมูล (ดึงจาก Sheet ชื่อเดียวกับ Case)
    // หมายเหตุ: ชื่อ Sheet ใน Google Sheet ต้องตรงกับตัวอักษรภาษาอังกฤษด้านล่างนี้ (เช่น News, Personnel)
    switch (pageId) {
        case 'home':
        case 'news':
            await loadData('News', UI.renderNews); 
            if(pageId === 'home') await loadData('News', UI.renderHomeNews);
            break;
            
        case 'personnel-list':
            await loadData('Personnel', UI.renderPersonnelList);
            break;
            
        case 'director-history':
            // ถ้าคุณยังไม่ได้สร้าง Sheet 'Director_history' ให้สร้าง หรือใช้ Static ไปก่อนได้
            // UI.renderHistoryTable('director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA); 
            await loadData('Director_history', (data) => UI.renderHistoryTable('director-history-table-body', data));
            break;

        case 'personnel-history':
            await loadData('Personnel_history', (data) => UI.renderHistoryTable('personnel-history-table-body', data));
            break;
            
        case 'teacher-achievements':
            await loadData('Teacher_awards', UI.renderTeacherAchievements);
            break;
            
        case 'student-achievements':
            await loadData('Student_awards', UI.renderStudentAchievements);
            break;
            
        case 'school-achievements':
            await loadData('School_awards', UI.renderSchoolAchievements);
            break;

        case 'innovations':
            await loadData('Innovations', UI.renderInnovations);
            break;

        case 'documents-official':
            await loadData('Documents', (data) => UI.renderDocuments(data, 'documents-official-container'));
            break;

        case 'documents-forms':
            await loadData('Forms', (data) => UI.renderDocuments(data, 'documents-forms-container'));
            break;
    }
}

// ฟังก์ชันกลางสำหรับโหลดข้อมูล
async function loadData(sheetName, renderCallback) {
    // แสดง Loading... (ถ้ามี element id ลงท้ายด้วย -loading ในหน้านั้น)
    const currentSection = document.querySelector('.page-content:not(.hidden)');
    const loader = currentSection ? currentSection.querySelector('[id$="-loading"]') : null;
    if (loader) loader.classList.remove('hidden');

    // ดึงข้อมูล
    if (!cache[sheetName]) {
        try {
            console.log(`Fetching ${sheetName}...`);
            cache[sheetName] = await fetchData(sheetName);
        } catch (e) {
            console.error(e);
            cache[sheetName] = []; // กัน Error ถ้าโหลดไม่ได้
        }
    }

    if (loader) loader.classList.add('hidden');

    // แสดงผล
    if (typeof renderCallback === 'function') {
        renderCallback(cache[sheetName]);
    }
}
