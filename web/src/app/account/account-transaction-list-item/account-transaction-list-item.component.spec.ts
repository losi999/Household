import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransactionListItemComponent } from './account-transaction-list-item.component';

describe('AccountTransactionListItemComponent', () => {
  let component: AccountTransactionListItemComponent;
  let fixture: ComponentFixture<AccountTransactionListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTransactionListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTransactionListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
