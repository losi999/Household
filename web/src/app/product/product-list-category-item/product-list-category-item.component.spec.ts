import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListCategoryItemComponent } from './product-list-category-item.component';

describe('ProductListCategoryItemComponent', () => {
  let component: ProductListCategoryItemComponent;
  let fixture: ComponentFixture<ProductListCategoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductListCategoryItemComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListCategoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
