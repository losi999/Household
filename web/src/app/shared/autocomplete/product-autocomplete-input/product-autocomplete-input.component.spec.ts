import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAutocompleteInputComponent } from './product-autocomplete-input.component';

describe('ProductAutocompleteInputComponent', () => {
  let component: ProductAutocompleteInputComponent;
  let fixture: ComponentFixture<ProductAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
