import { fetchData } from './js/api.js';

// Global Cache
const cache = {};

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    document.querySelectorAll('[data-page], [data-page-link]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const page = el.dataset.page || el.dataset.pageLink;
            showPage(page);
        });
    });

    // Load Home Data
    loadHomeNews();
});

async function showPage(pageId) {
    // Hide all contents
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('generic-page').classList.add('hidden');
    window.scrollTo(0, 0);

    // Handle Specific Pages
    if (pageId === 'home') {
        document.getElementById('page-home').classList.remove('hidden');
    } else if (pageId === 'info') {
        document.getElementById('page-info').classList.remove('hidden');
        loadSchoolInfo();
    } else {
        // Generic List Pages (News, Personnel, etc.)
        renderGenericPage(pageId);
    }
}

async function loadHomeNews() {
    const container = document.getElementById('home-news-container');
    const data = await getData('news');
    if (!data.length) { container.innerHTML = '<p class="text-gray-500 text-center">ยังไม่มีข่าวสาร</p>'; return; }
    
    container.innerHTML = data.slice(0, 3).map(news => `
        <div class="flex gap-4 items-start border-b pb-4 last:border-0">
            <div class="bg-blue-100 text-blue-600 rounded-lg p-3 shrink-0"><i class="fa-regular fa-calendar-alt"></i></div>
            <div>
                <h3 class="font-bold text-gray-800 hover:text-blue-600 cursor-pointer">${news.title}</h3>
                <p class="text-sm text-gray-500">${new Date(news.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>
    `).join('');
}

async function loadSchoolInfo() {
    const container = document.getElementById('info-content');
    const data = await getData('info');
    if (!data.length) return;

    container.innerHTML = data.map(info => `
        <div class="mb-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <h3 class="text-xl font-bold text-blue-900 mb-3">${info.label}</h3>
            <p class="whitespace-pre-line leading-relaxed">${info.value}</p>
        </div>
    `).join('');
}

async function renderGenericPage(pageId) {
    const section = document.getElementById('generic-page');
    const contentArea = document.getElementById('page-content-area');
    const loader = document.getElementById('loading-indicator');
    const title = document.getElementById('page-title');

    // Setup UI
    section.classList.remove('hidden');
    contentArea.innerHTML = '';
    loader.classList.remove('hidden');
    
    // Map Titles
    const titles = { news: "ข่าวประชาสัมพันธ์", personnel: "บุคลากร", teacher_awards: "ผลงานครู", student_awards: "ผลงานนักเรียน" };
    title.innerText = titles[pageId] || "ข้อมูล";

    // Fetch Data
    const data = await getData(pageId);
    loader.classList.add('hidden');

    if (!data.length) {
        contentArea.innerHTML = '<p class="col-span-full text-center text-gray-500">ไม่พบข้อมูล</p>';
        return;
    }

    // Render Cards based on Type
    contentArea.innerHTML = data.map(item => {
        // Universal Card Template
        const img = item.image || item.coverImageUrl || 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
        const titleText = item.title || item.name || 'ไม่มีชื่อ';
        const subText = item.role || item.project || item.date || '';

        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col">
                <div class="h-48 overflow-hidden bg-gray-100 relative group">
                    <img src="${img}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                </div>
                <div class="p-5 flex-grow">
                    <h3 class="font-bold text-lg text-gray-800 mb-2 line-clamp-2">${titleText}</h3>
                    <p class="text-sm text-gray-500">${subText}</p>
                </div>
            </div>
        `;
    }).join('');
}

async function getData(sheetName) {
    if (cache[sheetName]) return cache[sheetName];
    try {
        const result = await fetchData(sheetName);
        cache[sheetName] = result;
        return result;
    } catch (e) { console.error(e); return []; }
}
