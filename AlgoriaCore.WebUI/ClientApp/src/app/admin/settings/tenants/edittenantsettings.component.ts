import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    EmailSendMethod,
    HostGrpcEmailCommand,
    TenantSettingsForEditResponse,
    TenantSettingsGetForEditQuery,
    TenantSettingsPasswordComplexityCommand,
    TenantSettingsSendTestEmailCommand,
    TenantSettingsServiceProxy,
    TenantSettingsUpdateCommand
} from '../../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../../shared/services/form.service';
import { AppComponent } from '../../../app.component';

@Component({
    templateUrl: './edittenantsettings.component.html'
})
export class EditTenantSettingsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    model: TenantSettingsForEditResponse = new TenantSettingsForEditResponse();
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: TenantSettingsServiceProxy,
        private formService: FormService,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        this.prepareForm();

        self.getForEdit();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            passwordMinimumLengthDefault: this.l('Tenant.Settings.Security.PasswordMinimumLength'),
            passwordMaximumLengthDefault: this.l('Tenant.Settings.Security.PasswordMaximumLength'),
            passwordMinimumLength: this.l('Tenant.Settings.Security.PasswordMinimumLength'),
            passwordMaximumLength: this.l('Tenant.Settings.Security.PasswordMaximumLength'),
            passwordValidDays: this.l('Tenant.Settings.Security.PasswordValidDays'),
            failedAttemptsToBlockUser: this.l('Tenant.Settings.Security.FailedAttemptsToBlockUser'),
            userBlockingDuration: this.l('Tenant.Settings.Security.UserBlockingDuration'),
            mailSMTPSenderDefault: this.l('Tenant.Settings.Mail.SenderDefault'),
            mailSMTPSenderDefaultDisplayName: this.l('Tenant.Settings.Mail.SenderDefaultDisplayName'),
            mailSMTPHost: this.l('Tenant.Settings.Mail.Host'),
            mailSMTPPort: this.l('Tenant.Settings.Mail.Port'),
            mailDomainName: this.l('Tenant.Settings.Mail.DomainName'),
            mailUserName: this.l('Tenant.Settings.Mail.UserName'),
            mailUserPassword: this.l('Tenant.Settings.Mail.UserPassword'),
            grpcMailTenancyName: this.l('Tenant.Settings.Mail.GrpcMail.TenancyName'),
            grpcMailUserName: this.l('Tenant.Settings.Mail.GrpcMail.UserName'),
            grpcMailPassword: this.l('Tenant.Settings.Mail.GrpcMail.Password')
        };

        self.form = self.formBuilder.group({
            passwordUseDefaultConfiguration: [true],

            passwordMinimumLength: [{ value: '', disabled: false }, [Validators.required, Validators.min(1), Validators.max(255)]],
            passwordMaximumLength: [{ value: '', disabled: false }, [Validators.required, Validators.min(1), Validators.max(255)]],
            passwordUseNumbers: [{ value: '', disabled: false }],
            passwordUseUppercase: [{ value: '', disabled: false }],
            passwordUseLowercase: [{ value: '', disabled: false }],
            passwordUsePunctuationSymbols: [{ value: '', disabled: false }],

            passwordMinimumLengthDefault: [{ value: '', disabled: true }, [Validators.required, Validators.min(1), Validators.max(255)]],
            passwordMaximumLengthDefault: [{ value: '', disabled: true }, [Validators.required, Validators.min(1), Validators.max(255)]],
            passwordUseNumbersDefault: [{ value: '', disabled: true }],
            passwordUseUppercaseDefault: [{ value: '', disabled: true }],
            passwordUseLowercaseDefault: [{ value: '', disabled: true }],
            passwordUsePunctuationSymbolsDefault: [{ value: '', disabled: true }],

            enablePasswordReuseValidation: [''],
            enablePasswordPeriod: [''],
            passwordValidDays: ['', [Validators.required, Validators.min(0)]],

            enableUserBlocking: [''],
            failedAttemptsToBlockUser: [{ value: '', disabled: true }, [Validators.required, Validators.min(1), Validators.max(255)]],
            userBlockingDuration: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],

            mailSMTPSenderDefault: ['', [Validators.maxLength(256), Validators.email]],
            mailSMTPSenderDefaultDisplayName: ['', [Validators.maxLength(128)]],
            mailSMTPHost: ['', [Validators.maxLength(64)]],
            mailSMTPPort: ['', Validators.min(0)],
            mailEnableSSL: [''],
            mailUseDefaultCredentials: [''],
            mailDomainName: ['', [Validators.maxLength(128)]],
            mailUserName: [''],
            mailUserPassword: [''],
            grpcMailTenancyName: ['', [Validators.maxLength(128)]],
            grpcMailUserName: ['', [Validators.maxLength(128)]],
            grpcMailPassword: ['', [Validators.maxLength(128)]],
            trySentTo: ['']
        });
    }

    getForEdit(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getSettingsForEdit(new TenantSettingsGetForEditQuery())
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.passwordUseDefaultConfiguration.setValue(data.passwordUseDefaultConfiguration);

                self.f.passwordMinimumLength.setValue(data.passwordComplexity.minimumLength);
                self.f.passwordMaximumLength.setValue(data.passwordComplexity.maximumLength);
                self.f.passwordUseNumbers.setValue(data.passwordComplexity.useNumbers);
                self.f.passwordUseUppercase.setValue(data.passwordComplexity.useUppercase);
                self.f.passwordUseLowercase.setValue(data.passwordComplexity.useLowercase);
                self.f.passwordUsePunctuationSymbols.setValue(data.passwordComplexity.usePunctuationSymbols);

                self.f.passwordMinimumLengthDefault.setValue(data.passwordComplexityDefault.minimumLength);
                self.f.passwordMaximumLengthDefault.setValue(data.passwordComplexityDefault.maximumLength);
                self.f.passwordUseNumbersDefault.setValue(data.passwordComplexityDefault.useNumbers);
                self.f.passwordUseUppercaseDefault.setValue(data.passwordComplexityDefault.useUppercase);
                self.f.passwordUseLowercaseDefault.setValue(data.passwordComplexityDefault.useLowercase);
                self.f.passwordUsePunctuationSymbolsDefault.setValue(data.passwordComplexityDefault.usePunctuationSymbols);

                self.f.enablePasswordReuseValidation.setValue(data.enablePasswordReuseValidation);
                self.f.enablePasswordPeriod.setValue(data.enablePasswordPeriod);
                self.f.passwordValidDays.setValue(data.passwordValidDays);

                self.f.enableUserBlocking.setValue(data.enableUserBlocking);
                self.f.failedAttemptsToBlockUser.setValue(data.failedAttemptsToBlockUser);
                self.f.userBlockingDuration.setValue(data.userBlockingDuration);

                self.f.mailSMTPSenderDefault.setValue(data.mailSMTPSenderDefault);
                self.f.mailSMTPSenderDefaultDisplayName.setValue(data.mailSMTPSenderDefaultDisplayName);
                self.f.mailSMTPHost.setValue(data.mailSMTPHost);
                self.f.mailSMTPPort.setValue(data.mailSMTPPort);
                self.f.mailEnableSSL.setValue(data.mailEnableSSL);
                self.f.mailUseDefaultCredentials.setValue(data.mailUseDefaultCredentials);
                self.f.mailDomainName.setValue(data.mailDomainName);
                self.f.mailUserName.setValue(data.mailUserName);
                self.f.mailUserPassword.setValue(data.mailUserPassword);

                self.f.grpcMailTenancyName.setValue(data.grpcEmail.tenancyName);
                self.f.grpcMailUserName.setValue(data.grpcEmail.userName);
                self.f.grpcMailPassword.setValue(data.grpcEmail.password);

                if (data.emailSendMethod === EmailSendMethod.Grpc && !data.grpcEmail.sendConfiguration) {
                    self.f.grpcMailTenancyName.clearValidators();
                    self.f.grpcMailUserName.clearValidators();
                    self.f.grpcMailPassword.clearValidators();

                    self.f.grpcMailTenancyName.setValidators([Validators.required, Validators.maxLength(128)]);
                    self.f.grpcMailUserName.setValidators([Validators.required, Validators.maxLength(128)]);
                    self.f.grpcMailPassword.setValidators([Validators.required, Validators.maxLength(128)]);

                    self.f.grpcMailTenancyName.updateValueAndValidity();
                    self.f.grpcMailUserName.updateValueAndValidity();
                    self.f.grpcMailUserName.updateValueAndValidity();
                }

                self.onClickEnableUserBlocking();
                self.onClickEnablePasswordPeriod();
                self.onClickMailUseDefaultCredentials();
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const updateCmd = new TenantSettingsUpdateCommand();

        updateCmd.passwordUseDefaultConfiguration = self.f.passwordUseDefaultConfiguration.value;

        if (!self.f.passwordUseDefaultConfiguration.value) {
            updateCmd.passwordComplexity = new TenantSettingsPasswordComplexityCommand();
            updateCmd.passwordComplexity.minimumLength = self.f.passwordMinimumLength.value;
            updateCmd.passwordComplexity.maximumLength = self.f.passwordMaximumLength.value;
            updateCmd.passwordComplexity.useNumbers = self.f.passwordUseNumbers.value;
            updateCmd.passwordComplexity.useUppercase = self.f.passwordUseUppercase.value;
            updateCmd.passwordComplexity.useLowercase = self.f.passwordUseLowercase.value;
            updateCmd.passwordComplexity.usePunctuationSymbols = self.f.passwordUsePunctuationSymbols.value;
        }

        updateCmd.enablePasswordReuseValidation = self.f.enablePasswordReuseValidation.value;
        updateCmd.enablePasswordPeriod = self.f.enablePasswordPeriod.value;
        updateCmd.passwordValidDays = self.f.passwordValidDays.value;

        updateCmd.enableUserBlocking = self.f.enableUserBlocking.value;
        updateCmd.failedAttemptsToBlockUser = self.f.failedAttemptsToBlockUser.value;
        updateCmd.userBlockingDuration = self.f.userBlockingDuration.value;

        updateCmd.mailSMTPSenderDefault = self.f.mailSMTPSenderDefault.value;
        updateCmd.mailSMTPSenderDefaultDisplayName = self.f.mailSMTPSenderDefaultDisplayName.value;
        updateCmd.mailSMTPHost = self.f.mailSMTPHost.value;
        updateCmd.mailSMTPPort = self.f.mailSMTPPort.value;

        updateCmd.mailEnableSSL = self.f.mailEnableSSL.value;

        updateCmd.mailUseDefaultCredentials = self.f.mailUseDefaultCredentials.value;
        updateCmd.mailDomainName = self.f.mailDomainName.value;
        updateCmd.mailUserName = self.f.mailUserName.value;
        updateCmd.mailUserPassword = self.f.mailUserPassword.value;

        if (self.model.emailSendMethod === EmailSendMethod.Grpc && !self.model.grpcEmail.sendConfiguration) {
            updateCmd.grpcEmail = new HostGrpcEmailCommand();
            updateCmd.grpcEmail.tenancyName = self.f.grpcMailTenancyName.value;
            updateCmd.grpcEmail.userName = self.f.grpcMailUserName.value;
            updateCmd.grpcEmail.password = self.f.grpcMailPassword.value;
        }

        self.app.blocked = true;

        self.service.updateAllSettings(updateCmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Confirmation'));
            });
    }

    sendTestMail(): void {
        const self = this;
        const updateCmd = new TenantSettingsSendTestEmailCommand();

        updateCmd.emailAddress = self.f.trySentTo.value;

        self.app.blocked = true;

        self.service.sendTestEmail(updateCmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('TestEmailSentSuccessfully'), self.l('Success'));
            });
    }

    onClickEnableUserBlocking(): void {
        const self = this;

        if (self.f.enableUserBlocking.value) {
            self.f.failedAttemptsToBlockUser.enable();
            self.f.userBlockingDuration.enable();
        } else {
            self.f.failedAttemptsToBlockUser.disable();
            self.f.userBlockingDuration.disable();
        }
    }

    onClickEnablePasswordPeriod(): void {
        const self = this;

        if (self.f.enablePasswordPeriod.value) {
            self.f.passwordValidDays.enable();
        } else {
            self.f.passwordValidDays.disable();
        }
    }

    onClickMailUseDefaultCredentials(): void {
        const self = this;

        if (self.f.mailUseDefaultCredentials.value) {
            self.f.mailUserName.clearValidators();
            self.f.mailUserPassword.clearValidators();
        } else {
            self.f.mailUserName.setValidators([Validators.required, Validators.maxLength(128)]);
            self.f.mailUserPassword.setValidators([Validators.required, Validators.maxLength(128)]);
        }

        self.f.mailUserName.updateValueAndValidity();
        self.f.mailUserPassword.updateValueAndValidity();
    }
}
