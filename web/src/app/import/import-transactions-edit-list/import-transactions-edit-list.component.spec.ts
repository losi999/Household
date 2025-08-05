import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsEditListComponent } from './import-transactions-edit-list.component';

describe('ImportTransactionsEditListComponent', () => {
  let component: ImportTransactionsEditListComponent;
  let fixture: ComponentFixture<ImportTransactionsEditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsEditListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsEditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
