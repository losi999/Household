import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDateRangeFilterComponent } from './report-date-range-filter.component';

describe('ReportDateRangeFilterComponent', () => {
  let component: ReportDateRangeFilterComponent;
  let fixture: ComponentFixture<ReportDateRangeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDateRangeFilterComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReportDateRangeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
