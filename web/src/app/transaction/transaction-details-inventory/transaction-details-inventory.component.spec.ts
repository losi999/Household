import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsInventoryComponent } from './transaction-details-inventory.component';

describe('TransactionDetailsInventoryComponent', () => {
  let component: TransactionDetailsInventoryComponent;
  let fixture: ComponentFixture<TransactionDetailsInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsInventoryComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
