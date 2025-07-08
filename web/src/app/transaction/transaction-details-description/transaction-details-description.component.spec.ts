import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsDescriptionComponent } from './transaction-details-description.component';

describe('TransactionDetailsDescriptionComponent', () => {
  let component: TransactionDetailsDescriptionComponent;
  let fixture: ComponentFixture<TransactionDetailsDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsDescriptionComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
