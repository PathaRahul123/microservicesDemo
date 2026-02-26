import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WalletService } from '../wallet.service';
import { PaymentMethodDTO } from '../../shared/models/models';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>My Payment Methods</h2>
      
      <div class="cards-list">
        <h3>Saved Cards</h3>
        <div *ngIf="cards.length === 0" class="no-cards">No payment methods saved.</div>
        
        <div *ngFor="let card of cards" class="card-item" [class.default]="card.isDefault">
          <div class="card-info">
            <span class="card-type">{{ card.cardType || 'CARD' }}</span>
            <span class="card-number">{{ card.partialCardNumber }}</span>
            <span class="card-expiry">Exp: {{ card.expiryDate }}</span>
            <span *ngIf="card.isDefault" class="badge">Default</span>
          </div>
          <div class="card-actions">
            <button *ngIf="!card.isDefault" (click)="setDefault(card.id)" class="btn-sm btn-outline">Set Default</button>
            <button (click)="deleteCard(card.id)" class="btn-sm btn-danger">Remove</button>
          </div>
        </div>
      </div>

      <div class="add-card-form">
        <h3>Add New Card</h3>
        <form [formGroup]="cardForm" (ngSubmit)="onAddCard()">
          <div class="form-group">
            <label>Card Number</label>
            <input type="text" formControlName="cardNumber" placeholder="16-digit card number">
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label>Expiry Date (MM/YY)</label>
              <input type="text" formControlName="expiryDate" placeholder="MM/YY">
            </div>
            
            <div class="form-group half">
              <label>CVV</label>
              <input type="password" formControlName="cvv" placeholder="123">
            </div>
          </div>
          
          <div class="form-group">
            <label>Card Type</label>
            <select formControlName="cardType">
              <option value="VISA">Visa</option>
              <option value="MASTERCARD">MasterCard</option>
              <option value="AMEX">American Express</option>
              <option value="DISCOVER">Discover</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Billing Address</label>
            <input type="text" formControlName="billingAddress">
          </div>

          <button type="submit" [disabled]="cardForm.invalid" class="btn-primary">Add Card</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 40px auto; padding: 20px; }
    .cards-list { margin-bottom: 40px; }
    .no-cards { color: #666; font-style: italic; }
    
    .card-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card-item.default { border-color: #0d6efd; background: #f8fbff; }
    
    .card-info { display: flex; gap: 15px; align-items: center; font-size: 16px; font-weight: 500;}
    .card-type { font-weight: bold; color: #555; }
    .card-number { letter-spacing: 1px; }
    .badge { background: #007bff; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    
    .card-actions { display: flex; gap: 10px; }
    
    .add-card-form { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
    .form-group { margin-bottom: 15px; }
    .form-row { display: flex; gap: 15px; }
    .half { flex: 1; }
    
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    
    button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #007bff; color: white; width: 100%; font-size: 16px; margin-top: 10px; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-outline { background: transparent; border: 1px solid #007bff; color: #007bff; }
    .btn-danger { background: #dc3545; color: white; border: 1px solid #dc3545; }
  `]
})
export class CardsComponent implements OnInit {
  cards: PaymentMethodDTO[] = [];
  cardForm: FormGroup;

  constructor(private fb: FormBuilder, private walletService: WalletService) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{13,19}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      cardType: ['VISA', Validators.required],
      billingAddress: ['']
    });
  }

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.walletService.getCards().subscribe({
      next: (res) => {
        if (res.data && res.data.content) {
          this.cards = res.data.content;
        }
      },
      error: (err) => console.error('Failed to load cards', err)
    });
  }

  onAddCard() {
    if (this.cardForm.valid) {
      // Ensure cardType is uppercase before sending, though the select already provides it.
      const cardData = { ...this.cardForm.value, cardType: this.cardForm.value.cardType.toUpperCase() };
      this.walletService.addCard(cardData).subscribe({
        next: () => {
          alert('Card added successfully!');
          this.cardForm.reset({ cardType: 'VISA' });
          this.loadCards();
        },
        error: (err) => alert('Failed to add card: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }

  deleteCard(id: number) {
    if (confirm('Are you sure you want to remove this card?')) {
      this.walletService.deleteCard(id).subscribe({
        next: () => {
          this.loadCards();
        },
        error: (err) => alert('Failed to delete card')
      });
    }
  }

  setDefault(id: number) {
    this.walletService.setDefaultCard(id).subscribe({
      next: () => {
        this.loadCards();
      },
      error: (err) => alert('Failed to set default card')
    });
  }
}
