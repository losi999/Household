import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarHorizontalDayComponent } from './hairdressing-calendar-horizontal-day.component';

describe('HairdressingCalendarHorizontalDayComponent', () => {
  let component: HairdressingCalendarHorizontalDayComponent;
  let fixture: ComponentFixture<HairdressingCalendarHorizontalDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarHorizontalDayComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarHorizontalDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
