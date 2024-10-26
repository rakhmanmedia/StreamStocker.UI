import { Component, HostBinding } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {

  @HostBinding('class') hostClass = 'sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 dark:border-r-coal-100 fixed z-20 hidden lg:flex flex-col items-stretch shrink-0';
	@HostBinding('attr.data-drawer') drawer = 'true';
	@HostBinding('attr.data-drawer-class') drawerClass = 'drawer drawer-start top-0 bottom-0';
	@HostBinding('attr.data-drawer-enable') drawerEnable = 'true|lg:false';
	@HostBinding('attr.id') id = 'sidebar';

  stockerMenu = [
    {
      category: '', subcategories: [
        {
          name: "Dashboard", isAccordionShow: false, items: [
            { name: 'Главная', link: '/dashboard' }
          ]
        },
      ]
    },
    {
      category: 'Основное', subcategories: [
        {
          name: "Стоки", isAccordionShow: false, items: [
            { name: 'Сток ожидаемых', link: '/expected-stock' },
            { name: 'Сток порожних', link: '/empty-stock' },
            { name: 'Сток груженых', link: '/loaded-stock' }
          ]
        }
      ]
    },
    {
      category: 'Инструменты', subcategories: []
    }
  ];

  isAccordionShow: boolean = false

  constructor (private titleServ: TitleService,
    private router: Router) {

    // Show active menuItem
    this.stockerMenu.forEach(category => {

      category.subcategories.forEach(subcategory => {
          subcategory.items.forEach(item => {
          if (this.router.url.includes(item.link))
            subcategory.isAccordionShow = true;
        })
      })
    });
  }

  clickMenuItem(itemName: string) {
    this.titleServ.setTitle(itemName);   
  }
}
