import { Component } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  stocksMenu = [
    { name: 'Expected Stock', link: 'stocks' },
    { name: 'Empty Stock', link: 'stocks1' },
    { name: 'Loaded Stock', link: 'stocks2' }
  ];

  selectedMenuItem: string = 'Dashboard'; 

  constructor (private titleServ: TitleService){}

  clickMenuItem(itemName: string) {
    this.titleServ.setTitle(itemName);   
  }
}
