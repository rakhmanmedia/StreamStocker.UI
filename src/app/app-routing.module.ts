import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpectedStockComponent } from './components/expected-stock/expected-stock.component';
import { EmptyStockComponent } from './components/empty-stock/empty-stock.component';
import { LoadedStockComponent } from './components/loaded-stock/loaded-stock.component';

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
        path: 'expected-stock',
        component: ExpectedStockComponent
      },
      {
        path: 'empty-stock',
        component: EmptyStockComponent
      },
      {
        path: 'loaded-stock',
        component: LoadedStockComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
