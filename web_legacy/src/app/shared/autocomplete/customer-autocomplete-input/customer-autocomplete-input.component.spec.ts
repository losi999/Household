import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAutocompleteInputComponent } from './customer-autocomplete-input.component';

xdescribe('CustomerAutocompleteInputComponent', () => {
  let component: CustomerAutocompleteInputComponent;
  let fixture: ComponentFixture<CustomerAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
