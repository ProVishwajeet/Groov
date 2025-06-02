import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
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
export class LandingComponent implements OnInit {
  constructor(private router: Router, private productFeaturesService: ProductFeaturesService) {}
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
    // Check if broking service is enabled via API
    this.productFeaturesService.isBrokingServiceEnabled().subscribe(enabled => {
      this.brokingServiceEnabled = enabled;
      this.checkScreenSize(); // Update services list based on broking service status
    });
    
    // Initialize desktop services data
    this.desktopServices = [
      {
        title: 'Connect Accounts',
        description: 'Connect multiple bank account and P2Ps',
        iconColor: '#3e7bea', // Blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
        type: 'accounts'
      },
      {
        title: 'Financial Insights',
        description: 'Get real-time insights to track performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
        type: 'insights'
      },
      {
        title: 'Business Finance Solutions',
        description: 'Explore flexible funding options for your business growth',
        iconColor: '#ff7a00', // Orange
        actionText: 'EXPLORE NOW',
        actionLink: '#',
        locked: true,
        type: 'finance'
      }
    ];
    
    // Initialize mobile services data (based on second Figma image)
    this.mobileServices = [
      {
        title: 'Connect Accounts',
        description: 'Connect multiple bank account and P2Ps',
        iconColor: '#3e7bea', // Blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
        type: 'accounts'
      },
      {
        title: 'Credit Card',
        description: 'Monitor your business performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true,
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
  
  navigateToRegistration() {
    this.router.navigate(['/register']);
  }
  
  // No longer needed as we're using the API
  // Method removed
}
