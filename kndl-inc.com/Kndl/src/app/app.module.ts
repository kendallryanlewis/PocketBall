import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DomainsComponent } from "./dashboard/on-boarding/domains/domains.component";
import { OnBoardingServicesComponent } from "./dashboard/on-boarding/on-boarding-services/on-boarding-services.component";
import { OnBoardingComponent } from "./dashboard/on-boarding/on-boarding.component";
import { PaymentComponent } from "./dashboard/on-boarding/payment/payment.component";
import { WelcomeComponent } from "./dashboard/on-boarding/welcome/welcome.component";
import { AnalyticsComponent } from "./dashboard/overview/analytics/analytics.component";
import { OverviewComponent } from "./dashboard/overview/overview.component";
import { InvoicingComponent } from "./dashboard/overview/scheduled/invoicing/invoicing.component";
import { RemindersComponent } from "./dashboard/overview/scheduled/reminders/reminders.component";
import { ScheduledComponent } from "./dashboard/overview/scheduled/scheduled.component";
import { SchedulingCalanderComponent } from "./dashboard/overview/scheduled/scheduling-calander/scheduling-calander.component";
import { PaymentSectionComponent } from "./dashboard/payment-section/payment-section.component";
import { PreferencesComponent } from "./dashboard/preferences/preferences.component";
import { TabViewerComponent } from "./dashboard/tab-viewer/tab-viewer.component";
import { KndlAboutComponent } from "./kndl/kndl-about/kndl-about.component";
import { KndlPricingComponent } from "./kndl/kndl-pricing/kndl-pricing.component";
import { KndlServiceComponent } from "./kndl/kndl-service/kndl-service.component";
import { KndlTopNavigationComponent } from "./kndl/kndl-top-navigation/kndl-top-navigation.component";
import { KndlComponent } from "./kndl/kndl.component";
import { LoginComponent } from "./login/login.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AboutComponent } from "./standard-model/about/about.component";
import { ContactComponent } from "./standard-model/contact/contact.component";
import { FooterComponent } from "./standard-model/footer/footer.component";
import { HomeComponent } from "./standard-model/home.component";
import { LandingComponent } from "./standard-model/landing/landing.component";
import { PriceOptionComponent } from "./standard-model/pricing/price-option/price-option.component";
import { SideNavigationComponent } from "./standard-model/side-navigation/side-navigation.component";
import { OnePageServiceComponent } from "./templates/one-page-template/one-page-service/one-page-service.component";
import { OnePageTemplateComponent } from "./templates/one-page-template/one-page-template.component";
import { OnePageTopNavigationComponent } from "./templates/one-page-template/top-navigation/one-page-top-navigation.component";
import { PricingComponent } from "./standard-model/pricing/pricing.component";
import { OnePageAboutComponent } from "./templates/one-page-template/one-page-about/one-page-about.component";
import { FullPageTransitionTemplateComponent } from './templates/full-page-transition-template/full-page-transition-template.component';
import { FullPageTransitiontopNavigationComponent } from './templates/full-page-transition-template/full-page-transitiontop-navigation/full-page-transitiontop-navigation.component';
import { FullPageAboutComponent } from './templates/full-page-transition-template/full-page-about/full-page-about.component';
import { FullPageServiceComponent } from './templates/full-page-transition-template/full-page-service/full-page-service.component';
import { KndlAboutUsComponent } from './kndl/kndl-about-us/kndl-about-us.component';
import { KndlFooterComponent } from './kndl/kndl-footer/kndl-footer.component';
import { KndlCallToActionComponent } from './kndl/kndl-call-to-action/kndl-call-to-action.component';
import { KndlDetailedServicesComponent } from './kndl/kndl-detailed-services/kndl-detailed-services.component';
import { KndlAddOnsComponent } from './kndl/kndl-add-ons/kndl-add-ons.component';
import { AnimateOnScrollDirective } from "./directives/animat-on-scroll.directive";
import { PackageDetailComponent } from './package-detail/package-detail.component';
import { DashboardSupportComponent } from "./dashboard/dashboard-support/dashboard-support.component";
import { DashboardDesignsComponent } from './dashboard/dashboard-designs/dashboard-designs.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { AdminBillingComponent } from './dashboard/admin/admin-billing/admin-billing.component';
import { AdminUsersComponent } from './dashboard/admin/admin-users/admin-users.component';
import { AdminTaskComponent } from './dashboard/admin/admin-task/admin-task.component';
import { AdminWikiComponent } from './dashboard/admin/admin-wiki/admin-wiki.component';
import { RemoveDashesAndCapitalizePipe } from './pipes/remove-dashes-and-capitalize.pipe';
import { AdminSitesComponent } from './dashboard/admin/admin-sites/admin-sites.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    SideNavigationComponent,
    LandingComponent,
    LoginComponent,
    FooterComponent,
    PriceOptionComponent,
    PageNotFoundComponent,
    KndlComponent,
    KndlServiceComponent,
    KndlTopNavigationComponent,
    KndlPricingComponent,
    KndlAboutComponent,
    DashboardComponent,
    OnBoardingComponent,
    OverviewComponent,
    ScheduledComponent,
    WelcomeComponent,
    TabViewerComponent,
    DomainsComponent,
    OnBoardingServicesComponent,
    PaymentComponent,
    RemindersComponent,
    SchedulingCalanderComponent,
    PreferencesComponent,
    AnalyticsComponent,
    PaymentSectionComponent,
    OnePageTemplateComponent,
    OnePageTopNavigationComponent,
    OnePageServiceComponent,
    OnePageAboutComponent,
    PricingComponent,
    FullPageTransitionTemplateComponent,
    FullPageTransitiontopNavigationComponent,
    FullPageAboutComponent,
    FullPageServiceComponent,
    KndlAboutUsComponent,
    KndlFooterComponent,
    KndlCallToActionComponent,
    KndlDetailedServicesComponent,
    KndlAddOnsComponent,
    AnimateOnScrollDirective,
    PackageDetailComponent,
    DashboardSupportComponent,
    DashboardDesignsComponent,
    AdminComponent,
    AdminBillingComponent,
    AdminUsersComponent,
    AdminTaskComponent,
    AdminWikiComponent,
    RemoveDashesAndCapitalizePipe,
    AdminSitesComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    InvoicingComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
