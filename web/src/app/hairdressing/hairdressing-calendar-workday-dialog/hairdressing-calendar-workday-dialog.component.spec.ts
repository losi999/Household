import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarWorkdayDialogComponent } from './hairdressing-calendar-workday-dialog.component';

describe('HairdressingCalendarWorkdayDialogComponent', () => {
  let component: HairdressingCalendarWorkdayDialogComponent;
  let fixture: ComponentFixture<HairdressingCalendarWorkdayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarWorkdayDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarWorkdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
