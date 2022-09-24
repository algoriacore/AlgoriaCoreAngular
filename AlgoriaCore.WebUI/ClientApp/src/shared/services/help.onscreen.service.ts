import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HelpOnScreenService {
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

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    show(key: string, forced: boolean = false, position: string = null): any {

        this.keepAfterNavigationChange = false;

        this.subject.next({ key: key, forced: forced, position: position });
    }

    showCustom(content: string, forced: boolean = false, position: string = null): any {

        this.keepAfterNavigationChange = false;

        this.subject.next({ content: content, forced: forced, position: position });
    }
}
