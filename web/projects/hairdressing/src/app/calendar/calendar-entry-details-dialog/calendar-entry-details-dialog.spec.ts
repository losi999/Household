import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryDetailsDialog } from './calendar-entry-details-dialog';

describe('CalendarEntryDetailsDialog', () => {
  let component: CalendarEntryDetailsDialog;
  let fixture: ComponentFixture<CalendarEntryDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEntryDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
