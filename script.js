// This is the main controller file.

// It imports functions from other modules and coordinates everything.



import * as Data from './js/data.js';

import * as API from './js/api.js';

import * as UI from './js/ui.js';

import { STATIC_INNOVATIONS_DATA } from './js/inno.js';

import { STATIC_NEWS_DATA } from './js/news.js';

// 🌟 ADDED: Import ข้อมูลใหม่สำหรับหน้าทำเนียบ

import { STATIC_DIRECTOR_HISTORY_DATA } from './js/direc.js';

import { STATIC_PERSONNEL_HISTORY_DATA } from './js/member.js';





// --- Global Caches ---

let teacherAchievementsCache = [];

let innovationsDataCache = [];

let currentlyDisplayedInnovations = [];

let personnelDataCache = [];

let newsDataCache = [];



// --- Initial Setup ---

document.addEventListener('DOMContentLoaded', () => {

    setupNavigation();

    UI.setupDropdowns();

    UI.setupModal();

    setupEventListeners();

    setupInnovationFilterListeners();

    // 🌟 ADDED: เรียกใช้ฟังก์ชัน setup สำหรับช่องค้นหาของหน้าทำเนียบ

    UI.setupHistorySearch(

        'director-search-input', 

        'director-history-table-body', 

        STATIC_DIRECTOR_HISTORY_DATA

    );

    UI.setupHistorySearch(

        'personnel-history-search-input', 

        'personnel-history-table-body', 

        STATIC_PERSONNEL_HISTORY_DATA

    );

    showPage('home');

});





// --- NAVIGATION ---

function setupNavigation() {

    const mainNav = document.getElementById('main-nav');

    mainNav.addEventListener('click', (e) => {

        if (e.target.matches('a[data-page]')) {

            e.preventDefault();

            const pageId = e.target.dataset.page;

            showPage(pageId);

            UI.closeAllDropdowns();

        }

    });

}



async function showPage(pageId) {

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

        case 'home':

            if (newsDataCache.length === 0) {

                newsDataCache = STATIC_NEWS_DATA;

            }

            UI.renderHomeNews(newsDataCache);

            break;

        case 'personnel-list':

            if (personnelDataCache.length === 0) {

                personnelDataCache = Data.STATIC_PERSONNEL_DATA;

            }

            UI.renderPersonnelList(personnelDataCache);

            break;

        case 'students':

            UI.renderStudentChart();

            break;

        case 'student-council':

            UI.renderStudentCouncilList();

            break;

        case 'school-board':

            UI.renderSchoolBoardList();

            break;

        case 'teacher-achievements':

            if (teacherAchievementsCache.length > 0) {

                UI.renderTeacherAchievements(teacherAchievementsCache);

            } else {

                try {

                    const data = await API.loadTeacherAchievementsData();

                    teacherAchievementsCache = data;

                    UI.renderTeacherAchievements(teacherAchievementsCache);

                } catch (e) { console.error(e); }

            }

            break;

        case 'innovations':

             if (innovationsDataCache.length === 0) { 

                innovationsDataCache = STATIC_INNOVATIONS_DATA;

                UI.populateInnovationFilters(innovationsDataCache);

            }

            applyInnovationFilters();

            break;

        case 'news':

            if (newsDataCache.length === 0) {

                newsDataCache = STATIC_NEWS_DATA;

            }

            UI.renderNews(newsDataCache);

            break;

        // 🌟 ADDED: Case สำหรับจัดการหน้าทำเนียบใหม่ 🌟

        case 'director-history':

            document.getElementById('director-search-input').value = ''; // Clear search box

            UI.renderHistoryTable('director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA);

            break;

        case 'personnel-history':

            document.getElementById('personnel-history-search-input').value = ''; // Clear search box

            UI.renderHistoryTable('personnel-history-table-body', STATIC_PERSONNEL_HISTORY_DATA);

            break;

    }

}



function applyInnovationFilters() {

    const searchValue = document.getElementById('innovations-search-input').value.toLowerCase();

    const categoryValue = document.getElementById('innovations-category-filter').value;

    const subjectValue = document.getElementById('innovations-subject-filter').value;

    const gradeValue = document.getElementById('innovations-grade-filter').value;



    const filteredData = innovationsDataCache.filter(item => {

        const matchesSearch = !searchValue || 

                              (item.title && item.title.toLowerCase().includes(searchValue)) ||

                              (item.creator && item.creator.toLowerCase().includes(searchValue));

        const matchesCategory = !categoryValue || item.category === categoryValue;

        const matchesSubject = !subjectValue || item.subject === subjectValue;

        const matchesGrade = !gradeValue || item.grade === gradeValue;



        return matchesSearch && matchesCategory && matchesSubject && matchesGrade;

    });



    currentlyDisplayedInnovations = filteredData;

    UI.renderInnovations(filteredData);

}



function setupInnovationFilterListeners() {

    const searchInput = document.getElementById('innovations-search-input');

    const categoryFilter = document.getElementById('innovations-category-filter');

    const subjectFilter = document.getElementById('innovations-subject-filter');

    const gradeFilter = document.getElementById('innovations-grade-filter');

    const resetBtn = document.getElementById('innovations-reset-btn');



    searchInput.addEventListener('input', applyInnovationFilters);

    categoryFilter.addEventListener('change', applyInnovationFilters);

    subjectFilter.addEventListener('change', applyInnovationFilters);

    gradeFilter.addEventListener('change', applyInnovationFilters);



    resetBtn.addEventListener('click', () => {

        searchInput.value = '';

        categoryFilter.value = '';

        subjectFilter.value = '';

        gradeFilter.value = '';

        applyInnovationFilters();

    });

}



function setupEventListeners() {

    // Listen on the entire body for better event handling

    document.body.addEventListener('click', (e) => {

        

        const pageLinkElement = e.target.closest('[data-page-link]');

        if (pageLinkElement) {

            const pageId = pageLinkElement.dataset.pageLink;

            if (pageId) {

                showPage(pageId);

            }

            return;

        }

        

        const personnelCard = e.target.closest('.personnel-card');

        if (personnelCard) {

            const index = personnelCard.dataset.index;

            const selectedPerson = personnelDataCache[index];

            if (selectedPerson) UI.showPersonnelModal(selectedPerson);

            return;

        }



        const councilCard = e.target.closest('.student-council-card');

        if (councilCard) {

            const index = councilCard.dataset.index;

            const selectedMember = Data.STATIC_STUDENT_COUNCIL_DATA[index];

            if (selectedMember) UI.showStudentCouncilModal(selectedMember);

            return;

        }



        const boardCard = e.target.closest('.school-board-card');

        if (boardCard) {

            const index = boardCard.dataset.index;

            const selectedMember = Data.STATIC_SCHOOL_BOARD_DATA[index];

            if (selectedMember) UI.showSchoolBoardModal(selectedMember);

            return;

        }



        const innovationCard = e.target.closest('.innovation-card');

        if (innovationCard) {

            const index = innovationCard.dataset.index;

            const selectedInnovation = currentlyDisplayedInnovations[index];

            if (selectedInnovation) UI.showInnovationModal(selectedInnovation);

            return;

        }

    });

}
