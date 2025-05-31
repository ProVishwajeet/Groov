import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

interface BusinessType {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

@Component({
  selector: 'app-business-registration',
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BusinessRegistrationComponent implements OnInit {
  currentStep: string = 'business-type';
  isMobile: boolean = false;
  welcomeTitle: string = 'Welcome to Groov';
  welcomeDescription: string = 'Share your business details for a quick and secure setup, unlocking tailored financial solutions.';
  
  businessTypes: BusinessType[] = [
    {
      id: 'sole-trader',
      name: 'Sole Trader',
      description: 'A business structure where you are the sole owner.',
      selected: false
    },
    {
      id: 'partnership',
      name: 'Partnership',
      description: 'Ideal for businesses with two or more owners sharing responsibilities and profits.',
      selected: false
    },
    {
      id: 'ltd',
      name: 'Ltd Company (Ltd)',
      description: 'A private company structure with limited liability for its shareholders.',
      selected: false
    },
    {
      id: 'llp',
      name: 'Limited Liability Partnership (LLP)',
      description: 'A partnership model where members have limited liability protection.',
      selected: false
    },
    {
      id: 'plc',
      name: 'Public Limited Company (PLC)',
      description: 'A corporate structure where shares are publicly traded on the stock market.',
      selected: false
    }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.checkScreenSize();
  }
  
  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
  
  selectBusinessType(id: string) {
    this.businessTypes.forEach(type => {
      type.selected = type.id === id;
    });
  }
  
  nextStep() {
    // In a real application, you would navigate to the next step
    // For now, we'll just go back to the landing page
    this.router.navigate(['/']);
  }
  
  cancel() {
    this.router.navigate(['/']);
  }
}
