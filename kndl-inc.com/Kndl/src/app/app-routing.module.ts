import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './standard-model/home.component';
import { LoginComponent } from './login/login.component';
import { PriceOptionComponent } from './standard-model/pricing/price-option/price-option.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { KndlComponent } from './kndl/kndl.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnBoardingComponent } from './dashboard/on-boarding/on-boarding.component';
import { PackageDetailComponent } from './package-detail/package-detail.component';

const routes: Routes = [
  {
    path: '',
    component: KndlComponent
  }, {
    path: 'login',
    component: LoginComponent,
  }, {
    path: 'price/:item',
    component: PriceOptionComponent,
  }, {
    path: 'logout',
    component: LoginComponent,
  }, {
    path: 'package/:id',
    component: PackageDetailComponent,
  }, {
    path: 'dashboard',
    component: DashboardComponent,
  }, {
    path: '**',
    component: PageNotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
