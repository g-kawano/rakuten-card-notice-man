import { Client, Message } from "@line/bot-sdk";
import { Setting } from "@/00Setting";
import { Line } from "@/libs/Line/01Line";
import { LineFactory } from "@/factories/LineFactory";

jest.mock("@line/bot-sdk");
jest.mock("@/00Setting");

describe("Line class tests", () => {
  let mockPushMessage: jest.Mock;
  let mockSettingInstance: jest.Mocked<Setting>;
  let mockLineInstance: Line;

  beforeEach(() => {
    mockPushMessage = jest.fn();
    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => {
      return {
        pushMessage: mockPushMessage
      } as unknown as Client; // Client に対する型アサーション
    });

    mockSettingInstance = new Setting() as jest.Mocked<Setting>;
    mockSettingInstance.LINE_CHANNEL_ACCESS_TOKEN = "test_token";
    mockSettingInstance.LINE_GROUP_ID = "test_group";

    mockLineInstance = LineFactory.create(new Client({ channelAccessToken: "test_token" }), mockSettingInstance);
  });

  it("should correctly push a message", () => {
    const testMessage: Message = { type: "text", text: "Hello, world" };

    mockLineInstance.pushMessage(testMessage);

    expect(mockPushMessage).toHaveBeenCalledWith(mockSettingInstance.LINE_GROUP_ID, testMessage);
  });
});
