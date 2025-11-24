import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHorizontalDayComponent } from './calendar-horizontal-day.component';

xdescribe('HairdressingCalendarHorizontalDayComponent', () => {
  let component: CalendarHorizontalDayComponent;
  let fixture: ComponentFixture<CalendarHorizontalDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarHorizontalDayComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarHorizontalDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
