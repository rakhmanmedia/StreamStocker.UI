import { AfterContentInit, Component, HostBinding, OnInit } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {

  stockerMenu = [
    {
      category: '', subcategories: [
        {
          name: "Dashboard", isAccordionShow: false, items: [
            { name: 'Главная', link: 'dashboard', badge_soon: false }
          ]
        },
      ]
    },
    {
      category: 'Основное', subcategories: [
        {
          name: "Стоки", isAccordionShow: false, items: [
            { name: 'Сток ожидаемых', link: 'expected-stock', badge_soon: false },
            { name: 'Сток порожних', link: 'empty-stock', badge_soon: true },
            { name: 'Сток груженых', link: 'loaded-stock', badge_soon: true }
          ]
        }
      ]
    },
    {
      category: 'Инструменты', subcategories: [
        { name: 'Справочники', isAccordionShow: false, items:[]}
      ]
    }
  ];

  isAccordionShow: boolean = false

  constructor(private titleServ: TitleService,
    private router: Router, private location: Location) {

    // Show active menuItem
    this.stockerMenu.forEach(category => {

      category.subcategories.forEach(subcategory => {
        subcategory.items.forEach(item => {
          if (this.location.path().includes(item.link))
            subcategory.isAccordionShow = true;
        })
      })
    });
  }

  clickMenuItem(itemName: string) {
    this.titleServ.setTitle(itemName);
  }
}
