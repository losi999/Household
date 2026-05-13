import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarVerticalDay } from './calendar-vertical-day';

describe('CalendarVerticalDay', () => {
  let component: CalendarVerticalDay;
  let fixture: ComponentFixture<CalendarVerticalDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarVerticalDay],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarVerticalDay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
