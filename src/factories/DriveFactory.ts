import { Drive } from "@/libs/Drive/01Drive";

export class DriveFactory {
  /**
   * Drive インスタンスを作成する
   * @param driveApp DriveApp クライアント
   */
  static create(driveApp: GoogleAppsScript.Drive.DriveApp = DriveApp): Drive {
    return new Drive(driveApp);
  }
}
