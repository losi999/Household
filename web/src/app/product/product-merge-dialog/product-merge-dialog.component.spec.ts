import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMergeDialogComponent } from './product-merge-dialog.component';

describe('ProductMergeDialogComponent', () => {
  let component: ProductMergeDialogComponent;
  let fixture: ComponentFixture<ProductMergeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductMergeDialogComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
