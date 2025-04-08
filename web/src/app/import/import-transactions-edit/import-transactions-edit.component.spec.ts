import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsEditComponent } from './import-transactions-edit.component';

describe('ImportTransactionsEditComponent', () => {
  let component: ImportTransactionsEditComponent;
  let fixture: ComponentFixture<ImportTransactionsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
