// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Static data for Personnel Structure ---
const STATIC_PERSONNEL_DATA = [
    { 
        name: 'นางสาวสุพิศน์ พันธุนันท์', 
        role: 'ผู้อำนวยการสถานศึกษา',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- ค.บ.ภาษาอังกฤษ มหาวิทยาลัยราชภัฏอุดรธานี\n- กศ.ม.การบริหารการศึกษา มหาวิทยาลัยมหาสารคาม',
        class: '-',
        tel: '081-234-5678',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczM2HELcaPEIJuj0jR2qHvYmQmbveaCqqoND2vtSH6LGlRkDGL4JIZzmzP09FNq5ElNFNijen3AmNDKiT9Kw2J4zeD83RnNpO6D62PKEUk6ucWG7S29mwiYM1mXyx4op0auWBt6qwJltkqvVd2AkacZd=w693-h923-s-no-gm?authuser=0' 
    },
    { 
        name: 'นายสมยศ บุญประคม', 
        role: 'ครู',
        academicStanding: 'ผู้ทรงคุณค่า',
        education: '- ค.บ.พลศึกษา วิทยาลัยครูอุดรธานี\n- กศ.ม.เทคโนโลยีทางการศึกษา มหาวิทยาลัยมหาสารคาม',
        class: '-',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOfU073oWUhWyzdyJnZV3lYv3a3JlgZ_5lwebsbvRvJg9ve3FD7HgmxAYyq50xzFZ6mWS9MHFje9ShC493sAUw2qj-xPFlWjhcHPR3r9mmkDk669snXrECd1ktlkiTqGUIvBO_gM1L9RcL0Ph9uFhLT=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางมัณฑนา บุญประคม', 
        role: 'ครู',
        academicStanding: 'เชี่ยวชาญ',
        education: '- ค.บ.(เกียรตินิยมอันดับ ๒) ประถมศึกษา วิทยาลัยครูอุบลราชธานี\n- ศษ.ม.หลักสูตรและการสอน วิทยาลัยพิชญบัณฑิต',
        class: 'ประถมศึกษาปีที่ 1',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczNyYJV9Sb9Jyn0-_x-bGrS_8VnwVBMHUmvPER5u9kgyk-7mMJ94fNo8aNaXfcfu0U4vHs0lyPn7WH3KKSVs4-TAp-L4FEJEap7h_zie1xG22tHCS_byYJMleWLigxrWz3vxUz8JlaYW4pYmTF2rmsjP=w693-h923-s-no-gm?authuser=0'
    },
     { 
        name: 'นางบัณฑิตา วรจิตร', 
        role: 'ครู',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- ค.บ.การศึกษาปฐมวัย มหาวิทยาลัยราชภัฏอุดรธานี\n- ศษ.ม.การบริหารการศึกษา มหาวิทยาลัยกรุงเทพธนบุรี',
        class: 'อนุบาล 3',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOvZ8qI-FnKs1JheUxJTIVNbO42g4VYJJaU4kkczY0Swg0RzvZCP_zL54pG1c2IWIJFmngjGaOKj3_HzzX8JAe9K-kubp5QdO5P2-a2WY1gxb1HOWWpPbot15bq8VY8vfHzsUJzF7lQhfm-x5r1HJFz=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางปริฉัตร ไชยอุบล', 
        role: 'ครู',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- วท.บ.วิทยาศาสตร์สิ่งแวดล้อม มหาวิทยาลัยราชภัฏอุดรธานี\n- ป.บัณฑิตวิชาชีพครู มหาวิทยาลัยราชภัฏอุดรธานี \n- ศษ.ม.การบริหารการศึกษา มหาวิทยาลัยรามคำแหง',
        class: 'ประถมศึกษาปีที่ 6',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOiOOQOJolSM3KBrQfY3-n7cvLQ746I3_YQtsTy5G00moXHhh8Cji4WV4GvCEMcJUuevM9r-Jje4ET62SUkN6widCgmojbgx_oJwpLcLaWYNQBnNfXiLTF-1pb6HSVIgvmdJQPo2f_E5EMojv7ruDtE=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายวิรุฬห์ บงแก้ว', 
        role: 'ครู',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- ค.บ.วิทยาศาสตร์ มหาวิทยาลัยราชภัฏเลย',
        class: 'มัธยมศึกษาปีที่ 3',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPNb6WJYiWbSEVCkhL3cGUFvkXCEgVEwt46pJKAt1gtaGOX6OsGWWVNP1cl-moxubzYdel9uyFhMU0isvWDfH16NA9JwsyGjC9fiONb3i03lg3INGV-b5zj0A6kq68XkQwdfts5bwK6oG1BCqSwlDza=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางพิมพ์ภัช กัณหาสุระ', 
        role: 'ครู',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- ค.บ.คอมพิวเตอร์ศึกษา มหาวิทยาลัยราชภัฏอุดรธานี\n- ค.ม.หลักสูตรและการสอน มหาวิทยาลัยราชภัฏอุดรธานี',
        class: 'มัธยมศึกษาปีที่ 1',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPoPKS-0rz95sqlyF9LT0vLoBhnfycS1EiPnbw9grWvR1vFjST5FviPQHZvpGJd-96kNRHEapLdzrolk-_Qe-etcg21DH7rWA52jphI1wIsewOWhGV5ZxQwfJ30Hn8gpqRI65KbN3H_Jz3lkqd5mJBf=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางปิยะพร โพธิ์วงษ์', 
        role: 'ครู',
        academicStanding: 'ชำนาญการพิเศษ',
        education: '- ค.บ.การศึกษาปฐมวัย มหาวิทยาลัยราชภัฏอุดรธานี',
        class: 'อนุบาล 2',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczMS1B234kUdNZdcofvLK1WQGDt1C8sOvPcCk6Izg1fCntJWKsopzFOCXASXb9beR5K1pBGWiyMZHIMAFFuoh22l377JDR4scqOCaq4meEFI8nSr_FyOuVWR31S2Uv87sm6JrPgtEqZN5ikc6c1jAuGV=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางสุดดารัตน์ ไทยมา', 
        role: 'ครู',
        academicStanding: 'ชำนาญการ',
        education: '- ศศ.บ.ประวัติศาสตร์ มหาวิทยาลัยนเรศวร\n- บธ.บ.การท่องเที่ยว มหาวิทยาลัยนเรศวร\n- ศษ.ม.หลักสูตรและการสอน มหาวิทยาลัยกรุงเทพธนบุรี',
        class: 'ประถมศึกษาปีที่ 5',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPSXHwKmL5eA5hwh_HSJcf0C-fBN9AxfRgs4KvP0ESZpMKozyi0ZKdUbAGrJM8tq28laI7a5ix19-loN-f8yfTl25ispNxksoGWH--0Mgce-oq_-Y8QVpWQPDsquDuHP5MET-mxreZgiuKnJ1HmKvwS=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายธีรโชติ พันธ์เดช', 
        role: 'ครู',
        academicStanding: 'ชำนาญการ',
        education: '- ศศ.บ.(เกียรตินิยมอันดับ ๒) ภาษาอังกฤษ มหาวิทยาลัยราชภัฏอุดรธานี\n- ศษ.บ.การแนะแนว มหาวิทยาลัยสุโขทัยธรรมาธิราช\n- ศษ.ม.บริหารการศึกษา วิทยาลัยพิชญบัณฑิต',
        class: 'มัธยมศึกษาปีที่ 2',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczP3S_eGS1o4F-ash-yLX6bPFzpWF_WhD7uwaK0Z8zmN7Lx8eIJFp2U8UVVB3H9qNwkK4SGxnSEyaMqCAIrOgSvh786CaKie0s2ZkkvaCymmMgmNO2Sv4z0MZSX40gUxeSI6IOFyb01zMQzfP3fKHYam=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางสาววิมลดา นาสมยนต์', 
        role: 'ครู',
        academicStanding: 'ชำนาญการ',
        education: '- ค.บ.(เกียรตินิยมอันดับ ๒) ดนตรีศึกษา มหาวิทยาลัยราชภัฏมหาสารคาม',
        class: 'ประถมศึกษาปีที่ 4',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczMmjRUj2wUPjQqckqr1TTB4sAwDZxHjKjgtj8dwuvMUfmsnF2MH4l_ifjOkr4EcpIwZAwSC1Eu8i0aNWBPpmMDVlrcTddy3idAC79sMXQyj2hVZRngB5ZUh3CUa79IrFPEjZPl6NnEadJ7kNMGdHGy1=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายดอกคูณ พูดเพราะ', 
        role: 'ครู',
        academicStanding: '-',
        education: '- วท.บ.คณิตศาสตร์ มหาวิทยาลัยราชภัฏอุดรธานี\n- ป.บัณฑิตวิชาชีพครู มหาวิทยาลัยราชภัฏอุดรธานี',
        class: 'ประถมศึกษาปีที่ 6',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczMsOzLIk7mORWFfmsVQHQX8cXANSQ4pcKT7FMqOViL2eup1ay8zEYApWl5hxIIipt_ISFroy6PQfuw6bNjnQrW13Z84e7_rVkeeoy_1_vO2pXY5o_dzt28aERhQXENPRIWcB-HXQxnzsaiwKS8XxHuX=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางสาวมณีรัตน์ อาจสมดี', 
        role: 'ครู',
        academicStanding: '-',
        education: '- ศษ.บ.ภาษาอังกฤษ มหาวิทยาลัยรามคำแหง',
        class: 'ประถมศึกษาปีที่ 2',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOEdF1ISV1dx24tAgpwDEGK8-igunNHDlrygUA4r7-cIYncFJOWloOHxLT6DWTpBR6uZjoJiJfJrvjG6sasW4PJy2ekN3_8_2H_eWkVpU1S5ovaZEe8JjyWy-BgxJgp4UUqKjMZVqJtJRZtUoNdBWbC=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายญาณวุฒิ บุตรสมบัติ', 
        role: 'ครู',
        academicStanding: '-',
        education: '- กศ.บ.คณิตศาสตร์ มหาวิทยาลัยมหาสารคาม',
        class: 'ประถมศึกษาปีที่ 3',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOb5YshtBJ8QpSBiohDDXNTBZxaZWNZl_V-FOQ9G_690GRa5cFdUyxRwAbUC5yh422QaTSLU5eRp_xdU5e3hO5qrViPuEWB5PA7q1A5Xd13yU5czu_Ea7BcU3YerXjUXv65PTneb7cfZrjqvA-sNrbP=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายวุฒิพงษ์ เจนสระคู', 
        role: 'ครูผู้ช่วย',
        academicStanding: '-',
        education: '- ค.บ.ภาษาไทย มหาวิทยาลัยราชภัฏเลย',
        class: 'ประถมศึกษาปีที่ 2',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczMVYN45CYqXeGQAiM9yp31NqOzduG_XdHAh1fZL9GM_z7WUP4-p-EE46wlb0mX8E7cRBZtyMjTuQTykSgexsBgWoGgLTzcTrCW54ea-DnkZshCE5JbVpCQH2R1FOGZCdFZYjZ-Z5SpMX4tvjOPLbgjy=w331-h402-s-no-gm?authuser=0'
    },
    { 
        name: 'นางสาววิภาพร อุดทา', 
        role: 'ครูผู้ช่วย',
        academicStanding: '-',
        education: '- ค.บ.ภาษาไทย มหาวิทยาลัยนครพนม',
        class: 'ประถมศึกษาปีที่ 1',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPG3vOyzHs4ws5YWyGe-L03mC3mrTCG9NPLpefm5DRR97YVeV2yw_NDxUOpv6chVfrgqqKqLz_JRwXrtm8L5_OpPgVHdNAS67LLVQyhLzav2-8HN_OMwuOTjd8bP2FMwIlVOH2p_4Q7gqLI0qHd0Txn=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นางสาวอรุณ สายอ่อนตา', 
        role: 'ครูธุรการ',
        academicStanding: '-',
        education: '- ค.บ.วิทยาศาสตร์ทั่วไป มหาวิทยาลัยราชภัฏเลย',
        class: '-',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczNv3nxrVxEm29uVlNVcCakHOvOdafJ93eWwrkfre-W5TYVL3aDgx_1N1SSPpUO0mg7JsSB7ZcvoJMX2pMx1hcR5d4Yas1RIItsibRrsqyQ1ZY0eS7baQ6Vkyz_4BI9gMgUUaeKtD_-xyI8gilGUoeC_=w693-h923-s-no-gm?authuser=0'
    },
    { 
        name: 'นายสุชาติ อาสาสะนา', 
        role: 'ช่างไม้ 4',
        academicStanding: '-',
        education: '- ปวส.ไฟฟ้ากำลัง',
        class: '-',
        tel: '082-345-6789',
        imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOxWP1amBpdQMTQeuJIN7691QPuD-OQPV5MJUimVHddz4QwYRVd1Uk7Jz7u7hU9SZ_HHuBzlWP-IDskqAN9NcIIZYNM3ZCno11yNPvScx9UeLvUIpuB2A9x6zcniVGcB8kmIaVjD4BDXTXcSd8DyeYT=w693-h923-s-no-gm?authuser=0'
    },
];

