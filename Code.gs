// Code.gs

// ฟังก์ชันเดิมที่มีอยู่ (doGet, getMediaData ฯลฯ) เก็บไว้เหมือนเดิม...

/**
 * จัดการการรับข้อมูล (POST) เพื่อบันทึกข้อมูลใหม่
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const type = data.type; // news, personnel, etc.
    
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

function addDataToSheet(sheetName, dataObj) {
  // Mapping ชื่อ Type ให้ตรงกับชื่อ Sheet ใน Google Sheets
  // เช่น type='news' -> Sheet Name='News'
  const targetSheetName = sheetName.charAt(0).toUpperCase() + sheetName.slice(1); 
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(targetSheetName);
  
  // ถ้ายังไม่มี Sheet ให้สร้างใหม่
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    // สร้าง Header อัตโนมัติจาก Key ของข้อมูล
    const headers = Object.keys(dataObj).filter(k => k !== 'action' && k !== 'type');
    sheet.appendRow(headers);
  }

  // เตรียมข้อมูลลงแถว
  // อ่าน Header ปัจจุบันเพื่อให้ข้อมูลลงตรงช่อง
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => {
    // ถ้าชื่อฟิลด์ตรงกับ Header ให้ใส่ค่า (ถ้าไม่มีใส่ว่าง)
    return dataObj[header] || ''; 
  });

  // ถ้ามี Header ใหม่ที่ยังไม่มีใน Sheet ให้ต่อท้าย (Optional Logic)
  // แต่เบื้องต้นให้ใส่ตาม Header ที่มี
  
  sheet.appendRow(rowData);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved' }))
    .setMimeType(ContentService.MimeType.JSON);
}
