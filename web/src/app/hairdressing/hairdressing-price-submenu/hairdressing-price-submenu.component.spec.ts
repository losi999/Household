import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingPriceSubmenuComponent } from './hairdressing-price-submenu.component';

describe('HairdressingPriceSubmenuComponent', () => {
  let component: HairdressingPriceSubmenuComponent;
  let fixture: ComponentFixture<HairdressingPriceSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingPriceSubmenuComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingPriceSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
