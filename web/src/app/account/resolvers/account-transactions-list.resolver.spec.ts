import { TestBed } from '@angular/core/testing';

import { AccountTransactionsListResolver } from './account-transactions-list.resolver';

describe('AccountTransactionsListResolver', () => {
  let resolver: AccountTransactionsListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AccountTransactionsListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
