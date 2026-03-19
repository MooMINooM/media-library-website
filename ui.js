// js/ui.js - Lumina Bento Edition (Final Super Full Version + Announcement Modal)

// --- Global Variables (Data Persistence Layer) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let onetData = [];
let ntData = [];
let rtData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];
let allInnovationsData = [];

// --- Config ---
const ACH_ITEMS_PER_PAGE = 8;
const NEWS_ITEMS_PER_PAGE = 6;
const DOCS_ITEMS_PER_PAGE = 10;
const INNOV_ITEMS_PER_PAGE = 6;

// --- State Management ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

// ✅ เพิ่มฟังก์ชันจัดการวันที่ที่หายไป (ทำให้ข่าวไม่โชว์)
function formatDateThai(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function renderPagination(containerId, totalItems, perPage, currentPage, callbackName) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) { if (container) container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-2 mt-10 animate-fade-in py-4">`;
    html += `<button onclick="${callbackName}(${Math.max(1, currentPage - 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition shadow-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left text-xs"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const isActive = i === currentPage;
            html += `<button onclick="${callbackName}(${i}); window.scrollTo({top:0, behavior:'smooth'})" 
                class="w-10 h-10 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent scale-110' : 'bg-white text-slate-500 border-slate-100 hover:text-blue-600'}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="text-slate-300 px-1">...</span>`;
        }
    }

    html += `<button onclick="${callbackName}(${Math.min(totalPages, currentPage + 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition shadow-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right text-xs"></i></button></div>`;
    container.innerHTML = html;
}

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO & MEDIA RENDERER
// =============================================================================

export function renderSchoolInfo(dataList) {
    if (!dataList) return;
    const info = Array.isArray(dataList) ? dataList[0] : dataList;
    if (!info) return;

    if (info.school_name) document.title = info.school_name;

    const heroNameEl = document.getElementById('hero-school-name-short');
    if (heroNameEl) {
        let shortName = (info.school_name || 'โรงเรียน').replace('โรงเรียน', '').trim();
        heroNameEl.innerText = `"${shortName}"`;
    }

    const mapping = {
        'header-school-name': info.school_name, 'header-affiliation': info.affiliation, 'hero-motto': info.motto,
        'info-name-th': info.school_name, 'info-name-en': info.school_name_en, 'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8, 'info-obec-code': info.obec_code_6, 'info-affiliation-val': info.affiliation,
        'info-address': info.address, 'school-history-content': info.history, 'school-mission-content': info.mission,
        'info-vision': info.vision, 'info-philosophy': info.philosophy, 'info-motto': info.motto,
        'school-identity-content': info.identity, 'school-uniqueness-content': info.uniqueness, 'footer-school-name': info.school_name
    };

    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    }

    // Social Links (Flexible Column Check)
    const fbEl = document.getElementById('footer-facebook');
    const ytEl = document.getElementById('footer-youtube');
    const fbLink = info.facebook_url || info.facebook;
    if (fbLink && fbEl) { fbEl.href = fbLink; fbEl.classList.remove('hidden'); }
    const ytLink = info.youtube_url || info.youtube;
    if (ytLink && ytEl) { ytEl.href = ytLink; ytEl.classList.remove('hidden'); }

    // Logo Handling
    const logoHeader = document.getElementById('header-logo');
    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (info.logo_url) {
        if (logoHeader) { logoHeader.src = info.logo_url; logoHeader.classList.remove('hidden'); }
        if (logoBasic) {
            logoBasic.src = info.logo_url;
            logoBasic.classList.remove('hidden');
            if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
        }
    }

    // School Colors
    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        const c2 = info.color_code_2 || c1;
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    // Google Maps
    if (document.getElementById('school-map-container') && info.map_embed) {
        const mapContainer = document.getElementById('school-map-container');
        mapContainer.innerHTML = info.map_embed;
        const ifr = mapContainer.querySelector('iframe');
        if (ifr) {
            ifr.style.width = "100%";
            ifr.style.height = "100%";
            ifr.style.border = "0";
            ifr.style.borderRadius = "2rem";
        }
    }

    // VTR Logic
    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let videoId = "";
        try {
            if (info.vtr_url.includes('v=')) videoId = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) videoId = info.vtr_url.split('youtu.be/')[1].split('?')[0];
            else if (info.vtr_url.includes('embed/')) videoId = info.vtr_url.split('embed/')[1].split('?')[0];
        } catch (e) { }
        if (videoId) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${videoId}`;
            if (document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }

    // School Song
    if (info.song_url && document.getElementById('school-song')) {
        const audioEl = document.getElementById('school-song');
        audioEl.src = info.song_url;
        const musicControls = document.getElementById('music-player-controls');
        if (musicControls) musicControls.classList.remove('hidden');
    }

    // Ticker text from admin (ticker_text field, คั่นด้วย | )
    if (info.ticker_text) {
        window._adminTickerText = info.ticker_text;
        const ticker = document.getElementById('ticker-content');
        if (ticker) {
            const items = info.ticker_text.split('|').map(t => t.trim()).filter(Boolean);
            const singleHtml = items.map(t =>
                `<span class="inline-flex items-center gap-2 mr-14"><i class="fa-solid fa-circle text-[5px] opacity-50"></i> ${t}</span>`
            ).join('');
            ticker.innerHTML = singleHtml + singleHtml;
        }
    }


}
// =============================================================================
// FACEBOOK PAGE EMBED
// =============================================================================
export function renderFacebookFeed(info) {
    const section = document.getElementById('home-facebook-section');
    if (!section) return;

    const fbUrl = (info.facebook_url || info.facebook || '').trim();
    if (!fbUrl) return;
    if (info.show_facebook_feed === false || info.show_facebook_feed === 'ปิดการใช้งาน') return;

    const fbLink = document.getElementById('home-facebook-link');
    if (fbLink) fbLink.href = fbUrl;

    const embedDiv = document.getElementById('home-facebook-embed');
    if (!embedDiv) return;

    // ใช้ width=500 + adapt_container_width เพื่อให้ยืดเต็มคอลัมน์
    const encodedUrl = encodeURIComponent(fbUrl);
    const src = `https://www.facebook.com/plugins/page.php`
        + `?href=${encodedUrl}`
        + `&tabs=timeline`
        + `&width=500`
        + `&height=340`
        + `&small_header=true`
        + `&adapt_container_width=true`
        + `&hide_cover=false`
        + `&show_facepile=false`;

    embedDiv.innerHTML = `
        <div style="width:100%;height:340px;overflow:hidden;display:flex;justify-content:center;align-items:flex-start">
            <iframe
                src="${src}"
                style="border:none;overflow:hidden;width:500px;max-width:100%;height:340px;display:block"
                scrolling="no"
                frameborder="0"
                allowfullscreen="true"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
            </iframe>
        </div>`;

    // fb.loadSDK — resize iframe ให้พอดีกับ container หลัง DOM พร้อม
    if (!document.getElementById('fb-sdk')) {
        const s = document.createElement('script');
        s.id = 'fb-sdk';
        s.async = true;
        s.defer = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://connect.facebook.net/th_TH/sdk.js#xfbml=1&version=v18.0';
        document.head.appendChild(s);
    }

    section.style.display = 'flex';
    section.style.flexDirection = 'column';
}

