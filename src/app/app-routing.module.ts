import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { BusinessRegistrationComponent } from './components/business-registration/business-registration.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: BusinessRegistrationComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
