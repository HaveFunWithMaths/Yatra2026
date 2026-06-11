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
 * H: Prasadam Output
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
  let rawFileUrl = '';
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
      rawFileUrl = file.getUrl();
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
    sheet.getRange(existingRowIndex, 6).setValue(''); // Relationship is blank for Devotee
    sheet.getRange(existingRowIndex, 7).setValue(devotee.gender);
    sheet.getRange(existingRowIndex, 8).setValue(devotee.prasadPreference);
    sheet.getRange(existingRowIndex, 9).setValue(devotee.languages);
    sheet.getRange(existingRowIndex, 14).setValue(devotee.accommodation || '');
    // Concerns, Timestamp, and Payment Link for existing devotee remain unchanged.
  }

  if (isAlone) {
    if (!phoneExists) {
      const row = [
        devotee.name,           // A: Devotee Name
        devotee.whatsapp,       // B: WhatsApp Number
        devotee.name,           // C: Individual Name (same as devotee for solo)
        devotee.age,            // D: Age
        devotee.email,          // E: Email
        '',                     // F: Relationship (Blank for Devotee)
        devotee.gender,         // G: Gender
        devotee.prasadPreference, // H: Prasadam Output
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
        '',                     // F: Relationship (Blank for Devotee)
        devotee.gender,         // G: Gender
        devotee.prasadPreference, // H: Prasadam Output
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
        member.prasadPreference, // H: Prasadam Output
        member.languages,     // I: Languages
        member.seating,       // J: Seating Preference
        member.chanting,      // K: Chanting Status
        '',                   // L: Inclination (Deprecated)
        member.spiritualStatus, // M: One Liner
        member.accommodation || devotee.accommodation || '', // N: Accommodation
        devotee.concerns || '', // O: Concerns
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
  
  // Send automated email notification
  sendRegistrationEmail(data, timestamp, rawFileUrl);
  
  return { rowsAdded, startRow };
}

/**
 * Merge Column A (Devotee Name), Column B (WhatsApp Number), Column O (Concerns), Column P (Timestamp) and Column Q (Payment Link) for a range of rows
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

    // Merge Column O (Concerns, index 15)
    const rangeO = sheet.getRange(startRow, 15, endRow - startRow + 1, 1);
    rangeO.merge();
    rangeO.setVerticalAlignment('middle');

    // Merge Column P (Timestamp, index 16)
    const rangeP = sheet.getRange(startRow, 16, endRow - startRow + 1, 1);
    rangeP.merge();
    rangeP.setVerticalAlignment('middle');
    
    // Merge Column Q (Payment Link, index 17)
    const rangeQ = sheet.getRange(startRow, 17, endRow - startRow + 1, 1);
    rangeQ.merge();
    rangeQ.setVerticalAlignment('middle');
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
      'Prasadam Output',
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
      
      // CREATE AN UNMERGED VIEW OF THE DATA
      // Since Columns A and B are merged, reading the sheet returns empty strings for subsequent rows in the merged range.
      let lastDevName = '';
      let lastWa = '';
      const unmergedValues = values.map((row, idx) => {
        if (idx === 0) return row; // Header
        
        let colA = String(row[0]).trim();
        let colB = String(row[1]).trim();
        
        if (colA) lastDevName = colA; 
        else colA = lastDevName;
        
        if (colB) lastWa = colB;
        else colB = lastWa;
        
        return [colA, colB, ...row.slice(2)];
      });
      
      // PASS 1: Find all devotee entries with this WhatsApp number
      for (let i = 1; i < unmergedValues.length; i++) {
        const row = unmergedValues[i];
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
        for (let i = 1; i < unmergedValues.length; i++) {
          const row = unmergedValues[i];
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
                spiritualStatus: row[12] || '',
                accommodation: row[13] || ''
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

/**
 * Send an automated email notification with registration details
 */
function sendRegistrationEmail(data, timestamp, rawFileUrl) {
  try {
    const devotee = data.devotee;
    const isAlone = data.alone === true;
    const family = data.family || [];
    
    let emailBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">';
    // Header
    emailBody += '<div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">';
    emailBody += '<h2 style="margin: 0; font-size: 20px;">GNH Yatra 2026 - New Registration</h2>';
    emailBody += '</div>';
    
    // Main content
    emailBody += '<div style="padding: 20px;">';
    emailBody += '<h3 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">Devotee (Group Leader) Details</h3>';
    emailBody += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold; width: 150px;">Name:</td><td style="padding: 6px 0;">${devotee.name}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">WhatsApp Number:</td><td style="padding: 6px 0;">${devotee.whatsapp}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${devotee.email}" style="color: #4f46e5;">${devotee.email}</a></td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Age / Gender:</td><td style="padding: 6px 0;">${devotee.age} / ${devotee.gender}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Prasadam:</td><td style="padding: 6px 0;">${devotee.prasadPreference}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Languages:</td><td style="padding: 6px 0;">${devotee.languages}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Accommodation:</td><td style="padding: 6px 0;">${devotee.accommodation || 'None'}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Concerns:</td><td style="padding: 6px 0;">${devotee.concerns || 'None'}</td></tr>`;
    emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Timestamp:</td><td style="padding: 6px 0;">${timestamp}</td></tr>`;
    if (rawFileUrl) {
      emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Payment Link:</td><td style="padding: 6px 0;"><a href="${rawFileUrl}" style="color: #4f46e5; text-decoration: underline; font-weight: bold;" target="_blank">View Payment Screenshot</a></td></tr>`;
    } else {
      emailBody += `<tr><td style="padding: 6px 0; font-weight: bold;">Payment Link:</td><td style="padding: 6px 0; color: #ef4444; font-style: italic;">No payment file uploaded</td></tr>`;
    }
    emailBody += '</table>';
    
    // Family members
    if (!isAlone && family.length > 0) {
      emailBody += '<h3 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 20px;">Family / Group Members (' + family.length + ')</h3>';
      family.forEach((member, index) => {
        emailBody += `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px;">`;
        emailBody += `<h4 style="margin: 0 0 8px 0; color: #1e293b;">Member #${index + 1}: ${member.name}</h4>`;
        emailBody += '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold; width: 150px;">Age / Gender:</td><td style="padding: 4px 0;">${member.age} / ${member.gender}</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Relationship:</td><td style="padding: 4px 0;">${member.relationship || 'N/A'}</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Prasadam:</td><td style="padding: 4px 0;">${member.prasadPreference || 'N/A'}</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Languages:</td><td style="padding: 4px 0;">${member.languages || 'N/A'}</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Accommodation:</td><td style="padding: 4px 0;">${member.accommodation || 'N/A'}</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Seating / Chanting:</td><td style="padding: 4px 0;">${member.seating || 'N/A'} / Chants ${member.chanting || '0'} rounds</td></tr>`;
        emailBody += `<tr><td style="padding: 4px 0; font-weight: bold;">Spiritual Status:</td><td style="padding: 4px 0;">${member.spiritualStatus || 'N/A'}</td></tr>`;
        emailBody += '</table>';
        emailBody += '</div>';
      });
    }
    
    emailBody += '</div>'; // End padding
    emailBody += '<div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">';
    emailBody += 'This is an automated email from the GNH Yatra 2026 Registration Portal.';
    emailBody += '</div>';
    emailBody += '</div>'; // End container
    
    // Send email to all recipients
    const recipients = 'nayakgopal1998@gmail.com, krishnakishore.julakanti@gmail.com, kondaakash012004@gmail.com, ssvarun100@gmail.com, maheedharcherukuri@gmail.com';
    const subject = `GNH Yatra 2026: New Registration - ${devotee.name} (${isAlone ? 'Solo' : 'Group of ' + (family.length + 1)})`;
    
    logToSheet('[email] Sending registration email to: ' + recipients);
    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: emailBody
    });
    logToSheet('[email] Email sent successfully');
  } catch (emailErr) {
    logToSheet('[email] ERROR sending email: ' + emailErr.toString());
    logToSheet('[email] ERROR stack: ' + emailErr.stack);
  }
}

