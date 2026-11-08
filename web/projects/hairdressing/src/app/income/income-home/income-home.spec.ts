import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { IncomeHome } from './income-home';

describe('IncomeHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);

  let fixture: ComponentFixture<IncomeHome>;
  let selector: IElementSelector;

  const getToolbar = () => {
    return selector.getComponent(ToolbarStub);
  };

  const render = async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [IncomeHome],
    })
      .overrideComponent(IncomeHome, {
        remove: {
          imports: [Toolbar],
        },
        add: {
          imports: [ToolbarStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IncomeHome);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(getToolbar().componentInstance.title()).toBe('Bevétel');
    });
  });

  describe('image', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getElementByCss<HTMLImageElement>('img').nativeElement.getAttribute('src')).toBe('./bear.gif');
    });
  });
});
