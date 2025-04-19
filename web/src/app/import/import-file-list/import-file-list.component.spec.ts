import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFileListComponent } from './import-file-list.component';

describe('ImportFileListComponent', () => {
  let component: ImportFileListComponent;
  let fixture: ComponentFixture<ImportFileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportFileListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
