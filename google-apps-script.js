// ─────────────────────────────────────────────────────────────────────────────
// HRAD Task Monitor — Google Apps Script Backend
// Paste this entire file into Extensions > Apps Script in your Google Sheet
// Deploy as Web App: Execute as Me, Access: Anyone
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = "Tasks";

// Allowed origin for CORS — set to your Vercel URL after deploy
// e.g. "https://hrad-app.vercel.app"  (no trailing slash)
const ALLOWED_ORIGIN = "*"; // Change to your Vercel URL in production

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1)
    .filter(row => row[0] !== "") // skip empty rows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

  return buildResponse({ status: "ok", data: rows });
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  let payload;

  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return buildResponse({ status: "error", message: "Invalid JSON" });
  }

  // ── ADD ──────────────────────────────────────────────────────────────────
  if (payload.action === "add") {
    const id = "TASK-" + new Date().getTime();
    sheet.appendRow([
      id,
      payload.title       || "",
      payload.assignedTo  || "",
      payload.department  || "",
      payload.status      || "Pending",
      payload.priority    || "Medium",
      payload.dueDate     || "",
      payload.description || "",
      payload.addedBy     || "",
      new Date().toISOString()
    ]);
    return buildResponse({ status: "ok", id });
  }

  // ── UPDATE ───────────────────────────────────────────────────────────────
  if (payload.action === "update") {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf("Task ID");

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(payload.id)) {
        const row = i + 1; // 1-indexed
        if (payload.title       !== undefined) sheet.getRange(row, headers.indexOf("Title") + 1).setValue(payload.title);
        if (payload.assignedTo  !== undefined) sheet.getRange(row, headers.indexOf("Assigned To") + 1).setValue(payload.assignedTo);
        if (payload.department  !== undefined) sheet.getRange(row, headers.indexOf("Department") + 1).setValue(payload.department);
        if (payload.status      !== undefined) sheet.getRange(row, headers.indexOf("Status") + 1).setValue(payload.status);
        if (payload.priority    !== undefined) sheet.getRange(row, headers.indexOf("Priority") + 1).setValue(payload.priority);
        if (payload.dueDate     !== undefined) sheet.getRange(row, headers.indexOf("Due Date") + 1).setValue(payload.dueDate);
        if (payload.description !== undefined) sheet.getRange(row, headers.indexOf("Description") + 1).setValue(payload.description);
        return buildResponse({ status: "updated" });
      }
    }
    return buildResponse({ status: "error", message: "Task not found" });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (payload.action === "delete") {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf("Task ID");

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(payload.id)) {
        sheet.deleteRow(i + 1);
        return buildResponse({ status: "deleted" });
      }
    }
    return buildResponse({ status: "error", message: "Task not found" });
  }

  return buildResponse({ status: "error", message: "Unknown action" });
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP HELPER — Run this once to create headers in your sheet
// In Apps Script editor: click the function dropdown → select "setupSheet" → Run
// ─────────────────────────────────────────────────────────────────────────────
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = ["Task ID", "Title", "Assigned To", "Department", "Status", "Priority", "Due Date", "Description", "Added By", "Created At"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#2B5CE6");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 120);  // Task ID
  sheet.setColumnWidth(2, 220);  // Title
  sheet.setColumnWidth(3, 140);  // Assigned To
  sheet.setColumnWidth(4, 120);  // Department
  sheet.setColumnWidth(5, 110);  // Status
  sheet.setColumnWidth(6, 90);   // Priority
  sheet.setColumnWidth(7, 110);  // Due Date
  sheet.setColumnWidth(8, 200);  // Description
  sheet.setColumnWidth(9, 140);  // Added By
  sheet.setColumnWidth(10, 160); // Created At

  SpreadsheetApp.getUi().alert("✅ Sheet setup complete! Headers and formatting applied.");
}
