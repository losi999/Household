import { TestBed } from '@angular/core/testing';

import { TrackByService } from './track-by.service';

describe('TrackByService', () => {
  let service: TrackByService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackByService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
