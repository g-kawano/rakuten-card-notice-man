export class Setting {
  /**
   * 決済履歴の本人利用部の通知メッセージ表示用名
   */
  DISPLAY_HIMSELF: string | null;

  /**
   * 決済履歴の家族利用部の通知メッセージ表示用名
   */
  DISPLAY_FAMILY: string | null;

  /**
   * 本プロジェクトで使用する Google Drive のフォルダ名
   */
  DRIVE_FOLDER_NAME: string;

  /**
   * LINE Messaging API 用 アクセストークン
   */
  LINE_CHANNEL_ACCESS_TOKEN: string;

  /**
   * LINE トークグループ ID
   */
  LINE_GROUP_ID: string;

  /**
   * マスターデータを登録しているスプレッドシートファイル名
   */
  MASTER_SPREAD_SHEET_FILE: string;

  /**
   * メール受信日
   */
  MESSAGE_DATE: string;

  constructor() {
    const displayHimself = PropertiesService.getScriptProperties().getProperty("DISPLAY_HIMSELF");

    const displayFamily = PropertiesService.getScriptProperties().getProperty("DISPLAY_FAMILY");

    const driveFolderName = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_NAME");
    if (driveFolderName === null) {
      throw new Error("Gas properties DRIVE_FOLDER_NAME is not null!");
    }

    const lineChannelAccessToken = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_ACCESS_TOKEN");
    if (lineChannelAccessToken === null) {
      throw new Error("Gas properties LINE_CHANNEL_ACCESS_TOKEN is not null!");
    }

    const lineGroupId = PropertiesService.getScriptProperties().getProperty("LINE_GROUP_ID");
    if (lineGroupId === null) {
      throw new Error("Gas properties LINE_GROUP_ID is not null!");
    }

    const masterSpreadSheetFile = PropertiesService.getScriptProperties().getProperty("MASTER_SPREAD_SHEET_FILE");
    if (masterSpreadSheetFile === null) {
      throw new Error("Gas properties MASTER_SPREAD_SHEET_FILE is not null!");
    }

    const messageDate = PropertiesService.getScriptProperties().getProperty("MESSAGE_DATE");
    if (messageDate === null) {
      throw new Error("Gas properties MESSAGE_DATE is not null!");
    }

    this.DISPLAY_HIMSELF = displayHimself;
    this.DISPLAY_FAMILY = displayFamily;
    this.DRIVE_FOLDER_NAME = driveFolderName;
    this.LINE_CHANNEL_ACCESS_TOKEN = lineChannelAccessToken;
    this.LINE_GROUP_ID = lineGroupId;
    this.MASTER_SPREAD_SHEET_FILE = masterSpreadSheetFile;
    this.MESSAGE_DATE = messageDate;
  }

  setMessageDate(messageDate: string) {
    PropertiesService.getScriptProperties().setProperty("MESSAGE_DATE", String(messageDate));
  }
}
