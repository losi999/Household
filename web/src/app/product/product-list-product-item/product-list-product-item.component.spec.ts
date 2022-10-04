import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListProductItemComponent } from './product-list-product-item.component';

describe('ProductListProductItemComponent', () => {
  let component: ProductListProductItemComponent;
  let fixture: ComponentFixture<ProductListProductItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductListProductItemComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListProductItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
