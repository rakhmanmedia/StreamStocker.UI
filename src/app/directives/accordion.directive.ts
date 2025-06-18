import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAccordion]'
})
export class AccordionDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click', ['$event'])
  toggleAccordion(event: Event) {
    const target = event.target as HTMLElement;
    const accordionToggle = target.closest('.accordion-toggle') as HTMLElement;
    
    if (!accordionToggle) return;

    const accordionId = accordionToggle.getAttribute('data-accordion-toggle');

    if (!accordionId) return;

    const accordionContent = document.querySelector(accordionId) as HTMLElement;

    if (!accordionContent) return;

    const isExpanded = accordionToggle.getAttribute('aria-expanded') == 'true';

    accordionToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    accordionContent.classList.toggle('hidden', isExpanded);
  }
}
