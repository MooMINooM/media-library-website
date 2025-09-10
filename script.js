// --- 🎯 SETUP: กรุณาวาง Firebase Config ของคุณที่นี่ ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "edunova-5d966", // <-- สำคัญ: ใส่ Project ID ของคุณ
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Global Variables & Firebase Initialization ---
let db;
document.addEventListener('DOMContentLoaded', () => {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore(); // กำหนดค่า db ที่นี่
        console.log("Firebase Connected!");
        initializePageNavigation();
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
});


// --- ระบบจัดการหน้า (Page Navigation) ---
function initializePageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    // Flags ป้องกันการเรียก listener ซ้ำซ้อน
    let innovationsListenerAttached = false;
    let newsListenerAttached = false;
    let personnelListenerAttached = false;

    // แสดงหน้าตาม pageId และจัดการการโหลดข้อมูล
    function showPage(pageId, subId = null) {
        pageContents.forEach(page => page.classList.add('hidden'));
        
        // ถ้ามี subId แสดงว่าเป็นหน้ารายละเอียด
        if (subId) {
            const detailPage = document.getElementById(pageId + '-detail');
            if (detailPage) {
                detailPage.classList.remove('hidden');
                if (pageId === 'page-news') {
                    showNewsDetail(subId);
                }
            }
        } else {
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.remove('hidden');
        }

        // อัปเดต Active Link
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId.replace('page-', ''));
        });

        // Logic การโหลดข้อมูลสำหรับหน้ารายการ (List views)
        if (pageId === 'page-innovations' && !innovationsListenerAttached) {
            listenForInnovations();
            innovationsListenerAttached = true;
        }
        if (pageId === 'page-news' && !newsListenerAttached) {
            listenForNews();
            newsListenerAttached = true;
        }
        if (pageId === 'page-personnel' && !personnelListenerAttached) {
            listenForPersonnel();
            personnelListenerAttached = true;
        }
    }

    // Event listeners สำหรับลิงก์เมนูหลัก
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = 'page-' + link.dataset.page;
            showPage(pageId);
        });
    });

    // Event listener สำหรับปุ่ม "กลับ" ในหน้ารายละเอียดข่าว
    document.getElementById('back-to-news-btn').addEventListener('click', () => {
        showPage('page-news');
    });

    // Event Delegation สำหรับปุ่ม "อ่านต่อ"
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('.read-more-btn')) {
            const newsId = event.target.dataset.id;
            showPage('page-news', newsId);
        }
    });

    // แสดงหน้าแรกเป็นหน้าเริ่มต้น
    showPage('page-home');
}


// --- ระบบบุคลากร ---
function listenForPersonnel() {
    const personnelContainer = document.getElementById('personnel-list-container');
    db.collection('personnel').orderBy('order', 'asc').onSnapshot(
        (querySnapshot) => {
            if (querySnapshot.empty) {
                personnelContainer.innerHTML = '<p class="text-center text-gray-500 col-span-4">ยังไม่มีข้อมูลบุคลากรในระบบ</p>';
                return;
            }
            personnelContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const person = doc.data();
                const cardHTML = `
                    <div class="personnel-card">
                        <img src="${person.imageUrl || 'https://placehold.co/400x400/E2E8F0/334155?text=รูปบุคลากร'}" alt="${person.name}">
                        <h3>${person.name || 'ไม่ระบุชื่อ'}</h3>
                        <p>${person.position || 'ไม่ระบุตำแหน่ง'}</p>
                    </div>`;
                personnelContainer.innerHTML += cardHTML;
            });
        }, 
        (error) => {
            console.error("Error fetching personnel: ", error);
            personnelContainer.innerHTML = '<p class="text-center text-red-500 col-span-4">เกิดข้อผิดพลาดในการดึงข้อมูลบุคลากร</p>';
        }
    );
}

