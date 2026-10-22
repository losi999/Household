import { AccountTypeIconPipe } from './account-type-icon-pipe';
import { AccountType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('AccountTypeIconPipe', () => {
  const pipe = new AccountTypeIconPipe();

  it.each([
    [
      AccountType.BankAccount,
      'account_balance',
    ],
    [
      AccountType.Cash,
      'payments',
    ],
    [
      AccountType.CreditCard,
      'credit_card',
    ],
    [
      AccountType.Loan,
      'request_quote',
    ],
    [
      AccountType.Cafeteria,
      'restaurant',
    ],
  ])('should return the icon of the %s account type', (accountType, icon) => {
    expect(pipe.transform(testDataFactory.account.response({
      accountType,
    }))).toBe(icon);
  });
});
