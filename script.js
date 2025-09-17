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
            // Reset filters and render all innovations when first navigating to the page
            const searchInput = document.getElementById('innovations-search-input');
            const categoryFilter = document.getElementById('innovations-category-filter');
            const subjectFilter = document.getElementById('innovations-subject-filter');
            const gradeFilter = document.getElementById('innovations-grade-filter');
            if(searchInput) searchInput.value = '';
            if(categoryFilter) categoryFilter.value = '';
            if(subjectFilter) subjectFilter.value = '';
            if(gradeFilter) gradeFilter.value = '';
            UI.renderInnovations(allInnovations);
            break;
        case 'news':
            UI.renderNews(STATIC_NEWS_DATA);
            break;
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        // Card click listeners
        const personnelCard = e.target.closest('.personnel-card');
        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = STATIC_PERSONNEL_DATA[index];
            if (selectedPerson) UI.showPersonnelModal(selectedPerson);
            return; 
        }

        const councilCard = e.target.closest('.student-council-card');
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) UI.showStudentCouncilModal(selectedMember);
            return;
        }

        const boardCard = e.target.closest('.school-board-card');
        if (boardCard) {
            const index = boardCard.dataset.index;
            const selectedMember = STATIC_SCHOOL_BOARD_DATA[index];
            if (selectedMember) UI.showSchoolBoardModal(selectedMember);
            return;
        }

        const innovationCard = e.target.closest('.innovation-card');
        if (innovationCard) {
            const index = innovationCard.dataset.index;
            const currentlyDisplayedInnovations = filterInnovations();
            const selectedInnovation = currentlyDisplayedInnovations[index];
            if (selectedInnovation) UI.showInnovationModal(selectedInnovation);
            return;
        }
        
        // Homepage link listener
        const pageLinkElement = e.target.closest('[data-page-link]');
        if (pageLinkElement) {
            const pageId = pageLinkElement.dataset.pageLink;
            if (pageId) showPage(pageId);
            return;
        }
    });

    // --- Innovations Filter Logic (Attaching listeners to the filter container) ---
    const filterContainer = document.getElementById('innovations-filter-container');
    
    // This check prevents errors if the filter container isn't on the page
    if (filterContainer) {
        filterContainer.addEventListener('input', (e) => {
            if (e.target.matches('#innovations-search-input')) {
                filterAndRenderInnovations();
            }
        });

        filterContainer.addEventListener('change', (e) => {
            if (e.target.matches('select')) {
                filterAndRenderInnovations();
            }
        });

        filterContainer.addEventListener('click', (e) => {
            if (e.target.matches('#innovations-reset-btn')) {
                document.getElementById('innovations-search-input').value = '';
                document.getElementById('innovations-category-filter').value = '';
                document.getElementById('innovations-subject-filter').value = '';
                document.getElementById('innovations-grade-filter').value = '';
                filterAndRenderInnovations();
            }
        });
    }
}


// --- FILTER FUNCTIONS (Specific to Innovations) ---

function filterAndRenderInnovations() {
    const filteredData = filterInnovations();
    UI.renderInnovations(filteredData);
}

function filterInnovations() {
    const searchInput = document.getElementById('innovations-search-input');
    const categoryFilter = document.getElementById('innovations-category-filter');
    const subjectFilter = document.getElementById('innovations-subject-filter');
    const gradeFilter = document.getElementById('innovations-grade-filter');

    // Ensure elements exist before trying to read their values
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const subject = subjectFilter ? subjectFilter.value : '';
    const grade = gradeFilter ? gradeFilter.value : '';

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

