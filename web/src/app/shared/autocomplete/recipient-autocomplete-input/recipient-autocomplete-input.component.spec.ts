import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientAutocompleteInputComponent } from './recipient-autocomplete-input.component';

describe('RecipientAutocompleteInputComponent', () => {
  let component: RecipientAutocompleteInputComponent;
  let fixture: ComponentFixture<RecipientAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipientAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
