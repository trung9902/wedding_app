import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SUPABASE_KEY || 
                     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                     process.env.SUPABASE_ANON_KEY;

// Local JSON file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const WEDDING_FILE = path.join(DATA_DIR, 'wedding.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');

// Singleton Supabase Client
let supabaseClient = null;

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_KEY && 
    SUPABASE_URL.startsWith('http') && 
    SUPABASE_KEY.length > 10
  );
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

// ----------------- LOCAL JSON HELPERS -----------------

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile(filePath, defaultValue = null) {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      if (defaultValue !== null) {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
        return defaultValue;
      }
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
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
      } else {
        // First run on Supabase: Seed default row from local JSON if available
        const localData = readJsonFile(WEDDING_FILE, {});
        const adminPin = localData.adminPin || localData.admin_pin || 'admin123';
        const configData = { ...localData };
        delete configData.adminPin;
        delete configData.admin_pin;
        
        await supabase.from('wedding_config').insert({
          id: 'default',
          config: configData,
          admin_pin: adminPin,
        });

        return { ...configData, adminPin };
      }
    } catch (err) {
      console.error('Exception in Supabase getWeddingConfig:', err);
    }
  }

  // Fallback to local JSON
  const localData = readJsonFile(WEDDING_FILE, { adminPin: 'admin123' });
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

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }

      return { ...newConfig, adminPin: finalAdminPin };
    } catch (err) {
      console.error('Supabase updateWeddingConfig failed:', err);
      throw err;
    }
  }

  // Fallback to local JSON
  const updatedLocal = {
    ...newConfig,
    adminPin: finalAdminPin,
  };
  writeJsonFile(WEDDING_FILE, updatedLocal);
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
  return readJsonFile(RSVPS_FILE, []);
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

      if (error) {
        throw new Error(`Supabase addRsvp error: ${error.message}`);
      }

      return newRsvp;
    } catch (err) {
      console.error('Supabase addRsvp failed, falling back to local JSON:', err);
      // If error occurs, try fallback
    }
  }

  // Local JSON fallback
  const rsvps = readJsonFile(RSVPS_FILE, []);
  rsvps.unshift(newRsvp);
  writeJsonFile(RSVPS_FILE, rsvps);
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
  return readJsonFile(WISHES_FILE, []);
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

      if (error) {
        throw new Error(`Supabase addWish error: ${error.message}`);
      }

      return newWish;
    } catch (err) {
      console.error('Supabase addWish failed, falling back to local JSON:', err);
    }
  }

  // Local JSON fallback
  const wishes = readJsonFile(WISHES_FILE, []);
  wishes.unshift(newWish);
  writeJsonFile(WISHES_FILE, wishes);
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

      if (error) {
        throw new Error(`Supabase deleteWish error: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error('Supabase deleteWish failed, falling back to local JSON:', err);
    }
  }

  // Local JSON fallback
  let wishes = readJsonFile(WISHES_FILE, []);
  wishes = wishes.filter(w => w.id !== id);
  writeJsonFile(WISHES_FILE, wishes);
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

      if (rsvpsDel.error) console.error('Supabase clear rsvps error:', rsvpsDel.error);
      if (wishesDel.error) console.error('Supabase clear wishes error:', wishesDel.error);
    } catch (err) {
      console.error('Supabase resetAllData error:', err);
    }
  }

  // Clear local JSON as well
  writeJsonFile(RSVPS_FILE, []);
  writeJsonFile(WISHES_FILE, []);

  return true;
}
