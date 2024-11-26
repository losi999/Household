import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPaymentEditComponent } from './transaction-payment-edit.component';

describe('TransactionPaymentEditComponent', () => {
  let component: TransactionPaymentEditComponent;
  let fixture: ComponentFixture<TransactionPaymentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionPaymentEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionPaymentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
