import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHome } from './calendar-home';

describe('CalendarHome', () => {
  let component: CalendarHome;
  let fixture: ComponentFixture<CalendarHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHome],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
