// --- Mobile Menu Toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // ตรวจสอบว่า element เหล่านี้มีอยู่จริงในหน้านั้นๆ ก่อนจะเพิ่ม event listener
    if (mobileMenuButton && mobileMenu) {
        const openIcon = mobileMenuButton.querySelector('svg:first-child');
        const closeIcon = mobileMenuButton.querySelector('svg:last-child');

        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }
});

// --- Media Library Logic ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec';
let allMedia = [];
let filteredMedia = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

// DOM Elements
const mediaGrid = document.getElementById('media-grid');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const searchBox = document.getElementById('search-box');
const subjectFilter = document.getElementById('subject-filter');
const gradeFilter = document.getElementById('grade-filter');
const loadMoreButton = document.getElementById('load-more-button');
const loadMoreContainer = document.getElementById('load-more-container');

// Modal Elements
const modal = document.getElementById('details-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalCover = document.getElementById('modal-cover');
const modalDescription = document.getElementById('modal-description');
const modalCreator = document.getElementById('modal-creator');
const modalSubject = document.getElementById('modal-subject');
const modalGrade = document.getElementById('modal-grade');
const modalUploadDate = document.getElementById('modal-uploaddate');
const modalCopyLink = document.getElementById('modal-copy-link');
const modalOpenFile = document.getElementById('modal-open-file');

// Back to Top Button
const backToTopButton = document.getElementById("back-to-top");


// --- Utility Functions ---
function showError(message) {
    if (loader) loader.style.display = 'none';
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    if (mediaGrid) mediaGrid.innerHTML = '';
}

function formatDate(dateString) {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// --- Data Fetching ---
async function fetchData() {
    try {
        if(loader) loader.style.display = 'block';
        if(errorMessage) errorMessage.style.display = 'none';

        const [mediaRes, filtersRes] = await Promise.all([
            fetch(`${SCRIPT_URL}?action=getMediaData`),
            fetch(`${SCRIPT_URL}?action=getFilters`)
        ]);

        if (!mediaRes.ok || !filtersRes.ok) {
            throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }

        const mediaData = await mediaRes.json();
        const filterData = await filtersRes.json();
        
        if (!Array.isArray(mediaData)) {
            throw new Error('ข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
        }

        allMedia = mediaData;
        filteredMedia = allMedia;
        populateFilters(filterData);
        displayMediaPage(1); 

    } catch (error) {
        showError(error.message);
        console.error("Fetch error:", error);
    } finally {
        if(loader) loader.style.display = 'none';
    }
}

// --- Display Logic ---
function populateFilters(filterData) {
    if (subjectFilter && filterData.subjects) {
        filterData.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
    }
    if (gradeFilter && filterData.grades) {
        filterData.grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            gradeFilter.appendChild(option);
        });
    }
}

function displayMediaPage(page) {
    currentPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const mediaToDisplay = filteredMedia.slice(start, end);

    if (page === 1 && mediaGrid) {
        mediaGrid.innerHTML = '';
    }

    if (mediaToDisplay.length === 0 && page === 1) {
        mediaGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบสื่อที่ตรงกับเงื่อนไข</p>';
    } else {
        mediaToDisplay.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer';
            card.innerHTML = `
                <img src="${item['รูปปกสื่อ'] || 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image'}" alt="${item['ชื่อสื่อ']}" class="w-full h-40 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 truncate">${item['ชื่อสื่อ']}</h3>
                    <p class="text-sm text-gray-600 mt-1">${item['ประเภทสื่อ (วิชา)'] || 'ไม่ระบุ'}</p>
                </div>
            `;
            card.addEventListener('click', () => openModal(item));
            if(mediaGrid) mediaGrid.appendChild(card);
        });
    }

    // Handle "Load More" button visibility
    if (loadMoreContainer) {
        if (end < filteredMedia.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

function applyFilters() {
    const searchTerm = searchBox.value.toLowerCase();
    const selectedSubject = subjectFilter.value;
    const selectedGrade = gradeFilter.value;

    filteredMedia = allMedia.filter(item => {
        const titleMatch = item['ชื่อสื่อ']?.toLowerCase().includes(searchTerm) ?? true;
        const subjectMatch = !selectedSubject || item['ประเภทสื่อ (วิชา)'] === selectedSubject;
        const gradeMatch = !selectedGrade || item['ระดับชั้น'] === selectedGrade;
        return titleMatch && subjectMatch && gradeMatch;
    });

    displayMediaPage(1);
}

// --- Modal Logic ---
function openModal(item) {
    if (!modal) return;
    modalTitle.textContent = item['ชื่อสื่อ'] || 'ไม่มีชื่อ';
    modalCover.src = item['รูปปกสื่อ'] || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
    modalDescription.textContent = item['คำอธิบาย'] || 'ไม่มีคำอธิบาย';
    modalCreator.textContent = item['ผู้สร้าง'] || 'ไม่ระบุ';
    modalSubject.textContent = item['ประเภทสื่อ (วิชา)'] || 'ไม่ระบุ';
    modalGrade.textContent = item['ระดับชั้น'] || 'ไม่ระบุ';
    modalUploadDate.textContent = formatDate(item['วันที่อัปโหลด']);
    modalOpenFile.href = item['ลิงก์ดูไฟล์'] || '#';
    
    modalCopyLink.onclick = () => {
        navigator.clipboard.writeText(item['ลิงก์ดูไฟล์'] || '').then(() => {
            modalCopyLink.textContent = 'คัดลอกแล้ว!';
            setTimeout(() => { modalCopyLink.textContent = 'คัดลอกลิงก์'; }, 2000);
        });
    };
    
    modal.style.display = 'block';
}

function closeModal() {
    if(modal) modal.style.display = 'none';
}


// --- Event Listeners ---
if (searchBox) searchBox.addEventListener('input', applyFilters);
if (subjectFilter) subjectFilter.addEventListener('change', applyFilters);
if (gradeFilter) gradeFilter.addEventListener('change', applyFilters);
if (loadMoreButton) loadMoreButton.addEventListener('click', () => displayMediaPage(currentPage + 1));
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
if (backToTopButton) {
    window.onscroll = () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopButton.style.display = "flex";
        } else {
            backToTopButton.style.display = "none";
        }
    };
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initial data fetch for the library page
if (document.getElementById('media-grid')) {
    fetchData();
}

