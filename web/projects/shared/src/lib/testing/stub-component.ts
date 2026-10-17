import { Component, EventEmitter, reflectComponentType, signal, Type, WritableSignal } from '@angular/core';

/**
 * Creates a stub of a component, keeping its public template contract (selector, inputs, outputs and
 * content projection slots) but dropping its template, logic and dependencies. Use it with
 * `TestBed.overrideComponent` to test a component in isolation, without having to provide the
 * services its children happen to inject:
 *
 * ```ts
 * const ToolbarStub = createStubComponent(Toolbar);
 *
 * TestBed.configureTestingModule({ imports: [ProjectHome] })
 *   .overrideComponent(ProjectHome, {
 *     remove: { imports: [Toolbar] },
 *     add: { imports: [ToolbarStub] },
 *   });
 * ```
 *
 * Inputs stay readable the same way as on the real component (`stub.title()`), outputs can be
 * emitted from the test (`stub.saved.emit(value)`) and a `model()` works in both directions
 * (`stub.value()` reads what the parent bound, `stub.value.set(...)` writes back to it).
 *
 * The returned type is `Type<T>` so assertions keep the real component's input/output types; only
 * its template contract is actually implemented.
 */
export const createStubComponent = <T>(component: Type<T>): Type<T> => {
  const mirror = reflectComponentType(component);

  if (!mirror) {
    throw new Error(`${component.name} is not a component, so it cannot be stubbed`);
  }

  const inputPropNames = mirror.inputs.map(({ propName }) => propName);

  class ComponentStub {
    constructor() {
      mirror.inputs.forEach(({ propName }) => {
        const value = signal(undefined);
        const write = value.set.bind(value);

        Object.defineProperty(this, propName, {
          get: () => value,
          set: write,
        });
      });

      mirror.outputs.forEach(({ propName }) => {
        const emitter = new EventEmitter();

        if (!inputPropNames.includes(propName)) {
          this[propName] = emitter;

          return;
        }

        // a model() is a single property acting as both an input and an output, so its signal has to
        // emit to the parent when the test writes to it
        const modelSignal = this[propName] as WritableSignal<any> & Pick<EventEmitter<any>, 'emit' | 'subscribe'>;
        const write = modelSignal.set.bind(modelSignal);

        modelSignal.set = (value) => {
          write(value);
          emitter.emit(value);
        };
        modelSignal.subscribe = emitter.subscribe.bind(emitter);
        modelSignal.emit = emitter.emit.bind(emitter);
      });
    }
  }

  return Component({
    selector: mirror.selector,
    // the stub would otherwise generate the same component ID as the component it replaces (NG0912)
    host: {
      'data-stub': '',
    },
    template: mirror.ngContentSelectors.map(contentSelector => contentSelector === '*' ? '<ng-content></ng-content>' : `<ng-content select="${contentSelector}"></ng-content>`)
      .join(''),
    inputs: mirror.inputs.map(({ propName, templateName }) => ({
      name: propName,
      alias: templateName,
    })),
    outputs: mirror.outputs.map(({ propName, templateName }) => `${propName}: ${templateName}`),
  })(ComponentStub) as Type<T>;
};
