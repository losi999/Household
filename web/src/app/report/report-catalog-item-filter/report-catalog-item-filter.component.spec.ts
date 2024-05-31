import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCatalogItemFilterComponent } from './report-catalog-item-filter.component';

describe('ReportCatalogItemFilterComponent', () => {
  let component: ReportCatalogItemFilterComponent;
  let fixture: ComponentFixture<ReportCatalogItemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportCatalogItemFilterComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReportCatalogItemFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
