import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSubmenuComponent } from './bottom-submenu.component';

describe('BottomSubmenuComponent', () => {
  let component: BottomSubmenuComponent;
  let fixture: ComponentFixture<BottomSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSubmenuComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BottomSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
