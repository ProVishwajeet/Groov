import { Component, HostListener, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

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
  currentStep: string = 'business-type'; // 'business-type', 'merchant-details', 'business-address', 'turnover-funding'
  businessTypeSubStep: string = 'entity-type'; // 'entity-type', 'company-name'
  selectedBusinessType: string = '';
  isMobile: boolean = false;
  welcomeTitle: string = 'Welcome Aboard.';
  welcomeDescription: string = 'Share your business details for a quick and secure setup, unlocking tailored financial solutions.';
  
  // Form controls for all steps
  searchControl = new FormControl('');
  firstNameControl = new FormControl('', Validators.required);
  lastNameControl = new FormControl('', Validators.required);
  phoneNumberControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  termsAgreedControl = new FormControl(false, Validators.requiredTrue);
  
  // Business Address form controls
  addressSearchControl = new FormControl('');
  addressLine1Control = new FormControl('');
  addressLine2Control = new FormControl('');
  townCityControl = new FormControl('');
  stateRegionControl = new FormControl('');
  postCodeControl = new FormControl('');
  
  // Address display state
  hasRegisteredAddress: boolean = false;
  registeredCompanyName: string = '';
  registeredCompanyAddress: string = '';
  
  // Address search results
  showAddressResults: boolean = false;
  addressResults: string[] = [
    '456 Elm Avenue - Manchester, M1 2AB, United Kingdom',
    '123 Main Street - London, W1U 6RT, United Kingdom',
    '789 Oak Road - Birmingham, B2 3CD, United Kingdom',
    '101 Maple Lane - Glasgow, G1 4EF, United Kingdom',
    '202 Pine Drive - Edinburgh, EH1 5GH, United Kingdom',
    '303 Birch Boulevard - Cardiff, CF10 6HJ, United Kingdom'
  ];
  
  // Turnover/Funding Need properties
  turnoverOptions: string[] = ['More than £2M', '£1M - 2M', '£500K - 1M', '£200K - 500K', '£100K - 200K', 'Less than £100K'];
  fundingOptions: string[] = ['More than £2M', '£1M - 2M', '£500K - 1M', '£200K - 500K', '£100K - 200K', 'Less than £100K'];
  purposeOptions: string[] = ['Working Capital', 'Equipment Purchase', 'Expansion', 'Inventory', 'Debt Refinancing', 'Other'];
  selectedTurnover: string = '';
  selectedFunding: string = '';
  selectedPurposes: string[] = [];
  hasExistingLoans: string = '';
  loanProviderName: string = '';
  loanAmount: string = '';
  showTurnoverDropdown: boolean = false;
  showFundingDropdown: boolean = false;
  showPurposeDropdown: boolean = false;
  
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
    
    // Set up address search listener
    this.addressSearchControl.valueChanges.subscribe(value => {
      this.searchAddress(value);
    });
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
    // Handle next step based on current step
    if (this.currentStep === 'business-type') {
      if (this.businessTypeSubStep === 'entity-type') {
        // Check if a business type is selected
        if (!this.selectedBusinessType) {
          alert('Please select a business type to continue.');
          return;
        }
        
        // Move to company name search sub-step
        this.businessTypeSubStep = 'company-name';
        this.generateDummyCompanyResults();
      } else if (this.businessTypeSubStep === 'company-name') {
        // Check if company name is selected
        if (!this.registeredCompanyName) {
          alert('Please select a company to continue.');
          return;
        }
        
        // Move to merchant details step
        this.currentStep = 'merchant-details';
        this.updateProgressSteps('business-type', true);
      }
    } else if (this.currentStep === 'merchant-details') {
      // Validate merchant details form
      if (!this.firstNameControl.value || !this.lastNameControl.value || 
          !this.phoneNumberControl.value || !this.emailControl.value || 
          !this.termsAgreedControl.value) {
        alert('Please fill in all required fields and agree to the terms.');
        return;
      }
      
      // Move to business address step
      this.currentStep = 'business-address';
      this.updateProgressSteps('merchant-details', true);
    } else if (this.currentStep === 'business-address') {
      // Validate business address
      if (!this.validateBusinessAddress()) {
        return;
      }
      
      // Mark step as completed and move to turnover/funding step
      this.updateProgressSteps('business-address', true);
      this.currentStep = 'turnover-funding';
      
      // Set default company details if not already set (for demo purposes)
      if (!this.registeredCompanyName || !this.registeredCompanyAddress) {
        this.registeredCompanyName = 'Groov Technology Ltd.';
        this.registeredCompanyAddress = '07227081 - 90 York Road, Woking, Surrey, England, GU22 7XR';
        this.hasRegisteredAddress = true;
      }
    } else {
      // For other steps, navigate to landing page for now
      this.router.navigate(['/']);
    }
  }
  
  cancel() {
    if (this.currentStep === 'merchant-details') {
      // Go back to business type step
      this.currentStep = 'business-type';
      // If the selected business type is not sole trader, go back to company name step
      const selectedType = this.businessTypes.find(type => type.selected);
      if (selectedType && selectedType.id !== 'sole-trader') {
        this.businessTypeSubStep = 'company-name';
      }
    } else if (this.currentStep === 'business-address') {
      // Go back to merchant details step
      this.currentStep = 'merchant-details';
    } else if (this.businessTypeSubStep === 'company-name') {
      // Go back to entity type selection
      this.businessTypeSubStep = 'entity-type';
    } else {
      // Otherwise navigate to landing page
      this.router.navigate(['/']);
    }
  }
  
  validateBusinessAddress(): boolean {
    // Basic validation for required fields
    const addressLine1Valid = this.addressLine1Control.value ? this.addressLine1Control.value.trim().length > 0 : false;
    const townCityValid = this.townCityControl.value ? this.townCityControl.value.trim().length > 0 : false;
    const postCodeValid = this.postCodeControl.value ? this.postCodeControl.value.trim().length > 0 : false;
    
    if (!addressLine1Valid || !townCityValid || !postCodeValid) {
      alert('Please fill in all required address fields.');
      return false;
    }
    
    // If validation passes, set the registered address flag to true
    this.hasRegisteredAddress = true;
    // Update the registered address details
    this.updateRegisteredAddress();
    
    return true;
  }
  
  updateRegisteredAddress() {
    // Update the registered company address from form fields
    const addressLine1 = this.addressLine1Control.value || '';
    const addressLine2 = this.addressLine2Control.value || '';
    const townCity = this.townCityControl.value || '';
    const stateRegion = this.stateRegionControl.value || '';
    const postCode = this.postCodeControl.value || '';
    
    // Format the address string
    let addressParts = [];
    if (addressLine1) addressParts.push(addressLine1);
    if (addressLine2) addressParts.push(addressLine2);
    if (townCity) addressParts.push(townCity);
    if (stateRegion) addressParts.push(stateRegion);
    if (postCode) addressParts.push(postCode);
    
    this.registeredCompanyAddress = addressParts.join(', ');
  }
  
  editRegisteredAddress() {
    // Toggle to edit mode
    this.hasRegisteredAddress = false;
    
    // Navigate to the business address step
    this.currentStep = 'business-address';
    
    // Update progress steps to show we're on the business address step
    this.updateProgressSteps('business-address', false);
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
    
    // Set the company name and address for the registered address display
    this.registeredCompanyName = company.name;
    this.registeredCompanyAddress = company.address;
    
    // Parse the company address to set individual form fields
    // This is a simplified example - in a real app, you'd parse the address properly
    const addressParts = company.address.split(',');
    if (addressParts.length >= 3) {
      this.addressLine1Control.setValue(addressParts[0].trim());
      this.addressLine2Control.setValue(addressParts[1].trim());
      this.townCityControl.setValue(addressParts[2].trim());
      if (addressParts.length > 3) {
        this.stateRegionControl.setValue(addressParts[3].trim());
      }
      if (addressParts.length > 4) {
        this.postCodeControl.setValue(addressParts[4].trim());
      }
    }
    
    // Set the registered address flag to true since we have address data
    this.hasRegisteredAddress = true;
  }
  
  clearSearch() {
    this.searchControl.setValue('');
    this.showResults = false;
  }
  
  searchAddress(searchTerm: string | null) {
    if (searchTerm && searchTerm.trim().length > 0) {
      // Filter address results based on search term
      const filteredResults = this.addressResults.filter(address => 
        address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Show results if we have any matches
      this.showAddressResults = filteredResults.length > 0;
    } else {
      // Hide results if search term is empty
      this.showAddressResults = false;
    }
  }
  
  selectAddress(address: string) {
    // Set the search control value to the selected address
    this.addressSearchControl.setValue(address);
    
    // Hide the results
    this.showAddressResults = false;
    
    // Parse the address to set individual form fields
    const parts = address.split(' - ');
    if (parts.length >= 2) {
      // First part is the street address
      this.addressLine1Control.setValue(parts[0]);
      
      // Second part contains city, postal code, and country
      const locationParts = parts[1].split(', ');
      if (locationParts.length >= 3) {
        // City with postal code
        const cityPostalParts = locationParts[0].split(', ');
        this.townCityControl.setValue(cityPostalParts[0]);
        this.postCodeControl.setValue(locationParts[1]);
        this.stateRegionControl.setValue(locationParts[0]);
      }
    }
    
    // Set the registered address flag to true since we have address data
    this.hasRegisteredAddress = true;
    this.updateRegisteredAddress();
  }
  
  isStepCompleted(stepId: string): boolean {
    // Check if the step is completed based on the current step
    if (stepId === 'business-type') {
      return this.currentStep === 'merchant-details' || this.currentStep === 'business-address' || this.currentStep === 'turnover-funding';
    } else if (stepId === 'merchant-details') {
      return this.currentStep === 'business-address' || this.currentStep === 'turnover-funding';
    } else if (stepId === 'business-address') {
      return this.currentStep === 'turnover-funding';
    } else if (stepId === 'turnover-funding') {
      // This would be true if we had a next step after turnover-funding
      return false;
    }
    return false;
  }
  
  private updateProgressSteps(stepId: string, completed: boolean) {
    // We don't need to manually update the progress steps anymore
    // The ProgressStepsComponent will handle this through its input binding to currentStep
    // This is just here for future expansion if needed
    console.log(`Step ${stepId} completion status: ${completed}`);
  }
  
  // Turnover/Funding Need methods
  toggleTurnoverDropdown() {
    this.showTurnoverDropdown = !this.showTurnoverDropdown;
    this.showFundingDropdown = false;
    this.showPurposeDropdown = false;
  }
  
  toggleFundingDropdown() {
    this.showFundingDropdown = !this.showFundingDropdown;
    this.showTurnoverDropdown = false;
    this.showPurposeDropdown = false;
  }
  
  togglePurposeDropdown() {
    this.showPurposeDropdown = !this.showPurposeDropdown;
    this.showTurnoverDropdown = false;
    this.showFundingDropdown = false;
  }
  
  selectTurnover(option: string) {
    this.selectedTurnover = option;
    this.showTurnoverDropdown = false;
  }
  
  selectFunding(option: string) {
    this.selectedFunding = option;
    this.showFundingDropdown = false;
  }
  
  selectPurpose(option: string) {
    // Check if the option is already selected
    const index = this.selectedPurposes.indexOf(option);
    
    if (index === -1) {
      // Add the option if not already selected
      this.selectedPurposes.push(option);
    }
    
    // Keep the dropdown open for multiple selections
  }
  
  removePurpose(option: string) {
    const index = this.selectedPurposes.indexOf(option);
    if (index !== -1) {
      this.selectedPurposes.splice(index, 1);
    }
  }
  
  selectExistingLoans(option: string) {
    this.hasExistingLoans = option;
    
    // Clear loan details if NO is selected
    if (option === 'NO') {
      this.loanProviderName = '';
      this.loanAmount = '';
    }
  }
  
  submitAndContinue() {
    // Validate all required fields for this step
    if (!this.selectedTurnover || !this.selectedFunding || this.selectedPurposes.length === 0 || !this.hasExistingLoans) {
      alert('Please complete all required fields before continuing.');
      return;
    }

    // If user has existing loans, validate loan details
    if (this.hasExistingLoans === 'YES' && (!this.loanProviderName || !this.loanAmount)) {
      alert('Please provide loan details before continuing.');
      return;
    }

    // Prepare data for submission
    const turnoverFundingData = {
      turnover: this.selectedTurnover,
      fundingAmount: this.selectedFunding,
      purposes: this.selectedPurposes,
      hasExistingLoans: this.hasExistingLoans,
      loanDetails: this.hasExistingLoans === 'YES' ? {
        providerName: this.loanProviderName,
        amount: this.loanAmount
      } : null
    };
    
    console.log('Submitting funding data:', turnoverFundingData);
    
    // For now, just show a success message
    alert('Thank you for your submission! We will be in touch soon.');
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