// --- Static data for Student Council Structure ---
const STATIC_STUDENT_COUNCIL_DATA = [
    { name: 'ประธานนักเรียน', class: 'ประถมศึกษาปีที่ 6', role: 'ประธานนักเรียน', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { name: 'รองประธานฝ่ายวิชาการ', class: 'ประถมศึกษาปีที่ 5', role: 'รองประธานนักเรียนฝ่ายวิชาการ', imageUrl: 'YOUR_IMAGE_URL_HERE' },
];

// --- Static data for School Board Structure ---
const STATIC_SCHOOL_BOARD_DATA = [
    { name: 'ประธานกรรมการ', role: 'ประธานกรรมการสถานศึกษา', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { name: 'กรรมการผู้ทรงคุณวุฒิ', role: 'กรรมการผู้ทรงคุณวุฒิ', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { name: 'กรรมการผู้แทนผู้ปกครอง', role: 'กรรมการผู้แทนผู้ปกครอง', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { name: 'กรรมการผู้แทนครู', role: 'กรรมการผู้แทนครู', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { name: 'กรรมการและเลขานุการ', role: 'กรรมการและเลขานุการ', imageUrl: 'YOUR_IMAGE_URL_HERE' },
];


// --- Global Caches & State ---
let studentDataCache = [];
let teacherAchievementsCache = [];
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    showPage('home');
});

// --- DROPDOWN SYSTEM ---
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(menu);
            menu.classList.toggle('hidden');
        });
    });
    window.addEventListener('click', () => {
        closeAllDropdowns();
    });
}

