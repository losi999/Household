import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectList } from './project-list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { ProjectListItem } from '@household/app/project/project-list-item/project-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { MatActionList } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';

describe('ProjectList', () => {
  const ProjectListItemStub = createStubComponent(ProjectListItem);

  let fixture: ComponentFixture<ProjectList>;
  let selector: IElementSelector;

  const projects = [
    testDataFactory.project.response(),
    testDataFactory.project.response(),
  ];

  const render = async (projectList: Responses.Project[]) => {
    TestBed.resetTestingModule();
    
    await TestBed.configureTestingModule({
      imports: [ProjectList],
    })
      .overrideComponent(ProjectList, {
        remove: {
          imports: [ProjectListItem],
        },
        add: {
          imports: [ProjectListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectList);
    fixture.componentRef.setInput('projects', projectList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('action list', () => {
    it('should be rendered', async () => {
      await render(projects);

      expect(selector.getComponent(MatActionList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for each project', async () => {
      await render(projects);

      const listItems = selector.listComponents<ProjectListItem>(ProjectListItemStub, MatActionList);

      expect(listItems.length).toBe(projects.length);
      listItems.forEach((listItem, index) => {
        expect(listItem.componentInstance.project()).toEqual(projects[index]);
      });
    });

    it('should not be rendered if there are no projects', async () => {
      await render([]);

      expect(selector.listComponents(ProjectListItemStub, MatActionList).length).toBe(0);
    });
  });
});
