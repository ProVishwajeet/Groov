import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconBgColor: string = '#3e7bea';
  @Input() actionText: string = 'READ MORE';
  @Input() actionLink: string = '#';
  @Input() locked: boolean = true;
}
