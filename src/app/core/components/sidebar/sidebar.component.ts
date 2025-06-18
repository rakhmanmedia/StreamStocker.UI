import { AfterContentInit, Component, HostBinding, OnInit } from '@angular/core';
import { TitleService } from '../../../services/titleService/title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  
  stockerMenu: any[] = [];

  isAccordionShow: boolean = false

  constructor(
    private translate: TranslateService,
    private titleServ: TitleService,
    private router: Router, private location: Location) {

      this.loadMenu();

    // Show active menuItem
    // this.stockerMenu.forEach(category => {

    //   category.subcategories.forEach(subcategory => {
    //     subcategory.items.forEach(item => {
    //       if (this.location.path().includes(item.link))
    //         subcategory.isAccordionShow = true;
    //     })
    //   })
    // });
  }

  loadMenu(): void {
    this.translate.get([
      'MENU.EXPECTED_CONTAINERS',
      'MENU.EXPECTED',
      'MENU.DELETED',
      'MENU.REDIRECTED',
      'MENU.EMPTY_CONTAINERS',
      'MENU.EMPTY_AVAILABLE'
    ]).subscribe(translations => {
      console.log(translations);
      
      this.stockerMenu = [
        {
          category: '', subcategories: [
            {
              name: "Dashboard", icon: 'ki-filled ki-element-11 text-lg', isAccordionShow: false, items: [
                { name: 'Главная', link: 'dashboard', badge_soon: false }
              ]
            },
          ]
        },
        {
          category: 'Основное', subcategories: [
            {
              name: translations['MENU.EXPECTED_CONTAINERS'], icon: 'ki-filled ki-time text-lg', isAccordionShow: false, items: [
                { name: translations['MENU.EXPECTED'], link: 'expected-stock', badge_soon: false },
                { name: translations['MENU.DELETED'], link: 'deleted-containers', badge_soon: false },
                { name: translations['MENU.REDIRECTED'], link: 'redirected-containers', badge_soon: false },
                { name: 'Типы контейнеров', link: 'null', badge_soon: true },
                { name: 'ИСО коды', link: 'null', badge_soon: true },
              ]
            },
            {
              name: translations['MENU.EMPTY_CONTAINERS'], icon: 'ki-filled ki-logistic text-lg', isAccordionShow: false, items: [
                { name: translations['MENU.EMPTY_AVAILABLE'], link: 'empty-stock', badge_soon: false },
              ]
            }
          ]
        },
        {
          category: 'Инструменты', subcategories: [
            { name: 'Справочники', icon: 'ki-filled ki-book-open text-lg', isAccordionShow: false, items:[]}
          ]
        }
      ];

      this.stockerMenu.forEach(category => {

        category.subcategories.forEach(subcategory => {
          subcategory.items.forEach(item => {
            if (this.location.path().includes(item.link))
              subcategory.isAccordionShow = true;
          })
        })
      });
    });
  }

  clickMenuItem(itemName: string) {
    console.log(itemName);
  }
}
