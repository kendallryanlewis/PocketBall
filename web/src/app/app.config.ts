import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
    PreloadAllModules,
    provideRouter,
    withComponentInputBinding,
    withPreloading,
    withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(
            routes,
            withPreloading(PreloadAllModules),   // prefetch lazy chunks after first nav
            withComponentInputBinding(),           // bind route params as @Input
            withViewTransitions(),                 // native View Transition API for route changes
        ),
    ],
};
