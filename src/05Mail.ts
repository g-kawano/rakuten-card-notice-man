export class Message {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  private extractPaymentInfo = (prefix: string): string => {
    const matched: RegExpMatchArray | null = this.message.match(`${prefix}.+`);
    return matched ? matched[0].replace(prefix, "") : "";
  };

  getUseDay(): string {
    return this.extractPaymentInfo("■利用日: ");
  }

  getUseStore(): string {
    return this.extractPaymentInfo("■利用先: ");
  }

  getUser(): string {
    return this.extractPaymentInfo("■利用者: ");
  }

  getAmount(): string {
    return this.extractPaymentInfo("■利用金額: ");
  }
}
