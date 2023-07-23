import { Drive } from "@/libs/Drive/01Drive";

export class DriveFactory {
  static create(driveApp: GoogleAppsScript.Drive.DriveApp = DriveApp): Drive {
    return new Drive(driveApp);
  }
}
