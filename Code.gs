/**
 * Code.gs - ระบบหลังบ้าน V.2 (รองรับ CRUD เต็มรูปแบบ)
 */

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  if (action === 'getData') {
    return getDataFromSheet(params.sheet);
  }
  
  return responseJSON({ error: 'Invalid Action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // 1. เพิ่มข้อมูลใหม่
    if (action === 'addData') {
      return addDataToSheet(data.type, data.data);
    } 
    // 2. แก้ไขข้อมูลเดิม
    else if (action === 'editData') {
      return editDataInSheet(data.type, data.id, data.data);
    }
    // 3. ลบข้อมูล
    else if (action === 'deleteData') {
      return deleteDataFromSheet(data.type, data.id);
    }
    
    return responseJSON({ status: 'error', message: 'Invalid Action' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.message });
  }
}

// --- CORE FUNCTIONS ---

// ดึงข้อมูล (แถม ID ไปด้วย)
function getDataFromSheet(sheetName) {
  const targetSheet = formatSheetName(sheetName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) return responseJSON([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJSON([]);
  
  const headers = data.shift();
  // หา index ของ column 'id'
  const idIndex = headers.indexOf('id');
  
  const result = data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      // แปลงวันที่เป็น String
      obj[h] = (row[i] instanceof Date) ? row[i].toISOString() : row[i];
    });
    // ถ้าไม่มี id ในตาราง ให้ใช้ row index (ไม่แนะนำระยะยาว แต่ใช้แก้ขัดได้)
    if (!obj.id && idIndex === -1) {
       // obj.id = "row_" + index; // (Logic นี้อาจซับซ้อน ขอข้ามไปใช้ ID จริง)
    }
    return obj;
  });
  
  return responseJSON(result.reverse()); // ส่งกลับ ใหม่ -> เก่า
}

// เพิ่มข้อมูล (สร้าง ID อัตโนมัติ)
function addDataToSheet(sheetName, dataObj) {
  const targetSheet = formatSheetName(sheetName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) {
    sheet = ss.insertSheet(targetSheet);
    // เพิ่ม column id เสมอ
    const headers = ['id', ...Object.keys(dataObj)];
    sheet.appendRow(headers);
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // สร้าง Unique ID
  const newId = Utilities.getUuid();
  dataObj.id = newId;
  
  const rowData = headers.map(h => {
    let val = dataObj[h];
    return val === undefined ? '' : "'" + val;
  });
  
  sheet.appendRow(rowData);
  return responseJSON({ status: 'success', message: 'Added successfully', id: newId });
}

// แก้ไขข้อมูล (ค้นหาจาก ID)
function editDataInSheet(sheetName, id, dataObj) {
  const targetSheet = formatSheetName(sheetName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) return responseJSON({ status: 'error', message: 'Sheet not found' });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) return responseJSON({ status: 'error', message: 'No ID column found' });
  
  const data = sheet.getDataRange().getValues();
  
  // หาแถวที่ตรงกับ ID (เริ่มหาจากแถว 2)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      // เจอแถวแล้ว อัปเดตข้อมูล
      const rowNumber = i + 1;
      
      headers.forEach((h, colIndex) => {
        if (h !== 'id' && dataObj[h] !== undefined) { // ไม่แก้ ID
           sheet.getRange(rowNumber, colIndex + 1).setValue("'" + dataObj[h]);
        }
      });
      
      return responseJSON({ status: 'success', message: 'Updated successfully' });
    }
  }
  
  return responseJSON({ status: 'error', message: 'ID not found' });
}

// ลบข้อมูล
function deleteDataFromSheet(sheetName, id) {
  const targetSheet = formatSheetName(sheetName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) return responseJSON({ status: 'error', message: 'Sheet not found' });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) return responseJSON({ status: 'error', message: 'No ID column found' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return responseJSON({ status: 'success', message: 'Deleted successfully' });
    }
  }
  
  return responseJSON({ status: 'error', message: 'ID not found' });
}

// Helpers
function formatSheetName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
