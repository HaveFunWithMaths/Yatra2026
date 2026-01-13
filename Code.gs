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
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Process the submission
    const result = processSubmission(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Registration saved successfully', ...result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    console.error('Error processing submission:', error);
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
  
  if (isAlone) {
    // Single devotee submission (attending alone)
    const row = [
      devotee.name,           // A: Devotee Name
      devotee.name,           // B: Individual Name (same as devotee for solo)
      devotee.age,            // C: Age
      devotee.email,          // D: Email
      devotee.whatsapp,       // E: WhatsApp
      devotee.gender,         // F: Gender
      devotee.prasadPreference, // G: Prasadam
      devotee.languages,      // H: Languages
      '',                     // I: Seating (N/A for devotee alone)
      '',                     // J: Chanting (N/A for devotee alone)
      '',                     // K: Inclination (N/A for devotee alone)
      '',                     // L: One Liner (N/A for devotee alone)
      timestamp               // M: Timestamp
    ];
    
    sheet.appendRow(row);
    
    return { rowsAdded: 1, startRow: startRow };
    
  } else {
    // Group submission (devotee + family members)
    const family = data.family || [];
    const totalRows = 1 + family.length; // Devotee + family members
    
    // First row: Devotee's own data
    const devoteeRow = [
      devotee.name,           // A: Devotee Name
      devotee.name,           // B: Individual Name
      devotee.age,            // C: Age
      devotee.email,          // D: Email
      devotee.whatsapp,       // E: WhatsApp
      devotee.gender,         // F: Gender
      devotee.prasadPreference, // G: Prasadam
      devotee.languages,      // H: Languages
      '',                     // I: Seating (N/A for main devotee)
      '',                     // J: Chanting (N/A for main devotee)
      '',                     // K: Inclination (N/A for main devotee)
      '',                     // L: One Liner (N/A for main devotee)
      timestamp               // M: Timestamp
    ];
    
    sheet.appendRow(devoteeRow);
    
    // Subsequent rows: Family members
    family.forEach((member, index) => {
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
        timestamp             // M: Timestamp
      ];
      
      sheet.appendRow(memberRow);
    });
    
    // Merge Column A for this group
    if (family.length > 0) {
      mergeDevoteeColumn(sheet, startRow, startRow + totalRows - 1);
    }
    
    return { rowsAdded: totalRows, startRow: startRow };
  }
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
      'Timestamp'
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
