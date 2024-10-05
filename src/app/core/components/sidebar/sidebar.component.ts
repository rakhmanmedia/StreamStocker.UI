import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  isActive: boolean = false;

  stocksMenu = [
    { name: 'Expected Stock', link: 'auth' },
    { name: 'Empty Stock' },
    { name: 'Loaded Stock' }
  ];
  
  selectedIndex = -1;

  linkActive(index: number): void {
    this.selectedIndex = index;
  }
}
