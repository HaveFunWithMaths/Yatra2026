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
 * Handle POST requests from the React form
 */
function doPost(e) {
  try {
    console.log('[doPost] Request received');
    console.log('[doPost] postData contentType:', e.postData?.type);
    console.log('[doPost] postData length:', e.postData?.contents?.length);
    
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    console.log('[doPost] Parsed data keys:', Object.keys(data));
    console.log('[doPost] Has paymentFile:', !!data.paymentFile);
    if (data.paymentFile) {
      console.log('[doPost] paymentFile keys:', Object.keys(data.paymentFile));
      console.log('[doPost] paymentFile.name:', data.paymentFile.name);
      console.log('[doPost] paymentFile.mimeType:', data.paymentFile.mimeType);
      console.log('[doPost] paymentFile.data length:', data.paymentFile.data?.length);
    }
    
    // Process the submission
    const result = processSubmission(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Registration saved successfully', ...result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    console.error('[doPost] Error processing submission:', error);
    console.error('[doPost] Error stack:', error.stack);
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
    console.log('[processSubmission] Starting file upload to Drive');
    console.log('[processSubmission] File name:', data.paymentFile.name);
    console.log('[processSubmission] File mimeType:', data.paymentFile.mimeType);
    console.log('[processSubmission] File data length:', data.paymentFile.data.length);
    try {
      console.log('[processSubmission] Looking for folder "GNH Yatra Payments"');
      const folderIterator = DriveApp.getFoldersByName("GNH Yatra Payments");
      let folder;
      if (folderIterator.hasNext()) {
        folder = folderIterator.next();
        console.log('[processSubmission] Found existing folder, id:', folder.getId());
      } else {
        folder = DriveApp.createFolder("GNH Yatra Payments");
        console.log('[processSubmission] Created new folder, id:', folder.getId());
        try {
          folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          console.log('[processSubmission] Folder sharing set successfully');
        } catch (shareErr) {
          console.warn('[processSubmission] Could not set folder sharing:', shareErr);
        }
      }
      
      console.log('[processSubmission] Decoding base64 data...');
      const decodedBytes = Utilities.base64Decode(data.paymentFile.data);
      console.log('[processSubmission] Decoded bytes length:', decodedBytes.length);
      
      const blob = Utilities.newBlob(
        decodedBytes, 
        data.paymentFile.mimeType || 'application/octet-stream', 
        data.paymentFile.name || 'Payment_Screenshot'
      );
      console.log('[processSubmission] Blob created, size:', blob.getBytes().length);
      
      const file = folder.createFile(blob);
      paymentLink = file.getUrl();
      console.log('[processSubmission] File uploaded successfully, URL:', paymentLink);
    } catch (e) {
      console.error('[processSubmission] Error uploading file to Drive:', e);
      console.error('[processSubmission] Error stack:', e.stack);
      paymentLink = 'Upload Failed';
    }
  } else {
    console.log('[processSubmission] No paymentFile in data, skipping upload');
  }

  // Check if devotee phone number already exists
  let phoneExists = false;
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  for (let i = 1; i < values.length; i++) {
    // Column E is index 4 (0-based)
    if (String(values[i][4]).trim() === String(devotee.whatsapp).trim()) {
      phoneExists = true;
      break;
    }
  }
  
  let rowsAdded = 0;
  let mergeEndRow = startRow - 1;

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
 * Merge Column A (Devotee Name) for a range of rows
 */
function mergeDevoteeColumn(sheet, startRow, endRow) {
  if (startRow < endRow) {
    const range = sheet.getRange(startRow, 1, endRow - startRow + 1, 1);
    range.merge();
    range.setVerticalAlignment('middle');
    range.setFontWeight('bold');
    range.setBackground('#f3f4f6');
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
 * Handle GET requests (optional - for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'OK', 
      message: 'GNH Yatra 2026 Registration API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
