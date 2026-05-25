import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'app',
        loadComponent: () => import('./pages/shell/shell.component').then(m => m.ShellComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
            },
            {
                path: 'courses',
                loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent),
            },
            {
                path: 'courses/new',
                loadComponent: () => import('./pages/create-course/create-course.component').then(m => m.CreateCourseComponent),
            },
            {
                path: 'courses/:id',
                loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
            },
            {
                path: 'courses/:id/edit',
                loadComponent: () => import('./pages/create-course/create-course.component').then(m => m.CreateCourseComponent),
            },
            {
                path: 'scan-scorecard',
                loadComponent: () => import('./pages/scan-scorecard/scan-scorecard.component').then(m => m.ScanScorecardComponent),
            },
            {
                path: 'rounds/new',
                loadComponent: () => import('./pages/new-round/new-round.component').then(m => m.NewRoundComponent),
            },
            {
                path: 'rounds/:id',
                loadComponent: () => import('./pages/round-view/round-view.component').then(m => m.RoundViewComponent),
            },
            {
                path: 'history',
                loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent),
            },
            {
                path: 'trophy',
                loadComponent: () => import('./pages/trophy/trophy.component').then(m => m.TrophyComponent),
            },
            {
                path: 'friends',
                loadComponent: () => import('./pages/friends/friends.component').then(m => m.FriendsComponent),
            },
            {
                path: 'clubs',
                loadComponent: () => import('./pages/clubs/clubs.component').then(m => m.ClubsComponent),
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
