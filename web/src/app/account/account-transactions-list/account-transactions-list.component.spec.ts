import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransactionsListComponent } from './account-transactions-list.component';

describe('AccountTransactionsListComponent', () => {
  let component: AccountTransactionsListComponent;
  let fixture: ComponentFixture<AccountTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTransactionsListComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
