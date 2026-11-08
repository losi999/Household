import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountBalanceCalculator } from './account-balance-calculator';

describe.skip('AccountBalanceCalculator', () => {
  let component: AccountBalanceCalculator;
  let fixture: ComponentFixture<AccountBalanceCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBalanceCalculator],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountBalanceCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
