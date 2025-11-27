import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPriceSummaryComponent } from './job-price-summary.component';

describe.skip('JobPriceSummaryComponent', () => {
  let component: JobPriceSummaryComponent;
  let fixture: ComponentFixture<JobPriceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPriceSummaryComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
