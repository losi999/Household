import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAutocompleteInputComponent } from './account-autocomplete-input.component';

describe('AccountAutocompleteInputComponent', () => {
  let component: AccountAutocompleteInputComponent;
  let fixture: ComponentFixture<AccountAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
