import { Component, HostListener, ViewEncapsulation, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ConsentService } from '../../services/consent.service';
import { CompanySearchService, CompanySearchResult } from '../../services/company-search.service';
import { CompanyOfficersService, CompanyOfficer } from '../../services/company-officers.service';
import { AddressSearchService, AddressSuggestion } from '../../services/address-search.service';

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

interface ApiCompanyResult {
  companyName: string;
  companyNumber: string;
}

@Component({
  selector: 'app-business-registration',
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BusinessRegistrationComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  currentStep: string = 'business-type'; // 'business-type', 'merchant-details', 'business-address', 'turnover-funding', 'success'
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
  addressResults: string[] = [];
  addressSuggestions: AddressSuggestion[] = [];
  
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
  brandBackgroundColor: string = '';
  brandHeaderColor: string = '';
  brandLogoUrl: string = '';
  consentData: any = null;
  
  showResults: boolean = false;
  companyResults: any[] = [];
  selectedCompany: any = null;
  
  // Company officers
  companyOfficers: CompanyOfficer[] = [];
  showApplicantModal: boolean = false;
  selectedApplicant: CompanyOfficer | null = null;
  
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
  
  constructor(
    private route: ActivatedRoute,
    private consentService: ConsentService,
    private companySearchService: CompanySearchService,
    private companyOfficersService: CompanyOfficersService,
    private addressSearchService: AddressSearchService,
    private renderer: Renderer2) {}
    
  ngOnInit(): void {
    // Get URL parameters
    const paramsSub = this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const institutionAccountId = params['institutionAccountId'];
      
      if (token || institutionAccountId) {
        this.consentService.setCredentials(token, institutionAccountId);
        this.companySearchService.setToken(token);
        this.companyOfficersService.setToken(token);
        this.fetchConsentPageData();
      } else {
        // Use default credentials
        this.fetchConsentPageData();
      }
    });
    
    this.subscriptions.push(paramsSub);
    
    // Initial check for screen size
    this.checkScreenSize();
    // Force detection on load
    setTimeout(() => {
      this.checkScreenSize();
    }, 0);
    
    // Set up address search listener
    const addressSearchSub = this.addressSearchControl.valueChanges.pipe(
      debounceTime(300), // Wait for 300ms pause in events
      distinctUntilChanged() // Only emit when the current value is different from the last
    ).subscribe(value => {
      this.searchAddress(value);
    });
    
    this.subscriptions.push(addressSearchSub);
    
    // Set up company search with debounce
    const searchSub = this.searchControl.valueChanges.pipe(
      debounceTime(300), // Wait for 300ms pause in events
      distinctUntilChanged() // Only emit when the current value is different from the last
    ).subscribe(value => {
      this.searchCompany();
    });
    
    this.subscriptions.push(searchSub);
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
        
        // If Sole Trader is selected, skip company name step and go directly to merchant details
        if (this.selectedBusinessType === 'sole-trader') {
          this.currentStep = 'merchant-details';
          this.updateProgressSteps('business-type', true);
          return;
        }
        
        // For all other business types (Limited Company, Partnership, Charity, etc.),
        // show the company search step
        this.businessTypeSubStep = 'company-name';
        // Initialize empty company results (will be populated by API search)
        this.companyResults = [];
        return;
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
      this.navigateToLanding();
    }
  }
  
  cancel(): void {
    if (this.currentStep === 'business-type') {
      // Navigate back to landing page while preserving query parameters
      this.navigateToLanding();
    } else {
      // Go to previous step
      this.goToPreviousStep();
    }
  }
  
  goToPreviousStep(): void {
    if (this.currentStep === 'merchant-details') {
      // Go back to business type step
      this.currentStep = 'business-type';
      // If the selected business type is not sole trader, go back to company name step
      if (this.selectedBusinessType !== 'sole-trader') {
        this.businessTypeSubStep = 'company-name';
      }
    } else if (this.currentStep === 'business-address') {
      // Go back to merchant details step
      this.currentStep = 'merchant-details';
    } else if (this.currentStep === 'turnover-funding') {
      // Go back to business address step
      this.currentStep = 'business-address';
    } else if (this.businessTypeSubStep === 'company-name') {
      // Go back to entity type selection
      this.businessTypeSubStep = 'entity-type';
    }
  }
  
  navigateToLanding(): void {
    // Navigate to landing page while preserving query parameters
    window.location.href = '/';
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
    const searchTerm = this.searchControl.value?.trim() || '';
    if (searchTerm.length > 0) {
      this.showResults = true;
      
      // Use the API service to search for companies
      const searchSub = this.companySearchService.searchCompanies(searchTerm).subscribe(results => {
        // Map API results to our CompanyResult interface
        this.companyResults = results.map((apiResult, index) => {
          return {
            id: index.toString(),
            name: apiResult.companyName,
            regNumber: apiResult.companyNumber,
            address: 'UK Registered Company' // API doesn't provide address, so we use a placeholder
          };
        });
        
        console.log('Company search results:', this.companyResults);
      });
      
      this.subscriptions.push(searchSub);
    } else {
      this.showResults = false;
      this.companyResults = [];
    }
  }
  
  selectCompany(company: any): void {
    this.selectedCompany = company;
    this.registeredCompanyName = company.name;
    this.searchControl.setValue(company.name);
    this.showResults = false;
    
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
    
    // Fetch company officers after selecting a company
    if (company && company.regNumber) {
      this.fetchCompanyOfficers(company.regNumber);
    }
  }
  
  fetchCompanyOfficers(companyNumber: string): void {
    // Set the token from the company search service
    this.companyOfficersService.setToken(this.companySearchService.getToken());
    
    const officersSub = this.companyOfficersService.getCompanyOfficers(companyNumber)
      .subscribe(officers => {
        this.companyOfficers = officers;
        // Show the applicant selection modal
        this.showApplicantModal = true;
      });
    
    this.subscriptions.push(officersSub);
  }
  
  closeApplicantModal(): void {
    this.showApplicantModal = false;
  }
  
  selectApplicant(applicant: CompanyOfficer): void {
    this.selectedApplicant = applicant;
    this.showApplicantModal = false;
    
    // If the applicant is selected, update the merchant details with their information
    if (applicant && applicant.name) {
      console.log('Selected applicant:', applicant);
      
      // Parse the applicant name to get first name and last name
      const nameParts = applicant.name.split(' ');
      if (nameParts.length >= 2) {
        // First part is the first name, last part is the last name
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' '); // Join all remaining parts as last name
        
        // Set the form control values
        this.firstNameControl.setValue(firstName);
        this.lastNameControl.setValue(lastName);
      } else if (nameParts.length === 1) {
        // If only one name part, set it as first name
        this.firstNameControl.setValue(nameParts[0]);
      }
      
      // Set email if available
      if (applicant.email) {
        this.emailControl.setValue(applicant.email);
      }
      
      // Automatically proceed to the next step (merchant details)
      this.nextStep();
    }
  }
  
  clearSearch() {
    this.searchControl.setValue('');
    this.showResults = false;
    this.companyResults = [];
  }
  
  searchAddress(searchTerm: string | null) {
    if (searchTerm && searchTerm.trim().length > 0) {
      // Call the address search API service
      const searchSub = this.addressSearchService.searchAddresses(searchTerm).subscribe(
        (results) => {
          console.log('Address API response:', results);
          this.addressSuggestions = results;
          this.addressResults = results.map(item => item.suggestion);
          this.showAddressResults = this.addressResults.length > 0;
        },
        (error) => {
          console.error('Error fetching address suggestions:', error);
          this.showAddressResults = false;
        }
      );
      this.subscriptions.push(searchSub);
    } else {
      // Hide results if search term is empty
      this.showAddressResults = false;
    }
  }
  
  selectAddress(suggestion: AddressSuggestion) {
    console.log('Selected address suggestion:', suggestion);
    
    // Set the search control value to the selected address
    const address = suggestion.suggestion;
    this.addressSearchControl.setValue(address);
    this.addressLine1Control.setValue(address);
    
    // Hide the results
    this.showAddressResults = false;
    
    // Extract postal code if it exists in the address
    const postcodeRegex = /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i;
    const postcodeMatch = address.match(postcodeRegex);
    if (postcodeMatch) {
      this.postCodeControl.setValue(postcodeMatch[0]);
    }
    
    // Try to extract town/city from the address
    // Most UK addresses have format: "Street, Town, Postcode"
    const addressParts = address.split(',').map(part => part.trim());
    if (addressParts.length >= 2) {
      // Assuming the second-to-last part (before postcode) is likely the town/city
      const possibleTown = addressParts[addressParts.length - 2];
      // Make sure we're not setting the postcode as the town
      if (!postcodeRegex.test(possibleTown)) {
        this.townCityControl.setValue(possibleTown);
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
    console.log('User name data:', {
      firstName: this.firstNameControl.value,
      lastName: this.lastNameControl.value
    });
    
    // Make sure we have some default values for the success screen
    if (!this.firstNameControl.value) {
      this.firstNameControl.setValue('Clinton');
    }
    if (!this.lastNameControl.value) {
      this.lastNameControl.setValue('Foy');
    }
    
    // Update the current step to show the success screen
    this.updateProgressSteps('turnover-funding', true);
    this.currentStep = 'success';
    console.log('Current step changed to:', this.currentStep);
  }
  
  // Handle the connect accounts button click on the success page
  connectAccounts() {
    console.log('Connecting accounts...');
    // This would typically navigate to a banking connection page or open a modal
    // For now, we'll just show a message
    alert('Banking connection feature will be implemented in a future update.');
  }
  
  // This method is no longer needed as we're using the API
  // Keeping it commented for reference
  /*
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
  */
  
  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  // Fetch consent page data from API
  private fetchConsentPageData(): void {
    const consentSub = this.consentService.getConsentPage().subscribe(data => {
      this.consentData = data;
      
      if (data && data.institutionSettings) {
        // Apply styling from API response
        this.brandBackgroundColor = data.institutionSettings.backgroundColor || '';
        this.brandHeaderColor = data.institutionSettings.backgroundColor || '';
        this.brandLogoUrl = data.institutionSettings.logoUrl || data.institutionLogoUrl || '';
        
        console.log('API styling received:', {
          backgroundColor: this.brandBackgroundColor,
          logoUrl: this.brandLogoUrl
        });
        
        // Apply styles directly
        this.applyDynamicStyling();
      }
    });
    
    this.subscriptions.push(consentSub);
  }
  
  // Apply dynamic styling based on API response
  private applyDynamicStyling(): void {
    // Apply to registration container
    if (this.brandBackgroundColor) {
      const registrationContainer = document.querySelector('.registration-container');
      if (registrationContainer) {
        console.log('Applying background color to registration container:', this.brandBackgroundColor);
        this.renderer.setStyle(registrationContainer, 'background-color', this.brandBackgroundColor);
      }
    }
    
    // Apply to header
    if (this.brandHeaderColor) {
      const header = document.querySelector('.header.registration-header');
      if (header) {
        console.log('Applying background color to header:', this.brandHeaderColor);
        this.renderer.setStyle(header, 'background-color', this.brandHeaderColor);
      }
    }
  }
}
