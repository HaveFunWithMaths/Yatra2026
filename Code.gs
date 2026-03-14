/**
 * GNH Yatra 2026 - Registration Backend
 * Google Apps Script for handling form submissions
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Save the project (Ctrl+S)
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy" and authorize the app
 * 10. Copy the Web app URL and paste it in App.jsx (GOOGLE_SCRIPT_URL)
 * 
 * COLUMN MAPPING:
 * A: Devotee Name (Main User) - MERGED for group submissions
 * B: Individual Name
 * C: Age
 * D: Email (Devotee only)
 * E: WhatsApp (Devotee only)
 * F: Gender
 * G: Prasadam (comma-separated)
 * H: Languages (comma-separated)
 * I: Seating Preference (Family only)
 * J: Chanting Status (Family only)
 * K: Inclination (Family only)
 * L: One Liner / Spiritual Status (Family only)
 * M: Submission Timestamp
 */

/**
 * Write debug logs to a 'Debug' sheet in the spreadsheet
 * This is more reliable than console.log for web app executions
 */
function logToSheet(message) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let debugSheet = ss.getSheetByName('Debug');
    if (!debugSheet) {
      debugSheet = ss.insertSheet('Debug');
      debugSheet.appendRow(['Timestamp', 'Message']);
      debugSheet.getRange('1:1').setFontWeight('bold');
    }
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    debugSheet.appendRow([timestamp, String(message)]);
  } catch (logErr) {
    // If even logging fails, silently ignore
  }
}

/**
 * Handle POST requests from the React form
 */
