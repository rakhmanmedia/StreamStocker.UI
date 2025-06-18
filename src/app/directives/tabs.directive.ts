import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTabs]'
})
export class TabsDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click', ['$event'])
  toggleTab(event: Event) {
    const target = event.target as HTMLElement;
    const tabButton = target.closest('.tab') as HTMLElement;

    if (!tabButton) return;

    const tabId = tabButton.getAttribute('data-tab-toggle');

    if (!tabId) return;

    const tabContainer = this.el.nativeElement;
    const tabs = tabContainer.querySelectorAll('.tab');
    const tabContents = tabContainer.querySelectorAll('[id^="tab_"]');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(taabContent => taabContent.classList.add('hidden'));

    tabButton.classList.add('active');
    const activeTabContent = document.querySelector(tabId) as HTMLElement;
    if (activeTabContent) activeTabContent.classList.remove('hidden');
  }
}
