// --- ค่าที่ต้องตั้ง ---
// !!! สำคัญ: โปรดตรวจสอบว่าชื่อชีตหลักของคุณตรงกับ 'data' หรือไม่ (ใช้สำหรับดึงข้อมูลสื่อ)
const SHEET_NAME = 'data'; 
// --------------------

/**
 * Handles GET requests. Returns JSON data for API calls.
 * ฟังก์ชันรับค่า GET สำหรับดึงข้อมูลมาแสดงหน้าเว็บ
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
 * Handles POST requests. Saves data to Google Sheets.
 * ฟังก์ชันรับค่า POST สำหรับบันทึกข้อมูลจากหน้า Admin
 */
function doPost(e) {
  try {
    // แปลงข้อมูลที่ส่งมาเป็น JSON
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const type = data.type; // ค่านี้จะเป็นชื่อ Sheet ที่ต้องการบันทึก เช่น 'news', 'personnel'
    
    if (action === 'addData') {
      return addDataToSheet(type, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันช่วยสำหรับบันทึกข้อมูลลง Sheet ตามประเภทที่ระบุ
 * @param {string} sheetName - ชื่อประเภทข้อมูล (จะถูกแปลงเป็นชื่อ Sheet)
 * @param {object} dataObj - ข้อมูลที่ต้องการบันทึก
 */
function addDataToSheet(sheetName, dataObj) {
  // แปลงชื่อประเภทให้เป็นตัวพิมพ์ใหญ่ตัวแรก เช่น 'news' -> 'News'
  const targetSheetName = sheetName.charAt(0).toUpperCase() + sheetName.slice(1); 
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(targetSheetName);
  
  // ถ้ายังไม่มี Sheet ชื่อนี้ ให้สร้างใหม่
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    // สร้าง Header อัตโนมัติจาก Key ของข้อมูล (ยกเว้น key 'action' และ 'type')
    const headers = Object.keys(dataObj).filter(k => k !== 'action' && k !== 'type');
    sheet.appendRow(headers);
  }

  // อ่าน Header จากบรรทัดแรกของ Sheet เพื่อดูว่าจะต้องลงข้อมูลช่องไหน
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // เตรียมข้อมูลลงแถวให้ตรงกับ Header
  const rowData = headers.map(header => {
    // ถ้ามีข้อมูลที่ตรงกับ Header ให้ใส่ค่าลงไป (ถ้าไม่มีให้ใส่ค่าว่าง)
    let val = dataObj[header] || '';
    // ใส่เครื่องหมาย ' นำหน้าเพื่อป้องกัน Google Sheet แปลงรูปแบบวันที่หรือตัวเลขผิด
    return "'" + val; 
  });
  
  sheet.appendRow(rowData);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ดึงข้อมูลสื่อทั้งหมดจาก Sheet และส่งกลับเป็น JSON object โดยใช้ Header เดิมเป็น Key
 *
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
 * ดึงค่าที่ไม่ซ้ำกันสำหรับใช้สร้าง Filter (ใช้กับหน้า Library)
 *
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
    
    const subjects = (lastRow > 1) ?
      sheet.getRange(2, subjectIndex, lastRow - 1).getValues().flat().filter(Boolean) : [];
    const grades = (lastRow > 1) ?
      sheet.getRange(2, gradeIndex, lastRow - 1).getValues().flat().filter(Boolean) : [];
    
    const uniqueSubjects = [...new Set(subjects)].sort();
    const uniqueGrades = [...new Set(grades)].sort();
    return { subjects: uniqueSubjects, grades: uniqueGrades };
  } catch (error)
 {
    console.error("Error in getUniqueFilterValues:", error);
    return { error: "Failed to get filter values", details: error.message };
  }
}