function doPost(e) {
  try {
    logToSheet('[doPost] Request received');
    logToSheet('[doPost] postData contentType: ' + (e.postData ? e.postData.type : 'N/A'));
    logToSheet('[doPost] postData length: ' + (e.postData && e.postData.contents ? e.postData.contents.length : 'N/A'));
    
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    logToSheet('[doPost] Parsed data keys: ' + Object.keys(data).join(', '));
    logToSheet('[doPost] Has paymentFile: ' + !!(data.paymentFile));
    if (data.paymentFile) {
      logToSheet('[doPost] paymentFile.name: ' + data.paymentFile.name);
      logToSheet('[doPost] paymentFile.mimeType: ' + data.paymentFile.mimeType);
      logToSheet('[doPost] paymentFile.data length: ' + (data.paymentFile.data ? data.paymentFile.data.length : 'NO DATA'));
    }
    
    // Process the submission
    const result = processSubmission(data);
    
    logToSheet('[doPost] processSubmission completed, result: ' + JSON.stringify(result));
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Registration saved successfully', ...result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error to sheet for debugging
    logToSheet('[doPost] ERROR: ' + error.toString());
    logToSheet('[doPost] ERROR stack: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Process the submission data and write to the spreadsheet
 */
function processSubmission(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  // Ensure headers exist
  ensureHeaders(sheet);
  
  // Get the next available row
  const startRow = sheet.getLastRow() + 1;
  const devotee = data.devotee;
  const isAlone = data.alone === true;
  
  // Handle File Upload to Drive
  let paymentLink = '';
  if (data.paymentFile && data.paymentFile.data) {
    logToSheet('[upload] Starting file upload to Drive');
    logToSheet('[upload] File name: ' + data.paymentFile.name);
    logToSheet('[upload] File mimeType: ' + data.paymentFile.mimeType);
    logToSheet('[upload] File data length: ' + data.paymentFile.data.length);
    try {
      logToSheet('[upload] Looking for folder "GNH Yatra Payments"');
      const folderIterator = DriveApp.getFoldersByName("GNH Yatra Payments");
      let folder;
      if (folderIterator.hasNext()) {
        folder = folderIterator.next();
        logToSheet('[upload] Found existing folder, id: ' + folder.getId());
      } else {
        folder = DriveApp.createFolder("GNH Yatra Payments");
        logToSheet('[upload] Created new folder, id: ' + folder.getId());
        try {
          folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          logToSheet('[upload] Folder sharing set successfully');
        } catch (shareErr) {
          logToSheet('[upload] WARNING: Could not set folder sharing: ' + shareErr);
        }
      }
      
      logToSheet('[upload] Decoding base64 data...');
      var decodedBytes = Utilities.base64Decode(data.paymentFile.data);
      logToSheet('[upload] Decoded bytes length: ' + decodedBytes.length);
      
      var blob = Utilities.newBlob(
        decodedBytes, 
        data.paymentFile.mimeType || 'application/octet-stream', 
        data.paymentFile.name || 'Payment_Screenshot'
      );
      logToSheet('[upload] Blob created successfully');
      
      var file = folder.createFile(blob);
      paymentLink = file.getUrl();
      logToSheet('[upload] File uploaded successfully, URL: ' + paymentLink);
    } catch (uploadErr) {
      logToSheet('[upload] ERROR: ' + uploadErr.toString());
      logToSheet('[upload] ERROR stack: ' + uploadErr.stack);
      paymentLink = 'Upload Failed: ' + uploadErr.toString();
    }
  } else {
    logToSheet('[upload] No paymentFile in data or no data property, skipping upload');
    if (data.paymentFile) {
      logToSheet('[upload] paymentFile exists but data is: ' + (data.paymentFile.data ? 'has value' : 'falsy'));
    }
  }

  // Check if devotee phone number already exists
  let phoneExists = false;
  let existingRowIndex = -1;
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  for (let i = 1; i < values.length; i++) {
    // Column E is index 4 (0-based)
    if (String(values[i][4]).trim() === String(devotee.whatsapp).trim()) {
      phoneExists = true;
      existingRowIndex = i + 1; // 1-based indexing for row number
      break;
    }
  }
  
  let rowsAdded = 0;
  let mergeEndRow = startRow - 1;

  if (phoneExists) {
    // Update existing devotee information
    sheet.getRange(existingRowIndex, 1).setValue(devotee.name);
    sheet.getRange(existingRowIndex, 2).setValue(devotee.name);
    sheet.getRange(existingRowIndex, 3).setValue(devotee.age);
    sheet.getRange(existingRowIndex, 4).setValue(devotee.email);
    sheet.getRange(existingRowIndex, 5).setValue(devotee.whatsapp);
    sheet.getRange(existingRowIndex, 6).setValue(devotee.gender);
    sheet.getRange(existingRowIndex, 7).setValue(devotee.prasadPreference);
    sheet.getRange(existingRowIndex, 8).setValue(devotee.languages);
    sheet.getRange(existingRowIndex, 13).setValue(timestamp);
    if (paymentLink) {
        sheet.getRange(existingRowIndex, 14).setValue(paymentLink);
    }
  }

  if (isAlone) {
    if (!phoneExists) {
      const row = [
        devotee.name,           // A: Devotee Name
        devotee.name,           // B: Individual Name (same as devotee for solo)
        devotee.age,            // C: Age
        devotee.email,          // D: Email
        devotee.whatsapp,       // E: WhatsApp
        devotee.gender,         // F: Gender
        devotee.prasadPreference, // G: Prasadam
        devotee.languages,      // H: Languages
        '',                     // I: Seating
        '',                     // J: Chanting
        '',                     // K: Inclination
        '',                     // L: One Liner
        timestamp,              // M: Timestamp
        paymentLink             // N: Payment Link
      ];
      sheet.appendRow(row);
      rowsAdded = 1;
      mergeEndRow = startRow;
    }
  } else {
    // Group submission (devotee + family members)
    const family = data.family || [];
    let currentRow = startRow;
    
    // First row: Devotee's own data (if not already exists)
    if (!phoneExists) {
      const devoteeRow = [
        devotee.name,           // A: Devotee Name
        devotee.name,           // B: Individual Name
        devotee.age,            // C: Age
        devotee.email,          // D: Email
        devotee.whatsapp,       // E: WhatsApp
        devotee.gender,         // F: Gender
        devotee.prasadPreference, // G: Prasadam
        devotee.languages,      // H: Languages
        '',                     // I: Seating
        '',                     // J: Chanting
        '',                     // K: Inclination
        '',                     // L: One Liner
        timestamp,              // M: Timestamp
        paymentLink             // N: Payment Link
      ];
      sheet.appendRow(devoteeRow);
      rowsAdded++;
      currentRow++;
    }
    
    // Subsequent rows: Family members
    family.forEach((member) => {
      const memberRow = [
        devotee.name,         // A: Devotee Name (will be merged)
        member.name,          // B: Individual Name
        member.age,           // C: Age
        '',                   // D: Email (blank for family)
        member.phone || '',   // E: Phone (optional for family)
        member.gender,        // F: Gender
        member.prasadPreference, // G: Prasadam
        member.languages,     // H: Languages
        member.seating,       // I: Seating Preference
        member.chanting,      // J: Chanting Status
        member.inclination,   // K: Inclination
        member.spiritualStatus, // L: One Liner
        timestamp,            // M: Timestamp
        paymentLink           // N: Payment Link
      ];
      sheet.appendRow(memberRow);
      rowsAdded++;
      currentRow++;
    });
    
    mergeEndRow = currentRow - 1;
    
    // Merge Column A for this group
    if (rowsAdded > 1) {
      mergeDevoteeColumn(sheet, startRow, mergeEndRow);
    }
  }
  
  return { rowsAdded, startRow };
}

/**
 * Merge Column A (Devotee Name) and Column N (Payment Link) for a range of rows
 */
function mergeDevoteeColumn(sheet, startRow, endRow) {
  if (startRow < endRow) {
    // Merge Column A (Devotee Name)
    const rangeA = sheet.getRange(startRow, 1, endRow - startRow + 1, 1);
    rangeA.merge();
    rangeA.setVerticalAlignment('middle');
    rangeA.setFontWeight('bold');
    rangeA.setBackground('#f3f4f6');
    
    // Merge Column N (Payment Link, index 14)
    const rangeN = sheet.getRange(startRow, 14, endRow - startRow + 1, 1);
    rangeN.merge();
    rangeN.setVerticalAlignment('middle');
  }
}

/**
 * Ensure the spreadsheet has proper headers
 */
function ensureHeaders(sheet) {
  const firstCell = sheet.getRange('A1').getValue();
  
  if (!firstCell || firstCell !== 'Devotee Name') {
    const headers = [
      'Devotee Name',
      'Individual Name',
      'Age',
      'Email',
      'WhatsApp/Phone',
      'Gender',
      'Prasadam',
      'Languages',
      'Seating',
      'Chanting',
      'Inclination',
      'Spiritual Status',
      'Timestamp',
      'Payment Link'
    ];
    
    // Set headers in the first row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    
    // Style the headers
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4f46e5');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
    // Set column widths for better readability
    sheet.setColumnWidth(1, 150);  // Devotee Name
    sheet.setColumnWidth(2, 150);  // Individual Name
    sheet.setColumnWidth(3, 60);   // Age
    sheet.setColumnWidth(4, 200);  // Email
    sheet.setColumnWidth(5, 120);  // WhatsApp/Phone
    sheet.setColumnWidth(6, 80);   // Gender
    sheet.setColumnWidth(7, 180);  // Prasadam
    sheet.setColumnWidth(8, 150);  // Languages
    sheet.setColumnWidth(9, 120);  // Seating
    sheet.setColumnWidth(10, 100); // Chanting
    sheet.setColumnWidth(11, 100); // Inclination
    sheet.setColumnWidth(12, 250); // Spiritual Status
    sheet.setColumnWidth(13, 180); // Timestamp
    sheet.setColumnWidth(14, 250); // Payment Link
  }
}

/**
 * Test function - can be run manually to test the setup
 */
function testSubmission() {
  const testData = {
    alone: false,
    devotee: {
      name: 'Test Devotee',
      age: '30',
      email: 'test@example.com',
      whatsapp: '9876543210',
      gender: 'Male',
      prasadPreference: 'North Indian',
      languages: 'Hindi, English'
    },
    family: [
      {
        name: 'Family Member 1',
        age: '25',
        gender: 'Female',
        phone: '9876543211',
        prasadPreference: 'South Indian',
        languages: 'Telugu',
        seating: 'Can sit below',
        chanting: '4+',
        inclination: 'Yes',
        spiritualStatus: 'Regular temple visitor'
      },
      {
        name: 'Family Member 2',
        age: '10',
        gender: 'Male',
        phone: '',
        prasadPreference: 'North Indian, Diabetic',
        languages: 'Hindi',
        seating: 'Needs chair',
        chanting: '1+',
        inclination: 'Yes',
        spiritualStatus: 'New to KC'
      }
    ]
  };
  
  const result = processSubmission(testData);
  console.log('Test submission result:', result);
}

/**
 * TEST FUNCTION - Run this MANUALLY from Apps Script editor to:
 * 1. Trigger DriveApp authorization (Google will ask you to grant permission)
 * 2. Verify that Drive upload actually works
 * 
 * Steps: Click the ▶ Run button with this function selected.
 * If it asks for authorization, click "Review Permissions" and "Allow".
 */
function testDriveUpload() {
  logToSheet('[testDriveUpload] Starting Drive upload test...');
  
  try {
    // Step 1: Test folder access
    logToSheet('[testDriveUpload] Step 1: Testing DriveApp access...');
    const folderIterator = DriveApp.getFoldersByName('GNH Yatra Payments');
    let folder;
    if (folderIterator.hasNext()) {
      folder = folderIterator.next();
      logToSheet('[testDriveUpload] Found existing folder: ' + folder.getName() + ' (id: ' + folder.getId() + ')');
    } else {
      folder = DriveApp.createFolder('GNH Yatra Payments');
      logToSheet('[testDriveUpload] Created new folder: ' + folder.getId());
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
    
    // Step 2: Create a tiny test file
    logToSheet('[testDriveUpload] Step 2: Creating test file...');
    const testBlob = Utilities.newBlob('This is a test file from GNH Yatra', 'text/plain', 'test_upload.txt');
    const testFile = folder.createFile(testBlob);
    logToSheet('[testDriveUpload] Test file created! URL: ' + testFile.getUrl());
    
    // Step 3: Clean up test file
    testFile.setTrashed(true);
    logToSheet('[testDriveUpload] Test file cleaned up');
    
    logToSheet('[testDriveUpload] ✅ SUCCESS! Drive upload is working correctly.');
    console.log('✅ Drive upload test PASSED! Check the Debug sheet for details.');
    
  } catch (err) {
    logToSheet('[testDriveUpload] ❌ FAILED: ' + err.toString());
    logToSheet('[testDriveUpload] Error stack: ' + err.stack);
    console.log('❌ Drive upload test FAILED: ' + err.toString());
    console.log('You may need to authorize Drive permissions. Go to: Run > Review Permissions');
  }
}

/**
 * Handle GET requests (optional - for testing and fetching existing devotee data)
 */
function doGet(e) {
  try {
    if (e.parameter.action === 'getDevotee') {
      const whatsapp = e.parameter.whatsapp;
      if (!whatsapp) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'WhatsApp number not provided' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      let devoteeData = null;
      let familyMembers = [];
      let devoteeNames = new Set();
      
      // PASS 1: Find all devotee entries with this WhatsApp number
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[4]).trim() === String(whatsapp).trim()) {
          // Found the devotee! We take the first complete record we find.
          if (!devoteeData) {
            devoteeData = {
              name: row[0] || '',
              age: row[2] || '',
              email: row[3] || '',
              whatsapp: row[4] || '',
              gender: row[5] || '',
              prasadPreference: row[6] ? String(row[6]).split(',').map(s=>s.trim()) : [],
              languages: row[7] ? String(row[7]).split(',').map(s=>s.trim()) : []
            };
          }
          if (row[0]) {
            devoteeNames.add(String(row[0]).trim());
          }
        }
      }
      
      // PASS 2: Find all family members linked to these Devotee Names
      if (devoteeNames.size > 0) {
        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          const currentDevoteeName = String(row[0]).trim();
          if (devoteeNames.has(currentDevoteeName)) {
            const individualName = String(row[1]).trim();
            // A member is a family member if they have a distinct individual name
            if (individualName && individualName !== currentDevoteeName) {
              familyMembers.push({
                name: individualName,
                age: row[2] || '',
                phone: row[4] || '',
                gender: row[5] || '',
                prasadPreference: row[6] ? String(row[6]).split(',').map(s=>s.trim()) : [],
                languages: row[7] ? String(row[7]).split(',').map(s=>s.trim()) : [],
                seating: row[8] || '',
                chanting: row[9] || '',
                inclination: row[10] || '',
                spiritualStatus: row[11] || ''
              });
            }
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        devotee: devoteeData,
        family: familyMembers 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'OK', 
        message: 'GNH Yatra 2026 Registration API is running',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

