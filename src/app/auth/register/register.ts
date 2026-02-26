import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group"><label>Full Name</label><input type="text" formControlName="fullName"></div>
        <div class="form-group"><label>Email</label><input type="email" formControlName="email"></div>
        <div class="form-group"><label>Phone Number</label><input type="text" formControlName="phoneNumber"></div>
        <div class="form-group"><label>Password</label><input type="password" formControlName="password"></div>
        <div class="form-group"><label>Transaction PIN (4-6 digits)</label><input type="password" formControlName="transactionPin"></div>
        
        <div class="form-group">
          <label>Role</label>
          <select formControlName="role">
            <option value="PERSONAL">Personal</option>
            <option value="BUSINESS">Business</option>
          </select>
        </div>

        @if (registerForm.get('role')?.value === 'BUSINESS') {
          <div class="business-fields">
            <h4 style="margin-top: 10px; margin-bottom: 5px; color: #004d99;">Business Details</h4>
            <div class="form-group"><label>Company Name</label><input type="text" formControlName="businessName"></div>
            <div class="form-group"><label>Business Type</label><input type="text" formControlName="businessType" placeholder="e.g. Retail, Tech, Services"></div>
            <div class="form-group"><label>Tax ID / GSTIN</label><input type="text" formControlName="taxId"></div>
            <div class="form-group"><label>Registered Address</label><input type="text" formControlName="address"></div>
          </div>
        }

        <div class="form-group">
          <label>Security Question</label>
          <input type="text" formControlName="securityQuestion" placeholder="E.g. What is your pet's name?">
        </div>
        <div class="form-group">
          <label>Security Answer</label>
          <input type="text" formControlName="securityAnswer">
        </div>

        <button type="submit" [disabled]="registerForm.invalid">Register</button>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #198754; color: white; border: none; cursor: pointer; font-size: 16px; margin-top: 10px; }
    button:disabled { background: #ccc; cursor: not-allowed; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      transactionPin: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]],
      role: ['PERSONAL', Validators.required],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required],
      businessName: [''],
      businessType: [''],
      taxId: [''],
      address: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const payload = { ...this.registerForm.value };
      if (payload.role !== 'BUSINESS') {
        delete payload.businessName;
        delete payload.businessType;
        delete payload.taxId;
        delete payload.address;
      }

      this.authService.register(payload).subscribe({
        next: () => {
          if (payload.role === 'BUSINESS') {
            alert('Business registration successful! Your profile is pending Admin verification. You can log in, but features may be restricted until approved.');
          } else {
            alert('Registration successful! Please login.');
          }
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert('Registration failed: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
