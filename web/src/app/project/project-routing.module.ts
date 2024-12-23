import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectHomeComponent } from '@household/web/app/project/project-home/project-home.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule { }
