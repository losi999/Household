import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarVerticalDayComponent } from './calendar-vertical-day.component';

xdescribe('CalendarVerticalDayComponent', () => {
  let component: CalendarVerticalDayComponent;
  let fixture: ComponentFixture<CalendarVerticalDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarVerticalDayComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarVerticalDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
