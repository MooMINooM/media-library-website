// --- ค่าที่ต้องตั้ง ---
const FOLDER_ID = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec'; // <-- ตรวจสอบว่า ID ถูกต้อง
const SHEET_NAME = 'data';
// --------------------


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
    } else {
      output = { error: 'Invalid action specified.' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Note: This part is for the Apps Script Web App, not the Netlify site.
  // It is kept for direct testing purposes.
  return HtmlService.createTemplateFromFile('WebApp').evaluate()
      .setTitle('คลังสื่อดิจิทัล')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * ดึงข้อมูลสื่อทั้งหมดจาก Sheet
 */
function getMediaData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    const range = sheet.getDataRange();
    const values = range.getValues();
    if (values.length < 2) return [];

    const headers = values.shift(); 
    
    const data = values.map(row => {
      const mediaObject = {};
      headers.forEach((header, index) => {
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

