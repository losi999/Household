import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';
import { API_URL } from '@household/shared-ui';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: API_URL,
          useValue: '',
        },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
