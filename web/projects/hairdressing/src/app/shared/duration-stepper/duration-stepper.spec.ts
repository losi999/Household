import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationStepper } from './duration-stepper';

describe('DurationStepper', () => {
  let component: DurationStepper;
  let fixture: ComponentFixture<DurationStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationStepper],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DurationStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
