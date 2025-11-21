import { TestBed } from '@angular/core/testing';

import { RecipientService } from '@household/web/services/recipient.service';

describe.skip('RecipientService', () => {
  let service: RecipientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
