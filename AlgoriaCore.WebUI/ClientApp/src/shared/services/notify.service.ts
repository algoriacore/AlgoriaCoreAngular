import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class NotifyService {

    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
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

    info(message: string, title?: string, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ severity: 'info', summary: title, detail: message });
    }

    success(message: string, title?: string, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ severity: 'success', summary: title, detail: message });
    }

    warning(message: string, title?: string, options?: any, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ severity: 'warn', summary: title, detail: message });
    }

    error(message: string, title?: string, options?: any, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ severity: 'error', summary: title, detail: message });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