// ✅ NEW: Announcement Modal Renderer
export function renderAnnouncement(info) {
    const modal = document.getElementById('announcement-modal');
    const img = document.getElementById('announcement-img');
    const content = document.getElementById('announcement-content');
    if (!modal || !img || !content) return;

    // เช็คคอลัมน์ popup_img และสถานะการเปิด (show_popup) จากฐานข้อมูล
    if (info.popup_img && info.show_popup === true) {
        img.src = info.popup_img;
        img.onload = () => {
            img.classList.remove('hidden');
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }, 50);
        };
    }
}

// Function สำหรับปิด Announcement
window.closeAnnouncement = () => {
    const modal = document.getElementById('announcement-modal');
    if (modal) modal.classList.add('hidden');
};

// =============================================================================
// ACADEMIC SUMMARY IMAGES — ONET / NT / RT
// Settings from onet_settings / nt_settings / rt_settings tables (max 4 imgs)
// =============================================================================
export function renderAcademicSettings(subject, settings) {
    if (!settings) return;
    const wrap = document.getElementById(`${subject}-summary-imgs`);
    const grid = document.getElementById(`${subject}-imgs-grid`);
    const div  = document.getElementById(`${subject}-divider`);
    if (!wrap || !grid) return;

    const urls = [1,2,3,4].map(n => (settings[`img_${n}`]||'').trim()).filter(Boolean);
    if (!urls.length) { wrap.classList.add('hidden'); if(div) div.classList.add('hidden'); return; }

    const colClass = urls.length === 1 ? 'grid-cols-1'
        : urls.length === 2 ? 'grid-cols-1 md:grid-cols-2'
        : urls.length === 3 ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4';

    grid.className = `grid gap-4 ${colClass}`;
    grid.innerHTML = urls.map((url, idx) =>
        `<div class="group relative overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 bg-white cursor-pointer"
            onclick="window._openSummaryImg('${url.replace(/'/g,"&#39;")}')">
            <img src="${url}" alt="สรุปผล ${subject.toUpperCase()} ภาพที่ ${idx+1}"
                class="w-full h-auto object-contain group-hover:scale-105 transition duration-700"
                loading="lazy"
                onerror="this.parentElement.innerHTML='<div class=\'flex items-center justify-center h-28 text-slate-300 text-xs\'>โหลดรูปไม่ได้</div>'">
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <i class="fa-solid fa-magnifying-glass-plus text-white opacity-0 group-hover:opacity-100 transition text-2xl drop-shadow-lg"></i>
            </div>
        </div>`
    ).join('');

    wrap.classList.remove('hidden');
    if (div) div.classList.remove('hidden');
}

window._openSummaryImg = function(url) {
    const lb  = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (lb && img) { img.src = url; window._lightboxUrls = [url]; window._lightboxIdx = 0; lb.classList.remove('hidden'); }
};

// =============================================================================
// 3. ACHIEVEMENT SYSTEM (Folder Sorting + List/Card View)
// =============================================================================

