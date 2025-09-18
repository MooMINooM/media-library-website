// This is the main controller file.
// It imports functions from other modules and coordinates everything.

import * as Data from './js/data.js';
import * as API from './js/api.js';
import * as UI from './js/ui.js';
import { STATIC_INNOVATIONS_DATA } from './js/inno.js';
import { STATIC_NEWS_DATA } from './js/news.js';
import { STATIC_DIRECTOR_HISTORY_DATA } from './js/direc.js';
import { STATIC_PERSONNEL_HISTORY_DATA } from './js/member.js';
import { STATIC_DOCS_DATA } from './js/docs.js';


// --- Global Caches ---
let teacherAchievementsCache = [];
let innovationsDataCache = [];
let currentlyDisplayedInnovations = [];
let personnelDataCache = [];
let newsDataCache = [];
let documentsDataCache = [];

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    UI.setupDropdowns();
    UI.setupModal();
    setupEventListeners();
    setupInnovationFilterListeners();
    UI.setupHistorySearch('director-search-input', 'director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA);
    UI.setupHistorySearch('personnel-history-search-input', 'personnel-history-table-body', STATIC_PERSONNEL_HISTORY_DATA);
    
    // 🌟 ADDED: Setup search listeners for each document category
    setupDocumentSearchListeners();
    
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
    
    // Load documents data if not already loaded
    if (documentsDataCache.length === 0) {
        documentsDataCache = STATIC_DOCS_DATA;
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
        // ... other cases ...
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
            UI.renderHistoryTable('director-history-table-body', STATIC_DIRECTOR_HISTORY_DATA);
            break;
        case 'personnel-history':
            UI.renderHistoryTable('personnel-history-table-body', STATIC_PERSONNEL_HISTORY_DATA);
            break;
            
        // 🌟 UPDATED: Handle new document sub-pages 🌟
        case 'documents-orders':
            applyDocumentSearch('คำสั่ง', 'documents-orders-search', 'documents-orders-container');
            break;
        case 'documents-forms':
            applyDocumentSearch('แบบฟอร์ม', 'documents-forms-search', 'documents-forms-container');
            break;
        case 'documents-plans':
            applyDocumentSearch('แผนงาน', 'documents-plans-search', 'documents-plans-container');
            break;
    }
}

function applyInnovationFilters() {
    // ... (this function remains unchanged) ...
}

// 🌟 ADDED: New generic function for document searching 🌟
function applyDocumentSearch(category, searchInputId, containerId) {
    const searchInput = document.getElementById(searchInputId);
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const categoryData = documentsDataCache.filter(doc => doc.category === category);
    
    const filteredData = categoryData.filter(item => {
        return !searchTerm || (item.title && item.title.toLowerCase().includes(searchTerm));
    });

    UI.renderDocuments(filteredData, containerId);
}


function setupInnovationFilterListeners() {
    // ... (this function remains unchanged) ...
}

// 🌟 ADDED: New function to setup search for all document pages 🌟
function setupDocumentSearchListeners() {
    const ordersSearch = document.getElementById('documents-orders-search');
    if(ordersSearch) {
        ordersSearch.addEventListener('input', () => applyDocumentSearch('คำสั่ง', 'documents-orders-search', 'documents-orders-container'));
    }

    const formsSearch = document.getElementById('documents-forms-search');
    if(formsSearch) {
        formsSearch.addEventListener('input', () => applyDocumentSearch('แบบฟอร์ม', 'documents-forms-search', 'documents-forms-container'));
    }
    
    const plansSearch = document.getElementById('documents-plans-search');
    if(plansSearch) {
        plansSearch.addEventListener('input', () => applyDocumentSearch('แผนงาน', 'documents-plans-search', 'documents-plans-container'));
    }
}


function setupEventListeners() {
    // ... (this function remains unchanged) ...
}

