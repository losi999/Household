import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWorkdayDialogComponent } from './calendar-workday-dialog.component';

xdescribe('HairdressingCalendarWorkdayDialogComponent', () => {
  let component: CalendarWorkdayDialogComponent;
  let fixture: ComponentFixture<CalendarWorkdayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarWorkdayDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarWorkdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
