import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJobAutocompleteInputComponent } from './customer-job-autocomplete-input.component';

describe('CustomerJobAutocompleteInputComponent', () => {
  let component: CustomerJobAutocompleteInputComponent;
  let fixture: ComponentFixture<CustomerJobAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerJobAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerJobAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
