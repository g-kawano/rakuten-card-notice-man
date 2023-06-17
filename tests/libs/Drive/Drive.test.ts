import { Drive } from "@/libs/Drive/01Drive";

const mockDriveIterator = {
  hasNext: jest.fn(),
  next: jest.fn(),
};

// モック関数を注入したDriveAppのモックを作成
const mockDriveApp = {
  getFoldersByName: jest.fn(() => mockDriveIterator),
  getFilesByName: jest.fn(() => mockDriveIterator),
} as unknown as GoogleAppsScript.Drive.DriveApp;

describe("Drive", () => {
  describe("findFolderByName", () => {
    const targetFolderName = "testFolder";

    it("should return the specified folder when it exists", () => {
      mockDriveIterator.hasNext.mockReturnValue(true);
      mockDriveIterator.next.mockReturnValue({
        getName: jest.fn(() => targetFolderName),
      });

      const drive = new Drive(mockDriveApp);
      const result = drive.findFolderByName(targetFolderName);

      expect(result.getName()).toEqual(targetFolderName);
    });

    it("should throw an error when the specified folder does not exist", () => {
      mockDriveIterator.hasNext.mockReturnValue(false);

      const drive = new Drive(mockDriveApp);

      expect(() => drive.findFolderByName(targetFolderName)).toThrow(Error);
    });
  });

  describe("findFileByName", () => {
    const targetFileName = "testFile";

    it("should return the specified file when it exists", () => {
      mockDriveIterator.hasNext.mockReturnValue(true);
      mockDriveIterator.next.mockReturnValue({
        getName: jest.fn(() => targetFileName),
      });

      const drive = new Drive(mockDriveApp);
      const result = drive.findFileByName(targetFileName);

      expect(result.getName()).toEqual(targetFileName);
    });

    it("should throw an error when the specified file does not exist", () => {
      mockDriveIterator.hasNext.mockReturnValue(false);

      const drive = new Drive(mockDriveApp);

      expect(() => drive.findFileByName(targetFileName)).toThrow(Error);
    });
  });

  describe("deleteFile", () => {
    const drive = new Drive(mockDriveApp);
    const mockSetTrashed = jest.fn();

    jest.spyOn(drive, "findFolderByName").mockImplementation((folderName: string) => {
      // Mock the Folder object
      return {
        getName: () => folderName,
        getFilesByName: jest.fn().mockReturnValue({
          hasNext: jest.fn().mockReturnValue(true),
          next: jest.fn().mockReturnValue({
            setTrashed: mockSetTrashed,
          }),
        }),
      } as unknown as GoogleAppsScript.Drive.Folder;
    });

    it("should trash the specified file in the specified folder", () => {
      drive.deleteFile("testFolder", "testFile");
      expect(mockSetTrashed).toHaveBeenCalledWith(true);
    });
  });
});
