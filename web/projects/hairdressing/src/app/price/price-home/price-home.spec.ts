import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceHome } from './price-home';

describe('PriceHome', () => {
  let component: PriceHome;
  let fixture: ComponentFixture<PriceHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceHome],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PriceHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
