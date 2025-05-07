import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsHairdressingComponent } from './settings-hairdressing.component';

describe('SettingsHairdressingComponent', () => {
  let component: SettingsHairdressingComponent;
  let fixture: ComponentFixture<SettingsHairdressingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsHairdressingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsHairdressingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
