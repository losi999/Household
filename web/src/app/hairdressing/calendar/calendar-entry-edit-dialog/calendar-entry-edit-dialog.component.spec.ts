import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryEditDialogComponent } from './calendar-entry-edit-dialog.component';

describe.skip('HairdressingCalendarEntryFormComponent', () => {
  let component: CalendarEntryEditDialogComponent;
  let fixture: ComponentFixture<CalendarEntryEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarEntryEditDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
