import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPriceSummary } from './job-price-summary';

describe('JobPriceSummary', () => {
  let component: JobPriceSummary;
  let fixture: ComponentFixture<JobPriceSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPriceSummary],
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
