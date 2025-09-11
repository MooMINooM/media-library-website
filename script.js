// ------------------- 🎯 CONFIGURATION -------------------
// ✅ นี่คือ firebaseConfig ที่ถูกต้องสำหรับโปรเจกต์ของคุณ
const firebaseConfig = {
    apiKey: "AIzaSyDId2OvooesUmrcwJCNY4ra0DIr-jwVrWM",
    authDomain: "webschool-335d2.firebaseapp.com",
    projectId: "webschool-335d2",
    storageBucket: "webschool-335d2.firebasestorage.app",
    messagingSenderId: "771498542798",
    appId: "1:771498542798:web:9ba58488053ed22850f29f",
    measurementId: "G-H3TJ0JHFE7"
};
// ---------------------------------------------------------

// --- Global Variables & Firebase Initialization ---
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("✅ Firebase Initialized Successfully");
} catch (e) {
    console.error("🔥 Firebase Initialization Failed. Please check your firebaseConfig.", e);
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModal();
    setupEventListeners();
    showPage('home');
});


// --- NAVIGATION SYSTEM ---
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
        }
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    document.querySelectorAll('#main-nav a[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    if (pageId === 'personnel') {
        listenForPersonnel();
    }
}


// --- EVENT & MODAL SETUP ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        if (personnelCard) {
            const personId = personnelCard.dataset.id;
            showPersonnelModal(personId);
        }
    });
}

function setupModal() {
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.getElementById('detail-modal-close-btn');
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// --- PERSONNEL PAGE ---
function listenForPersonnel() {
    const listContainer = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    
    db.collection('personnel').orderBy('name').onSnapshot(snapshot => {
        loadingEl.classList.add('hidden');
        listContainer.innerHTML = '';
        if (snapshot.empty) {
            listContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ยังไม่มีข้อมูลบุคลากร</p>';
            return;
        }
        snapshot.forEach(doc => {
            const person = doc.data();
            const cardItem = document.createElement('div');
            cardItem.className = 'personnel-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4';
            cardItem.dataset.id = doc.id; // Use Firestore document ID

            const finalImageUrl = person.imageUrl || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
            const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Error';

            cardItem.innerHTML = `
                <img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
                <div class="text-center mt-2">
                    <h4 class="font-bold text-blue-800 text-md">${person.name || 'N/A'}</h4>
                    <p class="text-sm text-gray-600">${person.role || '-'}</p>
                </div>`;
            listContainer.appendChild(cardItem);
        });
    }, error => {
        console.error("Error fetching personnel:", error);
        loadingEl.textContent = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
    });
}

async function showPersonnelModal(personId) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    
    try {
        const doc = await db.collection('personnel').doc(personId).get();
        if (!doc.exists) {
            console.error("No such document!");
            return;
        }
        const person = doc.data();
        
        const imageUrl = person.imageUrl || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Error';

        modalContent.innerHTML = `
            <div class="text-center">
                <img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
                <h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3>
                <p class="text-gray-600 text-lg">${person.role || '-'}</p>
                <p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p>
            </div>
            <!-- Add more details here later -->
        `;
        modal.classList.remove('hidden');
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

