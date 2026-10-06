import { Component, Directive, input, model, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createStubComponent } from './stub-component';
import { elementSelectorFactory, IElementSelector } from './element-selector';

@Component({
  selector: 'shared-stub-target',
  template: '<span>real template</span>',
})
class StubTarget {
  label = input<string>();
  value = model<string>('');
  cleared = output<string>();
}

@Component({
  selector: 'shared-projecting-stub-target',
  template: '<ng-content></ng-content>',
})
class ProjectingStubTarget { }

@Component({
  imports: [
    StubTarget,
    ProjectingStubTarget,
  ],
  template: `
    <shared-stub-target [label]="label()" [(value)]="value" (cleared)="cleared = $event" />
    <shared-projecting-stub-target><span>projected content</span></shared-projecting-stub-target>
  `,
})
class Host {
  label = signal('host label');
  value = 'host value';
  cleared: string;
}

@Directive({
  selector: '[sharedNotAComponent]',
})
class NotAComponent { }

describe('createStubComponent', () => {
  const StubTargetStub = createStubComponent(StubTarget);
  const ProjectingStubTargetStub = createStubComponent(ProjectingStubTarget);

  let fixture: ComponentFixture<Host>;
  let selector: IElementSelector;

  const getStub = () => {
    return selector.getComponent<StubTarget>(StubTargetStub);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    })
      .overrideComponent(Host, {
        remove: {
          imports: [
            StubTarget,
            ProjectingStubTarget,
          ],
        },
        add: {
          imports: [
            StubTargetStub,
            ProjectingStubTargetStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Host);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  });

  it('should replace the real component', () => {
    expect(selector.getComponent(StubTarget)).toBeFalsy();
    expect(getStub()).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('real template');
  });

  describe('inputs', () => {
    it('should be readable as a signal', () => {
      expect(getStub().componentInstance.label()).toBe('host label');
    });

    it('should be updated when the parent changes them', async () => {
      fixture.componentInstance.label.set('changed label');

      await fixture.whenStable();

      expect(getStub().componentInstance.label()).toBe('changed label');
    });
  });

  describe('models', () => {
    it('should be readable as a signal', () => {
      expect(getStub().componentInstance.value()).toBe('host value');
    });

    it('should write back to the parent', async () => {
      getStub().componentInstance.value.set('changed value');

      await fixture.whenStable();

      expect(fixture.componentInstance.value).toBe('changed value');
    });
  });

  describe('outputs', () => {
    it('should be emittable', async () => {
      getStub().componentInstance.cleared.emit('emitted value');

      await fixture.whenStable();

      expect(fixture.componentInstance.cleared).toBe('emitted value');
    });
  });

  describe('content projection', () => {
    it('should be kept', () => {
      expect(selector.getComponent(ProjectingStubTargetStub).nativeElement.textContent.trim()).toBe('projected content');
    });
  });

  describe('a type that is not a component', () => {
    it('should not be stubbable', () => {
      expect(() => createStubComponent(NotAComponent)).toThrow('NotAComponent is not a component, so it cannot be stubbed');
    });
  });
});
