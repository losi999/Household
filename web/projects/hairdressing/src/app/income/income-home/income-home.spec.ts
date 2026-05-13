import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeHome } from './income-home';

describe('IncomeHome', () => {
  let component: IncomeHome;
  let fixture: ComponentFixture<IncomeHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeHome],
    })
      .compileComponents();

    fixture = TestBed.createComponent(IncomeHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
