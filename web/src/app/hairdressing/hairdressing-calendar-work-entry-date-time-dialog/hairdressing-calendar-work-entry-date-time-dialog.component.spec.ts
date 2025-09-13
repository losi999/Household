import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarWorkEntryDateTimeDialogComponent } from './hairdressing-calendar-work-entry-date-time-dialog.component';

describe('HairdressingCalendarWorkEntryDateTimeDialogComponent', () => {
  let component: HairdressingCalendarWorkEntryDateTimeDialogComponent;
  let fixture: ComponentFixture<HairdressingCalendarWorkEntryDateTimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarWorkEntryDateTimeDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarWorkEntryDateTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
