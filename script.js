let allMedia = [];
const ITEMS_PER_PAGE = 12; // กำหนดให้แสดงผลครั้งละ 12 รายการ
let currentFilteredItems = []; // รายการสื่อที่ผ่านการกรองแล้ว
let itemsCurrentlyShown = 0; // จำนวนสื่อที่แสดงผลอยู่บนหน้าจอ

// =================================================================
//  สำคัญ! ตรวจสอบว่า URL นี้ถูกต้อง
// =================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec';
// =================================================================


// --- DOM Elements ---
const mediaCardsContainer = document.getElementById('media-cards');
const modal = document.getElementById('media-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal-btn');
const backToTopBtn = document.getElementById('back-to-top');
const copyLinkBtn = document.getElementById('copy-link-btn');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');
// -- Elements ใหม่สำหรับ Dropdown --
const menuDropdownBtn = document.getElementById('menu-dropdown-btn');
const menuDropdown = document.getElementById('menu-dropdown');
const menuDropdownIcon = menuDropdownBtn.querySelector('i');


// --- Event Listeners ---
window.addEventListener('load', () => {
    fetchData();
    setupEventListeners();
});

window.addEventListener('scroll', handleScroll);

// -- Listener ใหม่สำหรับปิด Dropdown เมื่อคลิกที่อื่น --
window.addEventListener('click', (event) => {
    if (!menuDropdownBtn.contains(event.target)) {
        menuDropdown.classList.add('hidden');
        menuDropdownIcon.classList.remove('rotate-180');
    }
});


function setupEventListeners() {
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('subject-filter').addEventListener('change', applyFilters);
    document.getElementById('grade-filter').addEventListener('change', applyFilters);

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    mediaCardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.media-card');
        if (card) {
            openModal(card.dataset.fileId);
        }
    });

    backToTopBtn.addEventListener('click', scrollToTop);
    copyLinkBtn.addEventListener('click', copyModalLink);
    loadMoreBtn.addEventListener('click', displayMoreMedia);

    // -- Listener ใหม่สำหรับปุ่ม Dropdown --
    menuDropdownBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // ป้องกันไม่ให้ event click นี้ลอยไปถึง window
        menuDropdown.classList.toggle('hidden');
        menuDropdownIcon.classList.toggle('rotate-180');
    });
}