export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">ไม่พบข้อมูลผลงาน</div>`;
        return;
    }

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0, latestImage: item.image };
            acc[key].count++;
            if (!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
            return acc;
        }, {});

        // เรียงลำดับโฟลเดอร์ (Numeric + Thai Support)
        const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a, 'th', { numeric: true }));

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";

        sortedKeys.forEach(name => {
            const div = document.createElement('div');
            div.className = "group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center relative overflow-hidden h-full flex flex-col items-center justify-center";
            div.onclick = () => window.selectFolder(containerId, type, name);
            div.innerHTML = `
                <div class="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-4 shadow-sm border border-blue-50 group-hover:scale-110 transition duration-500 overflow-hidden relative">
                    ${groups[name].latestImage ? `<img src="${groups[name].latestImage}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-folder-open text-blue-100"></i>`}
                </div>
                <h4 class="font-bold text-slate-700 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors w-full px-2">${name}</h4>
                <div class="mt-3"><span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">${groups[name].count} Items</span></div>`;
            grid.appendChild(div);
        });
        container.appendChild(grid);
    } else {
        const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
        const pageItems = data.slice(startIndex, startIndex + ACH_ITEMS_PER_PAGE);

        const header = document.createElement('div');
        header.className = "flex items-center justify-between bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-8 animate-fade-in";
        header.innerHTML = `<h3 class="font-bold text-lg text-slate-700 flex items-center gap-3 ml-2"><i class="fa-solid fa-folder-open text-blue-500"></i> ${currentFolderFilter}</h3>
            <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-slate-800 hover:text-white">ย้อนกลับ</button>`;
        container.appendChild(header);

        if (['teacher', 'student', 'school'].includes(type)) {
            const cardGrid = document.createElement('div');
            cardGrid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in";
            pageItems.forEach(item => {
                const div = document.createElement('div');
                div.className = "group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col";
                div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
                div.innerHTML = `
                    <div class="aspect-[1.414/1] bg-slate-100 relative overflow-hidden">
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">` : `<div class="w-full h-full flex items-center justify-center text-slate-300 text-5xl"><i class="fa-solid fa-award"></i></div>`}
                        <div class="absolute top-4 left-4">${getSubjectBadge(item.subject || 'ทั่วไป')}</div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span class="text-[11px] font-black text-blue-600 uppercase tracking-widest">${item.title || 'เกียรติบัตร'}</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-800 line-clamp-1 mb-2">${item.students || item.name || '-'}</h4>
                        <div class="mt-auto pt-4 border-t border-slate-50">
                            <p class="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                <i class="fa-solid fa-trophy mr-1 text-amber-500"></i> รายการ: ${item.program || item.competition || '-'}
                            </p>
                        </div>
                    </div>`;
                cardGrid.appendChild(div);
            });
            container.appendChild(cardGrid);
        } else {
            const list = document.createElement('div');
            list.className = "grid grid-cols-1 gap-3 animate-fade-in";
            pageItems.forEach(item => {
                const div = document.createElement('div');
                div.className = "group bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer";
                div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
                div.innerHTML = `<div class="flex items-center gap-5 overflow-hidden"><div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-500 shrink-0"><i class="fa-solid fa-award"></i></div><div class="min-w-0"><h4 class="font-bold text-sm text-slate-700 group-hover:text-blue-600 truncate">${item.title || 'ประกาศเกียรติคุณ'}</h4><p class="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-4 mt-1"><span><i class="fa-solid fa-user-graduate mr-1"></i> ${item.students || item.name || '-'}</span><span><i class="fa-solid fa-tag mr-1 text-blue-300"></i> ${item.subject || 'ทั่วไป'}</span></p></div></div><div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white shrink-0"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></div>`;
                list.appendChild(div);
            });
            container.appendChild(list);
        }

        const pagId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(pagId);
        if (!pagDiv) { pagDiv = document.createElement('div'); pagDiv.id = pagId; container.appendChild(pagDiv); }
        renderPagination(pagId, data.length, ACH_ITEMS_PER_PAGE, page, `window.pagedAch_${type}`);
    }
}

// =============================================================================
// 4. WINDOW BRIDGES & SEARCH LOGIC
// =============================================================================

window.selectFolder = (cid, type, name) => {
    currentFolderFilter = name;
    let data = [];
    if (type === 'teacher') data = allTeacherData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    else if (type === 'student') data = allStudentData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    else if (type === 'school') data = allSchoolData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    else if (type === 'onet') data = onetData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    else if (type === 'nt') data = ntData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    else if (type === 'rt') data = rtData.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    renderAchievementSystem(cid, data, type, 1);
};

window.clearFolderFilter = (cid, type) => {
    currentFolderFilter = null;
    let data = [];
    if (type === 'teacher') data = allTeacherData;
    else if (type === 'student') data = allStudentData;
    else if (type === 'school') data = allSchoolData.filter(i => !['O-NET', 'NT', 'RT'].some(k => (i.title + i.competition).includes(k)));
    else if (type === 'onet') data = onetData;
    else if (type === 'nt') data = ntData;
    else if (type === 'rt') data = rtData;
    renderAchievementSystem(cid, data, type, 1);
};

window.filterAchievements = (inputId, selectOrType, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    // Determine the type from containerId
    let type;
    if (containerId.includes('teacher')) type = 'teacher';
    else if (containerId.includes('student')) type = 'student';
    else if (containerId.includes('school')) type = 'school';
    else if (containerId.includes('onet')) type = 'onet';
    else if (containerId.includes('nt-')) type = 'nt';
    else if (containerId.includes('rt')) type = 'rt';
    else type = selectOrType; // fallback to old behavior

    let source = (type === 'teacher') ? allTeacherData : (type === 'student' ? allStudentData : allSchoolData);
    if (type === 'onet') source = onetData; if (type === 'nt') source = ntData; if (type === 'rt') source = rtData;

    // Read the level select filter if it exists
    const selectEl = document.getElementById(selectOrType);
    const levelFilter = (selectEl && selectEl.tagName === 'SELECT') ? selectEl.value : 'all';

    const f = source.filter(i => {
        const textMatch = !val || [i.title, i.students, i.name, i.competition, i.subject, i.program].join(' ').toLowerCase().includes(val);
        const levelMatch = !levelFilter || levelFilter === 'all' || [i.level, i.competition, i.program].join(' ').includes(levelFilter);
        return textMatch && levelMatch;
    });
    currentFolderFilter = (val || (levelFilter && levelFilter !== 'all')) ? `ผลการค้นหา` : null;
    renderAchievementSystem(containerId, f, type, 1);
};

// ✅ News Filter
window.filterNews = (inputId, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    const yearSelect = document.getElementById('filter-news-year');
    const yearFilter = yearSelect ? yearSelect.value : '';
    const filtered = allNewsData.filter(item => {
        const textMatch = !val || item.title.toLowerCase().includes(val);
        const yearMatch = !yearFilter || (item.academic_year && item.academic_year === yearFilter);
        return textMatch && yearMatch;
    });
    renderNews(filtered, 1);
};

// ✅ Innovations Filter
window.filterInnovations = (inputId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    const subjectSelect = document.getElementById('filter-innovations-subject');
    const subjectFilter = subjectSelect ? subjectSelect.value : '';
    const filtered = allInnovationsData.filter(item => {
        const textMatch = !val || `${item.title} ${item.creator} ${item.subject}`.toLowerCase().includes(val);
        const subjectMatch = !subjectFilter || (item.subject && item.subject.includes(subjectFilter));
        return textMatch && subjectMatch;
    });
    renderInnovations(filtered, 1);
};

// filterDocuments replaced by filterDocs window function in renderDocumentsList

// Pagination Bridges
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);
window.pagedAch_onet = (p) => renderAchievementSystem('onet-container', onetData, 'onet', p);
window.pagedAch_nt = (p) => renderAchievementSystem('nt-container', ntData, 'nt', p);
window.pagedAch_rt = (p) => renderAchievementSystem('rt-container', rtData, 'rt', p);

// =============================================================================
// 5. OTHER RENDERERS
// =============================================================================

export function renderSchoolAchievements(data) {
    if (!data) return;
    allSchoolData = data;
    onetData = allSchoolData.filter(i => (i.title + i.competition).includes('O-NET'));
    ntData = allSchoolData.filter(i => (i.title + i.competition).includes('NT'));
    rtData = allSchoolData.filter(i => (i.title + i.competition).includes('RT'));
    const general = allSchoolData.filter(i => !['O-NET', 'NT', 'RT'].some(k => (i.title + i.competition).includes(k)));
    renderAchievementSystem('school-achievements-container', general, 'school');
    if (document.getElementById('onet-container')) renderAchievementSystem('onet-container', onetData, 'onet');
    if (document.getElementById('nt-container')) renderAchievementSystem('nt-container', ntData, 'nt');
    if (document.getElementById('rt-container')) renderAchievementSystem('rt-container', rtData, 'rt');
}

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }

export function renderNews(data, page = 1) {
    if (!data) return;
    if (allNewsData.length === 0 || data.length > allNewsData.length) { allNewsData = data; }
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    const items = data.slice((page - 1) * NEWS_ITEMS_PER_PAGE, page * NEWS_ITEMS_PER_PAGE);
    items.forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white/80 border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-6 mb-6 group cursor-pointer";
        div.onclick = () => { if (news.link) window.open(news.link, '_blank'); };
        // ✅ เปลี่ยนมาใช้ formatDateThai
        div.innerHTML = `<div class="w-full md:w-64 h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden shrink-0 relative">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : ''}<div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 border border-white">News</div></div><div class="flex-1 flex flex-col justify-between py-1"><div class="space-y-3"><h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">${news.title}</h4><p class="text-slate-500 text-sm leading-relaxed flex items-center gap-2 flex-wrap">ข้อมูลประชาสัมพันธ์วันที่ ${formatDateThai(news.date)}${news.academic_year ? ` <span class="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">ปี ${news.academic_year}</span>` : ''}</p></div><div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50"><span class="text-[11px] font-bold text-slate-400"><i class="fa-regular fa-clock text-blue-400"></i> ${formatDateThai(news.date)}</span><span class="text-blue-600 text-[10px] font-black group-hover:translate-x-2 transition-transform">Read More <i class="fa-solid fa-arrow-right"></i></span></div></div>`;
        container.appendChild(div);
    });
    renderPagination('news-pagination', data.length, NEWS_ITEMS_PER_PAGE, page, "window.pagedNews");
}
window.pagedNews = (p) => renderNews(allNewsData, p);

