import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconText } from './icon-text';

describe('IconText', () => {
  let component: IconText;
  let fixture: ComponentFixture<IconText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconText);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
