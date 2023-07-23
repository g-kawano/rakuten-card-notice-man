import { Setting } from "@/00Setting";
import { Client, Message } from "@line/bot-sdk";

/**
 * LINE 操作用クラス
 */
export class Line {
  line: Client;
  setting: Setting;

  /**
   * LINE にメッセージをプッシュする
   * push は無料プランでは 200 通までなので使いすぎ注意
   * @param message 送信メッセージ内容
   */
  constructor(lineClient: Client, setting: Setting) {
    this.line = lineClient;
    this.setting = setting;
  }

  pushMessage(message: Message | Message[]): void {
    this.line.pushMessage(this.setting.LINE_GROUP_ID, message);
  }
}
