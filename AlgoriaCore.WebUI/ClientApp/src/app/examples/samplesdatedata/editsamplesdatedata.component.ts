import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    SampleDateDataConvertCommand,
    SampleDateDataCreateCommand,
    SampleDateDataForEditResponse,
    SampleDateDataGetForEditQuery,
    SampleDateDataServiceProxy,
    SampleDateDataUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './editsamplesdatedata.component.html'
})
export class EditSamplesDateDataComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    id?: number = null;
    model: SampleDateDataForEditResponse = null;
    fieldLabels: any = {};

    timeZoneCombo: ComboboxItemDto[] = [];
    dateTimeDataConverted: string;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private formService: FormService,
        private dateTimeService: DateTimeService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: SampleDateDataServiceProxy,
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

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.timeZoneCombo = self.getTimeZoneCombo();

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    getTimeZoneCombo(): ComboboxItemDto[] {
        const self = this;
        const timeZoneCombo: ComboboxItemDto[] = [];

        for (const tz of self.dateTimeService.getAvailableZones()) {
            timeZoneCombo.push(new ComboboxItemDto({ value: tz, label: tz }));
        }

        return timeZoneCombo;
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            timeZone: this.l('Examples.DateTimes.TimeZone'),
            name: this.l('Examples.DateTimes.Name'),
            dateTimeData: this.l('Examples.DateTimes.DateTime'),
            dateData: this.l('Examples.DateTimes.Date'),
            timeData: this.l('Examples.DateTimes.Time'),
            dateTimeDataISO: this.l('Examples.DateTimes.DateTimeDataISO'),
            dateTimeDataAmPm: this.l('Examples.DateTimes.DateTimeDataAmPm'),
            dateDataEnWithoutButtons: this.l('Examples.DateTimes.DateDataEnWithoutButtons'),
            timeDataAmPm: this.l('Examples.DateTimes.TimeDataAmPm'),
            timeDataWithSeconds: this.l('Examples.DateTimes.TimeDataWithSeconds'),
            timeDataStep15Min: this.l('Examples.DateTimes.timeDataStep15Min'),
            timeZoneFrom: this.l('Examples.DateTimes.TimeZoneFrom'),
            timeZoneTo: this.l('Examples.DateTimes.TimeZoneTo'),
            dateTimeDataToConvert: this.l('Examples.DateTimes.DateTimeDataToConvert')
        };

        const now1: moment.Moment = moment();
        console.log(now1);
        console.log(now1.format('DD/MM/YYYY HH:mm'));

        const now2: moment.Moment = self.dateTimeService.getCurrentDateTime();
        console.log(now2);
        console.log(now2.format('DD/MM/YYYY HH:mm'));

        const now: Date = self.dateTimeService.getCurrentDateTimeToDate();
        const timeZone: string = self.dateTimeService.getTimeZone();

        self.form = self.formBuilder.group({
            timeZone: [timeZone],
            name: ['', Validators.required],
            dateTimeData: [now, Validators.required],
            dateData: [now, Validators.required],
            timeData: [now, Validators.required],
            statusControls: [true],
            dateTimeDataISO: [now],
            dateTimeDataAmPm: [now],
            dateDataEnWithoutButtons: [now],
            timeDataAmPm: [now],
            timeDataWithSeconds: [now],
            timeDataStep15Min: [now],
            timeZoneFrom: [timeZone],
            timeZoneTo: [timeZone],
            dateTimeDataToConvert: [now]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getSampleDateDataForEdit(new SampleDateDataGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(data.name);
                self.f.dateTimeData.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(data.dateTimeData));
                self.f.dateData.setValue(this.dateTimeService.getDateToAssignInFormControl(data.dateData));
                self.f.timeData.setValue(this.dateTimeService.getTimeToAssignInFormControl(data.timeData));

                self.f.dateTimeDataISO.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(data.dateTimeData));
                self.f.dateTimeDataAmPm.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(data.dateTimeData));
                self.f.dateDataEnWithoutButtons.setValue(this.dateTimeService.getDateToAssignInFormControl(data.dateData));
                self.f.timeDataAmPm.setValue(this.dateTimeService.getTimeToAssignInFormControl(data.timeData));
                self.f.timeDataWithSeconds.setValue(this.dateTimeService.getTimeToAssignInFormControl(data.timeData));
                self.f.timeDataStep15Min.setValue(this.dateTimeService.getTimeToAssignInFormControl(data.timeData));
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        if (self.id) {
            const updateCmd = new SampleDateDataUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.dateTimeData = this.dateTimeService.getDateTimeToSaveServer(self.f.dateTimeData.value);
            updateCmd.dateData = this.dateTimeService.getDateToSaveServer(self.f.dateData.value);
            updateCmd.timeData = this.dateTimeService.getTimeToSaveServer(self.f.timeData.value);

            self.app.blocked = true;

            self.service.updateSampleDateData(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Examples.DateTimes.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new SampleDateDataCreateCommand();

            createCmd.name = self.f.name.value;
            createCmd.dateTimeData = this.dateTimeService.getDateTimeToSaveServer(self.f.dateTimeData.value);
            createCmd.dateData = this.dateTimeService.getDateToSaveServer(self.f.dateData.value);
            createCmd.timeData = this.dateTimeService.getTimeToSaveServer(self.f.timeData.value);

            self.app.blocked = true;

            self.service.createSampleDateData(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Examples.DateTimes.SuccessfulCreate'), self.l('Success'));
                    self.activaModoNuevo();
                });
        }
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();

        // focus
    }

    onChangeStatusControls(event): void {
        const self = this;

        if (self.f.statusControls.value) {
            self.f.dateTimeDataISO.enable();
            self.f.dateTimeDataAmPm.enable();
            self.f.dateDataEnWithoutButtons.enable();
            self.f.timeDataAmPm.enable();
            self.f.timeDataWithSeconds.enable();
            self.f.timeDataStep15Min.enable();
        } else {
            self.f.dateTimeDataISO.disable();
            self.f.dateTimeDataAmPm.disable();
            self.f.dateDataEnWithoutButtons.disable();
            self.f.timeDataAmPm.disable();
            self.f.timeDataWithSeconds.disable();
            self.f.timeDataStep15Min.disable();
        }
    }

    onChangeTimeZone(event): void {
        const self = this;

        let dateTimeData: moment.Moment = this.dateTimeService.getDateTimeToSaveServer(self.f.dateTimeData.value);
        let dateData: moment.Moment = this.dateTimeService.getDateToSaveServer(self.f.dateData.value);
        const timeData: moment.Duration = this.dateTimeService.getTimeToSaveServer(self.f.timeData.value);

        let dateTimeDataISO: moment.Moment = this.dateTimeService.getDateTimeToSaveServer(self.f.dateTimeDataISO.value);
        let dateTimeDataAmPm: moment.Moment = this.dateTimeService.getDateTimeToSaveServer(self.f.dateTimeDataAmPm.value);
        let dateDataEnWithoutButtons: moment.Moment = this.dateTimeService.getDateToSaveServer(self.f.dateDataEnWithoutButtons.value);
        const timeDataAmPm: moment.Duration = this.dateTimeService.getTimeToSaveServer(self.f.timeDataAmPm.value);
        const timeDataWithSeconds: moment.Duration = this.dateTimeService.getTimeToSaveServer(self.f.timeDataWithSeconds.value);
        const timeDataStep15Min: moment.Duration = this.dateTimeService.getTimeToSaveServer(self.f.timeDataStep15Min.value);

        if (self.f.timeZone.value) {
            self.dateTimeService.setTimeZone(self.f.timeZone.value);
        } else {
            self.dateTimeService.setTimeZone();
        }

        const timeZone = self.dateTimeService.getTimeZone();

        dateTimeData = moment.tz(dateTimeData.format('YYYY-MM-DDTHH:mm:ssZ'), timeZone);
        dateData = moment.tz(dateData.format('YYYY-MM-DDTHH:mm:ssZ'), timeZone);

        dateTimeDataISO = moment.tz(dateTimeDataISO.format('YYYY-MM-DDTHH:mm:ssZ'), timeZone);
        dateTimeDataAmPm = moment.tz(dateTimeDataAmPm.format('YYYY-MM-DDTHH:mm:ssZ'), timeZone);
        dateDataEnWithoutButtons = moment.tz(dateDataEnWithoutButtons.format('YYYY-MM-DDTHH:mm:ssZ'), timeZone);

        self.f.dateTimeData.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(dateTimeData));
        self.f.dateData.setValue(this.dateTimeService.getDateToAssignInFormControl(dateData));
        self.f.timeData.setValue(this.dateTimeService.getTimeToAssignInFormControl(timeData));

        self.f.dateTimeDataISO.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(dateTimeDataISO));
        self.f.dateTimeDataAmPm.setValue(this.dateTimeService.getDateTimeToAssignInFormControl(dateTimeDataAmPm));
        self.f.dateDataEnWithoutButtons.setValue(this.dateTimeService.getDateToAssignInFormControl(dateDataEnWithoutButtons));
        self.f.timeDataAmPm.setValue(this.dateTimeService.getTimeToAssignInFormControl(timeDataAmPm));
        self.f.timeDataWithSeconds.setValue(this.dateTimeService.getTimeToAssignInFormControl(timeDataWithSeconds));
        self.f.timeDataStep15Min.setValue(this.dateTimeService.getTimeToAssignInFormControl(timeDataStep15Min));
    }

    timeZoneConvert(): void {
        const self = this;
        const cmd = new SampleDateDataConvertCommand();

        cmd.timeZoneFrom = self.f.timeZoneFrom.value;
        cmd.timeZoneTo = self.f.timeZoneTo.value;
        cmd.dateTimeDataToConvert = self.dateTimeService.getDateTimeToMomentPlain(self.f.dateTimeDataToConvert.value);
        self.app.blocked = true;

        self.service.convertSampleDateData(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.dateTimeDataConverted = self.dateTimeService.getDateTimeToDisplay(data.utc());
            });
    }

    return(): void {
        this.router.navigate(['/app/examples/samplesdatedata']);
    }
}
