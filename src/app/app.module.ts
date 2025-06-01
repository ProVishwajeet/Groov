import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { LandingComponent } from './components/landing/landing.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { BusinessRegistrationComponent } from './components/business-registration/business-registration.component';
import { ProgressStepsComponent } from './components/progress-steps/progress-steps.component';
import { SuccessScreenComponent } from './components/success-screen/success-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingComponent,
    ServiceCardComponent,
    BusinessRegistrationComponent,
    ProgressStepsComponent,
    SuccessScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
