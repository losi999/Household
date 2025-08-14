import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarEntryFormComponent } from './hairdressing-calendar-entry-form.component';

describe('HairdressingCalendarEntryFormComponent', () => {
  let component: HairdressingCalendarEntryFormComponent;
  let fixture: ComponentFixture<HairdressingCalendarEntryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarEntryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarEntryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
