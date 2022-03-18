import { TestBed } from '@angular/core/testing';

import { AccountListResolver } from './account-list.resolver';

describe('AccountListResolver', () => {
  let resolver: AccountListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AccountListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
