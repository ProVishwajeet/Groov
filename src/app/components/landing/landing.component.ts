import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductFeaturesService } from '../../services/product-features.service';

interface ServiceCard {
  title: string;
  description: string;
  iconColor: string;
  actionText: string;
  actionLink: string;
  locked: boolean;
  type?: string; // To identify service type
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  
  // Hero section
  heroTitle: string = 'Unlock your business potential';
  heroDescription: string = 'Tell us about your business and connect you bank account and explore business finance.';
  showAvatar: boolean = true;
  userInitial: string = 'M';
  
  // CTA section
  ctaButtonText: string = 'GET STARTED';
  
  // Footer section
  footerText: string = '©2024 Powered by Groov';
  
  // Broking service flag - fetched from API
  brokingServiceEnabled: boolean = false;
  
  // Services grid
  desktopServices: ServiceCard[] = [];
  mobileServices: ServiceCard[] = [];
  services: ServiceCard[] = [];
  isMobile: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productFeaturesService: ProductFeaturesService
  ) { }
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
  
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // Get base services list based on screen size
    let baseServices = this.isMobile ? this.mobileServices : this.desktopServices;
    
    // Filter services based on brokingServiceEnabled flag
    if (!this.brokingServiceEnabled) {
      // If broking service is disabled, exclude the Business Finance Solutions card
      this.services = baseServices.filter(service => service.type !== 'finance');
    } else {
      this.services = baseServices;
    }
  }
  
  ngOnInit(): void {
    // Get URL parameters and subscribe to changes
    const queryParamsSub = this.route.queryParams.subscribe(params => {
      console.log('URL parameters:', params);
      
      const token = params['token'];
      const institutionAccountId = params['institutionAccountId'];
      
      if (token || institutionAccountId) {
        // Update service with URL parameters
        this.productFeaturesService.setCredentials(token, institutionAccountId);
        console.log('URL parameters applied to service');
      }
      
      // Initialize service data
      this.initializeServiceData();
      
      // Check feature status via API after applying URL parameters
      this.checkFeatureStatus();
    });
    
    this.subscriptions.push(queryParamsSub);
  }
  
  private initializeServiceData(): void {
    // Initialize desktop services data
    this.desktopServices = [
      {
        title: 'Connect Accounts',
        description: 'Connect multiple bank account and P2Ps',
        iconColor: '#3e7bea', // Blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: false,
        type: 'accounts'
      },
      {
        title: 'Financial Insights',
        description: 'Get real-time insights to track performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: false,
        type: 'insights'
      },
      {
        title: 'Business Finance Solutions',
        description: 'Explore flexible funding options for your business growth',
        iconColor: '#ff7a00', // Orange
        actionText: 'EXPLORE NOW',
        actionLink: '#',
        locked: false,
        type: 'finance'
      }
    ];
    
    // Initialize mobile services data
    this.mobileServices = [
      {
        title: 'Connect Accounts',
        description: 'Connect multiple bank account and P2Ps',
        iconColor: '#3e7bea', // Blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: false,
        type: 'accounts'
      },
      {
        title: 'Credit Card',
        description: 'Monitor your business performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: false,
        type: 'insights'
      },
      {
        title: 'Term Loan',
        description: 'Monitor your business performance',
        iconColor: '#ff7a00', // Orange
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
        type: 'finance'
      },
      {
        title: 'Cash Advance',
        description: 'Grow your business with cash advance',
        iconColor: '#4CAF50', // Green
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
        type: 'finance'
      }
    ];
    
    // Set initial services based on screen size
    this.checkScreenSize();
  }
  
  private checkFeatureStatus(): void {
    // Make API call with correct token to get active features
    const featuresSub = this.productFeaturesService.getActiveFeatures().subscribe(features => {
      // Check if Broking feature is active
      const brokingFeature = features.find(feature => feature.platformProductName === 'Broking');
      this.brokingServiceEnabled = !!brokingFeature;
      console.log('Broking service is ' + (this.brokingServiceEnabled ? 'enabled' : 'disabled'));
      console.log('API response platformProductName:', features.map(f => f.platformProductName));
      
      // Update services list based on broking service status
      this.checkScreenSize();
    });
    
    this.subscriptions.push(featuresSub);
  }
  
  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  navigateToRegistration() {
    // Get existing URL parameters if any
    const existingToken = this.route.snapshot.queryParams['token'];
    const existingInstitutionAccountId = this.route.snapshot.queryParams['institutionAccountId'];
    
    // Create query params object for navigation
    let queryParams: any = {};
    
    // Use the API key encoded in Base64
    const apiKey = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';
    const encodedApiKey = btoa(apiKey);
    
    // Set token parameter (use existing if available, otherwise use encoded API key)
    queryParams.token = existingToken || encodedApiKey;
    
    // Set institutionAccountId parameter (use existing if available, otherwise empty string)
    queryParams.institutionAccountId = existingInstitutionAccountId || '';
    
    console.log('Navigating to registration with params:', queryParams);
    
    // Navigate with query parameters
    this.router.navigate(['/register'], { queryParams });
  }
}
