import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPaymentTransactionListItemComponent } from './account-payment-transaction-list-item.component';

describe('AccountPaymentTransactionListItemComponent', () => {
  let component: AccountPaymentTransactionListItemComponent;
  let fixture: ComponentFixture<AccountPaymentTransactionListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountPaymentTransactionListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPaymentTransactionListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
