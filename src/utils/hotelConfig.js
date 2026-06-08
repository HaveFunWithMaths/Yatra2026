/**
 * HOTEL_CONFIG
 * A single source of truth for hotel-specific data.
 * Keys are lowercase substrings that appear in the hotel name from the spreadsheet.
 * Order matters — more specific keys should come before general ones.
 */
export const HOTEL_CONFIG = {
  amrutha: {
    mapLink: 'https://maps.app.goo.gl/VHGSHbP9eeJSDBVq7',
    distance: '110 meters',
  },
  brindavan: {
    mapLink: 'https://maps.app.goo.gl/kZtu9Z5ZPhjJLTKdA',
    distance: '90 meters',
  },
  vrindavan: {
    mapLink: 'https://maps.app.goo.gl/kZtu9Z5ZPhjJLTKdA',
    distance: '90 meters',
  },
  shivananda: {
    mapLink: 'https://maps.app.goo.gl/DqEC39yuJ3Y4P6yi7',
    distance: '350 meters',
  },
  sivananda: {
    mapLink: 'https://maps.app.goo.gl/DqEC39yuJ3Y4P6yi7',
    distance: '350 meters',
  },
};

/**
 * Resolve hotel config from a hotel name string.
 * @param {string} hotelName
 * @returns {{ mapLink: string, distance: string } | null}
 */
export function resolveHotelConfig(hotelName) {
  if (!hotelName) return null;
  const lower = hotelName.toLowerCase();
  const match = Object.entries(HOTEL_CONFIG).find(([key]) => lower.includes(key));
  return match ? match[1] : null;
}

/**
 * NOTICES — General info banners shown after a successful room lookup.
 * Edit this array without touching component render logic.
 */
export const NOTICES = [
  'A lift/elevator is available at all hotels for your convenience.',
];

/**
 * COLUMN_MAP
 * Maps canonical field names to possible CSV header variants.
 * Handles trailing spaces, capitalization differences, and alternate names.
 */
export const COLUMN_MAP = {
  roomNo: ['Room No', 'Room Number', 'Room'],
  hotel: ['Hotel', 'hotel'],
  acType: ['AC/Non AC', 'AC', 'Type'],
  begin: ['Check-in', 'Check In', 'Begin', 'From'],
  end: ['Check-out', 'Check Out', 'End', 'To'],
  floor: ['Floor'],
  cost: ['Cost per Room per Day', 'Cost per Room per Day', 'Cost'],
  roomType: ['Room Type', 'RoomType'],
  extraBed: ['Extra Bed Provided', 'ExtraBed'],
  daysRented: ['No. of Days Rented', 'DaysRented'],
};

/**
 * Resolve a canonical field from a spreadsheet row using COLUMN_MAP.
 * @param {object} row
 * @param {string} field - canonical key from COLUMN_MAP
 * @returns {string}
 */
export function getField(row, field) {
  const variants = COLUMN_MAP[field] || [];
  for (const v of variants) {
    if (row[v] !== undefined && row[v] !== null) {
      return (row[v] || '').toString().trim();
    }
  }
  return '';
}
