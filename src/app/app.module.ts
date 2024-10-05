import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './components/auth/auth.component';
import { STOCKER_API_URL } from './app-injection-tokens';
import { environment } from '../environments/environment.development';
import { JwtModule } from '@auth0/angular-jwt';
import { ACCESS_TOKEN_KEY } from './services/auth.service';
import { StocksComponent } from './components/stocks/stocks.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { WrapperComponent } from './core/components/wrapper/wrapper.component';
import { HeaderComponent } from './core/components/header/header.component';
import { Page404Component } from './components/page-404/page-404.component';

export function tokenGetter() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    StocksComponent,
    LayoutComponent,
    SidebarComponent,
    WrapperComponent,
    HeaderComponent,
    Page404Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 

    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: environment.whiteListedDomains
      }
    })
  ],
  providers: [
    { 
      provide: STOCKER_API_URL,
      useValue: environment.stockerApi
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
