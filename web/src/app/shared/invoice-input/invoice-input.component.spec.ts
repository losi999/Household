import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceInputComponent } from './invoice-input.component';

describe('InvoiceInputComponent', () => {
  let component: InvoiceInputComponent;
  let fixture: ComponentFixture<InvoiceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceInputComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
