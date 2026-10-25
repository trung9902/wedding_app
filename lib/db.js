import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Supabase environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SUPABASE_KEY || 
                     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                     process.env.SUPABASE_ANON_KEY;

// Detect Serverless / Read-Only Environment (Vercel / AWS Lambda)
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Bundled directory (read-only on Vercel) vs Writable directory (/tmp on Vercel)
const BUNDLED_DATA_DIR = path.join(process.cwd(), 'data');
const WRITABLE_DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'wedding_data')
  : BUNDLED_DATA_DIR;

// In-memory fallback cache (survives warm serverless invocations)
const memoryStore = {
  'wedding.json': null,
  'rsvps.json': null,
  'wishes.json': null,
};

// Singleton Supabase Client
let supabaseClient = null;

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_KEY && 
    SUPABASE_URL.startsWith('http') && 
    SUPABASE_KEY.length > 10 &&
    !SUPABASE_KEY.includes('[SENSITIVE]')
  );
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

// ----------------- RESILIENT SERVERLESS JSON HELPERS -----------------

function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem warning
  }
}

function readJsonFile(fileName, defaultValue = null) {
  // 1. Check in-memory cache first
  if (memoryStore[fileName] !== null) {
    return memoryStore[fileName];
  }

  // 2. Check writable directory (/tmp on Vercel)
  const writablePath = path.join(WRITABLE_DATA_DIR, fileName);
  try {
    if (fs.existsSync(writablePath)) {
      const content = fs.readFileSync(writablePath, 'utf8');
      const parsed = JSON.parse(content);
      memoryStore[fileName] = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read ${writablePath}:`, err.message);
  }

  // 3. Check bundled directory (data/wedding.json)
  const bundledPath = path.join(BUNDLED_DATA_DIR, fileName);
  try {
    if (fs.existsSync(bundledPath)) {
      const content = fs.readFileSync(bundledPath, 'utf8');
      const parsed = JSON.parse(content);
      memoryStore[fileName] = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read ${bundledPath}:`, err.message);
  }

  // 4. Default fallback
  memoryStore[fileName] = defaultValue;
  return defaultValue;
}

