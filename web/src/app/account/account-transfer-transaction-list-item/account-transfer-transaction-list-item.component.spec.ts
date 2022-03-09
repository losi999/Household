import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransferTransactionListItemComponent } from './account-transfer-transaction-list-item.component';

describe('AccountTransferTransactionListItemComponent', () => {
  let component: AccountTransferTransactionListItemComponent;
  let fixture: ComponentFixture<AccountTransferTransactionListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTransferTransactionListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTransferTransactionListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
