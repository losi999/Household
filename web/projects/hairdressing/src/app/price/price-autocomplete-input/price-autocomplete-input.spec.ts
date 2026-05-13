import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceAutocompleteInput } from './price-autocomplete-input';

describe('PriceAutocompleteInput', () => {
  let component: PriceAutocompleteInput;
  let fixture: ComponentFixture<PriceAutocompleteInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceAutocompleteInput],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PriceAutocompleteInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