function writeJsonFile(fileName, data) {
  // 1. Always update memory store immediately
  memoryStore[fileName] = data;

  // 2. Try writing to writable directory (/tmp on Vercel, data/ in dev)
  try {
    ensureDir(WRITABLE_DATA_DIR);
    const writablePath = path.join(WRITABLE_DATA_DIR, fileName);
    fs.writeFileSync(writablePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Writing to ${WRITABLE_DATA_DIR}/${fileName} failed:`, err.message);
  }

  // 3. In local dev environment, also sync to project data/ folder
  if (!IS_SERVERLESS) {
    try {
      ensureDir(BUNDLED_DATA_DIR);
      const bundledPath = path.join(BUNDLED_DATA_DIR, fileName);
      fs.writeFileSync(bundledPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn(`Writing to ${BUNDLED_DATA_DIR}/${fileName} failed:`, err.message);
    }
  }

  return true;
}

// ----------------- WEDDING CONFIG -----------------

export async function getWeddingConfig() {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wedding_config')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        console.error('Supabase getWeddingConfig error, falling back to local JSON:', error.message);
      } else if (data) {
        const config = { ...(data.config || {}) };
        delete config.adminPin;
        delete config.admin_pin;
        return {
          ...config,
          adminPin: data.admin_pin || 'admin123',
        };
      }
    } catch (err) {
      console.error('Exception in Supabase getWeddingConfig:', err);
    }
  }

  // Fallback to local / serverless JSON
  const localData = readJsonFile('wedding.json', { adminPin: 'admin123' });
  const adminPin = localData.adminPin || localData.admin_pin || 'admin123';
  const config = { ...localData };
  delete config.adminPin;
  delete config.admin_pin;
  return {
    ...config,
    adminPin,
  };
}

export async function getPublicWeddingConfig() {
  const data = await getWeddingConfig();
  if (!data) return {};
  const { adminPin, admin_pin, ...publicData } = data;
  delete publicData.adminPin;
  delete publicData.admin_pin;
  return publicData;
}

export async function updateWeddingConfig(updatedFields = {}, newPin = null) {
  const supabase = getSupabase();
  const currentData = await getWeddingConfig();

  const finalAdminPin = newPin && String(newPin).trim().length > 0 
    ? String(newPin).trim() 
    : (currentData.adminPin || 'admin123');

  // Sanitize incoming fields to prevent mass assignment / adminPin leak
  const safeUpdates = { ...(updatedFields || {}) };
  delete safeUpdates.adminPin;
  delete safeUpdates.admin_pin;
  delete safeUpdates.id;

  const currentConfigClean = { ...currentData };
  delete currentConfigClean.adminPin;
  delete currentConfigClean.admin_pin;

  const newConfig = {
    ...currentConfigClean,
    ...safeUpdates,
  };
  delete newConfig.adminPin;
  delete newConfig.admin_pin;

  // Try Supabase if available
  if (supabase) {
    try {
      const { error } = await supabase
        .from('wedding_config')
        .upsert({
          id: 'default',
          config: newConfig,
          admin_pin: finalAdminPin,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        // Also update local/serverless cache
        writeJsonFile('wedding.json', { ...newConfig, adminPin: finalAdminPin });
        return { ...newConfig, adminPin: finalAdminPin };
      }
      console.warn('Supabase update returned error, falling back to local storage:', error.message);
    } catch (err) {
      console.warn('Supabase updateWeddingConfig failed, falling back to local storage:', err.message);
    }
  }

  // Fallback to local/serverless JSON (never crashes with EROFS)
  const updatedLocal = {
    ...newConfig,
    adminPin: finalAdminPin,
  };
  writeJsonFile('wedding.json', updatedLocal);
  return updatedLocal;
}

// ----------------- RSVPS -----------------

export async function getRsvps() {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getRsvps error, falling back to local JSON:', error.message);
      } else if (data) {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          phone: row.phone || '',
          attending: row.attending || 'yes',
          guestCount: Number(row.guest_count || 1),
          note: row.note || '',
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error('Exception in Supabase getRsvps:', err);
    }
  }

  // Fallback to local JSON
  return readJsonFile('rsvps.json', []);
}

export async function addRsvp({ name, phone = '', attending = 'yes', guestCount = 1, note = '' }) {
  const parsedCount = parseInt(guestCount, 10);
  const safeCount = isNaN(parsedCount) || parsedCount < 1 ? 1 : Math.min(parsedCount, 50);

  const newRsvp = {
    id: 'rsvp-' + Date.now(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    attending: attending === 'no' ? 'no' : 'yes',
    guestCount: safeCount,
    note: String(note || '').trim(),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('rsvps').insert({
        id: newRsvp.id,
        name: newRsvp.name,
        phone: newRsvp.phone,
        attending: newRsvp.attending,
        guest_count: newRsvp.guestCount,
        note: newRsvp.note,
        created_at: newRsvp.createdAt,
      });

      if (!error) {
        const rsvps = readJsonFile('rsvps.json', []);
        rsvps.unshift(newRsvp);
        writeJsonFile('rsvps.json', rsvps);
        return newRsvp;
      }
      console.warn('Supabase addRsvp returned error, falling back to local storage:', error.message);
    } catch (err) {
      console.warn('Supabase addRsvp failed, falling back to local JSON:', err);
    }
  }

  // Local/serverless JSON fallback
  const rsvps = readJsonFile('rsvps.json', []);
  rsvps.unshift(newRsvp);
  writeJsonFile('rsvps.json', rsvps);
  return newRsvp;
}

// ----------------- GUESTBOOK / WISHES -----------------

export async function getWishes() {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getWishes error, falling back to local JSON:', error.message);
      } else if (data) {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          message: row.message,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error('Exception in Supabase getWishes:', err);
    }
  }

  // Fallback to local JSON
  return readJsonFile('wishes.json', []);
}

export async function addWish({ name, message }) {
  const newWish = {
    id: 'wish-' + Date.now(),
    name: String(name || '').trim(),
    message: String(message || '').trim(),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('wishes').insert({
        id: newWish.id,
        name: newWish.name,
        message: newWish.message,
        created_at: newWish.createdAt,
      });

      if (!error) {
        const wishes = readJsonFile('wishes.json', []);
        wishes.unshift(newWish);
        writeJsonFile('wishes.json', wishes);
        return newWish;
      }
      console.warn('Supabase addWish error, falling back to local storage:', error.message);
    } catch (err) {
      console.warn('Supabase addWish failed, falling back to local JSON:', err);
    }
  }

  // Local JSON fallback
  const wishes = readJsonFile('wishes.json', []);
  wishes.unshift(newWish);
  writeJsonFile('wishes.json', wishes);
  return newWish;
}

export async function deleteWish(id) {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('wishes')
        .delete()
        .eq('id', id);

      if (!error) {
        let wishes = readJsonFile('wishes.json', []);
        wishes = wishes.filter(w => w.id !== id);
        writeJsonFile('wishes.json', wishes);
        return true;
      }
      console.warn('Supabase deleteWish error, falling back to local storage:', error.message);
    } catch (err) {
      console.warn('Supabase deleteWish failed, falling back to local JSON:', err);
    }
  }

  // Local JSON fallback
  let wishes = readJsonFile('wishes.json', []);
  wishes = wishes.filter(w => w.id !== id);
  writeJsonFile('wishes.json', wishes);
  return true;
}

// ----------------- ADMIN OPERATIONS -----------------

export async function verifyAdminPin(inputPin) {
  if (!inputPin) return false;
  const config = await getWeddingConfig();
  const validPin = config?.adminPin || 'admin123';
  return String(inputPin).trim() === String(validPin).trim();
}

export async function resetAllData(pin) {
  const isValid = await verifyAdminPin(pin);
  if (!isValid) {
    throw new Error('Sai mã PIN quản trị!');
  }

  const supabase = getSupabase();

  if (supabase) {
    try {
      const [rsvpsDel, wishesDel] = await Promise.all([
        supabase.from('rsvps').delete().neq('id', '___non_existent___'),
        supabase.from('wishes').delete().neq('id', '___non_existent___'),
      ]);

      if (rsvpsDel.error) console.warn('Supabase clear rsvps warning:', rsvpsDel.error);
      if (wishesDel.error) console.warn('Supabase clear wishes warning:', wishesDel.error);
    } catch (err) {
      console.warn('Supabase resetAllData warning:', err);
    }
  }

  // Clear local JSON as well
  writeJsonFile('rsvps.json', []);
  writeJsonFile('wishes.json', []);

  return true;
}
