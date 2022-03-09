import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountRoutingModule } from 'src/app/account/account-routing.module';

const routes: Routes = [{
  path: '',
  loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
