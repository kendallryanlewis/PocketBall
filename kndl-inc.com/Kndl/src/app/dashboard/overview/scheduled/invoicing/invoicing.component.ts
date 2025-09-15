import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

type InvoiceStatus = 'paid' | 'due' | 'overdue' | 'scheduled' | 'void';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in your base currency
  addOnId?: string;  // if it belongs to an add-on
}

interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;    // ISO
  dueDate?: string;     // ISO (for due/overdue)
  scheduledFor?: string;// ISO (for future)
  currency: string;     // e.g., 'USD'
  items: LineItem[];
  notes?: string;
}

interface Payment {
  id: string;
  date: string;      // ISO
  amount: number;
  currency: string;
  method: 'card' | 'ach' | 'wire' | 'cash' | 'other';
  invoiceNumber?: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  startedOn: string; // ISO
  endsOn?: string;   // ISO if cancelled/expired
  active: boolean;
  notes?: string;
}

interface Filters {
  status: 'all' | InvoiceStatus;
  start?: string; // ISO (YYYY-MM-DD)
  end?: string;   // ISO
}

@Component({
  selector: 'app-invoicing',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './invoicing.component.html'
})
export class InvoicingComponent {
  // ---- Mock data (swap with API service) ---------------------------------
  private now = new Date();

