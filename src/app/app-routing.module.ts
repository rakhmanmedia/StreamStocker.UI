import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

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
        path: '',
        component: DashboardComponent
      },
      {
        path: 'stocks',
        component: StocksComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
