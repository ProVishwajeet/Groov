import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface ServiceCard {
  title: string;
  description: string;
  iconColor: string;
  actionText: string;
  actionLink: string;
  locked: boolean;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  constructor(private router: Router) {}
  // Hero section
  heroTitle: string = 'Unlock your business potential';
  heroDescription: string = 'Tell us about your business and connect you bank account and explore business finance.';
  showAvatar: boolean = true;
  userInitial: string = 'M';
  
  // CTA section
  ctaButtonText: string = 'GET STARTED';
  
  // Footer section
  footerText: string = '©2024 Powered by Groov';
  
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
    this.services = this.isMobile ? this.mobileServices : this.desktopServices;
  }
  
  ngOnInit(): void {
    // Initialize desktop services data
    this.desktopServices = [
      {
        title: 'Connect Accounts',
        description: 'Connect multiple bank account and P2Ps',
        iconColor: '#3e7bea', // Blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true
      },
      {
        title: 'Financial Insights',
        description: 'Get real-time insights to track performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true
      },
      {
        title: 'Business Finance Solutions',
        description: 'Explore flexible funding options for your business growth',
        iconColor: '#ff7a00', // Orange
        actionText: 'EXPLORE NOW',
        actionLink: '#',
        locked: true
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
        locked: true
      },
      {
        title: 'Credit Card',
        description: 'Monitor your business performance',
        iconColor: '#3ca1c9', // Light blue
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true
      },
      {
        title: 'Term Loan',
        description: 'Monitor your business performance',
        iconColor: '#ff7a00', // Orange
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true
      },
      {
        title: 'Cash Advance',
        description: 'Grow your business with cash advance',
        iconColor: '#4CAF50', // Green
        actionText: 'READ MORE',
        actionLink: '#',
        locked: true
      }
    ];
    
    // Set initial services based on screen size
    this.checkScreenSize();
  }
  
  navigateToRegistration() {
    this.router.navigate(['/register']);
  }
}
