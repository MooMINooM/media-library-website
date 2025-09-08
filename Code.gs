// --- ค่าที่ต้องตั้ง ---
const FOLDER_ID = 'https://script.google.com/macros/s/AKfycbxgxfZ5SB9Um4HftajMJS6RJMG9kwd6hVjKz_DYTxDgQOB9qk1Xxl0mS1dr5YuoIFi-/exec'; // <-- ตรวจสอบว่า ID ถูกต้อง
const SHEET_NAME = 'data'; // <-- ตรวจสอบว่าชื่อชีตถูกต้อง
// --------------------

/**
 * Handles GET requests. Returns JSON data for API calls.
 */
function doGet(e) {
  let output;
  if (e.parameter.action) {
    const action = e.parameter.action;
    if (action === 'getMediaData') {
      output = getMediaData();
    } else if (action === 'getFilters') {
      output = getUniqueFilterValues();
    } else {
      output = { error: 'Invalid action specified.' };
    }
  } else {
    output = { error: 'No action specified.' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ดึงข้อมูลสื่อทั้งหมดจาก Sheet และส่งกลับเป็น JSON object โดยใช้ Header เดิมเป็น Key
 */
function getMediaData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    const range = sheet.getDataRange();
    const values = range.getValues();
    if (values.length < 2) return [];

    const headers = values.shift(); // ดึง Header ออกมาจากแถวแรก
    
    // แปลงข้อมูลแต่ละแถวให้เป็น Object โดยใช้ Header เป็น Key
    const data = values.map(row => {
      const mediaObject = {};
      headers.forEach((header, index) => {
        let value = row[index];
        if (value instanceof Date) {
          // แปลงข้อมูลวันที่ให้เป็นรูปแบบมาตรฐาน ISO String
          mediaObject[header] = value.toISOString();
        } else {
          mediaObject[header] = value;
        }
      });
      return mediaObject;
    });
    
    return data;
  } catch (error) {
    console.error("Error in getMediaData:", error);
    return { error: "Failed to get media data", details: error.message };
  }
}

/**
 * ดึงค่าที่ไม่ซ้ำกันสำหรับใช้สร้าง Filter
 */
function getUniqueFilterValues() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return { subjects: [], grades: [] };

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
  } catch (error) {
    console.error("Error in getUniqueFilterValues:", error);
    return { error: "Failed to get filter values", details: error.message };
  }
}

