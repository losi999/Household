import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSplitTransactionListItemComponent } from './account-split-transaction-list-item.component';

describe('AccountSplitTransactionListItemComponent', () => {
  let component: AccountSplitTransactionListItemComponent;
  let fixture: ComponentFixture<AccountSplitTransactionListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountSplitTransactionListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSplitTransactionListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
