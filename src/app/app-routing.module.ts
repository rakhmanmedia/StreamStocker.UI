import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpectedStockComponent } from './components/expected-stock/expected-stock.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { ExpectedStockDetailComponent } from './components/expected-stock-detail/expected-stock-detail.component';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'expected-stock',
        component: ExpectedStockComponent,
      },
      {
        path: 'expected-stock/detail',
        component: ExpectedStockDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
