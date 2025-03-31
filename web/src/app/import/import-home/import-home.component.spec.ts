import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportHomeComponent } from './import-home.component';

describe('ImportHomeComponent', () => {
  let component: ImportHomeComponent;
  let fixture: ComponentFixture<ImportHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