function closeAllDropdowns(exceptMenu = null) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== exceptMenu) {
            menu.classList.add('hidden');
        }
    });
}

// --- NAVIGATION SYSTEM ---
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
            closeAllDropdowns();
        }
    });
}

function showPage(pageId) {
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) {
        activePage.classList.remove('hidden');
    }
    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) {
            parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
        }
    }
    switch (pageId) {
        case 'personnel-list':
            renderPersonnelList();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council':
            renderStudentCouncilList();
            break;
        case 'teacher-achievements':
            loadTeacherAchievementsData();
            break;
        case 'school-board':
            renderSchoolBoardList();
            break;
    }
}

// --- EVENT LISTENERS, MODAL, UTILITY FUNCTIONS ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        const councilCard = e.target.closest('.student-council-card');
        const boardCard = e.target.closest('.school-board-card');

        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = STATIC_PERSONNEL_DATA[index];
            if (selectedPerson) showPersonnelModal(selectedPerson);
        }
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) showStudentCouncilModal(selectedMember);
        }
        if (boardCard) {
            const index = boardCard.dataset.index;
            const selectedMember = STATIC_SCHOOL_BOARD_DATA[index];
            if (selectedMember) showSchoolBoardModal(selectedMember);
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
function getDirectGoogleDriveUrl(url) {
    if (!url || !url.includes('drive.google.com')) return url;
    try {
        const parts = url.split('/');
        const idIndex = parts.findIndex(part => part === 'd') + 1;
        if (idIndex > 0 && idIndex < parts.length) {
            const fileId = parts[idIndex];
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return url;
    } catch (e) { return url; }
}

// --- PERSONNEL PAGE ---
function renderPersonnelList() {
    const container = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    const personnelList = STATIC_PERSONNEL_DATA;

    if (!personnelList || personnelList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }

    const createCard = (person, index, isDirector = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isDirector ? 'max-w-xs' : '';
        cardItem.className = `personnel-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        
        const finalImageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        
        const imageSize = isDirector ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isDirector ? 'text-lg' : 'text-md';

        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${person.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${person.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p>
            </div>`;
        return cardItem;
    };

    const director = personnelList[0];
    if (director) {
        const directorContainer = document.createElement('div');
        directorContainer.className = 'flex justify-center mb-8';
        directorContainer.appendChild(createCard(director, 0, true));
        container.appendChild(directorContainer);
    }

    const otherPersonnel = personnelList.slice(1);
    if (otherPersonnel.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8 border-t pt-6';
        
        otherPersonnel.forEach((person, index) => {
            othersContainer.appendChild(createCard(person, index + 1));
        });
        
        container.appendChild(othersContainer);
    }
}

// 🌟 UPDATED: showPersonnelModal no longer uses list-disc
function showPersonnelModal(person) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    
    const educationList = person.education 
        ? person.education.split('\n').map(edu => `<div>${edu.trim()}</div>`).join('') 
        : '-';

    modalContent.innerHTML = `<div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${person.role || '-'}</p><p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p></div><hr class="my-4"><div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start"><strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong><div class="text-gray-500">${educationList}</div><strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong><span class="text-gray-500">${person.class || '-'}</span><strong class="text-gray-600 text-right">โทร:</strong><span class="text-gray-500">${person.tel || '-'}</span></div>`;
    modal.classList.remove('hidden');
}

// --- STUDENT PAGE WITH CHART ---
async function loadStudentData(isRefresh = false) {
    const loadingEl = document.getElementById('students-loading');
    if (!isRefresh) {
        loadingEl.textContent = 'กำลังโหลดข้อมูล...';
        loadingEl.classList.remove('hidden');
    }
    try {
        const url = `${API_URL}?sheet=students&v=${new Date().getTime()}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        studentDataCache = result.data;
        renderStudentChart(studentDataCache);
    } catch (error) {
        console.error('Error loading student data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}
function renderStudentChart(studentList) {
    const loadingEl = document.getElementById('students-loading');
    const summaryContainer = document.getElementById('student-summary-container');
    const ctx = document.getElementById('studentChart').getContext('2d');
    loadingEl.classList.add('hidden');
    summaryContainer.innerHTML = '';
    if (!studentList || studentList.length === 0) {
        summaryContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลนักเรียน</p>';
        return;
    }
    const labels = studentList.map(s => s.grade || '');
    const boysData = studentList.map(s => parseInt(s.boys) || 0);
    const girlsData = studentList.map(s => parseInt(s.girls) || 0);
    const totalData = studentList.map(s => parseInt(s.total) || 0);
    const totalBoys = boysData.reduce((sum, count) => sum + count, 0);
    const totalGirls = girlsData.reduce((sum, count) => sum + count, 0);
    const grandTotal = totalBoys + totalGirls;
    summaryContainer.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-blue-800">${totalBoys.toLocaleString()}</h3>
            <p class="text-sm text-blue-600">นักเรียนชาย</p>
        </div>
        <div class="bg-pink-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-pink-800">${totalGirls.toLocaleString()}</h3>
            <p class="text-sm text-pink-600">นักเรียนหญิง</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-800">${grandTotal.toLocaleString()}</h3>
            <p class="text-sm text-gray-600">นักเรียนทั้งหมด</p>
        </div>
    `;
    if (studentChartInstance) {
        studentChartInstance.destroy();
    }
    studentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'นักเรียนชาย',
                    data: boysData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'นักเรียนหญิง',
                    data: girlsData,
                    backgroundColor: 'rgba(236, 72, 153, 0.7)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1
                },
                {
                    label: 'รวม',
                    data: totalData,
                    backgroundColor: 'rgba(107, 114, 128, 0.7)',
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'จำนวนนักเรียน (คน)' }
                },
                x: {
                    title: { display: true, text: 'ระดับชั้น' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'จำนวนนักเรียนแยกตามเพศและระดับชั้น' }
            }
        }
    });
}

