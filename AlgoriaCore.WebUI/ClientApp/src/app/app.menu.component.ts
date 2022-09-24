import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from './app-component-base';
import { AppComponent } from './app.component';
import { AppConsts } from 'src/shared/AppConsts';
import { ProcessesService } from 'src/shared/services/processes.service';
import { Router } from '@angular/router';
import { ScrollPanel } from 'primeng/scrollpanel';
import { MenuItem } from 'primeng/api/menuitem';
import { AppPermissions } from '../shared/AppPermissions';
import { CatalogCustomServiceProxy } from '../shared/service-proxies/service-proxies';
import { CatalogsCustomService } from '../shared/services/catalogscustom.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('layoutMenuScroller', { static: false }) layoutMenuScrollerViewChild: ScrollPanel;

    @Input() reset: boolean;

    model: any[];

    constructor(
        injector: Injector,
        public app: AppComponent,
        private processesService: ProcessesService,
        private catalogsCustomService: CatalogsCustomService) {
        super(injector);
    }

    ngOnInit() {
        this.model = [
            { label: this.l('Dashboard'), icon: 'pi pi-chart-bar', routerLink: ['/app/main/dashboard'] },
            {
                label: this.l('Instances'),
                icon: 'fa fa-th',
                routerLink: ['/app/admin/tenant'],
                permissionName: 'Pages.Tenants',
                visible: AppConsts.isHost
            },
            {
                label: this.l('Administration'), icon: 'pi pi-briefcase',
                items: [
                    {
                        label: this.l('Roles'),
                        icon: 'pi pi-list',
                        routerLink: ['/app/admin/roles'],
                        permissionName: 'Pages.Administration.Roles'
                    },
                    {
                        label: this.l('Languages'),
                        icon: 'pi pi-comment',
                        routerLink: ['/app/admin/languages'],
                        permissionName: 'Pages.Administration.Languages'
                    },
                    {
                        label: this.l('Users'),
                        icon: 'pi pi-users',
                        routerLink: ['/app/admin/users'],
                        permissionName: 'Pages.Administration.Users'
                    },
                    {
                        label: this.l('OrgUnits'),
                        icon: 'pi pi-sitemap',
                        routerLink: ['/app/admin/orgunits'],
                        permissionName: 'Pages.Administration.OrgUnits'
                    },
                    {
                        label: this.l('AuditLogs'),
                        icon: 'pi pi-lock',
                        routerLink: ['/app/admin/auditLogs'],
                        permissionName: 'Pages.Administration.AuditLogs'
                    },
                    {
                        label: this.l('Maintenance'),
                        icon: 'fa fa-fw fa-wrench',
                        routerLink: ['/app/admin/maintenance'],
                        permissionName: 'Pages.Administration.Host.Maintenance',
                        visible: !(AppConsts.multiTenancy && AppConsts.tenancyName)
                    },
                    {
                        label: this.l('Host.Settings'),
                        icon: 'pi pi-cog',
                        routerLink: ['/app/admin/host/settings'],
                        permissionName: 'Pages.Administration.Host.Settings',
                        visible: AppConsts.isHost
                    },
                    {
                        label: this.l('Tenant.Settings'),
                        icon: 'pi pi-cog',
                        routerLink: ['/app/admin/tenants/settings'],
                        permissionName: 'Pages.Administration.Tenant.Settings'
                    },
                    {
                        label: this.l('EmailGroups'),
                        icon: 'pi pi-envelope',
                        routerLink: ['/app/admin/emailgroups'],
                        permissionName: 'conftcor.0'
                    },
                    {
                        label: this.l('ChatRooms'),
                        icon: 'pi pi-comments',
                        routerLink: ['/app/admin/chatrooms'],
                        permissionName: 'Pages.Administration.ChatRooms'
                    },
                    {
                        label: this.l('Helps'),
                        icon: 'pi pi-question',
                        routerLink: ['/app/admin/helps'],
                        permissionName: 'Pages.Administration.Helps'
                    },
                    {
                        label: this.l('MailServiceMails.MailServiceMail'),
                        icon: 'pi pi-book',
                        routerLink: ['/app/mailgrpcservice/mailservicemail'],
                        permissionName: 'Pages.Administration.MailServiceMail'
                    }

                ]
            },
            {
                label: this.l('Examples'), icon: 'pi pi-list',
                items: [
                    { label: this.l('Examples.DateTimes'), icon: 'pi pi-calendar', routerLink: ['/app/examples/samplesdatedata'] },
                    { label: this.l('Chat'), icon: 'pi pi pi-comments', routerLink: ['/app/examples/samplechat'] },
                    // eslint-disable-next-line max-len
                    { label: this.l('Examples.Chat.ChatLog'), icon: 'pi pi pi-comments', routerLink: ['/app/examples/samplechat/chatlog'] },
                    { label: this.l('Examples.Log'), icon: 'pi pi-lock', routerLink: ['/app/examples/samplelog'] },
                    { label: this.l('Examples.Numbers'), icon: 'pi pi-percentage', routerLink: ['/app/examples/sampleNumbers'] },
                    { label: this.l('Examples.Autocomplete'), icon: 'pi pi-pencil', routerLink: ['/app/examples/autocomplete'] },
                    { label: this.l('Examples.Charts'), icon: 'pi pi-chart-bar', routerLink: ['/app/examples/charts'] },
                    { label: this.l('Examples.Arrobar'), icon: 'pi pi-tag', routerLink: ['/app/examples/arrobar'] }
                ]
            },
            this.getTemplatesSectionMenu(),
            this.getQuestionnairesSectionMenu(),
            this.getCatalogsCustomSectionMenu()
        ];
    }

    getTemplatesSectionMenu(): any {
        const self = this;
        const items = [];

        items.push({
            label: self.l('Templates.Configuration'),
            icon: 'fa fa-fw fa-clone',
            routerLink: ['/app/processes/templates'],
            permissionName: 'Pages.Processes.Templates'
        });

        for (const template of self.processesService.templates) {
            if (template.hasSecurity && template.isActivity) {
                items.push({
                    label: template.namePlural,
                    items: [
                        {
                            label: self.l('Processes.ViewType.Own'),
                            routerLink: ['/app/processes', template.id, 'own'],
                            permissionName: AppPermissions.calculatePermissionNameForProcess(
                                AppPermissions.processes, template.id, self.app.currentUser.tenantId),
                            reloadAlways: true
                        },
                        {
                            label: self.l('Processes.ViewType.OwnPendings'),
                            routerLink: ['/app/processes', template.id, 'ownpendings'],
                            permissionName: AppPermissions.calculatePermissionNameForProcess(
                                AppPermissions.processes, template.id, self.app.currentUser.tenantId),
                            reloadAlways: true
                        },
                        {
                            label: self.l('Processes.ViewType.Normal'),
                            routerLink: ['/app/processes', template.id],
                            permissionName: AppPermissions.calculatePermissionNameForProcess(
                                AppPermissions.processes, template.id, self.app.currentUser.tenantId),
                            reloadAlways: true
                        }
                    ]
                });
            } else {
                items.push({
                    label: template.namePlural,
                    routerLink: ['/app/processes', template.id],
                    permissionName: AppPermissions.calculatePermissionNameForProcess(
                        AppPermissions.processes, template.id, self.app.currentUser.tenantId),
                    reloadAlways: true
                });
            }
        }

        return {
            label: self.l('Templates'),
            icon: 'fa fa-fw fa-clone',
            items: items
        };
    }

    getQuestionnairesSectionMenu(): any {
        const self = this;
        const items = [];

        items.push({
            label: self.l('Questionnaires'),
            icon: 'pi pi-list',
            routerLink: ['/app/questionnaires/questionnaires'],
            permissionName: 'Pages.Questionnaires'
        });

        return {
            label: self.l('Questionnaires'),
            icon: 'pi pi-list',
            items: items
        };
    }

    getCatalogsCustomSectionMenu(): any {
        const self = this;
        const items = [];

        items.push({
            label: self.l('CatalogsCustom.Configuration'),
            icon: 'pi pi-table',
            routerLink: ['/app/questionnaires/catalogscustom'],
            permissionName: 'Pages.CatalogsCustom'
        });

        for (const catalog of self.catalogsCustomService.catalogs) {
            items.push({
                label: catalog.namePlural,
                routerLink: ['/app/catalogscustomimpl', catalog.id],
                permissionName: AppPermissions.calculatePermissionNameForCatalogCustom(
                    AppPermissions.catalogsCustom, catalog.id, self.app.currentUser.tenantId),
                reloadAlways: true
            });
        }

        return {
            label: self.l('CatalogsCustom'),
            icon: 'pi pi-list',
            items: items
        };
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.layoutMenuScrollerViewChild.moveBar();
        }, 100);
    }

    onMenuClick(event) {
        if (!this.app.isHorizontal()) {
            setTimeout(() => {
                this.layoutMenuScrollerViewChild.moveBar();
            }, 450);
        }
        this.app.onMenuClick(event);
    }
}

