// --- ค่าที่ต้องตั้ง ---
const FOLDER_ID = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec'; // <-- ตรวจสอบว่า ID ถูกต้อง
const SHEET_NAME = 'data';
// --------------------
// --- ค่าที่ต้องตั้ง ---
const FOLDER_ID = 'ใส่ ID ของโฟลเดอร์ที่คุณคัดลอกไว้ที่นี่'; // <-- ตรวจสอบว่า ID ถูกต้อง
const SHEET_NAME = 'Sheet1'; // <-- ตรวจสอบว่าชื่อชีตถูกต้อง
// --------------------

/**
 * สร้างเมนูบน Google Sheets (ถูกปิดการใช้งานชั่วคราว)
 */
/*
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('เมนูคลังสื่อ')
      .addItem('ซิงค์ข้อมูลไฟล์จาก Drive', 'syncMediaFilesToSheet')
      .addToUi();
}
*/

/**
 * Handles GET requests. Serves the HTML app or returns JSON data for API calls.
 */
function doGet(e) {
  if (e.parameter.action) {
    let output;
    let action = e.parameter.action;

    if (action === 'getMediaData') {
      output = getMediaData();
    } else if (action === 'getFilters') {
      output = getUniqueFilterValues();
    } else if (action === 'getLatestMedia') {
      output = getLatestMedia();
    } else {
      output = { error: 'Invalid action specified.' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return HtmlService.createTemplateFromFile('WebApp').evaluate()
      .setTitle('คลังสื่อดิจิทัล')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * ฟังก์ชันสำหรับดึงข้อมูลสื่อ 4 รายการล่าสุด
 */
function getLatestMedia() {
  const allMedia = getMediaData();
  
  // FIX: แก้ไขให้ใช้ key 'วันที่อัปโหลด' (ภาษาไทย) ให้สอดคล้องกัน
  const validMedia = allMedia.filter(item => {
    const date = item['วันที่อัปโหลด'];
    return date && !isNaN(new Date(date).getTime());
  });

  // FIX: แก้ไขให้ใช้ key 'วันที่อัปโหลด' (ภาษาไทย) ให้สอดคล้องกัน
  const sortedMedia = validMedia.sort((a, b) => new Date(b['วันที่อัปโหลด']) - new Date(a['วันที่อัปโหลด']));
  
  return sortedMedia.slice(0, 4);
}


/**
 * ดึงข้อมูลสื่อทั้งหมดจาก Sheet
 */
function getMediaData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values.shift(); 
    
    const data = values.map(row => {
      const mediaObject = {};
      headers.forEach((header, index) => {
        // FIX: ปรับปรุง Logic การแปลงชื่อ key ให้ถูกต้องและสอดคล้องกัน
        let key = header;
        if (header === 'Title') key = 'ชื่อสื่อ';
        else if (header === 'Description') key = 'คำอธิบาย';
        else if (header === 'Category') key = 'ประเภทสื่อ (วิชา)';
        else if (header === 'Grade') key = 'ระดับชั้น';
        else if (header === 'Creator') key = 'ผู้สร้าง';
        else if (header === 'CoverImageURL') key = 'รูปปกสื่อ';
        else if (header === 'FileLink') key = 'ลิงก์ดูไฟล์';
        else if (header === 'UploadDate') key = 'วันที่อัปโหลด';

        let value = row[index];
        // แปลง Date object เป็น string มาตรฐาน
        if (header === 'UploadDate' && value instanceof Date) {
          value = value.toISOString();
        }
        
        mediaObject[key] = value;
      });
      return mediaObject;
    });
    
    return data;
  } catch (error) {
    console.error("Error in getMediaData:", error);
    return [];
  }
}

/**
 * ดึงค่าที่ไม่ซ้ำกันสำหรับใช้สร้าง Filter
 */
function getUniqueFilterValues() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // FIX: ใช้ชื่อคอลัมน์ภาษาอังกฤษตามไฟล์ Sheet
    const subjectIndex = headers.indexOf('Category') + 1;
    const gradeIndex = headers.indexOf('Grade') + 1;

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
 * ฟังก์ชันซิงค์ไฟล์ (ถูกปิดการใช้งานชั่วคราว)
 * เนื่องจากโครงสร้างคอลัมน์ใน Sheet ไม่ตรงกับที่ฟังก์ชันนี้คาดหวัง
 * การเปิดใช้งานอาจทำให้ข้อมูลเรียงผิดเพี้ยน
 */
/*
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

function getExistingFileIds_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return new Set();
  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const values = range.getValues().flat().filter(String);
  return new Set(values);
}
*/

