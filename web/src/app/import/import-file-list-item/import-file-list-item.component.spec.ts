import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFileListItemComponent } from './import-file-list-item.component';

describe('ImportFileListItemComponent', () => {
  let component: ImportFileListItemComponent;
  let fixture: ComponentFixture<ImportFileListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportFileListItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImportFileListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
