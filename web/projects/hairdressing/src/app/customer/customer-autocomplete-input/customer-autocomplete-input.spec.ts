import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAutocompleteInput } from './customer-autocomplete-input';

describe('CustomerAutocompleteInput', () => {
  let component: CustomerAutocompleteInput;
  let fixture: ComponentFixture<CustomerAutocompleteInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAutocompleteInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerAutocompleteInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
