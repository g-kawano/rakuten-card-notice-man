import { Setting } from "@/00Setting";

const lineSettings = new Setting()
// @ts-ignore ts(2304) GAS のライブラリから読み込んでいるため
//https://github.com/kobanyan/line-bot-sdk-gas
const lineClient = new LineBotSDK.Client({
  channelAccessToken: lineSettings.LINE_CHANNEL_ACCESS_TOKEN,
});

/**
 * LINE 操作用クラス
 */
export class Line {
  /**
   * LINE にメッセージをプッシュする
   * push は無料プランでは 200 通までなので使いすぎ注意
   * @param message 送信メッセージ内容
   */
  pushMessage(message: any): void {
    lineClient.pushMessage(lineSettings.LINE_GROUP_ID, message);
  }
}
