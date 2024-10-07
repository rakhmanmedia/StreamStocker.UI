import { Component } from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrl: './content.component.css',
  host : {'class': 'grow content pt-5', 'id': 'content', 'role': 'content'}
})
export class ContentComponent {

}
