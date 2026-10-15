import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListItem } from './transaction-list-item';

describe('TransactionListItem', () => {
  let component: TransactionListItem;
  let fixture: ComponentFixture<TransactionListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionListItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
