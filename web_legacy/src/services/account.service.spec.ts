import { TestBed } from '@angular/core/testing';

import { AccountService } from '@household/web/services/account.service';

xdescribe('AccountService', () => {
  let service: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
