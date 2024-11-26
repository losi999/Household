import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionLoanEditComponent } from './transaction-loan-edit.component';

describe('TransactionLoanEditComponent', () => {
  let component: TransactionLoanEditComponent;
  let fixture: ComponentFixture<TransactionLoanEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionLoanEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionLoanEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
