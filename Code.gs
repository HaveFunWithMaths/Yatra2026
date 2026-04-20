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
 * B: WhatsApp Number - MERGED for group submissions
 * C: Individual Name
 * D: Age
 * E: Email (Devotee only)
 * F: Relationship
 * G: Gender
 * H: Prasadam
 * I: Languages
 * J: Seating Preference (Family only)
 * K: Chanting Status (Family only)
 * L: Inclination (Family only) - Deprecated
 * M: One Liner / Spiritual Status (Family only)
 * N: Accommodation
 * O: Concerns
 * P: Submission Timestamp
 * Q: Payment Link
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
      paymentLink = `=HYPERLINK("${file.getUrl()}", "Payment Link")`;
      logToSheet('[upload] File uploaded successfully, URL: ' + file.getUrl());
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
    // Column B is index 1 (0-based)
    if (String(values[i][1]).trim() === String(devotee.whatsapp).trim()) {
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
    sheet.getRange(existingRowIndex, 2).setValue(devotee.whatsapp);
    sheet.getRange(existingRowIndex, 3).setValue(devotee.name);
    sheet.getRange(existingRowIndex, 4).setValue(devotee.age);
    sheet.getRange(existingRowIndex, 5).setValue(devotee.email);
    sheet.getRange(existingRowIndex, 6).setValue(devotee.whatsapp); // Individual phone same as WhatsApp
    sheet.getRange(existingRowIndex, 7).setValue(devotee.gender);
    sheet.getRange(existingRowIndex, 8).setValue(devotee.prasadPreference);
    sheet.getRange(existingRowIndex, 9).setValue(devotee.languages);
    sheet.getRange(existingRowIndex, 14).setValue(devotee.accommodation || '');
    sheet.getRange(existingRowIndex, 15).setValue(devotee.concerns || '');
    sheet.getRange(existingRowIndex, 16).setValue(timestamp);
    if (paymentLink) {
        sheet.getRange(existingRowIndex, 17).setValue(paymentLink);
    }
  }

  if (isAlone) {
    if (!phoneExists) {
      const row = [
        devotee.name,           // A: Devotee Name
        devotee.whatsapp,       // B: WhatsApp Number
        devotee.name,           // C: Individual Name (same as devotee for solo)
        devotee.age,            // D: Age
        devotee.email,          // E: Email
        devotee.whatsapp,       // F: Relationship (Self)
        devotee.gender,         // G: Gender
        devotee.prasadPreference, // H: Prasadam
        devotee.languages,      // I: Languages
        '',                     // J: Seating
        '',                     // K: Chanting
        '',                     // L: Inclination (Deprecated)
        '',                     // M: One Liner
        devotee.accommodation || '', // N: Accommodation
        devotee.concerns || '',      // O: Concerns
        timestamp,              // P: Timestamp
        paymentLink             // Q: Payment Link
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
        devotee.whatsapp,       // B: WhatsApp Number
        devotee.name,           // C: Individual Name
        devotee.age,            // D: Age
        devotee.email,          // E: Email
        devotee.whatsapp,       // F: Relationship (Self)
        devotee.gender,         // G: Gender
        devotee.prasadPreference, // H: Prasadam
        devotee.languages,      // I: Languages
        '',                     // J: Seating
        '',                     // K: Chanting
        '',                     // L: Inclination (Deprecated)
        '',                     // M: One Liner
        devotee.accommodation || '', // N: Accommodation
        devotee.concerns || '',      // O: Concerns
        timestamp,              // P: Timestamp
        paymentLink             // Q: Payment Link
      ];
      sheet.appendRow(devoteeRow);
      rowsAdded++;
      currentRow++;
    }
    
    // Subsequent rows: Family members
    family.forEach((member) => {
      const memberRow = [
        devotee.name,         // A: Devotee Name (will be merged)
        devotee.whatsapp,     // B: WhatsApp Number (will be merged)
        member.name,          // C: Individual Name
        member.age,           // D: Age
        '',                     // E: Email (blank for family)
        member.relationship || '', // F: Relationship
        member.gender,        // G: Gender
        member.prasadPreference, // H: Prasadam
        member.languages,     // I: Languages
        member.seating,       // J: Seating Preference
        member.chanting,      // K: Chanting Status
        '',                   // L: Inclination (Deprecated)
        member.spiritualStatus, // M: One Liner
        devotee.accommodation || '', // N: Accommodation (inherited from main devotee)
        '',                   // O: Concerns
        timestamp,            // P: Timestamp
        paymentLink           // Q: Payment Link
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
  
  // Add Box Outline to sheet which makes it easy to Read.
  if (rowsAdded > 0) {
    sheet.getRange(startRow, 1, rowsAdded, 17).setBorder(true, true, true, true, true, true);
  }
  
  return { rowsAdded, startRow };
}

/**
 * Merge Column A (Devotee Name), Column B (WhatsApp Number) and Column O (Payment Link) for a range of rows
 */
function mergeDevoteeColumn(sheet, startRow, endRow) {
  if (startRow < endRow) {
    // Merge Column A (Devotee Name)
    const rangeA = sheet.getRange(startRow, 1, endRow - startRow + 1, 1);
    rangeA.merge();
    rangeA.setVerticalAlignment('middle');
    rangeA.setFontWeight('bold');
    rangeA.setBackground('#f3f4f6');
    
    // Merge Column B (WhatsApp Number)
    const rangeB = sheet.getRange(startRow, 2, endRow - startRow + 1, 1);
    rangeB.merge();
    rangeB.setVerticalAlignment('middle');
    rangeB.setFontWeight('bold');
    rangeB.setBackground('#f3f4f6');
    
    // Merge Column Q (Payment Link, index 17)
    const rangeO = sheet.getRange(startRow, 17, endRow - startRow + 1, 1);
    rangeO.merge();
    rangeO.setVerticalAlignment('middle');
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
      'WhatsApp Number',
      'Individual Name',
      'Age',
      'Email',
      'Relationship',
      'Gender',
      'Prasadam',
      'Languages',
      'Seating',
      'Chanting',
      'Inclination (Old)',
      'Spiritual Status',
      'Accommodation',
      'Concerns',
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
    sheet.setColumnWidth(1, 150);  // Devotee Name (A)
    sheet.setColumnWidth(2, 120);  // WhatsApp Number (B)
    sheet.setColumnWidth(3, 150);  // Individual Name (C)
    sheet.setColumnWidth(4, 60);   // Age (D)
    sheet.setColumnWidth(5, 200);  // Email (E)
    sheet.setColumnWidth(6, 150);  // Relationship (F)
    sheet.setColumnWidth(7, 80);   // Gender (G)
    sheet.setColumnWidth(8, 150);  // Prasadam (H)
    sheet.setColumnWidth(9, 150);  // Languages (I)
    sheet.setColumnWidth(10, 120); // Seating (J)
    sheet.setColumnWidth(11, 100); // Chanting (K)
    sheet.setColumnWidth(12, 100); // Inclination (Old) (L)
    sheet.setColumnWidth(13, 250); // Spiritual Status (M)
    sheet.setColumnWidth(14, 150); // Accommodation (N)
    sheet.setColumnWidth(15, 250); // Concerns (O)
    sheet.setColumnWidth(16, 180); // Timestamp (P)
    sheet.setColumnWidth(17, 250); // Payment Link (Q)
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
        relationship: 'Spouse',
        prasadPreference: 'South Indian',
        languages: 'Telugu',
        seating: 'Can sit below',
        chanting: '4+',
        spiritualStatus: 'Regular temple visitor'
      },
      {
        name: 'Family Member 2',
        age: '10',
        gender: 'Male',
        relationship: 'Son',
        prasadPreference: 'North Indian',
        languages: 'Hindi',
        seating: 'Needs chair',
        chanting: '1+',
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
        if (String(row[1]).trim() === String(whatsapp).trim()) { // Checking Column B
          // Found the devotee! We take the first complete record we find.
          if (!devoteeData) {
            devoteeData = {
              name: row[0] || '',
              age: row[3] || '',
              email: row[4] || '',
              whatsapp: row[1] || '',
              gender: row[6] || '',
              prasadPreference: row[7] ? String(row[7]).trim() : '',
              languages: row[8] ? String(row[8]).split(',').map(s=>s.trim()) : [],
              accommodation: row[13] || '',
              concerns: row[14] || ''
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
            const individualName = String(row[2]).trim(); // Individual Name is Column C
            // A member is a family member if they have a distinct individual name
            if (individualName && individualName !== currentDevoteeName) {
              familyMembers.push({
                name: individualName,
                age: row[3] || '',
                relationship: row[5] || '', // Relationship is Column F
                gender: row[6] || '',
                prasadPreference: row[7] ? String(row[7]).trim() : '',
                languages: row[8] ? String(row[8]).split(',').map(s=>s.trim()) : [],
                seating: row[9] || '',
                chanting: row[10] || '',
                spiritualStatus: row[12] || ''
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

