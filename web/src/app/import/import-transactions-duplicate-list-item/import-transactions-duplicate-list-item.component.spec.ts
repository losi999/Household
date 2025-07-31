import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsDuplicateListItemComponent } from './import-transactions-duplicate-list-item.component';

describe('ImportTransactionsDuplicateListItemComponent', () => {
  let component: ImportTransactionsDuplicateListItemComponent;
  let fixture: ComponentFixture<ImportTransactionsDuplicateListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsDuplicateListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsDuplicateListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
