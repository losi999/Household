import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionShortDetailsComponent } from './transaction-short-details.component';

describe('TransactionShortDetailsComponent', () => {
  let component: TransactionShortDetailsComponent;
  let fixture: ComponentFixture<TransactionShortDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionShortDetailsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionShortDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
