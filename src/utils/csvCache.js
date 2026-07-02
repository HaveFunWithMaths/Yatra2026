import Papa from 'papaparse';

export const REGISTRATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GIEPXnjsjw7RClGwgOFVOrZemhlqY7jAMl7t2FNkvos/export?format=csv';

export const PAYMENTS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1KqLzcSY92zccRQdBSHeNWXzll2ryE-Mpn9iWHkDRoHk/export?format=csv';

export const ACCOMMODATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1qbw2uXcD4Nezswp6igIXeqB3MrGW_4YRYeamzOggY2A/export?format=csv';

// Cache stores for promises and resolved values
let cache = {
  registration: null,
  payments: null,
  accommodation: null,
};

let promises = {
  registration: null,
  payments: null,
  accommodation: null,
};

export function clearCache() {
  cache = {
    registration: null,
    payments: null,
    accommodation: null,
  };
  promises = {
    registration: null,
    payments: null,
    accommodation: null,
  };
}

export function fetchRegistrationData(force = false) {
  if (!force && cache.registration) {
    return Promise.resolve(cache.registration);
  }
  if (!force && promises.registration) {
    return promises.registration;
  }

  promises.registration = fetch(REGISTRATION_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch registration data');
      return res.text();
    })
    .then((text) => {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      cache.registration = parsed.data;
      return cache.registration;
    })
    .catch((err) => {
      promises.registration = null; // Reset promise so we can retry
      throw err;
    });

  return promises.registration;
}

export function fetchPaymentsData(force = false) {
  if (!force && cache.payments) {
    return Promise.resolve(cache.payments);
  }
  if (!force && promises.payments) {
    return promises.payments;
  }

  promises.payments = fetch(PAYMENTS_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch payments data');
      return res.text();
    })
    .then((text) => {
      // Clean Payments CSV by skipping the first line (if there is a title/header line)
      const firstNewlineIndex = text.indexOf('\n');
      const cleanedText = firstNewlineIndex !== -1
        ? text.substring(firstNewlineIndex + 1)
        : text;

      const parsed = Papa.parse(cleanedText, { header: true, skipEmptyLines: true });
      cache.payments = parsed.data;
      return cache.payments;
    })
    .catch((err) => {
      promises.payments = null;
      throw err;
    });

  return promises.payments;
}

export function fetchAccommodationData(force = false) {
  if (!force && cache.accommodation) {
    return Promise.resolve(cache.accommodation);
  }
  if (!force && promises.accommodation) {
    return promises.accommodation;
  }

  promises.accommodation = fetch(ACCOMMODATION_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch accommodation data');
      return res.text();
    })
    .then((text) => {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      cache.accommodation = parsed.data;
      return cache.accommodation;
    })
    .catch((err) => {
      promises.accommodation = null;
      throw err;
    });

  return promises.accommodation;
}

/**
 * Preloads all three sheets in parallel.
 * Returns a promise that resolves when all are loaded.
 */
export function preloadAll(force = false) {
  if (force) {
    clearCache();
  }
  return Promise.all([
    fetchRegistrationData(force),
    fetchPaymentsData(force),
    fetchAccommodationData(force),
  ]).then(([registration, payments, accommodation]) => ({
    registration,
    payments,
    accommodation,
  }));
}
