import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsListComponent } from './import-transactions-list.component';

describe('ImportTransactionsListComponent', () => {
  let component: ImportTransactionsListComponent;
  let fixture: ComponentFixture<ImportTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
