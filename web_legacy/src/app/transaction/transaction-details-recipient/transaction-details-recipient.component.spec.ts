import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsRecipientComponent } from './transaction-details-recipient.component';

xdescribe('TransactionDetailsRecipientComponent', () => {
  let component: TransactionDetailsRecipientComponent;
  let fixture: ComponentFixture<TransactionDetailsRecipientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsRecipientComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
