import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { TenantConfirmRegistrationCommand } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'registerconfirm.component.html',
    providers: [MessageService]
})
export class TenantConfirmRegistrationComponent extends AppComponentBase implements OnInit {
    form: FormGroup;
    confirmated = false;

    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private app: AccountComponent
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        // Se ejecuta el confirm
        self.confirm();
    }

    confirm() {
        const self = this;

        self.confirmated = false;

        const userDto = new TenantConfirmRegistrationCommand();
        userDto.code = this.route.snapshot.queryParams['code'];

        self.app.blocked = true;

        self.authenticationService.confirmRegistration(userDto)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {
                    self.alertService.custom(self.l('Confirmation'), self.l('Register.Confirm.AccountCreatedSuccessfully'), function () {
                        self.router.navigate(['/account/login']);
                    });

                    this.confirmated = true;
                });
    }

    return(): void {
        this.router.navigate(['/account/login']);
    }
}
