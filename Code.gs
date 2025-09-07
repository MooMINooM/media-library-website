// --- ค่าที่ต้องตั้ง ---
const FOLDER_ID = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec'; // <-- ตรวจสอบว่า ID ถูกต้อง
const SHEET_NAME = 'data';
// --------------------

/**
 * สร้างเมนูบน Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('เมนูคลังสื่อ')
      .addItem('ซิงค์ข้อมูลไฟล์จาก Drive', 'syncMediaFilesToSheet')
      .addToUi();
}

/**
 * Handles GET requests. Serves the HTML app or returns JSON data for API calls.
 * นี่คือฟังก์ชันที่แก้ไขใหม่ให้ทำงานเป็น API ได้
 * @param {Object} e - Event parameter.
 * @returns {HtmlOutput|ContentService.TextOutput} The HTML output or JSON data.
 */
function doGet(e) {
  // ตรวจสอบว่ามีการร้องขอข้อมูลแบบ API หรือไม่ (ผ่าน parameter ชื่อ 'action')
  if (e.parameter.action) {
    let output;
    let action = e.parameter.action;

    if (action === 'getMediaData') {
      output = getMediaData();
    } else if (action === 'getFilters') {
      output = getUniqueFilterValues();
    } else if (action === 'getLatestMedia') { // --- เพิ่ม action ใหม่ ---
      output = getLatestMedia();
    } else {
      output = { error: 'Invalid action specified.' };
    }
    
    // ส่งข้อมูลกลับไปในรูปแบบ JSON
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // ถ้าไม่มีการร้องขอแบบ API ก็ให้แสดงหน้าเว็บแอปตามปกติ (สำหรับทดสอบ)
  return HtmlService.createTemplateFromFile('WebApp').evaluate()
      .setTitle('คลังสื่อดิจิทัล')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * ฟังก์ชันสำหรับดึงข้อมูลสื่อ 4 รายการล่าสุด
 * @returns {Array} ข้อมูลสื่อ 4 รายการล่าสุด
 */
function getLatestMedia() {
  const allMedia = getMediaData();
  // เรียงลำดับข้อมูลตาม 'วันที่อัปโหลด' จากใหม่สุดไปเก่าสุด
  const sortedMedia = allMedia.sort((a, b) => new Date(b['วันที่อัปโหลด']) - new Date(a['วันที่อัปโหลด']));
  // คืนค่ากลับไปแค่ 4 รายการแรก
  return sortedMedia.slice(0, 4);
}


/**
 * ฟังก์ชันสำหรับให้ฝั่ง Client (JavaScript) เรียกใช้เพื่อดึงข้อมูลสื่อทั้งหมดจาก Sheet
 * @returns {Array<Object>} ข้อมูลสื่อในรูปแบบ Array ของ Object
 */
function getMediaData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values.shift(); // เอาแถวแรก (หัวข้อ) ออกมาเก็บ
    
    // แปลงข้อมูลจาก Array 2 มิติ เป็น Array ของ Object เพื่อให้ใช้ง่ายใน JavaScript
    const data = values.map(row => {
      const mediaObject = {};
      headers.forEach((header, index) => {
        // แปลงวันที่เป็น ISO String เพื่อให้จัดการง่าย
        if (header === 'วันที่อัปโหลด' && row[index] instanceof Date) {
          mediaObject[header] = row[index].toISOString();
        } else {
          mediaObject[header] = row[index];
        }
      });
      return mediaObject;
    });
    
    return data;
  } catch (error) {
    console.error("Error in getMediaData:", error);
    return []; // คืนค่าเป็น Array ว่างถ้าเกิดข้อผิดพลาด
  }
}

/**
 * ดึงค่าที่ไม่ซ้ำกันสำหรับใช้สร้าง Filter (เช่น วิชา, ระดับชั้น)
 * @returns {Object} ออบเจ็กต์ที่มีรายการวิชาและระดับชั้นที่ไม่ซ้ำกัน
 */
function getUniqueFilterValues() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const subjectIndex = headers.indexOf('ประเภทสื่อ (วิชา)') + 1;
    const gradeIndex = headers.indexOf('ระดับชั้น') + 1;

    if (subjectIndex === 0 || gradeIndex === 0) {
        return { subjects: [], grades: [] };
    }
    
    const lastRow = sheet.getLastRow();
    
    const subjects = (lastRow > 1) ? sheet.getRange(2, subjectIndex, lastRow - 1).getValues().flat().filter(Boolean) : [];
    const grades = (lastRow > 1) ? sheet.getRange(2, gradeIndex, lastRow - 1).getValues().flat().filter(Boolean) : [];
    
    const uniqueSubjects = [...new Set(subjects)].sort();
    const uniqueGrades = [...new Set(grades)].sort();
    
    return { subjects: uniqueSubjects, grades: uniqueGrades };
}


/**
 * ฟังก์ชันหลักสำหรับซิงค์ข้อมูลไฟล์จาก Google Drive ไปยัง Google Sheets
 */
function syncMediaFilesToSheet() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const existingFileIds = getExistingFileIds_(sheet);
    const newFilesData = [];

    while (files.hasNext()) {
      const file = files.next();
      const fileId = file.getId();
      
      if (!existingFileIds.has(fileId)) {
        const fileName = file.getName();
        const fileType = file.getMimeType();
        const fileUrl = file.getUrl();
        const uploadDate = file.getDateCreated();
        
        newFilesData.push([
          fileId, fileName, '', fileType, '', '', '', '', fileUrl, uploadDate
        ]);
      }
    }
    
    if (newFilesData.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData);
      SpreadsheetApp.getUi().alert(`ดำเนินการสำเร็จ!`, `เพิ่มสื่อใหม่จำนวน ${newFilesData.length} รายการ`, SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('ไม่พบสื่อใหม่', 'ไม่พบไฟล์ใหม่ในโฟลเดอร์ Google Drive', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (e) {
    Logger.log(e);
    SpreadsheetApp.getUi().alert('เกิดข้อผิดพลาด', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ฟังก์ชันเสริม: ดึง ID ของไฟล์ทั้งหมดที่มีอยู่แล้วในชีต
 * @returns {Set<string>} ชุดข้อมูลของ File ID ที่ไม่ซ้ำกัน
 */
function getExistingFileIds_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return new Set();
  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const values = range.getValues().flat().filter(String);
  return new Set(values);
}


