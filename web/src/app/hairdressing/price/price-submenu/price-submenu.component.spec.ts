import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceSubmenuComponent } from './price-submenu.component';

describe('HairdressingPriceSubmenuComponent', () => {
  let component: PriceSubmenuComponent;
  let fixture: ComponentFixture<PriceSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceSubmenuComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PriceSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
