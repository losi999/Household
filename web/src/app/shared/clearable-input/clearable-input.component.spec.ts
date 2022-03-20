import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearableInputComponent } from './clearable-input.component';

describe('ClearableInputComponent', () => {
  let component: ClearableInputComponent;
  let fixture: ComponentFixture<ClearableInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClearableInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearableInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
