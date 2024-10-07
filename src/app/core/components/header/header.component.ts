import { Component } from '@angular/core';
import { AuthService, CURRENT_USER } from '../../../services/auth.service';
import { TitleService } from '../../../services/titleService/title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {

  readonly userEmail:string | null = null;
  title = 'Dashboard';

  constructor (private authServ: AuthService, private titleServ: TitleService) {
    if (localStorage.getItem(CURRENT_USER) != null)
      this.userEmail = localStorage.getItem(CURRENT_USER);

    this.titleServ.getTitle().subscribe(res => this.title = res);
  }
  
  onLogOut(){
    this.authServ.logOut();
  }

}
