// --- 🎯 SETUP: กรุณาวาง Firebase Config ของคุณที่นี่ ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "edunova-5d966", // <-- สำคัญ: ใส่ Project ID ของคุณ
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- ระบบจัดการหน้า (Page Navigation) ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase Connected!");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    // Flags ป้องกันการเรียก listener ซ้ำซ้อน
    let innovationsListenerAttached = false;
    let newsListenerAttached = false;

    function showPage(pageId) {
        pageContents.forEach(page => page.classList.add('hidden'));
        
        const activePage = document.getElementById(pageId);
        if (activePage) activePage.classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId.replace('page-', ''));
        });

        // --- Logic การโหลดข้อมูลตามหน้า ---
        if (pageId === 'page-innovations' && !innovationsListenerAttached) {
            listenForInnovations();
            innovationsListenerAttached = true;
        }
        if (pageId === 'page-news' && !newsListenerAttached) {
            listenForNews();
            newsListenerAttached = true;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = 'page-' + link.dataset.page;
            showPage(pageId);
        });
    });

    showPage('page-home');
});


// --- ระบบข่าวประชาสัมพันธ์ (ดึงข้อมูลจาก Firestore) ---
function listenForNews() {
    const db = firebase.firestore();
    const newsContainer = document.getElementById('news-list-container');
    
    // เรียงลำดับข่าวตาม 'publishDate' จากใหม่ไปเก่า
    db.collection('news').orderBy('publishDate', 'desc').onSnapshot(
        (querySnapshot) => {
            if (querySnapshot.empty) {
                newsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">ยังไม่มีข่าวประชาสัมพันธ์ในระบบ</p>';
                return;
            }

            newsContainer.innerHTML = ''; // ล้างข้อมูลเก่า
            querySnapshot.forEach((doc) => {
                const newsItem = doc.data();

                const cardHTML = `
                    <div class="news-card">
                        <img src="${newsItem.imageUrl || 'https://placehold.co/600x400/E2E8F0/334155?text=รูปภาพข่าว'}" alt="${newsItem.title}">
                        <div class="news-card-content">
                            <h3>${newsItem.title || 'ไม่มีหัวข้อข่าว'}</h3>
                            <p>${newsItem.summary || 'ไม่มีเนื้อหาโดยย่อ'}</p>
                            <!-- ในอนาคต เราสามารถสร้างลิงก์ไปยังหน้ารายละเอียดข่าวได้ -->
                            <a href="#">อ่านต่อ...</a>
                        </div>
                    </div>
                `;
                newsContainer.innerHTML += cardHTML;
            });
        }, 
        (error) => {
            console.error("Error fetching news: ", error);
            newsContainer.innerHTML = '<p class="text-center text-red-500 col-span-3">เกิดข้อผิดพลาดในการดึงข้อมูลข่าวสาร</p>';
        }
    );
}


// --- ระบบคลังนวัตกรรม (ดึงข้อมูลจาก Firestore) ---
function listenForInnovations() {
    const db = firebase.firestore();
    const innovationsContainer = document.getElementById('innovations-list-container');
    
    db.collection('innovations').onSnapshot(
        (querySnapshot) => {
            if (querySnapshot.empty) {
                innovationsContainer.innerHTML = '<p class="text-center text-gray-500">ยังไม่มีข้อมูลนวัตกรรมในระบบ</p>';
                return;
            }

            innovationsContainer.innerHTML = ''; // ล้างข้อมูลเก่า
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
                    </div>
                `;
                innovationsContainer.innerHTML += cardHTML;
            });
        }, 
        (error) => {
            console.error("Error fetching innovations: ", error);
            innovationsContainer.innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลนวัตกรรม</p>';
        }
    );
}

