import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AppConsts } from '../../shared/AppConsts';
import { AlertService } from '../../shared/services/alert.service';
import { DateTimeService } from '../../shared/services/datetime.service';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    authenticationService: AuthenticationService;
    dateTimeService: DateTimeService;

    constructor(private injector: Injector, private alertService: AlertService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url !== AppConsts.appSettingsUrl) {
            this.authenticationService = this.injector.get(AuthenticationService);
            this.dateTimeService = this.injector.get(DateTimeService);

            // add authorization header with jwt token if available
            const currentUser = this.authenticationService.currentUserValue;

            if (currentUser && currentUser.token) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`
                    }
                });
            }

            request = request.clone({
                setHeaders: {
                    'The-Timezone-IANA': this.dateTimeService.getTimeZone()
                }
            });
        }

        return next.handle(request).pipe(
            timeout(this.getTimeoutByUrl(request.url)),
            catchError(err => {
                if (err.name === 'TimeoutError') {
                    this.alertService.error(err.message);
                }
                return throwError(err);
            })
        );
    }

    getTimeoutByUrl(url: string): number {
        let res = AppConsts.timeouts.default;

        if (AppConsts.timeouts.urls.length > 0) {
            const urlTimeout = AppConsts.timeouts.urls.find(p => url.indexOf(p.url) > 0);

            if (urlTimeout) {
                res = urlTimeout.timeout;
            }
        }

        return res;
    }
}
