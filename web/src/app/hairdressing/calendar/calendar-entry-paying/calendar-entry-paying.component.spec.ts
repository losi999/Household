import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryPayingComponent } from './calendar-entry-paying.component';

describe('HairdressingCalendarEntryPayingComponent', () => {
  let component: CalendarEntryPayingComponent;
  let fixture: ComponentFixture<CalendarEntryPayingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarEntryPayingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryPayingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
