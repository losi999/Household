import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceCalculatorComponent } from './account-balance-calculator.component';

xdescribe('AccountBalanceCalculatorComponent', () => {
  let component: AccountBalanceCalculatorComponent;
  let fixture: ComponentFixture<AccountBalanceCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountBalanceCalculatorComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountBalanceCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
