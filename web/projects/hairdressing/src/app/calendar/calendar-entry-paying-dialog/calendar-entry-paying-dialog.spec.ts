import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryPayingDialog } from './calendar-entry-paying-dialog';

describe('CalendarEntryPayingDialog', () => {
  let component: CalendarEntryPayingDialog;
  let fixture: ComponentFixture<CalendarEntryPayingDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEntryPayingDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryPayingDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
