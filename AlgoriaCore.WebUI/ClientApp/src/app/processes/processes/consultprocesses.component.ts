import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { DateTimeService } from 'src/shared/services/datetime.service';
import {
    ProcessForEditResponse,
    ProcessGetForReadQuery,
    ProcessServiceProxy,
    TemplateFieldControl,
    TemplateFieldResponse,
    TemplateFieldType,
    TemplateResponse,
    TemplateSectionForListResponse
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';
import * as moment from 'moment';

@Component({
    templateUrl: './consultprocesses.component.html'
})
export class ConsultProcessesComponent extends AppComponentBase implements OnInit {

    templateId?: number = null;
    id?: number = null;
    model: ProcessForEditResponse;
    fieldLabels: any = {};

    templateSections: TemplateSectionForListResponse[] = [];

    TemplateFieldType = TemplateFieldType;
    TemplateFieldControl = TemplateFieldControl;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private service: ProcessServiceProxy,
        private formService: FormService,
        private changeLogService: ChangeLogService,
        private dateTimeService: DateTimeService,
        private app: AppComponent,
        private location: Location
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.id = self.activatedRoute.snapshot.params['id'];
        self.templateId = Number(self.activatedRoute.snapshot.params['template']);

        self.getForRead();
    }

    prepareLabels(template: TemplateResponse, templateFields: TemplateFieldResponse[]) {
        const self = this;

        self.fieldLabels = {};

        if (template.isActivity) {
            self.fieldLabels['ACT_UserCreator'] = self.l('Processes.Process.Activity.UserCreator');
            self.fieldLabels['ACT_CreationTime'] = self.l('Processes.Process.Activity.CreationTime');
            self.fieldLabels['ACT_Description'] = self.l('Processes.Process.Activity.Description');
            self.fieldLabels['ACT_Status'] = self.l('Processes.Process.Activity.Status');
            self.fieldLabels['ACT_InitialPlannedDate'] = self.l('Processes.Process.Activity.InitialPlannedDate');
            self.fieldLabels['ACT_InitialRealDate'] = self.l('Processes.Process.Activity.InitialRealDate');
            self.fieldLabels['ACT_FinalPlannedDate'] = self.l('Processes.Process.Activity.FinalPlannedDate');
            self.fieldLabels['ACT_FinalRealDate'] = self.l('Processes.Process.Activity.FinalRealDate');
            self.fieldLabels['ACT_IsOnTime'] = self.l('Processes.Process.Activity.IsOnTime');
            self.fieldLabels['ACT_Executor'] = self.l('Processes.Process.Activity.Executor');
            self.fieldLabels['ACT_Evaluator'] = self.l('Processes.Process.Activity.Evaluator');
        }

        for (const field of templateFields) {
            self.fieldLabels[field.fieldName] = field.name;
        }
    }

    getForRead(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getProcessForRead(new ProcessGetForReadQuery({ template: self.templateId, id: self.id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.prepareLabels(data.template, data.templateFields);

                self.model = data;

                if (data.templateFields && data.templateFields.length > 0) {
                    data.templateFields = data.templateFields.sort((a, b) => a.templateSection - b.templateSection);
                    let templateSection: number = null;
                    let ts: TemplateSectionForListResponse;

                    for (const field of data.templateFields) {
                        switch (field.fieldControl) {
                            case TemplateFieldControl.CalendarBasic:
                                self.model.data[field.fieldName + '_DESC'] = self.dateTimeService.getDateToDisplay(
                                    moment(self.model.data[field.fieldName], 'YYYY-MM-DDT00:00')
                                );
                                break;
                            case TemplateFieldControl.CalendarTime:
                                self.model.data[field.fieldName + '_DESC'] = self.dateTimeService.getDateTimeToDisplay(
                                    moment(self.model.data[field.fieldName], 'YYYY-MM-DDTHH:mmZ')
                                );
                                break;
                        }

                        if (templateSection !== field.templateSection) {
                            ts = new TemplateSectionForListResponse({
                                id: field.templateSection,
                                name: field.templateSectionDesc,
                                order: field.templateSectionOrder,
                                iconAF: field.templateSectionIconAF
                            });

                            ts['fields'] = data.templateFields.filter(p => p.templateSection === ts.id);

                            self.templateSections.push(ts);
                        }

                        templateSection = field.templateSection;
                    }

                    self.templateSections = self.templateSections.sort((a, b) => a.order - b.order);
                }

                if (data.activity) {
                    self.model.activity['creationTimeDesc'] = self.dateTimeService.getDateTimeToDisplay(data.activity.creationTime);
                    self.model.activity['initialPlannedDateDesc'] = self.dateTimeService.getDateToDisplay(data.activity.initialPlannedDate);
                    self.model.activity['finalPlannedDateDesc'] = self.dateTimeService.getDateToDisplay(data.activity.finalPlannedDate);
                    self.model.activity['initialRealDateDesc'] = self.dateTimeService.getDateToDisplay(data.activity.initialRealDate);
                    self.model.activity['finalRealDateDesc'] = self.dateTimeService.getDateToDisplay(data.activity.finalRealDate);
                    self.model.activity['executorDesc'] = data.activity.executor.map(p => p.userDesc).join(', ');
                    self.model.activity['evaluatorDesc'] = data.activity.evaluator.map(p => p.userDesc).join(', ');
                }
            });
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open(self.model.template.tableName, self.id);
    }

    return(): void {
        const self = this;

        self.location.back();
    }
}
