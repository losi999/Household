import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsInvoiceComponent } from './transaction-details-invoice.component';

describe('TransactionDetailsInvoiceComponent', () => {
  let component: TransactionDetailsInvoiceComponent;
  let fixture: ComponentFixture<TransactionDetailsInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsInvoiceComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
