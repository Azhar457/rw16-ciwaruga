import axios from "axios";

const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL;
const APP_SCRIPT_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL as string;

if (!SHEET_ID || !API_KEY || !API_URL) {
  throw new Error("Missing Google Sheets env variables");
}
/**
 * Get data from Google Sheets
 * @param range contoh: "warga!A:Z"
 */
export async function getSheetData(range: string) {
  try {
    const url = `${API_URL}/${SHEET_ID}/values/${encodeURIComponent(
      range
    )}?key=${API_KEY}`;
    const res = await axios.get(url);
    return res.data.values || [];
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

/**
 * Post data to Google Sheets (via App Script)
 * Data bisa berupa object { nama: "Budi", nik: "1234", ... }
 */
export async function postSheetData(data: Record<string, unknown>) {
  if (!APP_SCRIPT_URL) throw new Error("Missing APP_SCRIPT_URL");

  try {
    const res = await axios.post(APP_SCRIPT_URL, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Error posting sheet data:", error);
    throw error;
  }
}

// Shortcut khusus untuk sheet RW
export async function getWarga() {
  return getSheetData("warga!A:Z");
}
// export async function getUmkm() {
//   return getSheetData("umkm!A:Z");
// }
export async function getLoker() {
  return getSheetData("loker!A:Z");
}
export async function getBph() {
  return getSheetData("bph!A:Z");
}
export async function getLembaga() {
  return getSheetData("lembaga_desa!A:Z");
}
export async function getBerita() {
  return getSheetData("berita!A:Z");
}

// GET UMKM data
export async function getUmkm() {
  try {
    const res = await axios.get(`${APP_SCRIPT_URL}?sheet=umkm`);
    return res.data;
  } catch (err) {
    console.error("Error fetching UMKM:", err);
    return [];
  }
}

// POST UMKM data
export async function postUmkm(data: {
  nama: string;
  bidang: string;
  kontak: string;
}) {
  try {
    const res = await axios.post(APP_SCRIPT_URL, {
      sheet: "umkm",
      data,
    });
    return res.data;
  } catch (err) {
    console.error("Error posting UMKM:", err);
    throw err;
  }
}
