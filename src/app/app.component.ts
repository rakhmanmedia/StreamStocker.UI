import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoading: boolean = true;

  constructor(private router: Router) {
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
