import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ProcessServiceProxy,
    ToDoTimeSheetCreateCommand,
    ToDoTimeSheetForEditResponse,
    ToDoTimeSheetGetForEditQuery,
    ToDoTimeSheetUpdateCommand
} from 'src/shared/service-proxies/service-proxies';
import { FormService } from 'src/shared/services/form.service';
import { DateTimeService } from '../../../../../shared/services/datetime.service';

@Component({
    templateUrl: './edittodotimesheets.component.html'
})
export class EditToDoTimeSheetComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: ToDoTimeSheetForEditResponse = new ToDoTimeSheetForEditResponse();
    template: number;
    activity: number;
    id?: number = null;
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: ProcessServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private formService: FormService,
        private dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.template = self.modalConfig.data.template;
        self.activity = self.modalConfig.data.activity;
        self.id = self.modalConfig.data.id;

        this.prepareForm();

        self.getForEdit(self.template, self.id);
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            creationDate: self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.CreationDate'),
            hoursSpend: self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.HoursSpend'),
            comments: self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.Comments'),
            activityStatus: self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.Status')
        };

        self.form = self.formBuilder.group({
            creationDate: [null, [Validators.required]],
            hoursSpend: [null, [Validators.required]],
            comments: [null, [Validators.required, Validators.maxLength(250)]],
            activityStatus: [null]
        });
    }

    getForEdit(template: number, id: number): void {
        const self = this;

        self.blockedDocument = true;

        self.service.getToDoTimeSheetForEdit(new ToDoTimeSheetGetForEditQuery({ template: template, id: id }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.model = data;

                if (self.id) {
                    self.f.creationDate.setValue(self.dateTimeService.getDateToAssignInFormControl(data.creationDate));
                    self.f.comments.setValue(data.comments);
                    self.f.hoursSpend.setValue(data.hoursSpend);
                }
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.blockedDocument = true;

        if (self.id) {
            const updateCmd = new ToDoTimeSheetUpdateCommand();

            updateCmd.template = self.template;
            updateCmd.id = self.model.id;
            updateCmd.creationDate = self.dateTimeService.getDateToSaveServer(self.f.creationDate.value);
            updateCmd.comments = self.f.comments.value;
            updateCmd.hoursSpend = self.f.hoursSpend.value;
            updateCmd.activityStatus = self.f.activityStatus.value;

            self.service.updateToDoTimeSheet(updateCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.SuccessfulUpdate'), self.l('Success'));
                    self.return(true);
                });
        } else {
            const createCmd = new ToDoTimeSheetCreateCommand();

            createCmd.template = self.template;
            createCmd.activity = self.activity;
            createCmd.creationDate = self.dateTimeService.getDateToSaveServer(self.f.creationDate.value);
            createCmd.comments = self.f.comments.value;
            createCmd.hoursSpend = self.f.hoursSpend.value;
            createCmd.activityStatus = self.f.activityStatus.value;

            self.service.createToDoTimeSheet(createCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Processes.Process.ToDoTimeSheets.ToDoTimeSheet.SuccessfulCreate'), self.l('Success'));
                    self.return(true);
                });
        }
    }

    return(isSaved = false): void {
        const self = this;

        self.modalRef.close(isSaved);
    }
}
