import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarEntryDialogComponent } from './hairdressing-calendar-entry-dialog.component';

describe('HairdressingCalendarEntryFormComponent', () => {
  let component: HairdressingCalendarEntryDialogComponent;
  let fixture: ComponentFixture<HairdressingCalendarEntryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarEntryDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarEntryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
