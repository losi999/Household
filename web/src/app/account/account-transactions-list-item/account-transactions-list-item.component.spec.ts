import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransactionsListItemComponent } from './account-transactions-list-item.component';

describe('AccountTransactionListItemComponent', () => {
  let component: AccountTransactionsListItemComponent;
  let fixture: ComponentFixture<AccountTransactionsListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTransactionsListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTransactionsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
