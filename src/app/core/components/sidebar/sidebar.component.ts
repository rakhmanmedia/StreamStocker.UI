import { Component } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  stocksMenu = [
    { name: 'Сток ожидаемых', link: 'expected-stock', parent: 'Стоки' },
    { name: 'Сток порожних', link: 'empty-stock' },
    { name: 'Сток груженых', link: 'loaded-stock' }
  ];

  selectedMenuItem: string = 'Dashboard'; 

  constructor (private titleServ: TitleService){}

  clickMenuItem(itemName: string) {
    this.titleServ.setTitle(itemName);   
  }
}
