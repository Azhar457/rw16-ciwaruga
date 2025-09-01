/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const SHEET_ID = process.env.SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;
const APPS_SCRIPT_URL = process.env.APP_SCRIPT_URL;
const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

if (!SHEET_ID || !API_KEY) {
  console.error("Missing Google Sheets credentials:", {
    hasSheetId: !!SHEET_ID,
    hasApiKey: !!API_KEY,
  });
}

export interface SheetRow {
  [key: string]: string | number | undefined;
}

interface GoogleSheetsResponse {
  values?: string[][];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const sheetCache: Record<string, CacheEntry<any>> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 menit

function processGoogleSheetsResponse<T = SheetRow>(
  data: GoogleSheetsResponse
): T[] {
  const values = data.values || [];
  if (values.length === 0) return [];

  const headers = values[0];
  const rows = values.slice(1);

  return rows.map((row: string[]) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((header: string, i: number) => {
      const value = row[i] || "";
      if (
        !isNaN(Number(value)) &&
        value !== "" &&
        value !== null &&
        typeof value === "string"
      ) {
        if (
          value === "0" ||
          (!value.startsWith("0") &&
            !value.includes("-") &&
            !value.includes("+") &&
            !value.includes("e"))
        ) {
          obj[header] = Number(value);
        } else {
          obj[header] = value;
        }
      } else {
        obj[header] = value;
      }
    });
    return obj as T;
  });
}

export async function readGoogleSheet<T = SheetRow>(
  sheetName: string
): Promise<T[]> {
  const now = Date.now();
  const cacheKey = sheetName;

  // Cek cache
  if (
    sheetCache[cacheKey] &&
    now - sheetCache[cacheKey].timestamp < CACHE_DURATION
  ) {
    return sheetCache[cacheKey].data;
  }

  try {
    if (!SHEET_ID || !API_KEY) {
      console.error("Missing Google Sheets configuration");
      return [];
    }

    const range = `${sheetName}!A:Z`;
    const encodedRange = encodeURIComponent(range);
    const url = `${BASE_URL}/${SHEET_ID}/values/${encodedRange}`;
    const response = await axios.get<GoogleSheetsResponse>(url, {
      params: {
        key: API_KEY,
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      },
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "User-Agent": "RT-RW-Portal/1.0",
      },
    });

    if (response.data.error) {
      console.error("Google Sheets API Error:", response.data.error);
      return [];
    }

    const rows: T[] = processGoogleSheetsResponse<T>(response.data);

    // Simpan ke cache
    sheetCache[cacheKey] = {
      data: rows,
      timestamp: now,
    };

    return rows;
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);

    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    return [];
  }
}

export async function readGoogleSheetRange(
  sheetName: string,
  range: string = "A:Z"
): Promise<string[][]> {
  try {
    if (!SHEET_ID || !API_KEY) {
      console.error("Missing Google Sheets configuration");
      return [];
    }

    const fullRange = `${sheetName}!${range}`;
    const encodedRange = encodeURIComponent(fullRange);
    const url = `${BASE_URL}/${SHEET_ID}/values/${encodedRange}`;

    const response = await axios.get<GoogleSheetsResponse>(url, {
      params: {
        key: API_KEY,
        valueRenderOption: "UNFORMATTED_VALUE",
      },
      timeout: 10000,
    });

    if (response.data.error) {
      console.error("Google Sheets API Error:", response.data.error);
      return [];
    }

    return response.data.values || [];
  } catch (error) {
    console.error(`Error reading range ${range} from ${sheetName}:`, error);
    return [];
  }
}

export async function verifyWargaData(
  nikInput: string,
  kkInput: string
): Promise<SheetRow | null> {
  try {
    console.log("Starting warga verification...");

    const wargaData = await readGoogleSheet("warga");

    if (wargaData.length === 0) {
      console.log("No warga data found");
      return null;
    }

    const foundWarga = wargaData.find((warga: SheetRow) => {
      return (
        String(warga.nik || warga.NIK || warga.nik_encrypted || "") ===
          nikInput &&
        String(
          warga.kk || warga.KK || warga.no_kk || warga.kk_encrypted || ""
        ) === kkInput
      );
    });

    if (foundWarga) {
      console.log("Warga data found and verified");

      const safeData = { ...foundWarga };
      delete safeData.nik;
      delete safeData.kk;
      delete safeData.nik_encrypted;
      delete safeData.kk_encrypted;

      return {
        ...safeData,
        nik_masked:
          nikInput.substring(0, 4) +
          "****" +
          nikInput.substring(nikInput.length - 4),
        kk_masked:
          kkInput.substring(0, 4) +
          "****" +
          kkInput.substring(kkInput.length - 4),
      };
    }

    console.log("Warga data not found");
    return null;
  } catch (error) {
    console.error("Error verifying warga data:", error);
    return null;
  }
}

