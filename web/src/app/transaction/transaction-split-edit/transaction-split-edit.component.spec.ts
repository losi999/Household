import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSplitEditComponent } from './transaction-split-edit.component';

describe('TransactionSplitEditComponent', () => {
  let component: TransactionSplitEditComponent;
  let fixture: ComponentFixture<TransactionSplitEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionSplitEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionSplitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
