import { Component, HostListener, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

interface BusinessType {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface CompanyResult {
  id: string;
  name: string;
  regNumber: string;
  address: string;
}

@Component({
  selector: 'app-business-registration',
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BusinessRegistrationComponent implements OnInit {
  currentStep: string = 'business-type';
  businessTypeSubStep: string = 'entity-type'; // 'entity-type' or 'company-name'
  selectedBusinessType: string = '';
  isMobile: boolean = false;
  welcomeTitle: string = 'Welcome to Groov';
  welcomeDescription: string = 'Share your business details for a quick and secure setup, unlocking tailored financial solutions.';
  
  searchControl = new FormControl('');
  showResults: boolean = false;
  companyResults: CompanyResult[] = [];
  
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
    // Initial check for screen size
    this.checkScreenSize();
    // Force detection on load
    setTimeout(() => {
      this.checkScreenSize();
    }, 0);
  }
  
  @HostListener('window:resize')
  checkScreenSize() {
    // Set isMobile to true if screen width is less than 768px (bootstrap md breakpoint)
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // Log only when the state changes
    if (wasMobile !== this.isMobile) {
      console.log('Mobile state changed:', this.isMobile);
    }
  }
  
  selectBusinessType(id: string) {
    this.businessTypes.forEach(type => {
      type.selected = type.id === id;
    });
    this.selectedBusinessType = id;
  }
  
  nextStep() {
    if (this.currentStep === 'business-type') {
      if (this.businessTypeSubStep === 'entity-type') {
        // Check if a business type is selected
        const selectedType = this.businessTypes.find(type => type.selected);
        if (selectedType) {
          if (selectedType.id === 'sole-trader') {
            // For sole trader, skip company name step and go to merchant details
            this.currentStep = 'merchant-details';
          } else {
            // For other business types, go to company name step
            this.businessTypeSubStep = 'company-name';
            // Generate dummy company results
            this.generateDummyCompanyResults();
          }
        }
      } else if (this.businessTypeSubStep === 'company-name') {
        // Move to merchant details step
        this.currentStep = 'merchant-details';
      }
    } else {
      // For other steps, navigate to landing page for now
      this.router.navigate(['/']);
    }
  }
  
  cancel() {
    if (this.businessTypeSubStep === 'company-name') {
      // Go back to entity type selection
      this.businessTypeSubStep = 'entity-type';
    } else {
      // Otherwise navigate to landing page
      this.router.navigate(['/']);
    }
  }
  
  searchCompany() {
    const searchTerm = this.searchControl.value?.trim().toLowerCase() || '';
    if (searchTerm.length > 0) {
      this.showResults = true;
      // Filter results based on search term
      this.companyResults = this.generateDummyCompanyResults().filter(company => 
        company.name.toLowerCase().includes(searchTerm));
    } else {
      this.showResults = false;
    }
  }
  
  selectCompany(company: CompanyResult) {
    this.searchControl.setValue(company.name);
    this.showResults = false;
  }
  
  clearSearch() {
    this.searchControl.setValue('');
    this.showResults = false;
  }
  
  private generateDummyCompanyResults(): CompanyResult[] {
    this.companyResults = [
      {
        id: '1',
        name: 'Groov Business Consultancy Ltd',
        regNumber: '07272081',
        address: '90 York Road, Working, Surrey, Englan, GU22 7XR'
      },
      {
        id: '2',
        name: 'Groov Technology Ltd.',
        regNumber: '07272081',
        address: '90 York Road, Working, Surrey, Englan, GU22 7XR'
      },
      {
        id: '3',
        name: 'Groov Enterprise Business Consultancy Ltd',
        regNumber: '07272081',
        address: '90 York Road, Working, Surrey, Englan, GU22 7XR'
      },
      {
        id: '4',
        name: 'Groov Enterprise Business Consultancy Ltd',
        regNumber: '07272081',
        address: '90 York Road, Working, Surrey, Englan, GU22 7XR'
      }
    ];
    return this.companyResults;
  }
}
