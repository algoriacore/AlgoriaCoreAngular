import { Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '../../app/app-component-base';
import { AppConsts } from '../AppConsts';
import { HelpServiceProxy, SettingClientChangeCommand, SettingClientServiceProxy } from '../service-proxies/service-proxies';
import { SettingsClientService } from '../services/settingsclient.service';

@Component({
    selector: 'app-help-on-screen',
    templateUrl: 'app.help.onscreen.component.html'
})
export class AppHelpOnScreenComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('dvContent', { static: false }) dvContent: ElementRef;
    @ViewChild('navSideBar', { static: false }) navSideBar: Sidebar;

    message: any = {};
    visible = false;
    position = 'right';
    isNoShowAnymore = false;
    isNoShowAnymoreOriginal = false;
    settingClientName: string;

    private subscription: Subscription;

    constructor(
        injector: Injector,
        private helpService: HelpServiceProxy,
        private settingClientService: SettingClientServiceProxy,
        private settingsClientService: SettingsClientService,
    ) {
        super(injector);
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        const self = this;

        if (event.keyCode === 27) {
            self.hide();
        }
    }

    ngOnInit() {
        const self = this;

        self.subscription = this.helpOnScreenService.getMessage().subscribe(message => {
            self.message = message;
            self.isNoShowAnymore = false;
            self.isNoShowAnymoreOriginal = self.isNoShowAnymore;
            self.settingClientName = null;

            if (message) {
                if (message.position) {
                    self.position = message.position;
                }

                if (message.content) {
                    self.dvContent.nativeElement.innerHTML = message.content;
                    self.visible = true;
                } else {
                    self.settingClientName = AppConsts.helpOnScreenNamePrefix + self.message.key;
                    self.isNoShowAnymore = self.settingsClientService.getSetting(self.settingClientName) === '1';
                    self.isNoShowAnymoreOriginal = self.isNoShowAnymore;

                    if ((!self.isNoShowAnymore || self.message.forced) && message.key) {
                        // Obtener el contenido de la ayuda del servidor
                        self.helpService.getHelpByKeyForCurrentUser(message.key)
                            .subscribe(data => {
                                if (data && data.isActive) {
                                    self.dvContent.nativeElement.innerHTML = data.body;
                                    self.visible = true;
                                } else if (self.message.forced) {
                                    self.alertService.warning(self.l('HelpNotAvailable'));
                                }
                            });
                    }
                }
            }
        });
    }

    ngOnDestroy() {
        const self = this;

        self.subscription.unsubscribe();
    }

    hide() {
        const self = this;

        self.onHide();

        self.visible = false;
    }

    onHide() {
        const self = this;

        // self.navSideBar.destroyModal();

        if (self.visible && self.message.key) {
            if (self.isNoShowAnymore !== self.isNoShowAnymoreOriginal) {
                const command = new SettingClientChangeCommand();
                command.clientType = AppConsts.clientType;
                command.name = self.settingClientName;
                command.value = self.isNoShowAnymore ? '1' : '0';

                self.settingClientService.changeSettingClient(command).subscribe(data => {
                    self.settingsClientService.setSetting(self.settingClientName, command.value);
                });
            }
        }
    }
}