export function renderInnovations(data, page = 1) {
    if (data && data.length > 0 && (allInnovationsData.length === 0 || data.length > allInnovationsData.length)) { allInnovationsData = data; }
    const container = document.getElementById('innovations-container');
    if (!container) return;
    container.innerHTML = '';
    const items = data.slice((page - 1) * INNOV_ITEMS_PER_PAGE, page * INNOV_ITEMS_PER_PAGE);
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in";
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all cursor-pointer flex flex-col";
        div.onclick = () => window.open(item.fileUrl, '_blank');
        div.innerHTML = `<div class="aspect-[16/10] bg-slate-50 relative overflow-hidden">${item.coverImageUrl ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : ''}<div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-blue-600 shadow-sm border border-white">Innovation</div></div><div class="p-6 flex-1 flex flex-col"><h4 class="font-bold text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">${item.title}</h4><div class="mt-auto pt-5 border-t border-slate-50"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors"><i class="fa-solid fa-user-pen text-sm"></i></div><div class="min-w-0"><p class="text-xs font-black text-slate-700 truncate uppercase tracking-tight">${item.creator || '-'}</p><p class="text-[10px] font-bold text-slate-400 uppercase italic">ระดับ: ${item.class || '-'}</p></div></div></div></div>`;
        container.appendChild(div);
    });
    renderPagination('innovations-pagination', data.length, INNOV_ITEMS_PER_PAGE, page, "window.pagedInnovations");
}
window.pagedInnovations = (p) => renderInnovations(allInnovationsData, p);

// =============================================================================
// SPLIT PANEL DOCUMENTS RENDERER — เอกสารราชการ + แบบฟอร์ม
// =============================================================================

const _docState = {
    official: { data:[], activeCat:'__all__', search:'' },
    form:     { data:[], activeCat:'__all__', search:'' }
};

function _fileIconSplit(url) {
    if (!url) return { icon:'fa-file-lines', badge:'ไฟล์', badgeCls:'bg-slate-100 text-slate-500' };
    const u = url.toLowerCase();
    if (u.includes('.pdf'))  return { icon:'fa-file-pdf',       badge:'PDF', badgeCls:'bg-red-50 text-red-600' };
    if (u.includes('.doc'))  return { icon:'fa-file-word',       badge:'DOC', badgeCls:'bg-blue-50 text-blue-600' };
    if (u.includes('.xls'))  return { icon:'fa-file-excel',      badge:'XLS', badgeCls:'bg-emerald-50 text-emerald-600' };
    if (u.includes('.ppt'))  return { icon:'fa-file-powerpoint', badge:'PPT', badgeCls:'bg-orange-50 text-orange-600' };
    return { icon:'fa-file-lines', badge:'ไฟล์', badgeCls:'bg-slate-100 text-slate-500' };
}

