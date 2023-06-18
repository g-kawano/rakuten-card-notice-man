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
  constructor(
    // @ts-ignore ts(2304) GAS のライブラリから読み込んでいるため
    //https://github.com/kobanyan/line-bot-sdk-gas
    lineClient: Client = new LineBotSDK.Client({
      channelAccessToken: new Setting().LINE_CHANNEL_ACCESS_TOKEN,
    }),
    setting: Setting = new Setting()
  ) {
    this.line = lineClient;
    this.setting = setting;
  }

  pushMessage(message: Message | Message[]): void {
    this.line.pushMessage(this.setting.LINE_GROUP_ID, message);
  }
}
