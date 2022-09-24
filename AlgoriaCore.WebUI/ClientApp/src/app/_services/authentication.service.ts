import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConsts } from '../../shared/AppConsts';
import {
    AuthServiceProxy,
    ConfirmPasswordCommandReset,
    RegisterServiceProxy,
    SessionLoginResponseController,
    TenantConfirmRegistrationCommand,
    TenantCreateRegistrationCommand,
    UserChangePasswordCommand,
    UserImpersonalizeQuery,
    UserLoginQuery,
    UserResetPasswordCommand
} from '../../shared/service-proxies/service-proxies';
import { BrowserStorageService } from '../../shared/services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public currentUser: Observable<SessionLoginResponseController>;
    private currentUserSubject: BehaviorSubject<SessionLoginResponseController>;

    constructor(private authClient: AuthServiceProxy,
        private regClient: RegisterServiceProxy,
        private router: Router,
        private browserStorageService: BrowserStorageService) {
        this.currentUserSubject = new BehaviorSubject<SessionLoginResponseController>(JSON.parse(browserStorageService.get('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): SessionLoginResponseController {
        return this.currentUserSubject.value;
    }

    public login(userLoginQuery: UserLoginQuery) {

        return this.authClient.login(userLoginQuery)
            .pipe(map ( user => {
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    this.browserStorageService.remove('impersonalizedUser');
                    this.browserStorageService.set('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    public impersonalizeTenant(user: number, tenant: number) {
        const self = this;

        if (self.currentUserValue.userId === user) {
            return;
        }

        const query: UserImpersonalizeQuery = new UserImpersonalizeQuery({
            tenant: tenant,
            user: user
        });

        self.authClient.impersonalizeTenant(query)
            .pipe(map(user2 => self.impersonalizeCallback(user2))).subscribe(data => {
                window.location.href = AppConsts.appBaseUrl;
            });
    }

    public impersonalizeUser(user: number) {
        const self = this;

        if (self.currentUserValue.userId === user) {
            return;
        }

        self.authClient.impersonalizeUser(user)
            .pipe(map(user2 => self.impersonalizeCallback(user2))).subscribe(data => {
                window.location.href = AppConsts.appBaseUrl;
            });
    }

    public resetPassword(userDto: UserResetPasswordCommand) {
        return this.authClient.resetPassword(userDto)
            .pipe(map(user => user));
    }

    public confirmResetPassword(userDto: ConfirmPasswordCommandReset) {
        return this.authClient.confirmResetPassword(userDto)
            .pipe(map(user => user));
    }

    public changePassword(userDto: UserChangePasswordCommand) {
        return this.authClient.changePassword(userDto)
            .pipe(map(user => user));
    }

    public register(userDto: TenantCreateRegistrationCommand) {
        return this.regClient.create(userDto)
            .pipe(map(user => user));
    }

    public confirmRegistration(userDto: TenantConfirmRegistrationCommand) {
        return this.regClient.confirm(userDto)
            .pipe(map(user => user));
    }

    logoutImpersonalization() {
        const impersonalizedUserJSON = JSON.parse(this.browserStorageService.get('impersonalizedUser'));
        const previousUser = impersonalizedUserJSON.items[impersonalizedUserJSON.items.length - 1];

        impersonalizedUserJSON.items.pop();

        if (impersonalizedUserJSON.items.length > 0) {
            this.browserStorageService.set('impersonalizedUser', JSON.stringify(impersonalizedUserJSON));
        } else {
            this.browserStorageService.remove('impersonalizedUser');
        }

        this.browserStorageService.set('currentUser', JSON.stringify(previousUser));
        this.currentUserSubject.next(previousUser);

        window.location.href = AppConsts.appBaseUrl;
    }

    logout() {
        // remove user from local storage to log user out
        this.browserStorageService.remove('impersonalizedUser');
        this.browserStorageService.remove('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    private impersonalizeCallback(user: any): any {
        const self = this;

        if (user && user.token) {
            const impersonalizedUser = this.browserStorageService.get('impersonalizedUser');
            let impersonalizedUserJSON;

            if (impersonalizedUser) {
                impersonalizedUserJSON = JSON.parse(impersonalizedUser);
            } else {
                impersonalizedUserJSON = { items: [] };
            }

            impersonalizedUserJSON.items.push(JSON.parse(this.browserStorageService.get('currentUser')));
            this.browserStorageService.set('impersonalizedUser', JSON.stringify(impersonalizedUserJSON));

            // store user details and jwt token in local storage to keep user logged in between page refreshes
            this.browserStorageService.set('currentUser', JSON.stringify(user));

            self.currentUserSubject.next(user);
        }

        return user;
    }
}
