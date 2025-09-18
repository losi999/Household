import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarEntryDetailsDialogComponent } from './hairdressing-calendar-entry-details-dialog.component';

describe('HairdressingCalendarEntryDetailsDialogComponent', () => {
  let component: HairdressingCalendarEntryDetailsDialogComponent;
  let fixture: ComponentFixture<HairdressingCalendarEntryDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HairdressingCalendarEntryDetailsDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarEntryDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