// --- Data Fetching ---
async function fetchData() {
    if (!SCRIPT_URL || SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec') {
         showError({ message: 'กรุณาตั้งค่า SCRIPT_URL ในไฟล์ script.js ก่อน' });
         return;
    }
    document.getElementById('loader').style.display = 'block';
    try {
        const [mediaRes, filtersRes] = await Promise.all([
            fetch(`${SCRIPT_URL}?action=getMediaData`),
            fetch(`${SCRIPT_URL}?action=getFilters`)
        ]);
        if (!mediaRes.ok || !filtersRes.ok) throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์`);

        const mediaData = await mediaRes.json();
        const filterData = await filtersRes.json();
        
        allMedia = mediaData;
        populateFilters(filterData);
        applyFilters(); // เรียกใช้ applyFilters เพื่อแสดงผลข้อมูลชุดแรก
    } catch (error) {
        showError(error);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function populateFilters(filters) {
    const subjectSelect = document.getElementById('subject-filter');
    const gradeSelect = document.getElementById('grade-filter');
    
    filters.subjects.forEach(subject => subjectSelect.add(new Option(subject, subject)));
    filters.grades.forEach(grade => gradeSelect.add(new Option(grade, grade)));
}

// --- Display Logic ---
function displayMoreMedia() {
    const container = document.getElementById('media-cards');
    const itemsToDisplay = currentFilteredItems.slice(itemsCurrentlyShown, itemsCurrentlyShown + ITEMS_PER_PAGE);

    itemsToDisplay.forEach(media => {
        const card = document.createElement('div');
        card.className = 'media-card bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer';
        card.dataset.fileId = media['File ID'];
        
        const coverImage = media['รูปปกสื่อ'] || 'https://placehold.co/600x400/e2e8f0/64748b?text=ไม่มีรูปภาพ';
        
        card.innerHTML = `
            <img src="${coverImage}" alt="${media['ชื่อสื่อ']}" class="w-full h-48 object-cover pointer-events-none">
            <div class="p-5 pointer-events-none">
                <div class="flex flex-wrap gap-2 mb-2">
                    <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">${media['ประเภทสื่อ (วิชา)'] || 'ไม่ระบุ'}</span>
                    <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">${media['ระดับชั้น'] || 'ไม่ระบุ'}</span>
                </div>
                <h3 class="text-xl font-bold mb-2 truncate" title="${media['ชื่อสื่อ']}">${media['ชื่อสื่อ']}</h3>
                <p class="text-gray-600 text-sm h-10 overflow-hidden">${media['คำอธิบาย'] || 'ไม่มีคำอธิบาย'}</p>
            </div>
        `;
        container.appendChild(card);
    });

    itemsCurrentlyShown += itemsToDisplay.length;

    // ตรวจสอบเพื่อซ่อนหรือแสดงปุ่ม "โหลดเพิ่มเติม"
    if (itemsCurrentlyShown >= currentFilteredItems.length) {
        loadMoreContainer.classList.add('hidden');
    } else {
        loadMoreContainer.classList.remove('hidden');
    }
}

// --- Filtering Logic ---
function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const selectedSubject = document.getElementById('subject-filter').value;
    const selectedGrade = document.getElementById('grade-filter').value;

    currentFilteredItems = allMedia.filter(media => 
        (!searchTerm || media['ชื่อสื่อ'].toLowerCase().includes(searchTerm)) &&
        (!selectedSubject || media['ประเภทสื่อ (วิชา)'] === selectedSubject) &&
        (!selectedGrade || media['ระดับชั้น'] === selectedGrade)
    );
    
    // Reset การแสดงผลทั้งหมดก่อนเริ่มใหม่
    mediaCardsContainer.innerHTML = '';
    itemsCurrentlyShown = 0;
    
    document.getElementById('no-results').classList.toggle('hidden', currentFilteredItems.length > 0);

    displayMoreMedia(); // แสดงข้อมูลชุดแรก
}

// --- Modal Logic ---
function openModal(fileId) {
    const media = allMedia.find(m => m['File ID'] === fileId);
    if (!media) return;

    document.getElementById('modal-title').textContent = media['ชื่อสื่อ'];
    document.getElementById('modal-image').src = media['รูปปกสื่อ'] || 'https://placehold.co/600x400/e2e8f0/64748b?text=ไม่มีรูปภาพ';
    document.getElementById('modal-subject').textContent = media['ประเภทสื่อ (วิชา)'] || '-';
    document.getElementById('modal-grade').textContent = media['ระดับชั้น'] || '-';
    document.getElementById('modal-creator').textContent = media['ผู้สร้าง'] || '-';
    document.getElementById('modal-date').textContent = new Date(media['วันที่อัปโหลด']).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('modal-description').textContent = media['คำอธิบาย'] || 'ไม่มีคำอธิบาย';
    document.getElementById('modal-link').href = media['ลิงก์ดูไฟล์'];

    copyLinkBtn.innerHTML = '<i class="fas fa-copy mr-2"></i> คัดลอกลิงก์';

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    document.body.style.overflow = 'auto';
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- Feature Logic ---
function handleScroll() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function copyModalLink() {
    const link = document.getElementById('modal-link').href;
    navigator.clipboard.writeText(link).then(() => {
        copyLinkBtn.innerHTML = '<i class="fas fa-check mr-2"></i> คัดลอกแล้ว!';
        setTimeout(() => {
            copyLinkBtn.innerHTML = '<i class="fas fa-copy mr-2"></i> คัดลอกลิงก์';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// --- Utility Functions ---
function showError(error) {
    console.error('Error:', error);
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    loader.innerHTML = `<p class="text-red-500 font-bold">เกิดข้อผิดพลาด: ${error.message}</p><p class="text-sm text-gray-600 mt-2">โปรดตรวจสอบว่าคุณได้ใส่ URL ของเว็บแอปถูกต้องแล้ว และได้ Deploy สคริปต์เวอร์ชันล่าสุดแล้ว</p>`;
}

