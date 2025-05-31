import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';

interface Step {
  id: string;
  name: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-progress-steps',
  templateUrl: './progress-steps.component.html',
  styleUrls: ['./progress-steps.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgressStepsComponent implements OnInit {
  @Input() currentStep: string = 'business-type';
  
  steps: Step[] = [
    { id: 'business-type', name: 'Business Type', completed: false, active: true },
    { id: 'merchant-details', name: 'Merchant Details', completed: false, active: false },
    { id: 'business-address', name: 'Business Address', completed: false, active: false },
    { id: 'turnover-funding', name: 'Turnover/Funding Need', completed: false, active: false }
  ];
  
  ngOnInit() {
    this.updateStepStatus();
  }
  
  ngOnChanges() {
    this.updateStepStatus();
  }
  
  private updateStepStatus() {
    let foundActive = false;
    
    this.steps.forEach(step => {
      if (step.id === this.currentStep) {
        step.active = true;
        step.completed = false;
        foundActive = true;
      } else {
        step.active = false;
        step.completed = foundActive ? false : true;
      }
    });
  }
}