// --- ระบบข่าวประชาสัมพันธ์ (List View) ---
function listenForNews() {
    const newsContainer = document.getElementById('news-list-container');
    db.collection('news').orderBy('publishDate', 'desc').onSnapshot(
        (querySnapshot) => {
            if (querySnapshot.empty) {
                newsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">ยังไม่มีข่าวประชาสัมพันธ์ในระบบ</p>';
                return;
            }
            newsContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const newsItem = doc.data();
                const cardHTML = `
                    <div class="news-card">
                        <img src="${newsItem.imageUrl || 'https://placehold.co/600x400/E2E8F0/334155?text=รูปภาพข่าว'}" alt="${newsItem.title}">
                        <div class="news-card-content">
                            <h3>${newsItem.title || 'ไม่มีหัวข้อข่าว'}</h3>
                            <p>${newsItem.summary || 'ไม่มีเนื้อหาโดยย่อ'}</p>
                            <a class="read-more-btn" data-id="${doc.id}">อ่านต่อ...</a>
                        </div>
                    </div>`;
                newsContainer.innerHTML += cardHTML;
            });
        }, 
        (error) => {
            console.error("Error fetching news: ", error);
            newsContainer.innerHTML = '<p class="text-center text-red-500 col-span-3">เกิดข้อผิดพลาดในการดึงข้อมูลข่าวสาร</p>';
        }
    );
}

// --- ระบบแสดงรายละเอียดข่าว (Detail View) ---
function showNewsDetail(newsId) {
    const detailContainer = document.getElementById('news-detail-content');
    detailContainer.innerHTML = '<p>กำลังโหลดเนื้อหาข่าว...</p>';

    db.collection('news').doc(newsId).get().then((doc) => {
        if (doc.exists) {
            const newsItem = doc.data();
            // แปลง Timestamp เป็น Date object แล้วจัดรูปแบบ
            const publishDate = newsItem.publishDate.toDate().toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const detailHTML = `
                <div class="news-detail-container">
                    <img src="${newsItem.imageUrl || 'https://placehold.co/1200x600/E2E8F0/334155?text=รูปภาพข่าว'}" alt="${newsItem.title}">
                    <h1>${newsItem.title || 'ไม่มีหัวข้อข่าว'}</h1>
                    <p class="news-date">เผยแพร่เมื่อ: ${publishDate}</p>
                    <div class="news-full-content">
                        ${newsItem.content || 'ไม่มีเนื้อหา'}
                    </div>
                </div>
            `;
            detailContainer.innerHTML = detailHTML;
        } else {
            console.log("No such document!");
            detailContainer.innerHTML = '<p class="text-red-500">ไม่พบข้อมูลข่าวนี้</p>';
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
        detailContainer.innerHTML = '<p class="text-red-500">เกิดข้อผิดพลาดในการโหลดเนื้อหาข่าว</p>';
    });
}


// --- ระบบคลังนวัตกรรม ---
function listenForInnovations() {
    const innovationsContainer = document.getElementById('innovations-list-container');
    db.collection('innovations').onSnapshot(
        (querySnapshot) => {
            if (querySnapshot.empty) {
                innovationsContainer.innerHTML = '<p class="text-center text-gray-500">ยังไม่มีข้อมูลนวัตกรรมในระบบ</p>';
                return;
            }
            innovationsContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const innovation = doc.data();
                const cardHTML = `
                    <div class="innovation-card">
                        <img src="${innovation.coverImageURL || 'https://placehold.co/300x300/E2E8F0/334155?text=รูปภาพ'}" alt="${innovation.title}">
                        <div class="innovation-card-content">
                            <h3>${innovation.title || 'ไม่มีชื่อเรื่อง'}</h3>
                            <p class="text-sm text-gray-500 mt-1">โดย: ${innovation.creator || 'ไม่ระบุ'}</p>
                            <p class="text-gray-700 mt-2">${innovation.description || 'ไม่มีคำอธิบาย'}</p>
                            <div class="tags-container mt-2">
                                <span class="tag">ประเภท: ${innovation.fileType || 'ไม่ระบุ'}</span>
                                <span class="tag">ระดับชั้น: ${innovation.grade || 'ไม่ระบุ'}</span>
                            </div>
                            <a href="${innovation.fileLink}" target="_blank" class="action-button">เปิดดูนวัตกรรม</a>
                        </div>
                    </div>`;
                innovationsContainer.innerHTML += cardHTML;
            });
        }, 
        (error) => {
            console.error("Error fetching innovations: ", error);
            innovationsContainer.innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลนวัตกรรม</p>';
        }
    );
}

