import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsListItemComponent } from './import-transactions-list-item.component';

describe('ImportTransactionsListItemComponent', () => {
  let component: ImportTransactionsListItemComponent;
  let fixture: ComponentFixture<ImportTransactionsListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