export function sanitizeWargaData(data: SheetRow[]): SheetRow[] {
  return data.map((item) => {
    const safeData = { ...item };
    delete safeData.nik;
    delete safeData.kk;
    delete safeData.nik_encrypted;
    delete safeData.kk_encrypted;
    return {
      ...safeData,
      nik: "***HIDDEN***",
      kk: "***HIDDEN***",
    };
  });
}

export function filterActiveRecords<T extends Record<string, unknown>>(
  data: T[]
): T[] {
  return data.filter(
    (item) =>
      item.status_aktif === "Aktif" ||
      item.status_aktif === "aktif" ||
      item.status === "Aktif" ||
      item.status === "aktif"
  );
}

export async function getLoker(): Promise<SheetRow[]> {
  try {
    const data = await readGoogleSheet("loker");
    return filterActiveRecords(data);
  } catch (error) {
    console.error("Error getting loker data:", error);
    return [];
  }
}

export async function getUmkm(): Promise<SheetRow[]> {
  try {
    const data = await readGoogleSheet("umkm");
    return filterActiveRecords(data);
  } catch (error) {
    console.error("Error getting UMKM data:", error);
    return [];
  }
}

export async function getBerita(): Promise<SheetRow[]> {
  try {
    const data = await readGoogleSheet("berita");
    return filterActiveRecords(data);
  } catch (error) {
    console.error("Error getting berita data:", error);
    return [];
  }
}

export async function getWarga(): Promise<SheetRow[]> {
  try {
    const data = await readGoogleSheet("warga");
    return sanitizeWargaData(data);
  } catch (error) {
    console.error("Error getting warga data:", error);
    return [];
  }
}

export async function getBph(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("bph");
  } catch (error) {
    console.error("Error getting BPH data:", error);
    return [];
  }
}

export async function getLembagaDesa(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("lembaga_desa");
  } catch (error) {
    console.error("Error getting lembaga desa data:", error);
    return [];
  }
}

export async function getAccount(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("account");
  } catch (error) {
    console.error("Error getting account data:", error);
    return [];
  }
}

export async function getLog(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("log");
  } catch (error) {
    console.error("Error getting log data:", error);
    return [];
  }
}

export async function getBlokirAttempts(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("blokir_attempts");
  } catch (error) {
    console.error("Error getting blokir attempts data:", error);
    return [];
  }
}

export async function getSubscriptions(): Promise<SheetRow[]> {
  try {
    return await readGoogleSheet("subscriptions");
  } catch (error) {
    console.error("Error getting subscriptions data:", error);
    return [];
  }
}

export function searchRecords<T extends Record<string, SheetRow>>(
  data: T[],
  searchField: string,
  searchValue: string
): T[] {
  return data.filter((item) => {
    const fieldValue = String(item[searchField] || "").toLowerCase();
    return fieldValue.includes(searchValue.toLowerCase());
  });
}

export function sortRecords<T extends Record<string, SheetRow>>(
  data: T[],
  sortField: string,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();

    if (order === "asc") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
}

export function paginateRecords<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext: offset + limit < data.length,
      hasPrev: page > 1,
    },
  };
}

export async function getSheetData(range: string): Promise<string[][]> {
  const [sheetName] = range.split("!");
  return await readGoogleSheetRange(sheetName, range.split("!")[1] || "A:Z");
}

export async function writeGoogleSheet(
  sheetName: string,
  data: SheetRow | { action: string; id?: string | number; data?: SheetRow }
): Promise<{ success: boolean; message: string }> {
  try {
    if (!APPS_SCRIPT_URL) {
      return { success: false, message: "Apps Script URL not configured" };
    }

    let payload: unknown;
    if ("action" in data) {
      payload = { sheetName, ...data };
    } else {
      payload = { action: "append", sheetName, data };
    }

    const response = await axios.post(APPS_SCRIPT_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.success) {
      return { success: true, message: "Operasi berhasil" };
    } else {
      return {
        success: false,
        message: response.data.error || "Gagal menulis data",
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, message: "Internal server error" };
  }
}
export async function postSheetData(): Promise<{
  success: boolean;
  message: string;
}> {
  console.warn(
    "Write operations are no longer supported via Google Sheets API"
  );
  console.warn("Please use the admin dashboard for data management");

  return {
    success: false,
    message: "Write operations not supported. Please use admin dashboard.",
  };
}

export async function updateGoogleSheet({
  sheetName,
  id,
  data,
}: {
  sheetName: string;
  id: string | number;
  data: SheetRow;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (!APPS_SCRIPT_URL) {
      return { success: false, message: "Apps Script URL not configured" };
    }
    const payload = {
      action: "update",
      sheetName,
      id,
      data,
    };
    const response = await axios.post(APPS_SCRIPT_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.success) {
      return { success: true, message: "Operasi berhasil" };
    } else {
      return {
        success: false,
        message: response.data.error || "Gagal update data",
      };
    }
  } catch {
    return { success: false, message: "Internal server error" };
  }
}

export async function deleteGoogleSheet(): Promise<{
  success: boolean;
  message: string;
}> {
  return { success: false, message: "Write operations not supported" };
}
