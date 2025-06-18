import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { InitializeScriptService } from './services/initializer-services/initialize-script.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoading: boolean = true;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private initScriptServ: InitializeScriptService
  ) {
    this.translate.setDefaultLang('ru');
    const savedLang = localStorage.getItem('lang') || 'ru';
    this.translate.use(savedLang);

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart)
        this.isLoading = true;
      else if (
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
        setTimeout(() => {
          this.isLoading = false;
        }, 500);     
    });
  }
}
