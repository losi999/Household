import { TestBed } from '@angular/core/testing';

import { RecipientListResolver } from './recipient-list.resolver';

describe('RecipientListResolver', () => {
  let resolver: RecipientListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(RecipientListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
