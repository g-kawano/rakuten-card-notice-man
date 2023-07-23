import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { NoticePaymentHistoryMessageFactory } from "@/factories/NoticePaymentMessageFactory";
import { Setting } from "@/00Setting";
import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";

jest.mock("@/00Setting");

describe("NoticePaymentHistoryMessage", () => {
  const paymentHistoryList: PaymentHistory[] = [
    new PaymentHistory("2023/06/01", "Supermarket", "本人", "1,001 円"),
    new PaymentHistory("2023/06/01", "Supermarket", "本人", "1,001 円"),
    new PaymentHistory("2023/06/02", "Supermarket", "家族", "2,001 円"),
    new PaymentHistory("2023/06/02", "Supermarket", "家族", "2,001 円")
  ];

  let noticePaymentHistoryMessage: NoticePaymentHistoryMessage;
  let paymentHistoryListObject: PaymentHistoryList;
  let setting: Setting;

  beforeEach(() => {
    setting = new Setting() as jest.Mocked<Setting>;

    setting.DISPLAY_HIMSELF = null;
    setting.DISPLAY_FAMILY = null;

    noticePaymentHistoryMessage = NoticePaymentHistoryMessageFactory.create(paymentHistoryList, setting);
    paymentHistoryListObject = new PaymentHistoryList(paymentHistoryList);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return notice payment message", () => {
    function omitUndefinedFromObject<T extends object>(obj: T): T {
      const cleanedObj = JSON.parse(JSON.stringify(obj, (_, value) => (value === undefined ? undefined : value)));
      return cleanedObj as T;
    }

    // 全体のメッセージを確認する意味で、クラス全体のスナップショットも保存しておく
    // スナップショットの結果をそのまま flex シミュレータには反映はできないので、JSON フォーマットすること
    expect(omitUndefinedFromObject(noticePaymentHistoryMessage)).toMatchSnapshot();
  });

  describe("constructor", () => {
    it("should initialize the instance correctly", () => {
      expect(noticePaymentHistoryMessage).toBeInstanceOf(NoticePaymentHistoryMessage);
      expect(noticePaymentHistoryMessage.type).toBe("bubble");
      expect(noticePaymentHistoryMessage.setting).toBe(setting);
    });
  });

  describe("getHeader", () => {
    it("should return correct header object", () => {
      const result = noticePaymentHistoryMessage.getHeader();

      expect(result).toMatchSnapshot();
    });
  });

  describe("getBody", () => {
    it("should return correct body object", () => {
      const result = noticePaymentHistoryMessage.getBody(paymentHistoryListObject);

      expect(result).toMatchSnapshot();
    });

    it("should return correct body object when paymentHistoryList is empty", () => {
      const result = noticePaymentHistoryMessage.getBody(new PaymentHistoryList([]));

      expect(result).toMatchSnapshot();
    });
  });

  describe("buildPaymentHistoryMessage", () => {
    it("should return the correct BoxContent when userType is 'himself'", () => {
      const result = noticePaymentHistoryMessage.buildPaymentHistoryMessage(paymentHistoryListObject, "himself");

      expect(result).toMatchSnapshot();
    });

    it("should return the correct BoxContent when userType is 'family'", () => {
      const result = noticePaymentHistoryMessage.buildPaymentHistoryMessage(paymentHistoryListObject, "family");

      expect(result).toMatchSnapshot();
    });
  });

  describe("buildSubjectMessage", () => {
    const textContentObject = {
      type: "text",
      wrap: true,
      flex: undefined,
      align: undefined,
      color: undefined,
      weight: "bold",
      size: undefined,
      margin: undefined,
      decoration: undefined
    };

    it("should return the correct BoxContent when userType is 'himself and default display name'", () => {
      // default setting
      setting.DISPLAY_HIMSELF = null;

      const result = noticePaymentHistoryMessage.buildSubjectMessage("himself");
      const subjectTextContent = result.contents[0];
      const separatorContent = result.contents[1];

      expect(subjectTextContent).toMatchObject({
        ...textContentObject,
        text: "利用者: 本人"
      });

      expect(separatorContent).toMatchObject({ type: "separator", margin: "sm" });
    });
    it("should return the correct BoxContent when userType is 'family' and default display name", () => {
      // default setting
      setting.DISPLAY_FAMILY = null;

      const result = noticePaymentHistoryMessage.buildSubjectMessage("family");
      const subjectTextContent = result.contents[0];
      const separatorContent = result.contents[1];

      expect(subjectTextContent).toMatchObject({
        ...textContentObject,
        text: "利用者: 家族"
      });

      expect(separatorContent).toMatchObject({ type: "separator", margin: "sm" });
    });
    it("should return the correct BoxContent when userType is 'himself and custom display name'", () => {
      // custom setting
      setting.DISPLAY_HIMSELF = "太郎";

      const result = noticePaymentHistoryMessage.buildSubjectMessage("himself");
      const subjectTextContent = result.contents[0];
      const separatorContent = result.contents[1];

      expect(subjectTextContent).toMatchObject({
        ...textContentObject,
        text: "利用者: 太郎"
      });

      expect(separatorContent).toMatchObject({ type: "separator", margin: "sm" });
    });

    it("should return the correct BoxContent when userType is 'family' and custom display name", () => {
      // custom setting
      setting.DISPLAY_HIMSELF = "花子";

      const result = noticePaymentHistoryMessage.buildSubjectMessage("himself");
      const subjectTextContent = result.contents[0];
      const separatorContent = result.contents[1];

      expect(subjectTextContent).toMatchObject({
        ...textContentObject,
        text: "利用者: 花子"
      });

      expect(separatorContent).toMatchObject({ type: "separator", margin: "sm" });
    });
  });

  describe("buildPaymentMessage", () => {
    beforeEach(() => {
      jest
        .spyOn(NoticePaymentHistoryMessage.prototype, "buildPaymentMessageRecord")
        .mockReturnValue({ type: "box", layout: "vertical", contents: [] });
      jest
        .spyOn(NoticePaymentHistoryMessage.prototype, "buildTotalAmountRecord")
        .mockReturnValue({ type: "box", layout: "vertical", contents: [] });
    });

    it("should return the correct BoxContent when paymentHistoryList is exist", () => {
      paymentHistoryListObject = new PaymentHistoryList([paymentHistoryList[0], paymentHistoryList[1]]);
      const result = noticePaymentHistoryMessage.buildPaymentMessage(paymentHistoryListObject);
      const recordNumber = result.contents.length;

      expect(result).toHaveProperty("layout", "vertical");

      // 決済レコード 2 件 + 合計レコード
      expect(recordNumber).toBe(3);
    });

    it("should return the correct BoxContent when paymentHistoryList is not exist", () => {
      paymentHistoryListObject = new PaymentHistoryList([]);

      const result = noticePaymentHistoryMessage.buildPaymentMessage(paymentHistoryListObject);
      const recordNumber = result.contents.length;

      expect(result).toHaveProperty("layout", "vertical");

      // 決済レコード 0 件 + 合計レコード
      expect(recordNumber).toBe(1);
    });
  });

  describe("buildPaymentMessageRecord", () => {
    it("should return the correct BoxContent", () => {
      const result = noticePaymentHistoryMessage.buildPaymentMessageRecord(paymentHistoryList[0]);

      const resultContent = result.contents;

      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "xs");
      expect(result).toHaveProperty("justifyContent", "flex-start");

      expect(resultContent.length).toBe(3);

      expect(resultContent[0]).toHaveProperty("type", "text");
      expect(resultContent[0]).toHaveProperty("text", "2023/06/01");
      expect(resultContent[0]).toHaveProperty("wrap", true);
      expect(resultContent[0]).toHaveProperty("flex", 3);

      expect(resultContent[1]).toHaveProperty("type", "text");
      expect(resultContent[1]).toHaveProperty("text", "Supermarket");
      expect(resultContent[1]).toHaveProperty("wrap", true);
      expect(resultContent[1]).toHaveProperty("flex", 3);

      expect(resultContent[2]).toHaveProperty("type", "text");
      expect(resultContent[2]).toHaveProperty("text", "1,001 円");
      expect(resultContent[2]).toHaveProperty("wrap", true);
      expect(resultContent[2]).toHaveProperty("flex", 3);
    });
  });

  describe("buildTotalAmountRecord", () => {
    it("should return the correct BoxContent when PaymentHistoryList is exist", () => {
      paymentHistoryListObject = new PaymentHistoryList([paymentHistoryList[2], paymentHistoryList[3]]);

      const result = noticePaymentHistoryMessage.buildTotalAmountRecord(paymentHistoryListObject);

      const resultContent = result.contents;

      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "sm");
      expect(result).toHaveProperty("justifyContent", "flex-start");

      expect(resultContent.length).toBe(2);

      expect(resultContent[0]).toHaveProperty("type", "text");
      expect(resultContent[0]).toHaveProperty("text", "計");
      expect(resultContent[0]).toHaveProperty("align", "end");
      expect(resultContent[0]).toHaveProperty("flex", 4);

      expect(resultContent[1]).toHaveProperty("type", "text");
      expect(resultContent[1]).toHaveProperty("text", "4,002 円");
      expect(resultContent[1]).toHaveProperty("align", "end");
      expect(resultContent[1]).toHaveProperty("flex", 2);
    });

    it("should return the correct BoxContent when PaymentHistoryList is exist and isAll is true", () => {
      const result = noticePaymentHistoryMessage.buildTotalAmountRecord(paymentHistoryListObject, true);

      const resultContent = result.contents;

      expect(resultContent.length).toBe(2);

      expect(resultContent[0]).toHaveProperty("type", "text");
      expect(resultContent[0]).toHaveProperty("text", "合計");
      expect(resultContent[0]).toHaveProperty("align", "end");
      expect(resultContent[0]).toHaveProperty("flex", 4);

      expect(resultContent[1]).toHaveProperty("type", "text");
      expect(resultContent[1]).toHaveProperty("text", "6,004 円");
      expect(resultContent[1]).toHaveProperty("align", "end");
      expect(resultContent[1]).toHaveProperty("flex", 2);
    });

    it("should return the correct BoxContent when PaymentHistoryList is not exist", () => {
      const result = noticePaymentHistoryMessage.buildTotalAmountRecord(new PaymentHistoryList([]));

      const resultContent = result.contents;

      expect(resultContent.length).toBe(2);

      expect(resultContent[0]).toHaveProperty("type", "text");
      expect(resultContent[0]).toHaveProperty("text", "計");
      expect(resultContent[0]).toHaveProperty("align", "end");
      expect(resultContent[0]).toHaveProperty("flex", 4);

      expect(resultContent[1]).toHaveProperty("type", "text");
      expect(resultContent[1]).toHaveProperty("text", "0 円");
      expect(resultContent[1]).toHaveProperty("align", "end");
      expect(resultContent[1]).toHaveProperty("flex", 2);
    });
  });
});
