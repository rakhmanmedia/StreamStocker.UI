import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { RedirectedContainersComponent } from './components/expected/redirected-containers/redirected-containers.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TabsDirective } from './directives/tabs.directive';
import { AccordionDirective } from './directives/accordion.directive';
import { EmptyStockComponent } from './components/empty/empty-stock/empty-stock.component';
import { EmptyContainersComponent } from './components/empty/empty-containers/empty-containers/empty-containers.component';
import { DrawerAttachmentsComponent } from './core/elements/drawer-attachments/drawer-attachments.component';
import { AutocompleteInputComponent } from './core/elements/autocomplete-input/autocomplete-input.component';
import { ColumnFilterComponent } from './core/elements/column-filter/column-filter.component';

// Функция для загрузки переводов из файлов
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }
  

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
        LoadedStockComponent,
        LayoutComponent,
        ExpectedStockDetailComponent,
        SearchLookupComponent,
        ContainerValidatorDirective,
        PreloaderComponent,
        DeletedContainersComponent,
        RedirectedContainersComponent,
        TabsDirective,
        AccordionDirective,
        EmptyStockComponent,
        EmptyContainersComponent,
        DrawerAttachmentsComponent,
        AutocompleteInputComponent,
        ColumnFilterComponent
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

        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          }),

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