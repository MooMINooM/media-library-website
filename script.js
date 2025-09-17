// This is the main controller file.
// It imports functions from other modules and coordinates everything.

import { STATIC_PERSONNEL_DATA, STATIC_SCHOOL_BOARD_DATA, STATIC_STUDENT_COUNCIL_DATA, STATIC_DIRECTOR_HISTORY_DATA } from './js/data.js';
import { STATIC_INNOVATIONS_DATA } from './js/inno.js';
import { STATIC_NEWS_DATA } from './js/news.js';
import * as API from './js/api.js';
import * as UI from './js/ui.js';

// --- Global Caches ---
let teacherAchievementsCache = [];
let allInnovations = []; // Use this as the primary source of truth for innovations

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    UI.setupDropdowns();
    UI.setupModal();
    setupEventListeners();
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

    // Highlight active link logic...
    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
    }

    // Load data based on the page
    switch (pageId) {
        case 'home':
            UI.renderHomeNews(STATIC_NEWS_DATA);
            break;
        case 'personnel-list':
            UI.renderPersonnelList(STATIC_PERSONNEL_DATA);
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
        case 'director-history':
            UI.renderDirectorHistory(STATIC_DIRECTOR_HISTORY_DATA);
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
            if (allInnovations.length === 0) {
                allInnovations = STATIC_INNOVATIONS_DATA;
                UI.populateInnovationFilters(allInnovations);
            }
            UI.renderInnovations(allInnovations);
            break;
        case 'news':
            UI.renderNews(STATIC_NEWS_DATA);
            break;
    }
}

// --- EVENT LISTENERS for dynamic content ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = STATIC_PERSONNEL_DATA[index];
            if (selectedPerson) UI.showPersonnelModal(selectedPerson);
        }

        const councilCard = e.target.closest('.student-council-card');
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) UI.showStudentCouncilModal(selectedMember);
        }

        const boardCard = e.target.closest('.school-board-card');
        if (boardCard) {
            const index = boardCard.dataset.index;
            const selectedMember = STATIC_SCHOOL_BOARD_DATA[index];
            if (selectedMember) UI.showSchoolBoardModal(selectedMember);
        }

        const innovationCard = e.target.closest('.innovation-card');
        if (innovationCard) {
            const index = innovationCard.dataset.index;
            // The index must correspond to the currently filtered list, so we need to re-filter to find the correct item
            const currentlyDisplayedInnovations = filterInnovations();
            const selectedInnovation = currentlyDisplayedInnovations[index];
            if (selectedInnovation) UI.showInnovationModal(selectedInnovation);
        }
        
        // --- 🌟 NEW: Event listener for homepage links 🌟 ---
        const pageLinkElement = e.target.closest('[data-page-link]');
        if (pageLinkElement) {
            const pageId = pageLinkElement.dataset.pageLink;
            if (pageId) {
                showPage(pageId);
            }
        }
    });

    // --- Innovations Filter Logic ---
    const innovationsSearchInput = document.getElementById('innovations-search-input');
    const innovationsCategoryFilter = document.getElementById('innovations-category-filter');
    const innovationsSubjectFilter = document.getElementById('innovations-subject-filter');
    const innovationsGradeFilter = document.getElementById('innovations-grade-filter');
    const innovationsResetBtn = document.getElementById('innovations-reset-btn');

    function filterAndRenderInnovations() {
        const filteredData = filterInnovations();
        UI.renderInnovations(filteredData);
    }

    function filterInnovations() {
        const searchTerm = innovationsSearchInput.value.toLowerCase();
        const category = innovationsCategoryFilter.value;
        const subject = innovationsSubjectFilter.value;
        const grade = innovationsGradeFilter.value;

        return allInnovations.filter(item => {
            const matchesSearch = searchTerm === '' ||
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.creator && item.creator.toLowerCase().includes(searchTerm));
            const matchesCategory = category === '' || item.category === category;
            const matchesSubject = subject === '' || item.subject === subject;
            const matchesGrade = grade === '' || item.grade === grade;
            return matchesSearch && matchesCategory && matchesSubject && matchesGrade;
        });
    }

    innovationsSearchInput.addEventListener('input', filterAndRenderInnovations);
    innovationsCategoryFilter.addEventListener('change', filterAndRenderInnovations);
    innovationsSubjectFilter.addEventListener('change', filterAndRenderInnovations);
    innovationsGradeFilter.addEventListener('change', filterAndRenderInnovations);
    
    innovationsResetBtn.addEventListener('click', () => {
        innovationsSearchInput.value = '';
        innovationsCategoryFilter.value = '';
        innovationsSubjectFilter.value = '';
        innovationsGradeFilter.value = '';
        filterAndRenderInnovations();
    });
}