function _buildSplitPanel(type) {
    const state = _docState[type];
    const containerId = type === 'official' ? 'documents-official-container' : 'documents-forms-container';
    const container   = document.getElementById(containerId);
    if (!container) return;

    const isOfficial  = type === 'official';
    const accentSidebar = isOfficial
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-blue-50 text-blue-700 border-blue-200';
    const accentSearch = isOfficial
        ? 'focus-within:border-red-300 focus-within:ring-red-100'
        : 'focus-within:border-blue-300 focus-within:ring-blue-100';
    const accentDl = isOfficial
        ? 'hover:bg-red-500 hover:text-white hover:border-transparent'
        : 'hover:bg-blue-500 hover:text-white hover:border-transparent';

    // Build category list with counts
    const catMap = {};
    state.data.forEach(d => {
        const c = d.category || 'ทั่วไป';
        catMap[c] = (catMap[c] || 0) + 1;
    });
    const cats = Object.entries(catMap).sort((a,b) => a[0].localeCompare(b[0],'th'));
    const totalCount = state.data.length;

    // Filter items
    const q = state.search.toLowerCase().trim();
    let items = state.activeCat === '__all__'
        ? [...state.data]
        : state.data.filter(d => (d.category||'ทั่วไป') === state.activeCat);
    if (q) items = items.filter(d => (d.title||'').toLowerCase().includes(q));
    items.sort((a,b) => (a.title||'').localeCompare(b.title||'','th'));

    // Sidebar HTML
    const sidebarItems = [
        `<button onclick="window._docSelectCat('${type}','__all__')"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all
            ${state.activeCat === '__all__' ? accentSidebar + ' font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}">
            <span class="flex items-center gap-2 truncate">
                <i class="fa-solid fa-layer-group text-xs opacity-60 flex-shrink-0"></i> ทั้งหมด
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-white/60 border border-slate-200 flex-shrink-0 ml-2">${totalCount}</span>
        </button>`,
        ...cats.map(([cat, cnt]) =>
            `<button onclick="window._docSelectCat('${type}','${cat.replace(/'/g,"&#39;")}')"
                class="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-all
                ${state.activeCat === cat ? accentSidebar + ' font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}">
                <span class="flex items-center gap-2 truncate">
                    <i class="fa-solid fa-folder text-xs opacity-50 flex-shrink-0"></i>
                    <span class="truncate">${cat}</span>
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-white/60 border border-slate-200 flex-shrink-0 ml-2">${cnt}</span>
            </button>`
        )
    ].join('');

    // Main content HTML
    const activeLabel = state.activeCat === '__all__' ? 'ทั้งหมด' : state.activeCat;
    const mainContent = items.length === 0
        ? `<div class="flex flex-col items-center justify-center h-full py-16 text-slate-300">
            <i class="fa-solid fa-file-circle-xmark text-5xl mb-3"></i>
            <p class="font-medium text-sm">ไม่พบเอกสาร</p>
           </div>`
        : items.map(doc => {
            const fi   = _fileIconSplit(doc.fileUrl);
            const date = doc.uploadDate ? formatDateThai(doc.uploadDate) : '';
            const safe = (doc.fileUrl||'#').replace(/'/g,"&#39;");
            return `<div class="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent
                hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                onclick="window.open('${safe}','_blank')">
                <span class="text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${fi.badgeCls}">${fi.badge}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-700 group-hover:text-slate-900 truncate transition">${doc.title||'-'}</p>
                    ${date ? `<p class="text-[11px] text-slate-400 mt-0.5">${date}</p>` : ''}
                </div>
                <button class="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 transition-all ${accentDl} flex items-center gap-1">
                    <i class="fa-solid fa-download text-[10px]"></i> ดาวน์โหลด
                </button>
            </div>`;
          }).join('');

    container.innerHTML = `
        <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden" style="min-height:480px">
            <div class="flex divide-x divide-slate-100" style="min-height:480px">

                <!-- Sidebar -->
                <div class="w-48 md:w-56 flex-shrink-0 p-3 flex flex-col gap-1 overflow-y-auto" style="background:var(--sidebar-bg,#fafafa)">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">หมวดหมู่</p>
                    ${sidebarItems}
                </div>

                <!-- Main -->
                <div class="flex-1 flex flex-col min-w-0">
                    <!-- Search bar -->
                    <div class="border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                        <div class="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 py-2 ring-2 ring-transparent ${accentSearch} transition-all focus-within:ring-2">
                            <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs flex-shrink-0"></i>
                            <input type="text"
                                placeholder="ค้นหาใน${activeLabel}…"
                                value="${state.search.replace(/"/g,'&quot;')}"
                                oninput="window._docSearch('${type}', this.value)"
                                class="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400">
                        </div>
                        <span class="text-xs text-slate-400 flex-shrink-0">${items.length} รายการ</span>
                    </div>
                    <!-- Document list -->
                    <div class="flex-1 overflow-y-auto p-3 space-y-0.5">
                        ${mainContent}
                    </div>
                </div>

            </div>
        </div>`;
}

export function renderDocumentsList(data, containerId, type = 'official') {
    if (type === 'official') allOfficialDocs = data;
    else allFormDocs = data;
    _docState[type].data      = data;
    _docState[type].activeCat = '__all__';
    _docState[type].search    = '';
    _buildSplitPanel(type);
}

window._docSelectCat = function(type, cat) {
    _docState[type].activeCat = cat;
    _docState[type].search    = '';
    _buildSplitPanel(type);
};
window._docSearch = function(type, val) {
    _docState[type].search = val;
    _buildSplitPanel(type);
};

// Backward-compat stubs
window.filterDocs      = () => {};
window.clearDocsFilter = () => {};
window.selectDocFolder = () => {};
window.clearDocFolder  = () => {};


export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId); if (!container) return; container.innerHTML = '';
    const sorted = [...data].sort((a, b) => a.id - b.id);
    const createCard = (p, isL = false) => `<div class="relative group rounded-[2.5rem] p-8 ${isL ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full"><div class="w-32 h-32 rounded-full overflow-hidden border-[6px] ${isL ? 'border-blue-100 ring-4 ring-blue-50' : 'border-white shadow-md'} bg-white mb-6 group-hover:scale-105 transition duration-700 relative z-10">${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-200 text-5xl"><i class="fa-solid fa-user"></i></div>`}</div><div class="relative z-10 w-full"><h3 class="text-lg font-bold text-slate-800 mb-2">${p.name}</h3><div class="inline-block px-4 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-sm"><p class="text-[10px] font-black text-slate-500 uppercase">${p.role}</p></div></div></div>`;
    if (sorted[0]) container.innerHTML += `<div class="flex justify-center mb-12 animate-fade-in"><div class="w-full max-w-sm">${createCard(sorted[0], true)}</div></div>`;
    if (sorted.slice(1).length > 0) { let g = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">`; sorted.slice(1).forEach(p => g += createCard(p)); g += `</div>`; container.innerHTML += g; }
}

