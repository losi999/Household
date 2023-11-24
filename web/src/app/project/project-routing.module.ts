import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectHomeComponent } from 'src/app/project/project-home/project-home.component';
import { projectListResolver } from 'src/app/shared/resolvers';

const routes: Routes = [
  {
    path: '',
    component: ProjectHomeComponent,
    resolve: {
      projects: projectListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule { }
