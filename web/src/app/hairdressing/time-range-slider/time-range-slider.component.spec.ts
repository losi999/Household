import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRangeSliderComponent } from './time-range-slider.component';

describe('TimeRangeSliderComponent', () => {
  let component: TimeRangeSliderComponent;
  let fixture: ComponentFixture<TimeRangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeRangeSliderComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimeRangeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
