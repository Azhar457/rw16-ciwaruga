// src/lib/googleSheets.ts
import { google } from "googleapis";
import path from "path";
import { WargaData } from "./auth"; // Pastikan path ini benar

const SPREADSHEET_ID = process.env.SHEET_ID;

// Otentikasi menggunakan service account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Helper untuk mengubah array data menjadi objek
const rowsToObjects = (headers: any[], rows: any[][]): any[] => {
  return rows.map((row) => {
    const obj: { [key: string]: any } = {};
    headers.forEach((header, i) => {
      const value = row[i];
      // Konversi ke angka jika memungkinkan, dengan pengecualian untuk nomor telepon
      if (header !== "no_hp" && value !== "" && !isNaN(Number(value))) {
        obj[header] = Number(value);
      } else {
        obj[header] = value !== null && value !== undefined ? value : "";
      }
    });
    return obj;
  });
};

export async function readGoogleSheet<T>(sheetName: string): Promise<T[]> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error("Spreadsheet ID not configured");
    }
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    const headers = rows.shift() || [];
    return rowsToObjects(headers, rows) as T[];
  } catch (error) {
    console.error(`Error reading from sheet ${sheetName}:`, error);
    // Kembalikan array kosong agar aplikasi tidak crash
    return [];
  }
}

interface WriteOptions {
  action: "append" | "update" | "batch_update_status";
  id?: number;
  data?: any;
  ids?: number[]; // Untuk batch update
  status?: string; // Untuk batch update
}

export async function writeGoogleSheet(
  sheetName: string,
  options: WriteOptions
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error("Spreadsheet ID not configured");
    }
    const { action, data } = options;

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });
    const headers = headerResponse.data.values?.[0];
    if (!headers) throw new Error(`Headers not found in sheet: ${sheetName}`);

    const allData = await readGoogleSheet<WargaData>(sheetName);

    if (action === "append") {
      const maxId = Math.max(0, ...allData.map((item) => item.id || 0));
      const newRowData = { ...data, id: maxId + 1 };
      const newRow = headers.map((header) =>
        newRowData[header] !== undefined ? newRowData[header] : ""
      );

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [newRow] },
      });
      return { success: true };
    }

    if (action === "update" && options.id) {
      const idColIndex = headers.indexOf("id");
      const rowIndexToUpdate =
        allData.findIndex((row) => row.id === options.id) + 2; // +2 karena index 1-based dan ada header

      if (rowIndexToUpdate < 2)
        return { success: false, message: "ID not found" };

      const existingRow = allData[rowIndexToUpdate - 2];
      const updatedRow = headers.map((header) =>
        data[header as keyof WargaData] !== undefined
          ? data[header as keyof WargaData]
          : existingRow[header as keyof WargaData]
      );

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${rowIndexToUpdate}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updatedRow] },
      });
      return { success: true };
    }

    if (
      action === "batch_update_status" &&
      options.ids &&
      options.ids.length > 0
    ) {
      const idColIndex = headers.indexOf("id");
      const statusColIndex = headers.indexOf("status_aktif");
      const updatedAtIndex = headers.indexOf("updated_at");

      if (idColIndex === -1 || statusColIndex === -1) {
        return {
          success: false,
          message: "Required columns ('id', 'status_aktif') not found.",
        };
      }

      const dataForUpdate: { range: string; values: any[][] }[] = [];
      const now = new Date().toISOString();

      options.ids.forEach((id) => {
        const rowIndex = allData.findIndex((row) => row.id === id) + 2;
        if (rowIndex >= 2) {
          const existingRow = allData[rowIndex - 2];
          const newRow = [...headers.map((h) => existingRow[h as keyof WargaData] ?? "")]; // Buat baris baru berdasarkan data yang ada
          newRow[statusColIndex] = options.status || "Non-Aktif";
          if (updatedAtIndex !== -1) newRow[updatedAtIndex] = now;

          dataForUpdate.push({
            range: `${sheetName}!A${rowIndex}`,
            values: [newRow],
          });
        }
      });

      if (dataForUpdate.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: "USER_ENTERED",
            data: dataForUpdate,
          },
        });
      }
      return { success: true };
    }

    return { success: false, message: "Invalid action or options" };
  } catch (error) {
    console.error(`Error writing to sheet ${sheetName}:`, error);
    return { success: false, message: "Failed to update Google Sheets." };
  }
}
/**
 * Filters an array of records to include only those with status_aktif === "Aktif".
 * @param records Array of records, each expected to have a status_aktif property.
 * @returns Filtered array of active records.
 */
export function filterActiveRecords<T extends { status_aktif?: string }>(records: T[]): T[] {
  if (!Array.isArray(records)) {
    console.warn("filterActiveRecords received non-array input:", records);
    return [];
  }
  return records.filter(record => record.status_aktif === "Aktif");
}

// --- Make sure verifyWargaData is also exported if used elsewhere (Placeholder) ---
export async function verifyWargaData(nik: string, kk: string): Promise<WargaData | null> {
  // Placeholder: Implement actual Google Apps Script call or verification logic here
  console.warn("verifyWargaData is a placeholder and needs implementation.");
  // Example: Read sheet and find matching record (less secure without Apps Script)
  // const wargaData = await readGoogleSheet<WargaData>("warga");
  // const found = wargaData.find(w => w.nik_encrypted === nik && w.kk_encrypted === kk); // NOTE: This assumes NIK/KK are stored encrypted/hashed in the sheet
  // return found || null;
  return null; // Return null until implemented
}