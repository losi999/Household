import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMergeDialogComponent } from './category-merge-dialog.component';

describe('CategoryMergeDialogComponent', () => {
  let component: CategoryMergeDialogComponent;
  let fixture: ComponentFixture<CategoryMergeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryMergeDialogComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
