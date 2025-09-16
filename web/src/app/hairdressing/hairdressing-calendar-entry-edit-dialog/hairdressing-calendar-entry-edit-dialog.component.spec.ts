import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarEntryEditDialogComponent } from './hairdressing-calendar-entry-edit-dialog.component';

describe('HairdressingCalendarEntryFormComponent', () => {
  let component: HairdressingCalendarEntryEditDialogComponent;
  let fixture: ComponentFixture<HairdressingCalendarEntryEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarEntryEditDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarEntryEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