@Component({
    /* eslint-disable @angular-eslint/component-selector */
    selector: '[app-submenu]',
    /* eslint-enable @angular-eslint/component-selector */
    template: `
        <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
            <li *ngIf="showMenuItem(child)" [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
                <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" (mouseenter)="onMouseEnter(i)"
                   *ngIf="!child.routerLink" [ngClass]="child.styleClass"
                   [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target">
                    <i [ngClass]="child.icon" class="layout-menuitem-icon"></i>
                    <span class="layout-menuitem-text">{{child.label}}</span>
                    <i class="fa fa-fw fa-angle-down layout-submenu-toggler" *ngIf="child.items"></i>
                    <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                </a>
                <a (click)="itemClick($event,child,i)" (mouseenter)="onMouseEnter(i)" *ngIf="child.routerLink"
                   [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink" [fragment]="child.fragment"
                   [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target">
                    <i [ngClass]="child.icon" class="layout-menuitem-icon"></i>
                    <span class="layout-menuitem-text">{{child.label}}</span>
                    <i class="fa fa-fw fa-angle-down layout-submenu-toggler" *ngIf="child.items"></i>
                    <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                </a>
                <div class="layout-menu-tooltip">
                    <div class="layout-menu-tooltip-arrow"></div>
                    <div class="layout-menu-tooltip-text">{{child.label}}</div>
                </div>
                <ul app-submenu [item]="child" *ngIf="child.items" [visible]="isActive(i)" [reset]="reset" [parentActive]="isActive(i)"
                    [@children]="(app.isSlim()||app.isHorizontal())&&root ? isActive(i) ?
                    'visible' : 'hidden' : isActive(i) ? 'visibleAnimated' : 'hiddenAnimated'"></ul>
            </li>
        </ng-template>
    `,
    animations: [
        trigger('children', [
            state('hiddenAnimated', style({
                height: '0px'
            })),
            state('visibleAnimated', style({
                height: '*'
            })),
            state('visible', style({
                height: '*',
                'z-index': 100
            })),
            state('hidden', style({
                height: '0px',
                'z-index': '*'
            })),
            transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppSubMenuComponent extends AppComponentBase {
    @Input() item: MenuItem;
    @Input() root: boolean;
    @Input() visible: boolean;

    _parentActive: boolean;
    _reset: boolean;
    activeIndex: number;

    constructor(injector: Injector, public app: AppComponent, public appMenu: AppMenuComponent, public router: Router) {
        super(injector);
    }

    @Input() get reset(): boolean {
        return this._reset;
    }

    @Input() get parentActive(): boolean {
        return this._parentActive;
    }

    set reset(val: boolean) {
        this._reset = val;
        if (this._reset && (this.app.isHorizontal() || this.app.isSlim())) {
            this.activeIndex = null;
        }
    }

    set parentActive(val: boolean) {
        this._parentActive = val;

        if (!this._parentActive) {
            this.activeIndex = null;
        }
    }

    itemClick(event: Event, item: MenuItem, index: number) {
        if (this.root) {
            this.app.menuHoverActive = !this.app.menuHoverActive;
        }
        // avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }
        // activate current item and deactivate active sibling if any
        this.activeIndex = (this.activeIndex === index) ? null : index;
        // execute command
        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }
        // prevent hash change
        if (item.items || (!item.url && !item.routerLink)) {
            setTimeout(() => {
                this.appMenu.layoutMenuScrollerViewChild.moveBar();
            }, 450);
            event.preventDefault();
        }

        // hide menu
        if (!item.items) {
            if (this.app.isHorizontal() || this.app.isSlim()) {
                this.app.resetMenu = true;
            } else {
                this.app.resetMenu = false;
            }
            this.app.overlayMenuActive = false;
            this.app.staticMenuMobileActive = false;
            this.app.menuHoverActive = !this.app.menuHoverActive;
        }

        if (item['reloadAlways']) {
            this.app.redirectTo(item.routerLink);
        }
    }

    onMouseEnter(index: number) {
        if (this.root && this.app.menuHoverActive && (this.app.isHorizontal() || this.app.isSlim())
            && !this.app.isMobile() && !this.app.isTablet()) {
            this.activeIndex = index;
        }
    }

    isActive(index: number): boolean {
        return this.activeIndex === index;
    }

    showMenuItem(menuItem): boolean {

        if (menuItem.visible === false) {
            return false;
        }

        if (menuItem.permissionName) {
            return this.permission.isGranted(menuItem.permissionName);
        }

        if (menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return true;
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            const subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName && this.permission.isGranted(subMenuItem.permissionName) && subMenuItem.visible !== false) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                return this.checkChildMenuItemPermission(subMenuItem);
            } else if (!subMenuItem.permissionName) {
                return true;
            }
        }

        return false;
    }
}
