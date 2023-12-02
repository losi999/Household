import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAllListComponent } from './select-all-list.component';

describe('SelectAllListComponent', () => {
  let component: SelectAllListComponent;
  let fixture: ComponentFixture<SelectAllListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAllListComponent],
    })
      .compileComponents();
    
    fixture = TestBed.createComponent(SelectAllListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
