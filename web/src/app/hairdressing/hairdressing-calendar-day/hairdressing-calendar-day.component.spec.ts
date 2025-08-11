import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarDayComponent } from './hairdressing-calendar-day.component';

describe('HairdressingCalendarDayComponent', () => {
  let component: HairdressingCalendarDayComponent;
  let fixture: ComponentFixture<HairdressingCalendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarDayComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
