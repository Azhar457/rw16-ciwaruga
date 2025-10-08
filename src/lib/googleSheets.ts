// src/lib/googleSheets.ts
import { google } from "googleapis";
import path from "path";
import { WargaData } from "./auth";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Otentikasi menggunakan service account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Helper untuk mengubah array data menjadi objek
const rowsToObjects = (headers: any[], rows: any[][]) => {
  return rows.map((row) => {
    const obj: { [key: string]: any } = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });
};

// Fungsi Baru: readGoogleSheet
export async function readGoogleSheet<T>(sheetName: string): Promise<T[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows.shift() || [];
    return rowsToObjects(headers, rows) as T[];
  } catch (error) {
    console.error(`Error reading from sheet ${sheetName}:`, error);
    throw new Error("Failed to retrieve data from Google Sheets.");
  }
}

interface WriteOptions {
  action: "append" | "update" | "batch_update_status";
  id?: number | number[]; // Bisa satu ID atau array ID
  data?: any;
  ids?: number[]; // Untuk batch update
  status?: string; // Untuk batch update
}

// Fungsi Baru: writeGoogleSheet (dengan kemampuan batch)
export async function writeGoogleSheet(
  sheetName: string,
  options: WriteOptions
): Promise<{ success: boolean; message?: string }> {
  try {
    const { action, data } = options;

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });
    const headers = headerResponse.data.values?.[0];
    if (!headers) throw new Error(`Headers not found in sheet: ${sheetName}`);

    if (action === "append") {
      const allData = await readGoogleSheet<WargaData>(sheetName);
      const maxId = Math.max(0, ...allData.map((item) => item.id || 0));

      const newRow = headers.map((header) => {
        if (header === "id") return maxId + 1;
        return data[header] !== undefined ? data[header] : "";
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [newRow] },
      });
      return { success: true };
    }

    if (action === "update" && options.id && typeof options.id === "number") {
      const allValues = await sheets.spreadsheets.values
        .get({
          spreadsheetId: SPREADSHEET_ID,
          range: sheetName,
        })
        .then((res) => res.data.values || []);

      const idColIndex = headers.indexOf("id");
      const rowIndex = allValues.findIndex(
        (row) => String(row[idColIndex]) === String(options.id)
      );

      if (rowIndex === -1) return { success: false, message: "ID not found" };

      const updatedRow = headers.map((header, index) =>
        data[header] !== undefined ? data[header] : allValues[rowIndex][index]
      );

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${rowIndex + 1}`,
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
      const allValues = await sheets.spreadsheets.values
        .get({
          spreadsheetId: SPREADSHEET_ID,
          range: sheetName,
        })
        .then((res) => res.data.values || []);

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
        const rowIndex = allValues.findIndex(
          (row) => String(row[idColIndex]) === String(id)
        );
        if (rowIndex !== -1) {
          const newRow = [...allValues[rowIndex]];
          newRow[statusColIndex] = options.status || "Non-Aktif";
          if (updatedAtIndex !== -1) newRow[updatedAtIndex] = now;

          dataForUpdate.push({
            range: `${sheetName}!A${rowIndex + 1}`,
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
