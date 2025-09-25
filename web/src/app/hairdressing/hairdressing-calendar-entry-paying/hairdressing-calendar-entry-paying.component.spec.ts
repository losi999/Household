import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarEntryPayingComponent } from './hairdressing-calendar-entry-paying.component';

describe('HairdressingCalendarEntryPayingComponent', () => {
  let component: HairdressingCalendarEntryPayingComponent;
  let fixture: ComponentFixture<HairdressingCalendarEntryPayingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarEntryPayingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarEntryPayingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
