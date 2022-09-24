import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    SampleLogCriticalCommand,
    SampleLogDebugCommand,
    SampleLogErrorCommand,
    SampleLogInformationCommand,
    SampleLogServiceProxy,
    SampleLogTraceCommand,
    SampleLogWarningCommand
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplelog.component.html'
})
export class SampleLogComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private formService: FormService,
        private dateTimeService: DateTimeService,
        private service: SampleLogServiceProxy,
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

        self.prepareForm();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            message: this.l('Examples.Log.Message'),
            criticalemail: this.l('Examples.Log.CriticalEmail')
        };

        self.form = self.formBuilder.group({
            message: ['', Validators.required],
            criticalemail: ['']
        });
    }

    sendTrace(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogTraceCommand();
        cmd.message = self.f.message.value;

        self.app.blocked = true;

        self.service.createSampleLogTrace(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }

    sendDebug(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogDebugCommand();
        cmd.message = self.f.message.value;

        self.app.blocked = true;

        self.service.createSampleLogDebug(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }

    sendInformation(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogInformationCommand();
        cmd.message = self.f.message.value;

        self.app.blocked = true;

        self.service.createSampleLogInformation(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }

    sendWarning(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogWarningCommand();
        cmd.message = self.f.message.value;

        self.app.blocked = true;

        self.service.createSampleLogWarning(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }

    sendError(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogErrorCommand();
        cmd.message = self.f.message.value;

        self.app.blocked = true;

        self.service.createSampleLogError(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }

    sendCritical(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const cmd = new SampleLogCriticalCommand();

        cmd.message = self.f.message.value;
        cmd.email = self.f.criticalemail.value;

        self.app.blocked = true;

        self.service.createSampleLogCritical(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
            });
    }
}
