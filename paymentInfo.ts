export class PaymentInfo {
  date: string
  store: string
  user: string
  amount: string

  constructor(date: string, store: string, user: string, amount: string) {
    this.date = date
    this.store = store
    this.user = user
    this.amount = amount
  }
}
