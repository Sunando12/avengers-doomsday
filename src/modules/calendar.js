/**
 * Google Calendar Integration Module
 * Handles OAuth 2.0, event fetching, event creation, direct 1-click links, and demo fallback.
 */

import { saveData, loadData, removeData, STORAGE_KEYS } from './storage.js';
import { showToast } from './toast.js';
import { MOCK_EVENTS } from '../data/mock-data.js';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let isConnected = false;

// Callbacks for UI updates
let onConnectionChange = null;
let onEventsLoaded = null;

/**
 * Retrieve active credentials from localStorage or environment variables.
 */
export function getCredentials() {
  const saved = loadData(STORAGE_KEYS.GOOGLE_CREDENTIALS, {});
  return {
    clientId: saved.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: saved.apiKey || import.meta.env.VITE_GOOGLE_API_KEY || '',
  };
}

/**
 * Save user-entered Google credentials.
 */
export function saveCredentials(clientId, apiKey) {
  saveData(STORAGE_KEYS.GOOGLE_CREDENTIALS, { clientId, apiKey });
  // Re-initialize clients with new credentials
  reinitClients();
}

/**
 * Clear stored credentials.
 */
export function clearCredentials() {
  removeData(STORAGE_KEYS.GOOGLE_CREDENTIALS);
  disconnectCalendar();
}

/**
 * Initialize the Google Calendar module.
 * @param {Object} callbacks
 */
export function initCalendar(callbacks = {}) {
  if (callbacks.onConnectionChange) onConnectionChange = callbacks.onConnectionChange;
  if (callbacks.onEventsLoaded) onEventsLoaded = callbacks.onEventsLoaded;

  const creds = getCredentials();

  if (!creds.clientId || !creds.apiKey) {
    setDemoMode();
    return;
  }

  reinitClients();
}

function reinitClients() {
  const { clientId, apiKey } = getCredentials();
  if (!clientId || !apiKey) {
    setDemoMode();
    return;
  }

  // Load GAPI
  if (window.gapi) {
    window.gapi.load('client', () => initializeGapiClient(apiKey));
  } else {
    const checkGapi = setInterval(() => {
      if (window.gapi) {
        clearInterval(checkGapi);
        window.gapi.load('client', () => initializeGapiClient(apiKey));
      }
    }, 200);
  }

  // GIS token client
  if (window.google && window.google.accounts) {
    initializeGisClient(clientId);
  } else {
    const checkGis = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGis);
        initializeGisClient(clientId);
      }
    }, 200);
  }

  // Check for stored token
  const storedToken = loadData(STORAGE_KEYS.GOOGLE_TOKEN);
  if (storedToken && storedToken.access_token) {
    tryRestoreSession(storedToken);
  }
}

async function initializeGapiClient(apiKey) {
  try {
    await window.gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
  } catch (err) {
    console.error('[Calendar] GAPI init error:', err);
    setDemoMode();
  }
}

function initializeGisClient(clientId) {
  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: handleTokenResponse,
    });
    gisInited = true;
  } catch (err) {
    console.error('[Calendar] GIS init error:', err);
    setDemoMode();
  }
}

function handleTokenResponse(response) {
  if (response.error) {
    console.error('[Calendar] Token error:', response);
    showToast('Google Calendar authentication failed: ' + (response.error_description || response.error), 'error');
    return;
  }
  saveData(STORAGE_KEYS.GOOGLE_TOKEN, response);
  setConnected(true);
  showToast('Google Calendar successfully connected!', 'success');
  fetchEvents();
}

async function tryRestoreSession(token) {
  if (!gapiInited) {
    setTimeout(() => tryRestoreSession(token), 400);
    return;
  }
  try {
    window.gapi.client.setToken(token);
    setConnected(true);
    fetchEvents();
  } catch {
    removeData(STORAGE_KEYS.GOOGLE_TOKEN);
    setDemoMode();
  }
}

/**
 * Trigger Google OAuth sign-in flow or prompt for credentials if missing.
 */
export function connectCalendar(onPromptNeeded) {
  const { clientId, apiKey } = getCredentials();
  if (!clientId || !apiKey) {
    if (onPromptNeeded) {
      onPromptNeeded();
    } else {
      showToast('Please enter your Google API credentials.', 'warning');
    }
    return;
  }

  if (!tokenClient) {
    initializeGisClient(clientId);
  }

  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    showToast('Initializing Google Identity Services... please click again in a moment.', 'info');
  }
}

/**
 * Disconnect Google Calendar.
 */
export function disconnectCalendar() {
  const token = loadData(STORAGE_KEYS.GOOGLE_TOKEN);
  if (token && window.google) {
    try {
      window.google.accounts.oauth2.revoke(token.access_token);
    } catch { /* ignore */ }
  }
  removeData(STORAGE_KEYS.GOOGLE_TOKEN);
  if (window.gapi && window.gapi.client) {
    window.gapi.client.setToken(null);
  }
  setConnected(false);
  showToast('Google Calendar disconnected.', 'info');
  setDemoMode();
}

/**
 * Fetch upcoming events from Google Calendar.
 */
