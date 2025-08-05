import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsTransferComponent } from './transaction-details-transfer.component';

describe('TransactionDetailsTransferComponent', () => {
  let component: TransactionDetailsTransferComponent;
  let fixture: ComponentFixture<TransactionDetailsTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsTransferComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
