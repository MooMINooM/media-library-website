// ... existing code before showPage ...

function showPage(pageId) {
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }
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
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council':
            loadStudentCouncilData();
            break;
        case 'teacher-achievements':
            loadTeacherAchievementsData();
            break;
    }
}

// ... existing code before loadTeacherAchievementsData ...

// --- 🌟 UPDATED: TEACHER ACHIEVEMENTS PAGE with new card layout 🌟 ---
async function loadTeacherAchievementsData() {
    if (teacherAchievementsCache.length > 0) {
        renderTeacherAchievements(teacherAchievementsCache);
        return;
    }
    
    const container = document.getElementById('teacher-achievements-container');
    const loadingEl = document.getElementById('teacher-achievements-loading');

    loadingEl.classList.remove('hidden');
    container.innerHTML = '';
    
    try {
        if (!API_URL) throw new Error("API_URL is not configured.");
        
        const response = await fetch(`${API_URL}?sheet=performance`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        
        teacherAchievementsCache = result.data;
        renderTeacherAchievements(teacherAchievementsCache);

    } catch (error) {
        console.error('Error loading teacher achievements:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderTeacherAchievements(achievementsList) {
    const container = document.getElementById('teacher-achievements-container');
    const loadingEl = document.getElementById('teacher-achievements-loading');
    
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!achievementsList || achievementsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลผลงานครู</p>';
        return;
    }

    achievementsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300';

        // Truncate long project names with ellipsis
        const truncatedProject = (item.project && item.project.length > 50) 
            ? item.project.substring(0, 50) + '...' 
            : item.project;

        card.innerHTML = `
            <div>
                <h4 class="font-bold text-blue-800 text-lg">${item.name || '-'}</h4>
                <a href="${item.url_pro || '#'}" target="_blank" rel="noopener noreferrer" 
                   class="block mt-1 text-sm text-gray-600 hover:text-blue-800 hover:underline" 
                   title="${item.project || ''}">
                    ${truncatedProject || '-'}
                </a>
            </div>
            <div class="mt-4 text-right">
                <a href="${item.url_all || '#'}" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    ดูผลงานทั้งหมด
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

// ... rest of the existing code ...