  invoices = signal<Invoice[]>([
    {
      id: 'inv_1028',
      number: 'INV-1028',
      status: 'scheduled',
      issueDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()).toISOString(),
      scheduledFor: new Date(this.now.getFullYear(), this.now.getMonth() + 1, 5).toISOString(),
      currency: 'USD',
      items: [
        { description: 'Pixel & Post – Growth Plan', quantity: 1, unitPrice: 149 },
        { description: 'Extra design hours', quantity: 3, unitPrice: 75 }
      ],
      notes: 'Next bill cycle'
    },
    {
      id: 'inv_1027',
      number: 'INV-1027',
      status: 'due',
      issueDate: new Date(this.now.getFullYear(), this.now.getMonth(), 1).toISOString(),
      dueDate: new Date(this.now.getFullYear(), this.now.getMonth(), 15).toISOString(),
      currency: 'USD',
      items: [
        { description: 'Total Brand Presence – Pro', quantity: 1, unitPrice: 699 },
        { description: 'Email accounts (x5)', quantity: 5, unitPrice: 3 }
      ]
    },
    {
      id: 'inv_1026',
      number: 'INV-1026',
      status: 'overdue',
      issueDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, 1).toISOString(),
      dueDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, 15).toISOString(),
      currency: 'USD',
      items: [
        { description: 'Web Care – Starter', quantity: 1, unitPrice: 49 },
        { description: 'SEO add-on', quantity: 1, unitPrice: 25 }
      ],
      notes: 'Late fee may apply after 14 days.'
    },
    {
      id: 'inv_1025',
      number: 'INV-1025',
      status: 'paid',
      issueDate: new Date(this.now.getFullYear(), this.now.getMonth() - 2, 1).toISOString(),
      dueDate: new Date(this.now.getFullYear(), this.now.getMonth() - 2, 15).toISOString(),
      currency: 'USD',
      items: [
        { description: 'Digital + Print – Growth', quantity: 1, unitPrice: 149 }
      ],
      notes: 'Paid via card'
    }
  ]);

  payments = signal<Payment[]>([
    { id: 'pay_9004', date: new Date(this.now.getFullYear(), this.now.getMonth() - 2, 10).toISOString(), amount: 149, currency: 'USD', method: 'card', invoiceNumber: 'INV-1025' },
    { id: 'pay_9003', date: new Date(this.now.getFullYear(), this.now.getMonth() - 3, 10).toISOString(), amount: 149, currency: 'USD', method: 'card', invoiceNumber: 'INV-1024' },
  ]);

  addOns = signal<AddOn[]>([
    { id: 'ao_seo', name: 'SEO Booster', price: 25, currency: 'USD', billingCycle: 'monthly', startedOn: new Date(this.now.getFullYear(), this.now.getMonth() - 1, 1).toISOString(), active: true },
    { id: 'ao_email', name: 'Email accounts (x5)', price: 15, currency: 'USD', billingCycle: 'monthly', startedOn: new Date(this.now.getFullYear(), this.now.getMonth(), 1).toISOString(), active: true },
    { id: 'ao_print', name: 'Print package – Q2', price: 199, currency: 'USD', billingCycle: 'one-time', startedOn: new Date(this.now.getFullYear(), this.now.getMonth() - 4, 12).toISOString(), endsOn: new Date(this.now.getFullYear(), this.now.getMonth() - 4, 12).toISOString(), active: false }
  ]);

  // ---- Filters ------------------------------------------------------------
  filters = signal<Filters>({ status: 'all' });

  setStatus(status: Filters['status']) {
    this.filters.update(f => ({ ...f, status }));
  }
  clearDates() {
    this.filters.update(f => ({ ...f, start: undefined, end: undefined }));
  }

  // ---- Derived/calculated views ------------------------------------------
  private withinRange = (iso: string) => {
    const { start, end } = this.filters();
    if (!start && !end) return true;
    const d = new Date(iso).getTime();
    if (start && d < new Date(start).getTime()) return false;
    if (end && d > new Date(end).getTime()) return false;
    return true;
  };

  invoiceTotal = (inv: Invoice) =>
    inv.items.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);

  filteredInvoices = computed(() => {
    const f = this.filters();
    return this.invoices().filter(inv => {
      const dateForFilter = inv.scheduledFor ?? inv.issueDate;
      const inRange = this.withinRange(dateForFilter);
      const statusOk = (f.status === 'all') ? true : inv.status === f.status;
      return inRange && statusOk;
    }).sort((a, b) => {
      const da = new Date(a.scheduledFor ?? a.issueDate).getTime();
      const db = new Date(b.scheduledFor ?? b.issueDate).getTime();
      return db - da; // newest first
    });
  });

  upcoming = computed(() => this.invoices().filter(i => i.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime()));

  history = computed(() => this.invoices().filter(i => i.status !== 'scheduled')
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));

  activeAddOns = computed(() => this.addOns().filter(a => a.active));
  inactiveAddOns = computed(() => this.addOns().filter(a => !a.active));

  // balances
  currentBalance = computed(() => {
    // (due + overdue) - payments applied in current cycle (simple demo)
    const due = this.invoices()
      .filter(i => i.status === 'due' || i.status === 'overdue')
      .reduce((sum, i) => sum + this.invoiceTotal(i), 0);
    // In real life, you'd allocate payments to invoices; here just show raw outstanding
    return due;
  });

  nextCharge = computed(() => {
    const next = this.upcoming()[0];
    return next ? { date: next.scheduledFor!, amount: this.invoiceTotal(next), currency: next.currency } : undefined;
  });

  // ---- CSV Export ---------------------------------------------------------
  exportInvoicesCSV() {
    const rows = [
      ['Number', 'Status', 'IssueDate', 'Due/Scheduled', 'Currency', 'Total', 'Notes'],
      ...this.filteredInvoices().map(inv => [
        inv.number,
        inv.status,
        inv.issueDate,
        inv.dueDate ?? inv.scheduledFor ?? '',
        inv.currency,
        this.invoiceTotal(inv).toFixed(2),
        inv.notes ?? ''
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Actions (stubs you can wire to API) --------------------------------
  markPaid(inv: Invoice) {
    this.invoices.update(list => list.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
  }
  cancelAddOn(addOn: AddOn) {
    const todayIso = new Date().toISOString();
    this.addOns.update(list => list.map(a => a.id === addOn.id ? { ...a, active: false, endsOn: todayIso } : a));
  }
}
