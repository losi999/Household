import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTransactionsHomeComponent } from './account-transactions-home.component';

describe('AccountTransactionsHomeComponent', () => {
  let component: AccountTransactionsHomeComponent;
  let fixture: ComponentFixture<AccountTransactionsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTransactionsHomeComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTransactionsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
