import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  constructor(private authServ: AuthService,
    private router: Router
  ) {

  }

  onLogin(email: string, password: string) {
    this.authServ.logIn(email, password).subscribe(res => {
      this.router.navigateByUrl('auth')
    }, error => { 
      alert('Wrong email or password!')});
  }
}
