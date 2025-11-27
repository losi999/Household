import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsDuplicateListComponent } from './import-transactions-duplicate-list.component';

describe.skip('ImportTransactionsDuplicateListComponent', () => {
  let component: ImportTransactionsDuplicateListComponent;
  let fixture: ComponentFixture<ImportTransactionsDuplicateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsDuplicateListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsDuplicateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
