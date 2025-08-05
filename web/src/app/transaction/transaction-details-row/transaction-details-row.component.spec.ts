import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsRowComponent } from './transaction-details-row.component';

describe('TransactionDetailsRowComponent', () => {
  let component: TransactionDetailsRowComponent;
  let fixture: ComponentFixture<TransactionDetailsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsRowComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
