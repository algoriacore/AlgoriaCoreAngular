import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';
import { AuditLogListResponse } from 'src/shared/service-proxies/service-proxies';

@Component({
    templateUrl: './auditlogsdetail.component.html',
    styles: [`
        pre {
            font-family: monospace;
            background-color: #EFEFEF;
            color: #333333;
            padding: 1em;
            font-size: 14px;
            border-radius: 0;
            overflow: auto;
        }
        `
    ]
})
export class AuditLogsDetailComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    model: AuditLogListResponse = null;
    data = [{}, {}];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig
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

        self.model = self.modalConfig.data;
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            emailaddress: ['', Validators.required]
        });
    }

    getExecutionTime(): string {
        const self = this;
        return moment(self.model.executionTime).fromNow() + ' (' + moment(self.model.executionTime).format('YYYY-MM-DD HH:mm:ss') + ')';
    }

    return(isSuccess: boolean = false): void {
        const self = this;

        self.modalRef.close(isSuccess);
    }
}
