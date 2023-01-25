import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LocalizationService } from './localization.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router, private localization: LocalizationService) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next(null);
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message, icon: 'pi pi-check-circle' });
    }

    error(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'error', text: message, icon: 'pi pi-times-circle' });
    }

    warning(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'warning', text: message, icon: 'pi pi-exclamation-triangle' });
    }

    info(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'info', text: message, icon: 'pi pi-info-circle' });
    }

    validation(messageTitle: string, messageText: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'error', title: messageTitle, text: messageText, icon: 'pi pi-times-circle' });
    }

    customByType(type: string, messageTitle: string, messageText: string, callback?: (result: boolean) => void,
        keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: type, title: messageTitle, text: messageText, close: callback });
    }

    custom(messageTitle: string, messageText: string, callback?: (result: boolean) => void, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'custom', title: messageTitle, text: messageText, close: callback });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    confirm(message: string, callback?: (result: boolean) => void): any;
    confirm(message: string, title?: string, callback?: (result: boolean) => void): any;

    confirm(message: string, titleOrCallBack?: string | ((result: boolean) => void), callback?: (result: boolean) => void): any {
        const type = 'confirm';

        if (typeof titleOrCallBack === 'string') {
            this.confirmCustom({
                type: type,
                message: message,
                header: titleOrCallBack,
                accept: callback,
                cancelTitle: this.localization.l('No'),
                acceptTitle: this.localization.l('Yes')
            });
        } else {
            this.confirmCustom({
                type: type,
                message: message,
                accept: titleOrCallBack as ((result: boolean) => void),
                cancelTitle: this.localization.l('No'),
                acceptTitle: this.localization.l('Yes')
            });
        }
    }

    confirmDelete(message: string, titleOrCallBack?: string | ((result: boolean) => void), callback?: (result: boolean) => void): any {
        const type = 'confirm';

        if (typeof titleOrCallBack === 'string') {
            this.confirmCustom({
                type: type,
                message: message,
                header: titleOrCallBack,
                accept: callback,
                cancelTitle: this.localization.l('Cancel'),
                acceptTitle: this.localization.l('Delete'),
                colorStyle: 'danger'
            });
        } else {
            this.confirmCustom({
                type: type,
                message: message,
                accept: titleOrCallBack as ((result: boolean) => void),
                cancelTitle: this.localization.l('Cancel'),
                acceptTitle: this.localization.l('Delete'),
                colorStyle: 'danger'
            });
        }
    }

    confirmCustom(config: any) {
        this.keepAfterNavigationChange = false;

        this.subject.next(config);
    }
}
