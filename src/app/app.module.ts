import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './components/auth/auth.component';
import { STOCKER_API_URL, STOCKER_AUTH_HEADER_OPT } from './app-injection-tokens';
import { environment } from '../environments/environment.development';
import { JwtModule } from '@auth0/angular-jwt';
import { ACCESS_TOKEN_KEY } from './services/auth.service';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { Page404Component } from './components/page-404/page-404.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentComponent } from './core/components/content/content.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { ExpectedStockComponent } from './components/expected-stock/expected-stock.component';
import { EmptyStockComponent } from './components/empty-stock/empty-stock.component';
import { LoadedStockComponent } from './components/loaded-stock/loaded-stock.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { ExpectedStockDetailComponent } from './components/expected-stock-detail/expected-stock-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SidebarComponent,
    HeaderComponent,
    Page404Component,
    ContentComponent,
    DashboardComponent,
    FooterComponent,
    ExpectedStockComponent,
    EmptyStockComponent,
    LoadedStockComponent,
    LayoutComponent,
    ExpectedStockDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterLink,
    RouterLinkActive,

    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem(ACCESS_TOKEN_KEY);
        },
        allowedDomains: environment.whiteListedDomains
      }
    })
  ],
  providers: [
    { 
      provide: STOCKER_API_URL,
      useValue: environment.stockerApi
    },
    {
      provide: STOCKER_AUTH_HEADER_OPT,
      useValue: environment.stokerAuthHeaderOpt
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { 

}

