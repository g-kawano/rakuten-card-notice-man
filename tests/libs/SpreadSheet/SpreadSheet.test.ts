import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { SpreadSheetFactory } from "@/factories/SpreadSheetFactory";

/**
 * DriveApp が返すイテレータのモック
 */
const mockDriveIterator = {
  hasNext: jest.fn(),
  next: jest.fn()
};

const mockGetSheetByName = jest.fn();
const mockInsertSheet = jest.fn();
const mockSetActiveSheet = jest.fn();
const mockGetDataRange = jest.fn().mockReturnValue({
  getValues: jest.fn(),
  getLastColumn: jest.fn()
});

const mockGetRange = jest.fn().mockReturnValue({
  setValues: jest.fn(),
  getValues: jest.fn()
});

describe("SpreadSheet", () => {
  let spreadSheet: SpreadSheet;
  let mockedDriveApp: GoogleAppsScript.Drive.DriveApp;
  let mockedSpreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
  let mockedSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  let mockedSheet: GoogleAppsScript.Spreadsheet.Sheet;

  beforeEach(() => {
    // DriveAppとSpreadsheetAppのモックを作成
    mockedDriveApp = {
      searchFiles: jest.fn(() => mockDriveIterator)
    } as unknown as GoogleAppsScript.Drive.DriveApp;
    mockedSpreadSheetApp = {
      openById: jest.fn(),
      create: jest.fn()
    } as unknown as GoogleAppsScript.Spreadsheet.SpreadsheetApp;

    // SpreadsheetとSheetのモックを作成
    mockedSpreadsheet = {
      getSheetByName: mockGetSheetByName,
      insertSheet: mockInsertSheet,
      setActiveSheet: mockSetActiveSheet
    } as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
    mockedSheet = {
      getDataRange: mockGetDataRange,
      getRange: mockGetRange,
      getLastRow: jest.fn()
    } as unknown as GoogleAppsScript.Spreadsheet.Sheet;

    spreadSheet = SpreadSheetFactory.create(mockedSpreadsheet, mockedSheet);
  });

  describe("getSpreadsheet", () => {
    it("creates a new spreadsheet when there is no matching file", () => {
      const fileName = "test";
      mockDriveIterator.hasNext.mockReturnValue(false);

      SpreadSheet.getSpreadsheet(fileName, mockedDriveApp, mockedSpreadSheetApp);

      expect(mockedSpreadSheetApp.create).toHaveBeenCalledWith(fileName);
    });

    it("opens the existing spreadsheet when there is a matching file", () => {
      const fileName = "test";
      mockDriveIterator.hasNext.mockReturnValue(true);
      mockDriveIterator.next.mockReturnValue({
        getId: jest.fn(() => fileName)
      });

      SpreadSheet.getSpreadsheet(fileName, mockedDriveApp, mockedSpreadSheetApp);

      expect(mockedSpreadSheetApp.openById).toHaveBeenCalledWith("test");
    });
  });

  describe("getSpreadSheetSheet", () => {
    it("creates a new sheet when there is no matching sheet", () => {
      const sheetName = "testSheet";

      mockGetSheetByName.mockReturnValue(null);
      mockInsertSheet.mockReturnValue(mockedSheet);

      const result = SpreadSheet.getSpreadSheetSheet(mockedSpreadsheet, sheetName);

      expect(mockedSpreadsheet.insertSheet).toHaveBeenCalledWith(sheetName);
      expect(result).toBe(mockedSheet);
    });

    it("returns the existing sheet when there is a matching sheet", () => {
      const sheetName = "testSheet";

      mockGetSheetByName.mockReturnValue(mockedSheet);
      mockSetActiveSheet.mockReturnValue(mockedSheet);

      const result = SpreadSheet.getSpreadSheetSheet(mockedSpreadsheet, sheetName);

      expect(mockedSpreadsheet.setActiveSheet).toHaveBeenCalledWith(mockedSheet);
      expect(result).toBe(mockedSheet);
    });
  });

  describe("addRecords", () => {
    let dummyValues: string[][];
    let dummyRecords: string[][];
    let dummyLastColumn: number;

    beforeEach(() => {
      dummyValues = [["value1"], ["value2"]];
      dummyLastColumn = 2;

      mockGetDataRange().getValues.mockReturnValue(dummyValues);
      mockGetDataRange().getLastColumn.mockReturnValue(dummyLastColumn);
    });

    const testCases = [
      { name: "adds records to the sheet", records: [["record1"], ["record2"]] },
      { name: "adds records to the sheet when no record", records: [[]] }
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, () => {
        dummyRecords = testCase.records;

        spreadSheet.addRecords(dummyRecords);

        expect(mockedSheet.getRange).toHaveBeenCalledWith(
          1,
          1,
          dummyValues.length + dummyRecords.length,
          dummyLastColumn
        );

        expect(mockGetRange().setValues).toHaveBeenCalledWith(dummyValues.concat(dummyRecords));
      });
    });
  });

  describe("sumColumn", () => {
    it("returns the sum of a column", () => {
      const startRowNumber = 1;
      const columnNumber = 2;
      const lastRow = 5;
      const values = [[1], [2], ["string"], [4], [5]];

      mockedSheet.getLastRow = jest.fn().mockReturnValue(lastRow);
      mockGetRange().getValues.mockReturnValue(values);

      const result = spreadSheet.sumColumn(startRowNumber, columnNumber);

      expect(mockedSheet.getLastRow).toHaveBeenCalled();
      expect(mockedSheet.getRange).toHaveBeenCalledWith(startRowNumber, columnNumber, lastRow - 1);
      expect(mockGetDataRange().getValues).toHaveBeenCalled();
      expect(result).toBe(12); // 1 + 2 + 4 + 5 = 12, "string" is ignored
    });
  });
});
