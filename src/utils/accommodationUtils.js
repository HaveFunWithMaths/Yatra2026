import { getField } from './hotelConfig';

// Devotee columns in the Accommodation sheet
const DEVOTEE_COLS = ['Devotee1', 'Devotee2', 'Devotee3', 'Devotee4', 'Devotee5', 'Devotee6'];

export function normalize(str) {
  return (str || '').trim().toLowerCase();
}

/**
 * Compare phone numbers or emails resiliently (case-insensitive, strips formatting for phones).
 */
export function matchPhoneOrEmail(val1, val2) {
  const norm1 = normalize(val1);
  const norm2 = normalize(val2);
  if (norm1 === norm2) return true;

  // Phone number matching: strip non-digits and compare last 10 digits
  const digits1 = norm1.replace(/\D/g, '');
  const digits2 = norm2.replace(/\D/g, '');
  if (digits1.length >= 10 && digits2.length >= 10) {
    return digits1.slice(-10) === digits2.slice(-10);
  }
  return false;
}

/**
 * Parse the Registration CSV (forward-fill merged A/B columns) and
 * return the set of Individual Names belonging to the matching group.
 */
export function findGroupNames(rows, input) {
  let lastDevName = '';
  let lastPhone = '';
  let matchedDevoteeName = null;

  // Filter out invalid rows (missing name/age) and forward-fill devotee/phone
  const processed = rows
    .filter(row => row['Individual Name'] && row['Age'])
    .map((row) => {
      const colA = row['Devotee Name']?.trim();
      const colB = row['WhatsApp Number']?.trim();
      if (colA) lastDevName = colA;
      if (colB) lastPhone = colB;
      return {
        ...row,
        _devName: lastDevName,
        _phone: lastPhone,
      };
    });

  // Identify which devotee group the user belongs to
  for (const row of processed) {
    const phone = row._phone || row['WhatsApp Number'] || '';
    const email = row['Email'] || '';
    if (matchPhoneOrEmail(phone, input) || matchPhoneOrEmail(email, input)) {
      matchedDevoteeName = row._devName || row['Devotee Name'];
      break;
    }
  }

  if (!matchedDevoteeName) return null;

  // Collect all Individual Names within that group
  const names = new Set();
  const normDev = normalize(matchedDevoteeName);
  for (const row of processed) {
    const rowDev = normalize(row._devName || row['Devotee Name'] || '');
    if (rowDev === normDev) {
      const indiv = (row['Individual Name'] || '').trim();
      if (indiv) names.add(indiv);
    }
  }

  return { devoteeName: matchedDevoteeName, individualNames: Array.from(names) };
}

/**
 * Parse the Accommodation CSV and return unique room rows that contain
 * at least one of the given names. Also return which of the given names
 * were found (for highlighting).
 */
export function findRooms(accomRows, individualNames) {
  const normNames = individualNames.map(normalize);
  const results = []; // { room, matchedNames }

  for (const row of accomRows) {
    const devoteesInRow = DEVOTEE_COLS.map(col => (row[col] || '').trim()).filter(Boolean);
    const matched = [];

    for (const name of individualNames) {
      const normName = normalize(name);
      if (devoteesInRow.some(d => normalize(d) === normName)) {
        matched.push(name);
      }
    }

    if (matched.length > 0) {
      results.push({
        room: {
          roomNo: getField(row, 'roomNo'),
          hotel: getField(row, 'hotel'),
          acType: getField(row, 'acType'),
          begin: getField(row, 'begin'),
          end: getField(row, 'end'),
          floor: getField(row, 'floor'),
          cost: getField(row, 'cost'),
          roomType: getField(row, 'roomType'),
          extraBed: getField(row, 'extraBed'),
          daysRented: getField(row, 'daysRented'),
          devotees: devoteesInRow,
        },
        matchedNames: matched,
      });
    }
  }

  return results;
}
