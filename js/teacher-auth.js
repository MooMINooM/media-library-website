// ================================================
// teacher-auth.js — ระบบล็อกอินครู ปพ.5 / ปพ.6
// ================================================
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co';
const ANON_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

export const db = window.supabase.createClient(PROJECT_URL, ANON_KEY);
const SESSION_KEY = 'paw_teacher_session';

export async function loginTeacher(username, password) {
    const { data, error } = await db.rpc('authenticate_teacher', { p_username: username.trim(), p_password: password });
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data[0]));
    return data[0];
}
export function getTeacherSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
}
export function logoutTeacher() { sessionStorage.removeItem(SESSION_KEY); }

// getTeacherAssignments — กรองด้วย teacher_subjects.academic_year โดยตรง
// ถูกต้องไม่ว่า classrooms.academic_year จะเปลี่ยนไปแล้วหรือเปล่า
export async function getTeacherAssignments(teacherId, academicYear) {
    const { data, error } = await db
        .from('teacher_subjects')
        .select('id, academic_year, subjects(id,code,name,group_name,credits,hours_per_week,semester), classrooms(id,name,level,grade,academic_year,semester)')
        .eq('teacher_id', teacherId)
        .eq('academic_year', academicYear);
    if (error) throw error;
    return (data || []).filter(a => a.classrooms != null);
}

// ดึงนักเรียนในห้อง (ปีปัจจุบัน — classroom_id ปัจจุบัน)
export async function getStudentsByClass(classroomId) {
    const { data, error } = await db
        .from('students').select('id,student_no,name,gender')
        .eq('classroom_id', classroomId).eq('is_active', true);
    if (error) throw error;
    return _sortStudents(data || []);
}

// NEW: ดึงนักเรียนที่เคยอยู่ห้องนี้ในปีที่ระบุ ผ่าน student_promotions
// ใช้สำหรับดูย้อนหลัง — classroom_id ปัจจุบันของเด็กอาจเปลี่ยนไปแล้ว
export async function getStudentsByClassHistory(classroomId, academicYear) {
    const { data, error } = await db
        .from('student_promotions')
        .select('student_id, students(id,student_no,name,gender)')
        .eq('from_classroom_id', classroomId)
        .eq('academic_year', academicYear);
    if (error) throw error;
    const students = (data || []).map(r => r.students).filter(Boolean);
    return _sortStudents(students);
}

// NEW: ดึงนักเรียนที่จบการศึกษาในปีที่ระบุ (to_classroom_id = NULL)
export async function getGraduatedStudents(academicYear) {
    const { data, error } = await db
        .from('student_promotions')
        .select('student_id, students(id,student_no,name,gender)')
        .eq('academic_year', academicYear)
        .is('to_classroom_id', null);
    if (error) throw error;
    const students = (data || []).map(r => r.students).filter(Boolean);
    return _sortStudents(students);
}

function _sortStudents(students) {
    return students.sort((a, b) => {
        const gA = a.gender === 'ชาย' ? 0 : 1;
        const gB = b.gender === 'ชาย' ? 0 : 1;
        if (gA !== gB) return gA - gB;
        return (a.student_no || '').localeCompare(b.student_no || '', undefined, { numeric: true });
    });
}

// FIX วิกฤต 1: เพิ่ม academic_year parameter เพื่อแยกปีได้
export async function getP5Grades(teacherSubjectId, semester = null, academicYear = null) {
    let q = db.from('p5_grades').select('*').eq('teacher_subject_id', teacherSubjectId);
    if (semester !== null) q = q.eq('semester', semester);
    if (academicYear !== null) q = q.eq('academic_year', academicYear);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
}

// FIX วิกฤต 1: onConflict เพิ่ม academic_year เพื่อให้ปีต่างกันไม่ทับกัน
// gradeObj ต้องมี academic_year เสมอ
export async function saveP5Grade(gradeObj) {
    const { data, error } = await db
        .from('p5_grades')
        .upsert(gradeObj, { onConflict: 'teacher_subject_id,student_id,semester,academic_year' })
        .select();
    if (error) throw error;
    return data;
}

// ปพ.6: ดึงคุณลักษณะ
export async function getP6Records(classroomId, academicYear, semester) {
    const { data, error } = await db
        .from('p6_characteristics').select('*')
        .eq('classroom_id', classroomId).eq('academic_year', academicYear).eq('semester', parseInt(semester));
    if (error) throw error;
    return data || [];
}

// ปพ.6: บันทึกคุณลักษณะ
export async function saveP6Record(recordObj) {
    const { data, error } = await db
        .from('p6_characteristics')
        .upsert(recordObj, { onConflict: 'student_id,semester,academic_year' })
        .select();
    if (error) throw error;
    return data;
}

export function scoreToGrade(pct) {
    if (pct >= 80) return '4';
    if (pct >= 75) return '3.5';
    if (pct >= 70) return '3';
    if (pct >= 65) return '2.5';
    if (pct >= 60) return '2';
    if (pct >= 55) return '1.5';
    if (pct >= 50) return '1';
    return '0';
}
export function traitLabel(val) {
    return { 3:'ดีเยี่ยม', 2:'ดี', 1:'ผ่าน', 0:'ไม่ผ่าน' }[val] ?? '—';
}

export async function getP5Summary(classroomId, academicYear, semester) {
    const { data, error } = await db
        .from('p5_summary').select('*')
        .eq('classroom_id', classroomId)
        .eq('academic_year', academicYear)
        .eq('semester', parseInt(semester));
    if (error) throw error;
    return data || [];
}

export async function saveP5Summary(obj) {
    const { data, error } = await db
        .from('p5_summary')
        .upsert(obj, { onConflict: 'student_id,classroom_id,semester,academic_year' })
        .select();
    if (error) throw error;
    return data;
}

export async function getAttendance(classroomId, dateStart, dateEnd) {
    const { data, error } = await db
        .from('p5_attendance').select('*')
        .eq('classroom_id', classroomId)
        .gte('attend_date', dateStart)
        .lte('attend_date', dateEnd);
    if (error) throw error;
    return data || [];
}

// FIX ปานกลาง 2: attendance onConflict ต้องมี classroom_id ด้วย
// ป้องกันข้อมูลทับกันเมื่อนักเรียนย้ายห้องกลางปี
export async function saveAttendance(records) {
    const { data, error } = await db
        .from('p5_attendance')
        .upsert(records, { onConflict: 'student_id,classroom_id,attend_date' })
        .select();
    if (error) throw error;
    return data;
}

// NEW: ดึงปีการศึกษาทั้งหมด — รวมปีในอดีต (จาก student_promotions) + ปีปัจจุบัน (จาก classrooms)
export async function getAcademicYears() {
    const [r1, r2] = await Promise.all([
        db.from('student_promotions').select('academic_year'),
        db.from('classrooms').select('academic_year')
    ]);
    const all = [
        ...((r1.data || []).map(r => r.academic_year)),
        ...((r2.data || []).map(r => r.academic_year))
    ];
    return [...new Set(all)].filter(Boolean).sort((a, b) => b.localeCompare(a));
}

// ปีปัจจุบัน = ปีที่อยู่ใน classrooms ตอนนี้
// หลัง execute เลื่อนชั้น classrooms.academic_year จะถูกอัปเดตเป็นปีใหม่อัตโนมัติ
export async function getCurrentAcademicYear() {
    const { data, error } = await db
        .from('classrooms')
        .select('academic_year')
        .order('academic_year', { ascending: false })
        .limit(1);
    if (error || !data || !data.length) return null;
    return data[0].academic_year;
}
