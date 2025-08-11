import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingCalendarHomeComponent } from './hairdressing-calendar-home.component';

describe('HairdressingCalendarHomeComponent', () => {
  let component: HairdressingCalendarHomeComponent;
  let fixture: ComponentFixture<HairdressingCalendarHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingCalendarHomeComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingCalendarHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
