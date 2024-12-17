import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAutocompleteInputComponent } from './project-autocomplete-input.component';

describe('ProjectAutocompleteInputComponent', () => {
  let component: ProjectAutocompleteInputComponent;
  let fixture: ComponentFixture<ProjectAutocompleteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAutocompleteInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
