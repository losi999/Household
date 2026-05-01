import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSubmenu } from './bottom-submenu';

describe('BottomSubmenu', () => {
  let component: BottomSubmenu;
  let fixture: ComponentFixture<BottomSubmenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSubmenu],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BottomSubmenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
