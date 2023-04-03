const XLSX = require("xlsx");
const fs = require("fs");

const defFileName = "download/input.xlsx";

function readExcelFile(fileName) {
  const inputBook = XLSX.readFile(fileName || defFileName);
  const inputSheet = inputBook.Sheets["Sheet1"];
  const sheetData = XLSX.utils.sheet_to_json(inputSheet);

  return sheetData;
}

function exportExcelFile(data = []) {
  const workbook = XLSX.utils.book_new();
  if (data?.[0]) {
    let i = 0;
    data = data.map((_data) => {
      i++;
      return { STT: i, ..._data };
    });
  }
  const newSheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, newSheet, "log");
  XLSX.writeFile(workbook, "download/log.xlsx");
}

module.exports = { readExcelFile, exportExcelFile };
