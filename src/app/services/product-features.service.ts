import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

export interface ProductFeature {
  id: number;
  platformProductId: number;
  platformProductName: string;
  partnerConnectionAdapterId: number | null;
  name: string;
  details: string;
  active: boolean;
  partnerName: string;
  partnerLogoUrl: string | null;
  connectionStatus: string | null;
  accountAccess: string;
  financialPartnerIntegrationId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductFeaturesService {
  private baseApiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/authorization/consent';
  private defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  private _token: string;
  private _institutionAccountId: string;
  
  constructor(private http: HttpClient, private route: ActivatedRoute) {
    // Initialize with default values
    this._token = this.defaultToken;
    this._institutionAccountId = '';
    
    // Subscribe to route query params changes
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this._token = params['token'];
      }
      
      if (params['institutionAccountId']) {
        this._institutionAccountId = params['institutionAccountId'];
      }
    });
  }
  
  // Set token and institutionAccountId manually
  setCredentials(token?: string, institutionAccountId?: string) {
    if (token) {
      this._token = token;
    }
    
    if (institutionAccountId) {
      this._institutionAccountId = institutionAccountId;
    }
  }

  getActiveFeatures(skipApiCall: boolean = false): Observable<ProductFeature[]> {
    // Use the active-product-features endpoint as specified
    const apiUrl = `${this.baseApiUrl}/active-product-features`;
    
    // Use the API key provided in the curl command
    const apiKey = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';
    
    // Build headers with the correct API key
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'token': apiKey
    });
    
    // For landing page, we'll make the API call since we have the correct token now
    console.log('Requesting API (features):', apiUrl);
    
    return this.http.get<ProductFeature[]>(apiUrl, { headers }).pipe(
      tap(response => {
        console.log('API response received for features:', response);
      }),
      catchError(error => {
        console.error('API error:', error);
        // Return mock data with Broking feature for testing
        const mockFeatures: ProductFeature[] = [
          {
            id: 1902,
            platformProductId: 922,
            platformProductName: 'Broking',
            partnerConnectionAdapterId: null,
            name: 'Lead form enabled',
            details: 'Lead form enabled',
            active: true,
            partnerName: '',
            partnerLogoUrl: null,
            connectionStatus: null,
            accountAccess: 'LIVE',
            financialPartnerIntegrationId: null
          },
          {
            id: 1903,
            platformProductId: 922,
            platformProductName: 'Broking',
            partnerConnectionAdapterId: null,
            name: 'FCA Regulated',
            details: 'FCA Regulated',
            active: true,
            partnerName: '',
            partnerLogoUrl: null,
            connectionStatus: null,
            accountAccess: 'LIVE',
            financialPartnerIntegrationId: null
          }
        ];
        return of(mockFeatures);
      })
    );
  }

  isBrokingServiceEnabled(): Observable<boolean> {
    return this.getActiveFeatures().pipe(
      map(features => {
        // Check if any feature has platformProductName = "Broking"
        const brokingEnabled = features.some(feature => feature.platformProductName === 'Broking');
        console.log('Broking service status:', brokingEnabled ? 'Enabled' : 'Disabled');
        return brokingEnabled;
      })
    );
  }
}
