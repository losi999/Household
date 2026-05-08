import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWorkdayDialog } from './calendar-workday-dialog';

describe('CalendarWorkdayDialog', () => {
  let component: CalendarWorkdayDialog;
  let fixture: ComponentFixture<CalendarWorkdayDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarWorkdayDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarWorkdayDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
