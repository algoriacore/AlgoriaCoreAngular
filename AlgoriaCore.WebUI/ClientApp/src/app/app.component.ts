import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AppSettings } from '../shared/AppSettings';
import { SessionLoginResponseController } from '../shared/service-proxies/service-proxies';
import { ChatSignalrService } from '../shared/services/chatsignalr.service';
import { SettingsClientService } from '../shared/services/settingsclient.service';
import { VersionCheckService } from '../shared/services/version.check.service';
import { AppComponentBase } from './app-component-base';
import { AuthenticationService } from './_services/authentication.service';
import { AppViewConfigComponent } from '../shared/components/app.viewconfig.component';

@Component({
    templateUrl: './app.component.html'
})
export class AppComponent extends AppComponentBase implements AfterViewInit, AfterContentChecked {

    currentUser: SessionLoginResponseController;

    menuMode: string;

    topbarMenuActive: boolean;

    notificationsMenuActive: boolean;

    overlayMenuActive: boolean;

    staticMenuDesktopInactive: boolean;

    staticMenuMobileActive: boolean;

    layoutMenuScroller: HTMLDivElement;

    lightMenu: boolean;

    lightTopbar: boolean;

    topbarColor: string;

    menuClick: boolean;

    topbarItemClick: boolean;

    resetMenu: boolean;

    menuHoverActive: boolean;

    blocked: boolean;

    constructor(
        private injector: Injector,
        private primengConfig: PrimeNGConfig,
        private authenticationService: AuthenticationService,
        private router: Router,
        private settingsClientService: SettingsClientService,
        private chatSignalrService: ChatSignalrService,
        private versionCheckService: VersionCheckService,
        private changeDetector: ChangeDetectorRef
    ) {
        super(injector);

        this.blocked = false;
        this.menuMode = 'static';
        this.notificationsMenuActive = false;
        this.overlayMenuActive = false;
        this.staticMenuDesktopInactive = false;
        this.staticMenuMobileActive = false;
        this.topbarColor = 'layout-topbar-light';
        this.lightMenu = true;
        this.lightTopbar = true;

        this.primengConfig.ripple = true;
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }

    ngAfterViewInit(): void {
        const self = this;

        this.chatSignalrService.init();
        this.versionCheckService.initVersionCheck();

        let settingValue: string = self.settingsClientService.getSetting(AppSettings.menuLayout);

        if (settingValue) {
            self.changeMenuMode(settingValue);
        }

        settingValue = self.settingsClientService.getSetting(AppSettings.appTheme);

        if (settingValue) {
            self.changeTheme(settingValue);
        }
    }

    onLayoutClick() {
        if (!this.topbarItemClick) {
            this.topbarMenuActive = false;
            this.notificationsMenuActive = false;
        }

        if (!this.menuClick) {
            if (this.isHorizontal() || this.isSlim()) {
                this.resetMenu = true;
            }

            if (this.overlayMenuActive || this.staticMenuMobileActive) {
                this.hideOverlayMenu();
            }

            this.menuHoverActive = false;
        }

        this.topbarItemClick = false;
        this.menuClick = false;
    }

    onMenuButtonClick(event) {
        this.menuClick = true;
        this.topbarMenuActive = false;
        this.notificationsMenuActive = false;

        if (this.isOverlay()) {
            this.overlayMenuActive = !this.overlayMenuActive;
        }
        if (this.isDesktop()) {
            this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
        } else {
            this.staticMenuMobileActive = !this.staticMenuMobileActive;
        }

        event.preventDefault();
    }

    onMenuClick($event) {
        this.menuClick = true;
        this.resetMenu = false;
    }

    onTopbarMenuButtonClick(event) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;
        this.notificationsMenuActive = false;

        this.hideOverlayMenu();

        event.preventDefault();
    }

    onNotificationsClick(event) {
        this.topbarItemClick = true;
        this.notificationsMenuActive = !this.notificationsMenuActive;
        this.topbarMenuActive = false;

        this.hideOverlayMenu();

        event.preventDefault();
    }

    onTopbarSubItemClick(event) {
        event.preventDefault();
        this.router.navigate(['/app/admin/users/profile']);
    }

    isHorizontal() {
        return this.menuMode === 'horizontal';
    }

    isSlim() {
        return this.menuMode === 'slim';
    }

    isOverlay() {
        return this.menuMode === 'overlay';
    }

    isStatic() {
        return this.menuMode === 'static';
    }

    isMobile() {
        return window.innerWidth < 1025;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    isTablet() {
        const width = window.innerWidth;
        return width <= 1024 && width > 640;
    }

    hideOverlayMenu() {
        this.overlayMenuActive = false;
        this.staticMenuMobileActive = false;
    }

    changeMenuMode(menuMode: string) {
        this.menuMode = menuMode;
        this.staticMenuDesktopInactive = false;
        this.overlayMenuActive = false;
    }

    changeTheme(theme: string) {
        const layoutLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('layout-css');
        layoutLink.href = 'assets/layout/css/layout-' + theme.split('-')[0] + '.css';
        const themeLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('theme-css');
        themeLink.href = 'assets/theme/' + 'theme-' + theme + '.css';
    }

    logoutImpersonalization(event) {
        event.preventDefault();

        this.authenticationService.logoutImpersonalization();
    }

    logout(event) {
        this.authenticationService.logout();
    }

    onChatbarMenuButtonClick(event) {
        this.router.navigate(['/app/examples/samplechat']);

        event.preventDefault();
    }

    redirectTo(commands: any[]): void {
        this.router.navigateByUrl('/app/dummy', { skipLocationChange: true }).then(() =>
            this.router.navigate(commands));
    }

    configurateView(settingViewConfigName: string, cols: any[], callback?: (response: any[]) => void): void {
        const self = this;
        const ref = self.dialogService.open(AppViewConfigComponent, {
            styleClass: 'd-xl-40 d-lg-50 d-md d-sm',
            header: self.l('Views.Configurate'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            footer: 'DUMMY',
            data: {
                settingViewConfigName: settingViewConfigName,
                cols: cols
            }
        });

        ref.onClose.subscribe((response: any[]) => {
            if (callback) {
                callback(response);
            }
        });
    }
}
