import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';

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
  private apiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/authorization/consent/active-product-features';
  private token = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';

  constructor(private http: HttpClient) { }

  getActiveFeatures(): Observable<ProductFeature[]> {
    console.log('Requesting API: /consent/active-product-features...');
    
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'token': this.token
    });

    return this.http.get<ProductFeature[]>(this.apiUrl, { headers }).pipe(
      tap(response => {
        console.log('For /consent/active-product-features: Connected');
        console.log('API response received:', response);
      }),
      catchError(error => {
        console.error('For /consent/active-product-features: Disconnected');
        console.error('API error:', error);
        return of([]);
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
