import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsCategoryComponent } from './transaction-details-category.component';

describe('TransactionDetailsCategoryComponent', () => {
  let component: TransactionDetailsCategoryComponent;
  let fixture: ComponentFixture<TransactionDetailsCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailsCategoryComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
