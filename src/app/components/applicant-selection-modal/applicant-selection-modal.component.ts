import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CompanyOfficer } from '../../services/company-officers.service';

@Component({
  selector: 'app-applicant-selection-modal',
  templateUrl: './applicant-selection-modal.component.html',
  styleUrls: ['./applicant-selection-modal.component.scss']
})
export class ApplicantSelectionModalComponent {
  @Input() officers: CompanyOfficer[] = [];
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectApplicant = new EventEmitter<CompanyOfficer>();

  closeModal(): void {
    this.close.emit();
  }

  selectOfficer(officer: CompanyOfficer): void {
    this.selectApplicant.emit(officer);
    this.closeModal();
  }

  selectNone(): void {
    this.selectApplicant.emit({
      name: 'None of above',
      email: 'Submit',
      officerRole: ''
    });
    this.closeModal();
  }
}
