import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryAutocompleteInputComponent } from './category-autocomplete-input.component';

describe('CategoryAutocompleteInputComponent', () => {
  let component: CategoryAutocompleteInputComponent;
  let fixture: ComponentFixture<CategoryAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAutocompleteInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
