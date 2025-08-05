import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsEditListItemComponent } from './import-transactions-edit-list-item.component';

describe('ImportTransactionsEditListItemComponent', () => {
  let component: ImportTransactionsEditListItemComponent;
  let fixture: ComponentFixture<ImportTransactionsEditListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsEditListItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsEditListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
