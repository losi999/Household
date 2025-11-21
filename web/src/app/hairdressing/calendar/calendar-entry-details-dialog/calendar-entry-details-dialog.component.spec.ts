import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryDetailsDialogComponent } from './calendar-entry-details-dialog.component';

describe.skip('HairdressingCalendarEntryDetailsDialogComponent', () => {
  let component: CalendarEntryDetailsDialogComponent;
  let fixture: ComponentFixture<CalendarEntryDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEntryDetailsDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
