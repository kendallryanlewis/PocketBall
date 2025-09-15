import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item, onBoardingItems } from 'src/app/models/onBoardingItems';
import { TierType } from 'src/app/models/tier';

export interface OnboardingStep {
  title: string;
  subs: string[];
}

type Tier = 'starter' | 'growth' | 'pro';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['../../dashboard.component.scss', './welcome.component.scss']
})

export class WelcomeComponent {
  @Input() selectedService: TierType = 'starter';
  @Output() projectStarted = new EventEmitter<void>();
  steps: OnboardingStep[] = [
    { title: 'Welcome', subs: ['Introduction', 'Brand overview'] },
    { title: 'Select Services', subs: ['Choose plan', 'Add-ons selection'] },
    { title: 'Choose Domain & Hosting', subs: ['Select domain', 'Pick hosting plan', 'Configure add-ons'] },
    { title: 'Review & Purchase', subs: ['Review selections', 'Confirm & pay'] },
  ];
  selectedStep = 0;

  selectStep(i: number) {
    this.selectedStep = i;
  }


  progress() {
    const v = this.visibleItems();
    const total = v.length;
    const done = v.filter(i => !!i.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }

  visibleItems(): Item[] {
    return onBoardingItems.filter(i => i.scope === 'all' || i.scope === this.selectedService);
  }

  startProject() {
    this.projectStarted.emit();
  }
}
