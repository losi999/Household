import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTransferEditComponent } from './transaction-transfer-edit.component';

describe('TransactionTransferEditComponent', () => {
  let component: TransactionTransferEditComponent;
  let fixture: ComponentFixture<TransactionTransferEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionTransferEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionTransferEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
