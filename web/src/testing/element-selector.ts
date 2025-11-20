import { DebugElement, Type } from '@angular/core';
import { By } from '@angular/platform-browser';

type TypedDebugElement<T, H extends HTMLElement = HTMLElement> = Omit<DebugElement, 'nativeElement' | 'componentInstance'> & {
  nativeElement: H;
  componentInstance: T
};

export type IElementSelector = {
  getComponent<T, H extends HTMLElement = HTMLElement>(component: Type<T>, parent?: DebugElement, ...nesting: (Type<any> | string)[]): TypedDebugElement<T, H>;
  getComponent<T, H extends HTMLElement = HTMLElement>(component: Type<T>, ...nesting: (Type<any> | string)[]): TypedDebugElement<T, H>;
  getComponentByCss<T, H extends HTMLElement = HTMLElement>(cssQuery: string, parent?: DebugElement, ...nesting: Type<any>[]): TypedDebugElement<T, H>;
  getComponentByCss<T, H extends HTMLElement = HTMLElement>(cssQuery: string, ...nesting: Type<any>[]): TypedDebugElement<T, H>;
  getComponentByTestId<T, H extends HTMLElement = HTMLElement>(testId: string, parent?: DebugElement, ...nesting: Type<any>[]): TypedDebugElement<T, H>;
  getComponentByTestId<T, H extends HTMLElement = HTMLElement>(testId: string, ...nesting: Type<any>[]): TypedDebugElement<T, H>;
  listComponents<T, H extends HTMLElement = HTMLElement>(component: Type<T>, parent?: DebugElement, ...nesting: (Type<any> | string)[]): TypedDebugElement<T, H>[];
  listComponents<T, H extends HTMLElement = HTMLElement>(component: Type<T>, ...nesting: (Type<any> | string)[]): TypedDebugElement<T, H>[];
  getElementByCss<H extends HTMLElement = HTMLElement>(cssQuery: string, parent?: DebugElement, ...nesting: Type<any>[]): TypedDebugElement<never, H>;
  getElementByCss<H extends HTMLElement = HTMLElement>(cssQuery: string, ...nesting: Type<any>[]): TypedDebugElement<never, H>;
  getElementByTestId<H extends HTMLElement = HTMLElement>(testId: string, parent?: DebugElement, ...nesting: Type<any>[]): TypedDebugElement<never, H>;
  getElementByTestId<H extends HTMLElement = HTMLElement>(testId: string, ...nesting: Type<any>[]): TypedDebugElement<never, H>;
};

export const elementSelectorFactory = (root: DebugElement): IElementSelector => {
  const queryNesting = (innerRoot: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
    if (!innerRoot) {
      return root;
    }

    let parent = innerRoot instanceof DebugElement ? innerRoot : root;
    
    nesting?.forEach((n) => {
      if (typeof n === 'string') {
        parent = parent.query(By.css(n));
      } else {
        parent = parent.query(By.directive(n));
      }
    });

    return parent;    
  };

  const getTestIdSelector = (testId: string) => `[data-testId="${testId}"]`;

  return {
    getComponent: (component: Type<any>, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).query(By.directive(component));
    },
    getComponentByCss: (cssQuery: string, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).query(By.css(cssQuery));
    },
    getComponentByTestId: (testId: string, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).query(By.css(getTestIdSelector(testId)));
    },
    listComponents: (component: Type<any>, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).queryAll(By.directive(component));
    },
    getElementByCss: (cssQuery: string, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).query(By.css(cssQuery)) as TypedDebugElement<never>;
    },
    getElementByTestId: (testId: string, parent: DebugElement | (Type<any> | string), ...nesting: (Type<any> | string)[]) => {
      return queryNesting(parent, ...nesting).query(By.css(getTestIdSelector(testId))) as TypedDebugElement<never>;
    },
  };
};
