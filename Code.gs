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
  const validMedia = allMedia.filter(item => {
    const date = item['วันที่อัปโหลด'];
    return date && !isNaN(new Date(date).getTime());
  });
  const sortedMedia = validMedia.sort((a, b) => new Date(b['วันที่อัปโหลด']) - new Date(a['วันที่อัปโหลด']));
  return sortedMedia.slice(0, 4);
}


/**
 * ดึงข้อมูลสื่อทั้งหมดจาก Sheet (พร้อม Debugging Logs)
 */
function getMediaData() {
  try {
    Logger.log("--- เริ่มการทำงานของ getMediaData ---");
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log("!!! ข้อผิดพลาด: ไม่พบชีตชื่อ '" + SHEET_NAME + "'");
      return [];
    }
    Logger.log("เจอชีตแล้ว: " + sheet.getName());

    const range = sheet.getDataRange();
    const values = range.getValues();
    Logger.log("จำนวนแถวทั้งหมดที่พบ (รวมหัวข้อ): " + values.length);
    
    if (values.length < 2) {
      Logger.log("ไม่พบข้อมูล (มีแค่แถวหัวข้อหรือว่างเปล่า)");
      return [];
    }

    const headers = values.shift(); 
    Logger.log("หัวข้อคอลัมน์ที่พบ: " + headers.join(", "));
    
    const data = values.map((row, rowIndex) => {
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

      // จะแสดง Log แค่ข้อมูลแถวแรกเพื่อไม่ให้ยาวเกินไป
      if (rowIndex === 0) {
        Logger.log("ตัวอย่างข้อมูลแถวแรกที่ประมวลผลเสร็จ: " + JSON.stringify(mediaObject));
      }
      return mediaObject;
    });
    
    Logger.log("ประมวลผลข้อมูลสำเร็จ " + data.length + " รายการ");
    Logger.log("--- จบการทำงานของ getMediaData ---");
    return data;

  } catch (error) {
    Logger.log("!!! เกิดข้อผิดพลาดร้ายแรงใน getMediaData: " + error.toString());
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
