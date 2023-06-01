import { Component, Injector, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { AppConsts } from '../../shared/AppConsts';
import { StringsHelper } from '../../shared/helpers/StringsHelper';
import { UserLoginQuery, UserLoginMicrosoftQuery } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';
import { MsalBroadcastService, MsalService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import {
    InteractionStatus,
    AuthenticationResult,
    InteractionType,
    PopupRequest,
    RedirectRequest
} from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { BrowserStorageService } from '../../shared/services/storage.service';
import { Subject } from 'rxjs';

@Component({
    templateUrl: 'login.component.html',
    providers: [MessageService]
})
export class LoginComponent extends AppComponentBase implements OnInit {

    private static readonly _destroying$ = new Subject<void>();

    form: FormGroup;
    submitted = false;
    returnUrl: string;
    userLoginQuery: UserLoginQuery = new UserLoginQuery();
    multiTenancy: boolean = AppConsts.multiTenancy;

    showTenantField = true;
    tenancyNameStorageKey = 'TENANCYNAME';

    constructor(
        injector: Injector,
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private app: AccountComponent,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
        private storageService: BrowserStorageService
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.showTenantField = StringsHelper.isNullOrWhiteSpace(AppConsts.tenancyName);

        this.form = this.formBuilder.group({
            tenancyname: [{ value: AppConsts.tenancyName, disabled: !StringsHelper.isNullOrWhiteSpace(AppConsts.tenancyName) }],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'

        if (this.route.snapshot.queryParams['returnUrl'] && this.route.snapshot.queryParams['returnUrl'] !== '') {
            this.returnUrl = this.baseUrl + this.route.snapshot.queryParams['returnUrl'];
        } else {
            this.returnUrl = this.baseUrl;
        }

        self.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(LoginComponent._destroying$)
            )
            .subscribe((a) => {
                const allStorages = self.storageService.getAll();
                const storageVal = allStorages.find(m => m.key === AppConsts.azureLocalStorageKey);

                if (storageVal) {
                    self.loginMicrosoft(storageVal, this.returnUrl);
                }
            });
    }

    singInMicrosoft() {
        const self = this;

        // Antes que nada, se guarda el tenant capturado en localstorage
        self.browserStorageService.set(self.tenancyNameStorageKey, self.f.tenancyname.value);

        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            } else {
                this.authService.loginPopup()
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            }
        } else {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
            } else {
                this.authService.loginRedirect();
            }
        }
    }

    loginMicrosoft(storageVal: any, returnUrl: string) {
        const self = this;

        const tenancyName = self.browserStorageService.get(self.tenancyNameStorageKey);
        self.browserStorageService.remove(self.tenancyNameStorageKey);

        const accessTokenKey = storageVal.value.accessToken[0];
        const allStorages = self.storageService.getAll();
        const aT = allStorages.find(m => m.key === accessTokenKey);

        // Decodificar el token
        const tokenObj = self.decodeJWT(aT.value.secret);
        self.f.username.setValue(tokenObj.email);
        self.f.tenancyname.setValue(tenancyName);

        self.f.username.disable();
        self.f.tenancyname.disable();

        self.app.blocked = true;

        const userLoginQuery: UserLoginMicrosoftQuery = new UserLoginMicrosoftQuery();
        userLoginQuery.token = aT.value.secret;
        userLoginQuery.tenancyName = tenancyName;

        self.authenticationService.loginMicrosoft(userLoginQuery)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {

                    self.messageService.add({
                        severity: 'success',
                        summary: this.l('Login.Welcome'),
                        detail: data.firstName + ' ' + data.lastName
                    });
                    location.href = returnUrl;
                },
                error => {
                    // Eliminar toda la información del login previo de microsoft
                    self.authenticationService.logoutMicrosoft();

                    self.f.username.enable();
                    self.f.tenancyname.enable();

                    if (error.StatusCode === 401) {
                        this.messageService.add({
                            severity: 'warn', summary: this.l('Login.FailLogin'), detail: this.l('Login.FailLoginMessage')
                        });
                        return false;
                    } else if (error.StatusCode === 409) {
                        self.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 400) {
                        self.messageService.add({ severity: 'error', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 406) {
                        // Requiere cambio de contraseña
                        self.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });

                        setTimeout(function () {
                            // const a = {
                            //    queryParams: {
                            //        tn: userLoginQuery.tenancyName,
                            //        un: userLoginQuery.userName
                            //    }
                            // };

                            // self.router.navigate(['/account/changep'], a);
                        }, 2000);
                    }
                }
            );
    }

    decodeJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    gotoRegister(): void {
        const self = this;

        self.router.navigate(['/account/register']);
    }

    onSubmit(): void {
        const self = this;

        self.submitted = true;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        self.userLoginQuery.tenancyName = self.f.tenancyname.value;
        self.userLoginQuery.userName = self.f.username.value;
        self.userLoginQuery.password = self.f.password.value;

        self.app.blocked = true;

        self.authenticationService.login(self.userLoginQuery)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.l('Login.Welcome'),
                        detail: data.firstName + ' ' + data.lastName
                    });
                    location.href = this.returnUrl;
                },
                error => {
                    if (error.StatusCode === 401) {
                        this.messageService.add({
                            severity: 'warn', summary: this.l('Login.FailLogin'), detail: this.l('Login.FailLoginMessage')
                        });
                        return false;
                    } else if (error.StatusCode === 409) {
                        this.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 400) {
                        this.messageService.add({ severity: 'error', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 406) {
                        // Requiere cambio de contraseña
                        this.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });

                        setTimeout(function () {
                            const a = {
                                queryParams: {
                                    tn: self.userLoginQuery.tenancyName,
                                    un: self.userLoginQuery.userName
                                }
                            };

                            self.router.navigate(['/account/changep'], a);
                        }, 2000);
                    }
                }
            );
    }
}
