import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTransactionsHomeComponent } from './import-transactions-home.component';

describe('ImportTransactionsHomeComponent', () => {
  let component: ImportTransactionsHomeComponent;
  let fixture: ComponentFixture<ImportTransactionsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportTransactionsHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTransactionsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
