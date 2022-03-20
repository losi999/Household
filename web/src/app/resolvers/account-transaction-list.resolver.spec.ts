import { TestBed } from '@angular/core/testing';

import { AccountTransactionListResolver } from './account-transaction-list.resolver';

describe('AccountTransactionListResolver', () => {
  let resolver: AccountTransactionListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AccountTransactionListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
