import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  showError: boolean = false;
  errMessage:string = '';

  constructor(private authServ: AuthService,
    private router: Router) {
  }

  onLogin(email: string, password: string) {
    this.authServ.logIn(email, password).subscribe(res => { 
      if (res.data != null) {
        this.showError = false;
        this.router.navigateByUrl('auth');
      }
      else { 
        this.errMessage = res.description;
        this.showError = true; 
      }
    }, err => {
      this.showError = true;
      this.errMessage = err.error;
    });
  }
}
