import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPriceCalculator } from './job-price-calculator';

describe('JobPriceCalculator', () => {
  let component: JobPriceCalculator;
  let fixture: ComponentFixture<JobPriceCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPriceCalculator],
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
