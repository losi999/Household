import { TestBed } from '@angular/core/testing';

import { HairdressingService } from './hairdressing.service';

describe.skip('HairdressingService', () => {
  let service: HairdressingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HairdressingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
