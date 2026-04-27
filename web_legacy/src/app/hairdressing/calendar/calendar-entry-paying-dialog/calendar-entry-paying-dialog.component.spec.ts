import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEntryPayingDialogComponent } from './calendar-entry-paying-dialog.component';

xdescribe('CalendarEntryPayingDialogComponent', () => {
  let component: CalendarEntryPayingDialogComponent;
  let fixture: ComponentFixture<CalendarEntryPayingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarEntryPayingDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryPayingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
