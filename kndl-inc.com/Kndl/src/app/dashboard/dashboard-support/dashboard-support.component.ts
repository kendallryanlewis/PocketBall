import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard-support',
    templateUrl: './dashboard-support.component.html',
    styleUrls: ['./dashboard-support.component.scss']
})
export class DashboardSupportComponent {
    supportEmail = 'support@kndl-inc.com';
    billingEmail = 'billing@kndl-inc.com';
    salesEmail = 'sales@kndl-inc.com';
    businessHours = 'Mon-Fri, 9am-6pm EST';
}
