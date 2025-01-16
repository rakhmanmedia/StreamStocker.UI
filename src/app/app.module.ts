import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { DataTablesModule } from 'angular-datatables';
import { SearchLookupComponent } from './core/elements/search-lookup/search-lookup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContainerValidatorDirective } from './directives/container-validator.directive';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PreloaderComponent } from './core/components/preloader/preloader.component';
import { DeletedContainersComponent } from './components/expected/deleted-containers/deleted-containers.component';

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
        SearchLookupComponent,
        ContainerValidatorDirective,
        PreloaderComponent,
        DeletedContainersComponent,
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RouterLink,
        RouterLinkActive,
        DataTablesModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            closeButton: true,
            timeOut: 5000,
            preventDuplicates: true,
          }),

        JwtModule.forRoot({
            config: {
                tokenGetter: () => {
                    return localStorage.getItem(ACCESS_TOKEN_KEY);
                },
                allowedDomains: environment.whiteListedDomains
            }
        })], providers: [
            {
                provide: STOCKER_API_URL,
                useValue: environment.stockerApi
            },
            {
                provide: STOCKER_AUTH_HEADER_OPT,
                useValue: environment.stokerAuthHeaderOpt
            },
            provideHttpClient(withInterceptorsFromDi())
        ]
})

export class AppModule {
}