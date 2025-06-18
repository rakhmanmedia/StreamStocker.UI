import { Injectable } from '@angular/core';

declare var KTAccordion: any;
declare var KTTabs: any;
declare var KTDropdown: any;

@Injectable({
  providedIn: 'root'
})
export class MetronicService {

  constructor() { }

  initializeAccordion(): void {
    if (KTAccordion)
      KTAccordion.init();  // Инициализация компонента Accordion
  }
  
  initializeTabs(): void {
    if (KTTabs)
      KTTabs.init(); // Инициализация компонента Tabs
  }

  initializeDropdawn(): void {
    KTDropdown.init();
  }
}
