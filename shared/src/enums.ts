export enum CategoryType {
  Regular = 'regular',
  Invoice = 'invoice',
  Inventory = 'inventory',
}

export enum AccountType {
  BankAccount = 'bankAccount',
  Cash = 'cash',
  CreditCard = 'creditCard',
  Loan = 'loan',
  Cafeteria = 'cafeteria',
}

export enum FileType {
  Otp='otp',
  Erste = 'erste',
  Revolut = 'revolut',
}
export enum FileProcessingStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export enum TransactionType {
  Payment = 'payment',
  Split = 'split',
  Transfer = 'transfer',
  Deferred = 'deferred',
  Reimbursement = 'reimbursement',
  Draft = 'draft',
}
