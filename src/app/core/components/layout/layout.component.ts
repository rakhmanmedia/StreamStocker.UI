import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  host: {'class':'flex grow'}
})

export class LayoutComponent {

  constructor(private authServ: AuthService){}

  public get isLogIn(): boolean {
    //console.log(this.authServ.isAuthenticated());
    return this.authServ.isAuthenticated();
  }
}