export function renderHistoryTable(tbodyId, data) {
    const c = document.getElementById(tbodyId); if (!c) return;
    const isT = c.tagName === 'TBODY'; const target = isT ? c.closest('table').parentElement : c;
    if (isT) c.closest('table').style.display = 'none'; target.innerHTML = '';
    [...data].sort((a, b) => b.id - a.id).forEach(i => { target.innerHTML += `<div class="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-6 mb-4"><div class="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 group-hover:scale-105 transition border border-slate-100">${i.image ? `<img class="h-full w-full object-cover" src="${i.image}">` : ''}</div><div class="flex-1"><h4 class="font-bold text-lg text-slate-800">${i.name}</h4><p class="text-xs text-slate-500 font-bold uppercase mt-1">${i.role || '-'}</p></div><div class="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100 whitespace-nowrap">${i.year || '-'}</div></div>`; });
}

export function renderStudentChart(data) {
    const c = document.getElementById('student-summary-container'); const canvas = document.getElementById('studentChart');
    if (!data || data.length === 0) return; let tM = 0, tF = 0; data.forEach(d => { tM += parseInt(d.male || 0); tF += parseInt(d.female || 0); });
    if (c) c.innerHTML = `<div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 shadow-xl text-white flex items-center gap-5"><div><p class="text-[10px] font-bold opacity-70 uppercase">ทั้งหมด</p><h3 class="text-3xl font-black">${tM + tF}</h3></div></div><div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-sky-100 flex items-center gap-5"><div><p class="text-[10px] font-bold text-sky-400 uppercase">ชาย</p><h3 class="text-3xl font-black text-slate-800">${tM}</h3></div></div><div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-pink-100 flex items-center gap-5"><div><p class="text-[10px] font-bold text-pink-400 uppercase">หญิง</p><h3 class="text-3xl font-black text-slate-800">${tF}</h3></div></div></div>`;
    if (canvas && window.Chart) { if (window.myStudentChart) window.myStudentChart.destroy(); window.myStudentChart = new Chart(canvas, { type: 'bar', data: { labels: data.map(d => d.grade), datasets: [{ label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 6 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } }); }
}

export function renderHomeNews(newsList) {
    const c = document.getElementById('home-news-container'); if (!c) return; c.innerHTML = '';
    // ✅ เปลี่ยนมาใช้ formatDateThai ในหน้าแรกด้วย
    [...newsList].sort((a, b) => b.id - a.id).slice(0, 4).forEach(n => { c.innerHTML += `<div class="p-4 border-b border-slate-50 flex gap-4 hover:bg-white/80 cursor-pointer transition rounded-2xl group" onclick="window.open('${n.link || '#'}', '_blank')"><div class="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">` : ''}</div><div class="flex-1 min-w-0 py-0.5"><h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4><p class="text-[10px] font-black text-slate-400 uppercase mt-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1"></span> ${formatDateThai(n.date)}</p></div></div>`; });
}

console.log("Lumina Final Super Full Version: Connected with Maps, Colors & Announcement System");

// =============================================================================
// CALENDAR EVENTS RENDERER
// =============================================================================
let calendarEventsData = [];
let calendarCurrentDate = new Date();

export function renderCalendar(events) {
    calendarEventsData = events || [];
    window._calendarEventsAll = calendarEventsData; // expose for full list
    renderMiniCalendar();
}

function renderMiniCalendar() {
    const container = document.getElementById('mini-calendar-body');
    const monthLabel = document.getElementById('calendar-month-label');
    if (!container) return;

    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const thMonthsFull = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

    if (monthLabel) monthLabel.textContent = `${thMonthsFull[month]} ${year + 543}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const typeColors = {
        academic: 'bg-blue-500', activity: 'bg-emerald-500',
        holiday: 'bg-red-500', exam: 'bg-amber-500', other: 'bg-slate-400'
    };

    // Build event map by date
    const eventMap = {};
    calendarEventsData.forEach(ev => {
        const d = ev.start_date ? ev.start_date.split('T')[0] : null;
        if (!d) return;
        if (!eventMap[d]) eventMap[d] = [];
        eventMap[d].push(ev);
    });

    let html = `<div class="grid grid-cols-7 gap-0 text-center mb-1">`;
    ['อา','จ','อ','พ','พฤ','ศ','ส'].forEach(d => {
        html += `<div class="text-[9px] font-bold text-slate-400 py-1">${d}</div>`;
    });
    html += `</div><div class="grid grid-cols-7 gap-0.5">`;

    for (let i = 0; i < firstDay; i++) html += `<div></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
        const evs = eventMap[dateStr] || [];
        const dotColor = evs.length > 0 ? (typeColors[evs[0].type] || 'bg-slate-400') : '';

        html += `<div class="relative flex flex-col items-center py-1 rounded-lg cursor-pointer hover:bg-slate-50 transition group ${isToday ? 'bg-indigo-600 hover:bg-indigo-700 rounded-xl' : ''}"
            ${evs.length > 0 ? `onclick="window.showCalendarEvent('${dateStr}')"` : ''}>
            <span class="text-[11px] font-bold ${isToday ? 'text-white' : 'text-slate-600'}">${day}</span>
            ${evs.length > 0 ? `<span class="w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5 ${isToday ? 'bg-white' : ''}"></span>` : '<span class="w-1.5 h-1.5 mt-0.5"></span>'}
        </div>`;
    }
    html += `</div>`;
    container.innerHTML = html;

    // Show upcoming events
    const upcomingEl = document.getElementById('calendar-upcoming');
    if (upcomingEl) {
        const now = new Date(); now.setHours(0,0,0,0);
        const upcoming = calendarEventsData
            .filter(e => e.start_date && new Date(e.start_date) >= now)
            .sort((a,b) => new Date(a.start_date)-new Date(b.start_date))
            .slice(0, 3);

        const typeIcons = { academic:'fa-book', activity:'fa-star', holiday:'fa-umbrella-beach', exam:'fa-pen', other:'fa-circle-dot' };
        const typeBg = { academic:'bg-blue-50 text-blue-600', activity:'bg-emerald-50 text-emerald-600', holiday:'bg-red-50 text-red-600', exam:'bg-amber-50 text-amber-600', other:'bg-slate-50 text-slate-500' };

        if (upcoming.length === 0) {
            upcomingEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-2">ไม่มีกิจกรรมที่กำลังจะมาถึง</p>`;
        } else {
            upcomingEl.innerHTML = upcoming.map(e => {
                const d = new Date(e.start_date);
                const thM = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
                const color = typeBg[e.type] || typeBg.other;
                const icon = typeIcons[e.type] || 'fa-circle-dot';
                return `<div class="flex items-center gap-2.5 py-1.5">
                    <div class="w-8 h-8 rounded-xl ${color} flex flex-col items-center justify-center flex-shrink-0 text-center">
                        <i class="fa-solid ${icon} text-[10px]"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-700 truncate">${e.title}</p>
                        <p class="text-[10px] text-slate-400">${d.getDate()} ${thM[d.getMonth()]} ${d.getFullYear()+543}</p>
                    </div>
                </div>`;
            }).join('');
        }
    }
}

window.calendarPrev = function() {
    calendarCurrentDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth()-1, 1);
    renderMiniCalendar();
};
window.calendarNext = function() {
    calendarCurrentDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth()+1, 1);
    renderMiniCalendar();
};
window._calCurrentDate = function() { return new Date(calendarCurrentDate); };
window.showCalendarEvent = function(dateStr) {
    const evs = calendarEventsData.filter(e => e.start_date && e.start_date.split('T')[0] === dateStr);
    if (!evs.length) return;
    const typeLabel = { academic:'วิชาการ', activity:'กิจกรรม', holiday:'วันหยุด', exam:'สอบ', other:'อื่นๆ' };
    const typeBg = { academic:'bg-blue-100 text-blue-700', activity:'bg-emerald-100 text-emerald-700', holiday:'bg-red-100 text-red-700', exam:'bg-amber-100 text-amber-700', other:'bg-slate-100 text-slate-600' };
    const d = new Date(dateStr);
    const thM = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    let html = `<div class="space-y-3">`;
    evs.forEach(e => {
        const lbl = typeLabel[e.type] || 'อื่นๆ';
        const clr = typeBg[e.type] || typeBg.other;
        html += `<div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div class="flex items-start gap-3">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${clr} flex-shrink-0 mt-0.5">${lbl}</span>
                <div>
                    <p class="font-bold text-slate-800 text-sm">${e.title}</p>
                    ${e.description ? `<p class="text-xs text-slate-500 mt-1">${e.description}</p>` : ''}
                    ${e.location ? `<p class="text-xs text-slate-400 mt-1"><i class="fa-solid fa-location-dot mr-1"></i>${e.location}</p>` : ''}
                </div>
            </div>
        </div>`;
    });
    html += `</div>`;
    const modal = document.getElementById('calendar-event-modal');
    const modalTitle = document.getElementById('calendar-modal-title');
    const modalBody = document.getElementById('calendar-modal-body');
    if (modal) {
        if (modalTitle) modalTitle.textContent = `${d.getDate()} ${thM[d.getMonth()]} ${d.getFullYear()+543}`;
        if (modalBody) modalBody.innerHTML = html;
        modal.classList.remove('hidden');
    }
};

