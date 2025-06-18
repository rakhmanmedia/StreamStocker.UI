import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpectedStockComponent } from './components/expected-stock/expected-stock.component';
import { ExpectedStockDetailComponent } from './components/expected-stock-detail/expected-stock-detail.component';
import { Page404Component } from './components/page-404/page-404.component';
import { DeletedContainersComponent } from './components/expected/deleted-containers/deleted-containers.component';
import { RedirectedContainersComponent } from './components/expected/redirected-containers/redirected-containers.component';
import { EmptyStockComponent } from './components/empty/empty-stock/empty-stock.component';
import { EmptyContainersComponent } from './components/empty/empty-containers/empty-containers/empty-containers.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  { path: 'expected-stock', component: ExpectedStockComponent },
  { path: 'deleted-containers', component: DeletedContainersComponent },
  { path: 'redirected-containers', component: RedirectedContainersComponent },
  { path: 'expected-stock/:id', component: ExpectedStockDetailComponent },
  { path: 'expected-stock/detail', component: ExpectedStockDetailComponent },
  { path: 'empty-stock', component: EmptyStockComponent },
  { path: 'empty-stock/:id', component: EmptyContainersComponent },
  { path: '**', component: Page404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
