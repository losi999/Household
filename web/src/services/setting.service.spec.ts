import { TestBed } from '@angular/core/testing';

import { SettingService } from './setting.service';

xdescribe('SettingService', () => {
  let service: SettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
