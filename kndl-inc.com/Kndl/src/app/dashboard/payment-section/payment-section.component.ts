import { Component } from '@angular/core';

interface PaymentCard {
  id: string;
  brand: string;
  lastFour: string;
  expiry: string;
  name: string;
}

@Component({
  selector: 'app-payment-section',
  templateUrl: './payment-section.component.html',
  styleUrls: ['./payment-section.component.scss']
})
export class PaymentSectionComponent {
  payments: PaymentCard[] = [
    { id: '1', brand: 'visa', lastFour: '4012', expiry: '01/22', name: 'John Doe' },
    { id: '2', brand: 'mastercard', lastFour: '2228', expiry: '12/23', name: 'John Doe' },
    { id: '3', brand: 'amex', lastFour: '5214', expiry: '03/22', name: 'John Doe' }
  ];
  selectedCardId: string | null = null;
  editingCard: boolean = false;
  cardFormModel: any = { cardNumber: '', expiry: '', cvc: '', name: '' };
  editCardId: string | null = null;

  selectCard(card: PaymentCard) {
    this.selectedCardId = card.id;
  }

  editCard(card: PaymentCard) {
    this.editingCard = true;
    this.editCardId = card.id;
    this.cardFormModel = {
      cardNumber: '', // For security, do not prefill full card number
      expiry: card.expiry,
      cvc: '',
      name: card.name
    };
  }

  removeCard(card: PaymentCard) {
    this.payments = this.payments.filter(c => c.id !== card.id);
    if (this.selectedCardId === card.id) this.selectedCardId = null;
    if (this.editCardId === card.id) this.cancelEdit();
  }

  onSubmitCardForm() {
    if (this.editingCard && this.editCardId) {
      // Update existing card (simulate, real app would use Stripe)
      const idx = this.payments.findIndex(c => c.id === this.editCardId);
      if (idx > -1) {
        this.payments[idx] = {
          ...this.payments[idx],
          expiry: this.cardFormModel.expiry,
          name: this.cardFormModel.name
        };
      }
    } else {
      // Add new card (simulate, real app would use Stripe)
      const newId = (Math.random() * 100000).toFixed(0);
      this.payments.push({
        id: newId,
        brand: this.detectBrand(this.cardFormModel.cardNumber),
        lastFour: this.cardFormModel.cardNumber.slice(-4),
        expiry: this.cardFormModel.expiry,
        name: this.cardFormModel.name
      });
    }
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingCard = false;
    this.editCardId = null;
    this.cardFormModel = { cardNumber: '', expiry: '', cvc: '', name: '' };
  }

  getCardBrandIcon(brand: string): string {
    switch (brand) {
      case 'visa': return 'fa fa-cc-visa';
      case 'mastercard': return 'fa fa-cc-mastercard';
      case 'amex': return 'fa fa-cc-amex';
      default: return 'fa fa-credit-card';
    }
  }

  detectBrand(cardNumber: string): string {
    if (/^4/.test(cardNumber)) return 'visa';
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    if (/^3[47]/.test(cardNumber)) return 'amex';
    return 'other';
  }
}
