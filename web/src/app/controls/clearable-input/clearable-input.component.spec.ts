import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearableInputComponent } from './clearable-input.component';

describe('ClearableInputComponent', () => {
  let component: ClearableInputComponent;
  let fixture: ComponentFixture<ClearableInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearableInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearableInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