// =============================================================================
// NEWS TICKER RENDERER
// =============================================================================
export function renderNewsTicker(newsList) {
    // ถ้า admin ตั้ง ticker_text ไว้แล้วใน school_info ให้ข้ามขั้นตอนนี้
    if (window._adminTickerText) return;
    const ticker = document.getElementById('ticker-content');
    if (!ticker || !newsList || !newsList.length) return;
    const items = [...newsList].sort((a,b) => b.id - a.id).slice(0, 8);
    const singleHtml = items.map(n =>
        `<span class="inline-flex items-center gap-2 mr-12"><i class="fa-solid fa-circle text-[6px] opacity-60"></i> ${n.title}</span>`
    ).join('');
    ticker.innerHTML = singleHtml + singleHtml;
}

// =============================================================================
// GALLERY RENDERER
// =============================================================================
let allGalleryAlbums = [];

export function renderHomeGallery(albums) {
    allGalleryAlbums = albums || [];
    const c = document.getElementById('home-gallery-container');
    if (!c) return;
    if (!albums || !albums.length) {
        c.innerHTML = `<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:13px">ยังไม่มีอัลบั้ม</div>`;
        return;
    }
    const catColors = { academic:'from-blue-400 to-blue-600', activity:'from-emerald-400 to-emerald-600', sport:'from-orange-400 to-red-500', ceremony:'from-purple-400 to-indigo-600', other:'from-slate-400 to-slate-600' };
    // แสดงสูงสุด 4 อัลบั้ม ใน 2×2 grid แต่ละ card สูง 100% ของ cell
    c.innerHTML = albums.slice(0,4).map(a => {
        const grad    = catColors[a.category] || catColors.other;
        const cover   = a.cover_url;
        const url     = a.album_url || '#';
        const dateStr = a.event_date
            ? new Date(a.event_date).toLocaleDateString('th-TH', {year:'numeric',month:'short',day:'numeric'})
            : (a.academic_year ? `ปี ${a.academic_year}` : '');
        return `<a href="${url}" target="_blank" rel="noopener"
            class="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 block"
            style="height:100%;min-height:0">
            ${cover
                ? `<img src="${cover}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" style="position:absolute;inset:0">`
                : `<div class="w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center" style="position:absolute;inset:0"><i class="fa-solid fa-images text-white text-2xl opacity-70"></i></div>`}
            <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-2.5">
                <p class="text-white font-bold text-[11px] leading-tight line-clamp-1">${a.title}</p>
                <p class="text-white/60 text-[9px] mt-0.5">${dateStr}</p>
            </div>
            <div class="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <i class="fa-solid fa-arrow-up-right-from-square text-white" style="font-size:8px"></i>
            </div>
        </a>`;
    }).join('');
}

