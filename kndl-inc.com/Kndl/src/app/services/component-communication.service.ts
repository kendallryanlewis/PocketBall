import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

export interface OnboardingData {
    businessName?: string;
    selectedPackage?: string;
    domainSetup?: {
        selectedOption?: any;
        selectedDomain?: any;
        completedSteps?: number;
        totalSteps?: number;
    };
    currentStep?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ComponentCommunicationService {
    private packageSelectedSubject = new Subject<string>();
    private onboardingDataSubject = new BehaviorSubject<OnboardingData>({});

    packageSelected$ = this.packageSelectedSubject.asObservable();
    onboardingData$ = this.onboardingDataSubject.asObservable();

    constructor() {
        // Load existing onboarding data from localStorage
        this.loadOnboardingData();
    }

    selectPackage(packageName: string) {
        this.packageSelectedSubject.next(packageName);
        this.updateOnboardingData({ selectedPackage: packageName });
    }

    updateOnboardingData(data: Partial<OnboardingData>) {
        const currentData = this.onboardingDataSubject.value;
        const updatedData = { ...currentData, ...data };

        this.onboardingDataSubject.next(updatedData);

        // Save to localStorage for persistence
        localStorage.setItem('onboardingData', JSON.stringify(updatedData));
    }

    getOnboardingData(): OnboardingData {
        return this.onboardingDataSubject.value;
    }

    setBusinessName(name: string) {
        this.updateOnboardingData({ businessName: name });
    }

    setCurrentStep(step: number) {
        this.updateOnboardingData({ currentStep: step });
    }

    clearOnboardingData() {
        localStorage.removeItem('onboardingData');
        this.onboardingDataSubject.next({});
    }

    private loadOnboardingData() {
        const saved = localStorage.getItem('onboardingData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.onboardingDataSubject.next(data);
            } catch (e) {
                console.warn('Could not parse saved onboarding data');
            }
        }
    }
}