export async function fetchEvents() {
  if (!isConnected || !window.gapi?.client?.calendar) {
    loadDemoEvents();
    return;
  }
  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 25,
      orderBy: 'startTime',
    });
    const items = response.result.items || [];
    if (onEventsLoaded) onEventsLoaded(items);
    showToast(`Loaded ${items.length} live events from Google Calendar.`, 'success');
  } catch (err) {
    console.error('[Calendar] Fetch error:', err);
    showToast('Failed to fetch from Google Calendar. Showing local events.', 'warning');
    loadDemoEvents();
  }
}

/**
 * Create a new event on Google Calendar or local state.
 */
export async function createEvent(eventData) {
  const startIso = new Date(eventData.startDateTime).toISOString();
  const endIso = new Date(eventData.endDateTime).toISOString();

  const event = {
    summary: eventData.summary,
    description: eventData.description || 'Tactical mission briefing scheduled via Avengers Command Center.',
    start: { dateTime: startIso, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: endIso, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    location: eventData.location || 'Avengers Compound / Earth-616',
  };

  if (!isConnected || !window.gapi?.client?.calendar) {
    // Demo mode: add to local events
    const localEvent = {
      id: 'ev_' + Date.now(),
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
    };
    const localEvents = loadData(STORAGE_KEYS.EVENTS, []);
    localEvents.push(localEvent);
    saveData(STORAGE_KEYS.EVENTS, localEvents);
    if (onEventsLoaded) onEventsLoaded(localEvents);
    showToast('Event saved locally! You can sync to Google Calendar anytime.', 'success');
    return localEvent;
  }

  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    showToast('Event synced directly to your Google Calendar!', 'success');
    fetchEvents();
    return response.result;
  } catch (err) {
    console.error('[Calendar] Create event error:', err);
    showToast('Failed to create event on Google Calendar API.', 'error');
    return null;
  }
}

/**
 * Delete an event.
 */
export async function deleteEvent(eventId) {
  if (!isConnected || !window.gapi?.client?.calendar) {
    let localEvents = loadData(STORAGE_KEYS.EVENTS, []);
    localEvents = localEvents.filter(e => e.id !== eventId);
    saveData(STORAGE_KEYS.EVENTS, localEvents);
    if (onEventsLoaded) onEventsLoaded(localEvents);
    showToast('Event deleted.', 'info');
    return;
  }

  try {
    await window.gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    showToast('Event removed from Google Calendar.', 'info');
    fetchEvents();
  } catch (err) {
    console.error('[Calendar] Delete error:', err);
    showToast('Failed to delete event from Google Calendar.', 'error');
  }
}

/**
 * Generate a 1-click Google Calendar Web Intent URL
 * Works for ANY user immediately without API setup!
 */
export function getGoogleCalendarUrl(event) {
  const title = encodeURIComponent(event.summary || event.title || 'Avengers Tactical Mission');
  const details = encodeURIComponent(event.description || 'Tactical mission logged from Avengers Doomsday Command Center.');
  const location = encodeURIComponent(event.location || 'Avengers Compound');

  const startDate = new Date(event.start?.dateTime || event.startDateTime || event.deadline || Date.now());
  const endDate = new Date(event.end?.dateTime || event.endDateTime || (startDate.getTime() + 3600000));

  const formatGCalDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Download event as standard .ics iCalendar file for 1-click import into Google Calendar or Outlook
 */
export function downloadIcs(event) {
  const summary = event.summary || event.title || 'Avengers Mission';
  const description = event.description || 'Mission generated by Avengers Command Center';
  const location = event.location || 'Earth-616';

  const startDate = new Date(event.start?.dateTime || event.startDateTime || event.deadline || Date.now());
  const endDate = new Date(event.end?.dateTime || event.endDateTime || (startDate.getTime() + 3600000));

  const pad = (n) => String(n).padStart(2, '0');
  const formatIcsDate = (d) => {
    return d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Avengers Doomsday//Mission Command Center//EN',
    'BEGIN:VEVENT',
    `UID:doomsday_${Date.now()}@avengers.marvel`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${summary.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded .ics calendar file!', 'success');
}

// ─── Internal Helpers ───────────────────────────────────────────

function setConnected(connected) {
  isConnected = connected;
  if (onConnectionChange) onConnectionChange(connected);
}

function setDemoMode() {
  setConnected(false);
  loadDemoEvents();
}

function loadDemoEvents() {
  let localEvents = loadData(STORAGE_KEYS.EVENTS);
  if (!localEvents || localEvents.length === 0) {
    localEvents = MOCK_EVENTS.map(e => ({
      ...e,
      start: { dateTime: new Date(Date.now() + Math.random() * 4 * 86400000 + 3600000).toISOString() },
      end: { dateTime: new Date(Date.now() + Math.random() * 4 * 86400000 + 7200000).toISOString() },
    }));
    saveData(STORAGE_KEYS.EVENTS, localEvents);
  }
  if (onEventsLoaded) onEventsLoaded(localEvents);
}

export function isCalendarConnected() {
  return isConnected;
}
