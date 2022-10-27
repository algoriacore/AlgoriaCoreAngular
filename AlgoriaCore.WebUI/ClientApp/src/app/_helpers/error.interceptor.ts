import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AlertService } from '../../shared/services/alert.service';
import { AuthenticationService } from '../_services/authentication.service';
import { AppConsts } from '../../shared/AppConsts';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    authenticationService: AuthenticationService;

    constructor(private injector: Injector,
        private route: ActivatedRoute,
        private alertService: AlertService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // Don't do anything
                // console.log('Error: ' + event.status);
                // console.log(event);
            }
            return event;
        }),
        catchError((err: any) => {
            // Verify if is error 401. Then logout
            if (this.route.snapshot.children[0] && !this.route.snapshot.children[0].url[0].path.includes('account')
                && err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService = this.injector.get(AuthenticationService);
                this.authenticationService.logout();
            }

            // Check if it's an error we must process
            if (!request.url.startsWith(AppConsts.appVersionUrl)) {
                if (this.isAnErrorWeMustProcess(err)) {
                    // Check if header has the 'errormessage' node
                    if (err.headers.get('errormessage')) {
                        const obj = JSON.parse(decodeURIComponent(escape(atob(err.headers.get('errormessage')))));

                        this.handleErrorResponse(obj);
                        return throwError(obj);
                    }
                } else {
                    if (err.headers.get('errormessage')) {
                        const obj = JSON.parse(decodeURIComponent(escape(atob(err.headers.get('errormessage')))));

                        this.handleErrorResponse(obj);
                        return throwError(obj);
                    } else {
                        this.handleErrorResponse({ Message: err.message });
                    }
                }
            }

            return throwError(err);
        })
        );
    }

    isAnErrorWeMustProcess(err: any): boolean {
        return err.status === 400 || err.status === 403 || err.status === 404 || err.status === 422 ||
            err.status === 406 || err.status === 409 || err.status === 500;
    }

    handleErrorResponse(err: any) {
        const self = this;

        switch (err.StatusCode) {
            case 400:
                self.alertService.warning(err.Message);
                break;
            case 403:
                self.alertService.warning(err.Message);
                break;
            case 404:
                self.alertService.warning(err.Message);
                break;
            case 422:
                self.alertService.validation(err.Title, err.Message);
                break;
            case 500:
                self.alertService.error(err.Message);
                break;
            default:
                self.alertService.error(err.Message);
                break;
        }
    }
}