// --- STUDENT COUNCIL PAGE ---
function renderStudentCouncilList() {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    const boardData = STATIC_STUDENT_COUNCIL_DATA;

    if (!boardData || boardData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสภานักเรียน</p>';
        return;
    }
    const createCard = (member, index, isPresident = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isPresident ? 'max-w-xs' : '';
        cardItem.className = `student-council-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        const imageSize = isPresident ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isPresident ? 'text-lg' : 'text-md';
        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${member.class || ''}</p>
            </div>`;
        return cardItem;
    };
    
    const president = boardData[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8';
        presidentContainer.appendChild(createCard(president, 0, true));
        container.appendChild(presidentContainer);
    }
    const otherMembers = boardData.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t pt-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        container.appendChild(othersContainer);
    }
}

function showStudentCouncilModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${member.role || '-'}</p>
            <p class="text-md text-gray-500 mt-1">${member.class || ''}</p>
        </div>`;
    modal.classList.remove('hidden');
}

// --- SCHOOL BOARD PAGE ---
function renderSchoolBoardList() {
    const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    const boardData = STATIC_SCHOOL_BOARD_DATA;

    if (!boardData || boardData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสถานศึกษา</p>';
        return;
    }
    
    const createCard = (member, index, isPresident = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isPresident ? 'max-w-xs' : '';
        cardItem.className = `school-board-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        const imageSize = isPresident ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isPresident ? 'text-lg' : 'text-md';
        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
            </div>`;
        return cardItem;
    };

    const president = boardData[0];
    if (president) {
        const presidentSection = document.createElement('div');
        presidentSection.className = 'mb-8';
        presidentSection.innerHTML = `<h3 class="text-xl font-semibold text-center mb-4 text-blue-800">ประธานกรรมการ</h3>`;
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center';
        presidentContainer.appendChild(createCard(president, 0, true));
        presidentSection.appendChild(presidentContainer);
        container.appendChild(presidentSection);
    }

    const otherMembers = boardData.slice(1);
    if (otherMembers.length > 0) {
        const othersSection = document.createElement('div');
        othersSection.className = 'mt-8 border-t pt-6';
        othersSection.innerHTML = `<h3 class="text-xl font-semibold text-center mb-4 text-blue-800">คณะกรรมการ</h3>`;
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        othersSection.appendChild(othersContainer);
        container.appendChild(othersSection);
    }
}

function showSchoolBoardModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${member.role || '-'}</p>
        </div>`;
    modal.classList.remove('hidden');
}

// --- TEACHER ACHIEVEMENTS PAGE ---
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
        card.innerHTML = `
            <div>
                <h4 class="font-bold text-blue-800 text-lg">${item.name || '-'}</h4>
                <a href="${item.url_pro || '#'}" target="_blank" rel="noopener noreferrer" class="block mt-1 text-sm text-gray-600 hover:text-blue-800 hover:underline line-clamp-2" title="${item.project || ''}">
                    ${item.project || '-'}
                </a>
            </div>
            <div class="mt-4 text-right">
                <a href="${item.url_all || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    ดูผลงานทั้งหมด
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

