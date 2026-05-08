import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryEditDialog } from './calendar-entry-edit-dialog';

describe('CalendarEntryEditDialog', () => {
  let component: CalendarEntryEditDialog;
  let fixture: ComponentFixture<CalendarEntryEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEntryEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryEditDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
