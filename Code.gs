/**
 * Code.gs - ระบบหลังบ้านสำหรับจัดการข้อมูลโรงเรียนแบบครบวงจร
 */

// ชื่อชีตที่อนุญาตให้เข้าถึงได้ (เพื่อความปลอดภัย)
// ถ้าคุณเพิ่มหมวดใหม่ในหน้า Admin อย่าลืมมาเพิ่มชื่อชีตตรงนี้ด้วย (ตัวพิมพ์เล็ก-ใหญ่ต้องตรงกัน)
const ALLOWED_SHEETS = [
  'News', 'Personnel', 'Director_history', 'Personnel_history', 
  'Teacher_awards', 'Student_awards', 'School_awards', 
  'Innovations', 'Documents', 'Forms', 'Board', 'Council'
];

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  if (action === 'getData') {
    return getDataFromSheet(params.sheet);
  } else if (action === 'getFilters') {
    // (Optional) เผื่อใช้สำหรับดึงตัวเลือก Filter ต่างๆ
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return responseJSON({ error: 'Invalid Action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addData') {
      return addDataToSheet(data.type, data.data);
    }
    
    return responseJSON({ status: 'error', message: 'Invalid Action' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.message });
  }
}

// ฟังก์ชันดึงข้อมูลจาก Sheet
function getDataFromSheet(sheetName) {
  // ตรวจสอบว่าชื่อชีตถูกต้องหรือไม่ (Security Check)
  // แปลง input เป็น Capitalize (ตัวแรกใหญ่) เพื่อให้ตรงกับมาตรฐาน
  const targetSheet = sheetName.charAt(0).toUpperCase() + sheetName.slice(1);
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) {
    // ถ้าไม่เจอ Sheet ให้ส่ง Array ว่างกลับไป (หน้าเว็บจะได้ไม่พัง)
    return responseJSON([]); 
  }
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length < 2) return responseJSON([]); // มีแต่หัวข้อ หรือไม่มีข้อมูล
  
  const headers = values.shift(); // ดึงบรรทัดแรกเป็น Header (Key)
  
  const data = values.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      // แปลงวันที่เป็นรูปแบบที่อ่านง่าย หรือส่งเป็น ISO String
      if (val instanceof Date) {
        // ปรับ Timezone เป็นไทย (GMT+7) ถ้าจำเป็น หรือส่งไปให้ JS หน้าบ้านจัดการ
        obj[header] = val.toISOString(); 
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
  
  // ส่งข้อมูลกลับ โดยเรียงจากใหม่ไปเก่า (ถ้ามีคอลัมน์ date หรือ uploadDate)
  // หรือส่งไปตามลำดับบรรทัดเลยก็ได้
  return responseJSON(data.reverse()); 
}

// ฟังก์ชันบันทึกข้อมูล
function addDataToSheet(sheetName, dataObj) {
  const targetSheet = sheetName.charAt(0).toUpperCase() + sheetName.slice(1);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(targetSheet);
  
  // ถ้าไม่มี Sheet ให้สร้างใหม่
  if (!sheet) {
    sheet = ss.insertSheet(targetSheet);
    // สร้าง Header จาก Key ของ Object ที่ส่งมา
    const headers = Object.keys(dataObj);
    sheet.appendRow(headers);
  }
  
  // อ่าน Header ปัจจุบันเพื่อให้ข้อมูลลงถูกช่อง
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const rowData = headers.map(header => {
    let val = dataObj[header] || '';
    // ใส่ ' นำหน้าป้องกัน Google Sheet แปลงรูปแบบอัตโนมัติ (เช่น เบอร์โทร 081...)
    return "'" + val; 
  });
  
  sheet.appendRow(rowData);
  
  return responseJSON({ status: 'success', message: `Saved to ${targetSheet} successfully` });
}

// Helper สร้าง JSON Response
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
