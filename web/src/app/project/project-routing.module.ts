import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectHomeComponent } from 'src/app/project/project-home/project-home.component';
import { ProjectListResolver } from 'src/app/resolvers/project-list.resolver';

const routes: Routes = [
  {
    path: '',
    component: ProjectHomeComponent,
    resolve: {
      projects: ProjectListResolver,
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule { }
