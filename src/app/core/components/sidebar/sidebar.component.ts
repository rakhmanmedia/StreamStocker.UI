import { Component } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  stocksMenu = [
    { name: 'Expected Stock', link: 'expected-stock' },
    { name: 'Empty Stock', link: 'empty-stock' },
    { name: 'Loaded Stock', link: 'loaded-stock' }
  ];

  selectedMenuItem: string = 'Dashboard'; 

  constructor (private titleServ: TitleService){}

  clickMenuItem(itemName: string) {
    this.titleServ.setTitle(itemName);   
  }
}
