// This is the main controller file.
// It imports functions from other modules and coordinates everything.

import * as Data from './js/data.js';
import * as API from './js/api.js';
import * as UI from './js/ui.js';
import { STATIC_INNOVATIONS_DATA } from './js/inno.js';
import { STATIC_NEWS_DATA } from './js/news.js';
import { STATIC_DIRECTOR_HISTORY_DATA } from './js/direc.js';
import { STATIC_PERSONNEL_HISTORY_DATA } from './js/member.js';
import { STATIC_STUDENT_AWARDS_DATA } from './js/staward.js';
import { STATIC_SCHOOL_AWARDS_DATA } from './js/saward.js';
import { STATIC_DOCS_DATA } from './js/docs.js';
import { STATIC_FILES_DATA } from './js/files.js';


// --- Global Caches ---
let teacherAchievementsCache = [];
let innovationsDataCache = [];
let currentlyDisplayedInnovations = [];
let personnelDataCache = [];
let newsDataCache = [];
let studentAchievementsCache = [];
let schoolAchievementsCache = [];
let documentsDataCache = [];
let filesDataCache = [];
// 🌟 ADDED: Cache for filtered student achievements
let currentlyDisplayedStudentAchievements = [];


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    UI.setupDropdowns();
    UI.setupModal();
    setupEventListeners();
    setupInnovationFilterListeners();
    UI.setupHistorySearch('director-search-input', 'director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA);
    UI.setupHistorySearch('personnel-history-search-input', 'personnel-history-table-body', STATIC_PERSONNEL_HISTORY_DATA);
    setupDocumentSearchListeners();
    // 🌟 ADDED: Setup for student achievement filters
    setupStudentAchievementFilterListeners();
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
            if (newsDataCache.length === 0) newsDataCache = STATIC_NEWS_DATA;
            UI.renderHomeNews(newsDataCache);
            break;
        case 'personnel-list':
            if (personnelDataCache.length === 0) personnelDataCache = Data.STATIC_PERSONNEL_DATA;
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
            if (teacherAchievementsCache.length === 0) {
                 try {
                    const data = await API.loadTeacherAchievementsData();
                    teacherAchievementsCache = data;
                } catch (e) { console.error(e); }
            }
            UI.renderTeacherAchievements(teacherAchievementsCache);
            break;
        case 'student-achievements':
            if (studentAchievementsCache.length === 0) {
                studentAchievementsCache = STATIC_STUDENT_AWARDS_DATA;
                UI.populateStudentAchievementFilters(studentAchievementsCache);
            }
            applyStudentAchievementFilters();
            break;
        case 'school-achievements':
            if (schoolAchievementsCache.length === 0) schoolAchievementsCache = STATIC_SCHOOL_AWARDS_DATA;
            UI.renderSchoolAchievements(schoolAchievementsCache);
            break;
        case 'innovations':
             if (innovationsDataCache.length === 0) { 
                innovationsDataCache = STATIC_INNOVATIONS_DATA;
                UI.populateInnovationFilters(innovationsDataCache);
            }
            applyInnovationFilters();
            break;
        case 'news':
            if (newsDataCache.length === 0) newsDataCache = STATIC_NEWS_DATA;
            UI.renderNews(newsDataCache);
            break;
        case 'director-history':
            const directorSearch = document.getElementById('director-search-input');
            if(directorSearch) directorSearch.value = '';
            UI.renderHistoryTable('director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA);
            break;
        case 'personnel-history':
            const personnelSearch = document.getElementById('personnel-history-search-input');
            if(personnelSearch) personnelSearch.value = '';
            UI.renderHistoryTable('personnel-history-table-body', STATIC_PERSONNEL_HISTORY_DATA);
            break;
        case 'documents-official':
            if (documentsDataCache.length === 0) documentsDataCache = STATIC_DOCS_DATA;
            const officialSearch = document.getElementById('documents-official-search');
            if(officialSearch) officialSearch.value = '';
            applyDocumentSearch(documentsDataCache, 'documents-official-search', 'documents-official-container');
            break;
        case 'documents-forms':
            if (filesDataCache.length === 0) filesDataCache = STATIC_FILES_DATA;
            const formsSearch = document.getElementById('documents-forms-search');
            if(formsSearch) formsSearch.value = '';
            applyDocumentSearch(filesDataCache, 'documents-forms-search', 'documents-forms-container');
            break;
        case 'history':
        case 'info':
        case 'structure':
            // Static pages, no specific JS action needed.
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

function applyDocumentSearch(dataSource, searchInputId, containerId) {
    const searchInput = document.getElementById(searchInputId);
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!dataSource) return;

    const filteredData = dataSource.filter(item => {
        return !searchTerm || (item.title && item.title.toLowerCase().includes(searchTerm));
    });

    UI.renderDocuments(filteredData, containerId);
}

// 🌟 ADDED: ฟังก์ชันสำหรับกรองผลงานนักเรียน
function applyStudentAchievementFilters() {
    const searchValue = document.getElementById('student-achievements-search-input').value.toLowerCase();
    const subjectValue = document.getElementById('student-achievements-subject-filter').value;

    const filteredData = studentAchievementsCache.filter(item => {
        const matchesSearch = !searchValue || (item.title && item.title.toLowerCase().includes(searchValue)) || (item.students && item.students.toLowerCase().includes(searchValue));
        const matchesSubject = !subjectValue || item.subject === subjectValue;
        return matchesSearch && matchesSubject;
    });

    currentlyDisplayedStudentAchievements = filteredData;
    UI.renderStudentAchievements(filteredData);
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

function setupDocumentSearchListeners() {
    const officialSearch = document.getElementById('documents-official-search');
    if (officialSearch) {
        officialSearch.addEventListener('input', () => {
            if (documentsDataCache.length === 0) documentsDataCache = STATIC_DOCS_DATA;
            applyDocumentSearch(documentsDataCache, 'documents-official-search', 'documents-official-container');
        });
    }

    const formsSearch = document.getElementById('documents-forms-search');
    if (formsSearch) {
        formsSearch.addEventListener('input', () => {
            if (filesDataCache.length === 0) filesDataCache = STATIC_FILES_DATA;
            applyDocumentSearch(filesDataCache, 'documents-forms-search', 'documents-forms-container');
        });
    }
}

// 🌟 ADDED: ฟังก์ชันสำหรับดักจับ event ของตัวกรองผลงานนักเรียน
function setupStudentAchievementFilterListeners() {
    const searchInput = document.getElementById('student-achievements-search-input');
    const subjectFilter = document.getElementById('student-achievements-subject-filter');
    const resetBtn = document.getElementById('student-achievements-reset-btn');

    if (searchInput) searchInput.addEventListener('input', applyStudentAchievementFilters);
    if (subjectFilter) subjectFilter.addEventListener('change', applyStudentAchievementFilters);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (subjectFilter) subjectFilter.value = '';
            applyStudentAchievementFilters();
        });
    }
}

function setupEventListeners() {
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

        // 🌟 FIXED: Changed class name to match ui.js 🌟
        const achievementCard = e.target.closest('.student-achievement-card');
        if (achievementCard) {
            const index = achievementCard.dataset.index;
            const selectedAchievement = currentlyDisplayedStudentAchievements[index];
            if (selectedAchievement) {
                UI.showStudentAchievementModal(selectedAchievement);
            }
            return;
        }
    });
}

