// --- 🎯 SETUP: กรุณาวาง Firebase Config ของคุณที่นี่ ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Global Variables & Firebase Initialization ---
let db, auth, currentUser;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ Firebase Initialized Successfully");
} catch (e) {
    console.error("🔥 Firebase Initialization Failed:", e);
}


document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupInitialPage();
});


// --- ระบบยืนยันตัวตน (Authentication) ---
function initializeAuth() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        setupAdminUI(user);
    });
}

function setupAdminUI(user) {
    const mainNav = document.getElementById('main-nav');
    const oldAdminContainer = document.getElementById('admin-nav-container');
    if (oldAdminContainer) oldAdminContainer.remove();

    const adminContainer = document.createElement('div');
    adminContainer.id = 'admin-nav-container';
    adminContainer.className = 'flex items-center whitespace-nowrap'; 

    if (user) {
        adminContainer.innerHTML = `
            <a href="#" data-page="admin" class="nav-link bg-green-600 hover:bg-green-700 text-white !border-b-2 !border-transparent rounded-md">แผงควบคุม</a>
            <a href="#" id="logout-btn" class="nav-link bg-red-600 hover:bg-red-700 text-white !border-b-2 !border-transparent ml-2 rounded-md">ออกจากระบบ</a>
        `;
        mainNav.appendChild(adminContainer);
        
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut();
            showPage('home');
        });

    } else {
        adminContainer.innerHTML = `
            <a href="#" data-page="login" class="nav-link whitespace-nowrap">สำหรับผู้ดูแล</a>
        `;
        mainNav.appendChild(adminContainer);
    }
}


// --- การแสดงผลหน้าเริ่มต้นและระบบนำทางหลัก ---
function setupInitialPage() {
    const mainNav = document.getElementById('main-nav');
    
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
        }
    });

    showPage('home');
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) {
        activePage.classList.remove('hidden');
    }

    document.querySelectorAll('#main-nav a[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // โหลดข้อมูลสำหรับหน้านั้นๆ
    switch (pageId) {
        case 'home':
            break;
        case 'personnel':
            listenForPersonnel();
            break;
        case 'students':
            listenForStudents();
            break;
        case 'school-board':
            listenForSchoolBoard();
            break;
        case 'student-council':
            listenForStudentCouncil();
            break;
        case 'news':
            listenForNews();
            break;
        case 'documents': // เพิ่ม case ใหม่สำหรับหน้าเอกสาร
            listenForDocuments();
            break;

        case 'innovations':
            listenForInnovations();
            break;
    }
}


// --- ฟังก์ชันดึงข้อมูลต่างๆ (Placeholder) ---
function listenForPersonnel() { console.log("Fetching Personnel data..."); }
function listenForStudents() { console.log("Fetching Students data..."); }
function listenForSchoolBoard() { console.log("Fetching School Board data..."); }
function listenForStudentCouncil() { console.log("Fetching Student Council data..."); }
function listenForNews() { console.log("Fetching News data..."); }
function listenForDocuments() { console.log("Fetching Documents data..."); } // เพิ่มฟังก์ชันใหม่
function listenForInnovations() { console.log("Fetching Innovations data..."); }