export function renderGalleryPage(albums) {
    allGalleryAlbums = albums || [];
    const c = document.getElementById('gallery-albums-container');
    if (!c) return;
    if (!albums || !albums.length) {
        c.innerHTML = `<div class="col-span-3 text-center py-20 text-slate-300"><i class="fa-solid fa-images text-5xl mb-3 block"></i><p>ยังไม่มีอัลบั้มภาพ</p></div>`;
        return;
    }
    const catColors = { academic:'from-blue-400 to-blue-600', activity:'from-emerald-400 to-emerald-600', sport:'from-orange-400 to-red-500', ceremony:'from-purple-400 to-indigo-600', other:'from-slate-400 to-slate-600' };
    const catLabel  = { academic:'วิชาการ', activity:'กิจกรรม', sport:'กีฬา', ceremony:'พิธีการ', other:'อื่นๆ' };
    const srcLabel  = (url) => {
        if (!url) return null;
        if (url.includes('photos.google') || url.includes('photos.app.goo')) return { icon:'fa-google', text:'Google Photos', color:'text-red-500' };
        if (url.includes('drive.google'))  return { icon:'fa-google-drive', text:'Google Drive', color:'text-blue-500' };
        if (url.includes('facebook'))      return { icon:'fa-facebook', text:'Facebook', color:'text-blue-600' };
        return { icon:'fa-arrow-up-right-from-square', text:'เปิดอัลบั้ม', color:'text-indigo-500' };
    };
    c.innerHTML = albums.map(a => {
        const grad    = catColors[a.category] || catColors.other;
        const cover   = a.cover_url;
        const lbl     = catLabel[a.category] || 'อื่นๆ';
        const url     = a.album_url || '#';
        const src     = srcLabel(a.album_url);
        const dateStr = a.event_date
            ? new Date(a.event_date).toLocaleDateString('th-TH', {year:'numeric',month:'short',day:'numeric'})
            : (a.academic_year ? `ปีการศึกษา ${a.academic_year}` : '');
        return `<a href="${url}" target="_blank" rel="noopener"
            class="group relative overflow-hidden rounded-[2.5rem] bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 block">
            <div class="relative aspect-[4/3] overflow-hidden">
                ${cover
                    ? `<img src="${cover}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">`
                    : `<div class="w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center"><i class="fa-solid fa-images text-white text-5xl opacity-60"></i></div>`}
                <div class="absolute top-3 left-3">
                    <span class="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-600 rounded-full">${lbl}</span>
                </div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <div class="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <i class="fa-solid fa-arrow-up-right-from-square text-slate-700 text-sm"></i>
                    </div>
                </div>
            </div>
            <div class="p-4">
                <h4 class="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition">${a.title}</h4>
                ${a.description ? `<p class="text-[11px] text-slate-400 mt-1 line-clamp-1">${a.description}</p>` : ''}
                <div class="flex items-center justify-between mt-3">
                    <span class="text-[10px] text-slate-400">${dateStr}</span>
                    ${src ? `<span class="text-[10px] font-bold ${src.color} flex items-center gap-1">
                        <i class="fa-brands ${src.icon} text-[10px]"></i> ${src.text}
                    </span>` : ''}
                </div>
            </div>
        </a>`;
    }).join('');
}

window.openGalleryAlbum = function(albumId) {
    const album = allGalleryAlbums.find(a => a.id == albumId);
    if (!album || !album.album_url) return;
    window.open(album.album_url, '_blank', 'noopener');
};

window.openLightbox = function(url, idx) {
    const lb = document.getElementById('lightbox-modal');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg) return;
    window._lightboxIdx = idx;
    lbImg.src = url;
    lb.classList.remove('hidden');
};
window.lightboxNav = function(dir) {
    const urls = window._lightboxUrls || [];
    window._lightboxIdx = (window._lightboxIdx + dir + urls.length) % urls.length;
    const lbImg = document.getElementById('lightbox-img');
    if (lbImg) lbImg.src = urls[window._lightboxIdx];
};
window.closeGalleryAlbum = function() {
    const modal = document.getElementById('gallery-photo-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
};
window.closeLightbox = function() {
    const lb = document.getElementById('lightbox-modal');
    if (lb) lb.classList.add('hidden');
};

console.log("Calendar, Gallery, Ticker modules loaded ✅");
