import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHorizontalDay } from './calendar-horizontal-day';

describe('CalendarHorizontalDay', () => {
  let component: CalendarHorizontalDay;
  let fixture: ComponentFixture<CalendarHorizontalDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHorizontalDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarHorizontalDay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
