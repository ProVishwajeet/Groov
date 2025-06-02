import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ConsentService, ConsentPageResponse } from '../../services/consent.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isRegistrationPage: boolean = false;
  brandBackgroundColor: string = '';
  brandLogoUrl: string = '';
  consentData: ConsentPageResponse | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private consentService: ConsentService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Monitor route changes
    const routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isRegistrationPage = event.url.includes('/register');
    });
    this.subscriptions.push(routeSub);
    
    // Set initial value
    this.isRegistrationPage = this.router.url.includes('/register');
    
    // Get URL parameters
    const paramsSub = this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const institutionAccountId = params['institutionAccountId'];
      
      if (token || institutionAccountId) {
        this.consentService.setCredentials(token, institutionAccountId);
        this.fetchConsentPageData();
      } else {
        // Use default credentials
        this.fetchConsentPageData();
      }
    });
    this.subscriptions.push(paramsSub);
  }
  
  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Fetch consent page data from API
  private fetchConsentPageData(): void {
    const consentSub = this.consentService.getConsentPage().subscribe(data => {
      this.consentData = data;
      
      if (data && data.institutionSettings) {
        // Apply styling from API response
        this.brandBackgroundColor = data.institutionSettings.backgroundColor || '';
        this.brandLogoUrl = data.institutionSettings.logoUrl || data.institutionLogoUrl || '';
        
        console.log('Header - API styling received:', {
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
    // Apply to header
    if (this.brandBackgroundColor && this.isRegistrationPage) {
      const header = document.querySelector('.header.registration-header');
      if (header) {
        console.log('Applying background color to header:', this.brandBackgroundColor);
        this.renderer.setStyle(header, 'background-color', this.brandBackgroundColor);
      }
    }
  }
}
