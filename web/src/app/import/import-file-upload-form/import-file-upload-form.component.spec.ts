import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFileUploadFormComponent } from './import-file-upload-form.component';

describe('ImportFileUploadFormComponent', () => {
  let component: ImportFileUploadFormComponent;
  let fixture: ComponentFixture<ImportFileUploadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportFileUploadFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportFileUploadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
