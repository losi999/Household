import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyvalueAutocompleteInputComponent } from './keyvalue-autocomplete-input.component';

describe('KeyvalueAutocompleteInputComponent', () => {
  let component: KeyvalueAutocompleteInputComponent;
  let fixture: ComponentFixture<KeyvalueAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyvalueAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(KeyvalueAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
