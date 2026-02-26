import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Send Money</h2>
      <form [formGroup]="sendForm" (ngSubmit)="onSubmit()">
        <div class="form-group"><label>Receiver Email/Phone</label><input type="text" formControlName="receiverIdentifier"></div>
        <div class="form-group"><label>Amount</label><input type="number" formControlName="amount"></div>
        <div class="form-group"><label>Description</label><input type="text" formControlName="description"></div>
        <div class="form-group"><label>Transaction PIN</label><input type="password" formControlName="transactionPin"></div>
        <button type="submit" [disabled]="sendForm.invalid">Send</button>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
    button:disabled { background: #ccc; }
  `]
})
export class SendMoneyComponent {
  sendForm: FormGroup;
  constructor(private fb: FormBuilder, private walletService: WalletService) {
    this.sendForm = this.fb.group({
      receiverIdentifier: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      transactionPin: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]
    });
  }
  onSubmit() {
    if (this.sendForm.valid) {
      const payload = {
        ...this.sendForm.value,
        idempotencyKey: crypto.randomUUID()
      };
      this.walletService.sendMoney(payload).subscribe({
        next: () => { alert('Money sent successfully'); this.sendForm.reset(); },
        error: (err) => alert('Failed to send money: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }
}
