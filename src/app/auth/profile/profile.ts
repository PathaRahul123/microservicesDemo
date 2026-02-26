import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Profile & Security</h2>
      
      <div class="card">
        <h3>Change Password</h3>
        <form [formGroup]="passwordForm" (ngSubmit)="onUpdatePassword()">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" formControlName="oldPassword">
          </div>
          <div class="form-group">
            <label>New Password (min 8 characters)</label>
            <input type="password" formControlName="newPassword">
            @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
              <small class="error-text">
                Password must be at least 8 characters long.
              </small>
            }
          </div>
          <button type="submit" [disabled]="passwordForm.invalid">Update Password</button>
        </form>
      </div>

      <div class="card">
        <h3>Change Transaction PIN</h3>
        <form [formGroup]="pinForm" (ngSubmit)="onUpdatePin()">
          <div class="form-group">
            <label>Current PIN</label>
            <input type="password" formControlName="oldPin">
          </div>
          <div class="form-group">
            <label>New PIN (4-6 digits)</label>
            <input type="password" formControlName="newPin">
            @if (pinForm.get('newPin')?.invalid && pinForm.get('newPin')?.touched) {
              <small class="error-text">
                PIN must be exactly 4 to 6 digits long.
              </small>
            }
          </div>
          <button type="submit" [disabled]="pinForm.invalid" class="btn-secondary">Update PIN</button>
        </form>
      </div>

    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 40px auto; padding: 20px; }
    .card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; background: #fff; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .btn-secondary { background: #6c757d; }
    .error-text { color: #dc3545; font-size: 12px; margin-top: 5px; display: block; }
  `]
})
export class ProfileComponent {
  passwordForm: FormGroup;
  pinForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.pinForm = this.fb.group({
      oldPin: ['', Validators.required],
      newPin: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]
    });
  }

  onUpdatePassword() {
    if (this.passwordForm.valid) {
      this.authService.updatePassword(this.passwordForm.value).subscribe({
        next: () => {
          alert('Password updated successfully!');
          this.passwordForm.reset();
        },
        error: (err) => alert('Failed to update password: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }

  onUpdatePin() {
    if (this.pinForm.valid) {
      this.authService.updatePin(this.pinForm.value).subscribe({
        next: () => {
          alert('Transaction PIN updated successfully!');
          this.pinForm.reset();
        },
        error: (err) => alert('Failed to update PIN: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }
}
