import { Client } from "@line/bot-sdk";
import { Setting } from "@/00Setting";
import { Line } from "@/libs/Line/01Line";

export class LineFactory {
  static create(
    lineClient: Client = new Client({ channelAccessToken: new Setting().LINE_CHANNEL_ACCESS_TOKEN }),
    setting: Setting = new Setting()
  ): Line {
    return new Line(lineClient, setting);
  }
}
