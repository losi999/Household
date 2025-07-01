import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsProjectComponent } from './transaction-details-project.component';

describe('TransactionDetailsProjectComponent', () => {
  let component: TransactionDetailsProjectComponent;
  let fixture: ComponentFixture<TransactionDetailsProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
