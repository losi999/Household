import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPriceCalculatorComponent } from './job-price-calculator.component';

describe.skip('JobPriceCalculatorComponent', () => {
  let component: JobPriceCalculatorComponent;
  let fixture: ComponentFixture<JobPriceCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPriceCalculatorComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
