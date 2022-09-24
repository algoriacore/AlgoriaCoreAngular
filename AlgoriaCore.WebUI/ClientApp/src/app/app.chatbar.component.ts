import { AfterViewInit, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from './app-component-base';
import { AppComponent } from './app.component';
import { ScrollPanel } from 'primeng/scrollpanel';

@Component({
    selector: 'app-chatbar',
    templateUrl: './app.chatbar.component.html'
})
export class AppChatBarComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('layoutChatBarScroller', { static: false }) layoutChatBarScroller: ScrollPanel;

    @Input() reset: boolean;

    model: any[];

    constructor(injector: Injector, public app: AppComponent) {
        super(injector);
    }

    ngOnInit() {
        this.model = [
            { label: this.l('Dashboard').toUpperCase(), icon: 'fa fa-fw fa-dashboard', routerLink: ['/app/main/dashboard'] },
            {
                label: this.l('Instances').toUpperCase(),
                icon: 'fa fa-th',
                routerLink: ['/app/admin/tenant'],
                permissionName: 'Pages.Tenants'
            },
            {
                label: this.l('Administration').toUpperCase(), icon: 'fa fa-fw fa-wrench',
                items: [
                    {
                        label: this.l('Roles'),
                        icon: 'fa fa-fw fa-briefcase',
                        routerLink: ['/app/admin/roles'],
                        permissionName: 'Pages.Administration.Roles'
                    },
                    {
                        label: this.l('Languages'),
                        icon: 'fa fa-fw fa-language',
                        routerLink: ['/app/admin/languages'],
                        permissionName: 'Pages.Administration.Languages'
                    },
                    {
                        label: this.l('Users'),
                        icon: 'fa fa-fw fa-users',
                        routerLink: ['/app/admin/users'],
                        permissionName: 'Pages.Administration.Users'
                    },
                    {
                        label: this.l('AuditLogs'),
                        icon: 'fa fa-fw fa-lock',
                        routerLink: ['/app/admin/auditLogs'],
                        permissionName: 'Pages.Administration.AuditLogs'
                    },
                    {
                        label: this.l('Maintenance'),
                        icon: 'fa fa-fw fa-wrench',
                        routerLink: ['/app/admin/maintenance'],
                        permissionName: 'Pages.Administration.Host.Maintenance'
                    },
                    {
                        label: this.l('Host.Settings'),
                        icon: 'fa fa-fw fa-cog',
                        routerLink: ['/app/admin/host/settings'],
                        permissionName: 'Pages.Administration.Host.Settings'
                    },
                    {
                        label: this.l('Tenant.Settings'),
                        icon: 'fa fa-fw fa-cog',
                        routerLink: ['/app/admin/tenants/settings'],
                        permissionName: 'Pages.Administration.Tenant.Settings'
                    },
                    {
                        label: this.l('EmailGroups'),
                        icon: 'fa fa-fw fa-envelope',
                        routerLink: ['/app/admin/emailgroups'],
                        permissionName: 'conftcor.0'
                    },
                ]
            },
            {
                label: this.l('Examples').toUpperCase(), icon: 'fa fa-fw fa-list',
                items: [
                    { label: this.l('Examples.DateTimes'), icon: 'fa fa-fw fa-cog', routerLink: ['/app/examples/samplesdatedata'] },
                    { label: this.l('Chat'), icon: 'fa fa-fw fa-cog', routerLink: ['/app/examples/samplechat'] },
                ]
            }
        ];
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.layoutChatBarScroller.moveBar();
        }, 100);
    }

    onMenuClick(event) {
        if (!this.app.isHorizontal()) {
            setTimeout(() => {
                this.layoutChatBarScroller.moveBar();
            }, 450);
        }
        this.app.onMenuClick(event);
    }
}
