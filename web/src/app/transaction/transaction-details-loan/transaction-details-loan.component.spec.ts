import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsLoanComponent } from './transaction-details-loan.component';

describe('TransactionDetailsLoanComponent', () => {
  let component: TransactionDetailsLoanComponent;
  let fixture: ComponentFixture<TransactionDetailsLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsLoanComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
