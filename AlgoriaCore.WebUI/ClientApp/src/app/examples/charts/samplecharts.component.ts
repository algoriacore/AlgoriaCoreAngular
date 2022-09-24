import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { FormService } from '../../../shared/services/form.service';
import { AuditLogServiceProxy, AuditLogGetListQuery, AuditLogListResponse } from 'src/shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplecharts.component.html'
})
export class SampleChartsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    lista: AuditLogListResponse[];

    fieldLabels: any = {};

    dataLine: any;
    dataPie: any;
    dataDoughnut: any;
    dataPolar: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private _service: AuditLogServiceProxy,
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

        self.lista = [];
        self.search();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            simple: this.l('Examples.Autocomplete.Simple'),
            itemTemplate: this.l('Examples.Autocomplete.Itemtemplate'),
            multiple: this.l('Examples.Autocomplete.Multiple'),
            multipleWithChecks: this.l('Examples.Autocomplete.MultipleWithChecks'),
        };

        self.form = self.formBuilder.group({
            simpleValue: [''],
            itemTemplateValue: [''],
            multiple: [[]], // Es un array de objetos
            selectedValue: [[]] // Es un array de objetos
        });
    }

    search(): void {
        const self = this;

        const anio = new Date().getFullYear();

        const dto = new AuditLogGetListQuery();
        dto.startDate = moment(anio.toString() + '0101');
        dto.endDate = moment(anio.toString() + '1201');
        dto.pageNumber = 1;
        dto.pageSize = 1000;

        self.app.blocked = true;

        self._service.getAuditLogList(dto)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.lista = data.items;

                self.buildDataLine();
                self.buildDataPie();
                self.buildDataDoughnut();
                self.buildDataPolar();
            });
    }

    buildDataLine(): void {
        const self = this;

        // Mostrar el total por mes de los 3 primeros usuario encontrados
        const usuList = self.lista.map(m =>
            m.userId
        ).filter((v, i, s) => s.indexOf(v) === i).filter(m => m != null);

        let totalCiclo = 1;
        if (usuList.length > 1) {
            totalCiclo = 2;
        }

        self.dataLine = {};
        self.dataLine.labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        self.dataLine.datasets = [];

        const colors = ['#4bc0c0', '#565656'];

        for (let i = 0, len = totalCiclo; i < len; i++) {

            const uName = self.lista.find(m => m.userId === usuList[i]);

            const objDataset: any = {};
            objDataset.label = uName.userName;
            objDataset.fill = false;
            objDataset.borderColor = colors[i];
            objDataset.data = [];

            for (let j = 0; j <= 11; j++) {
                const totPorMes = self.lista.filter(m => m.userId === usuList[i] && m.executionTime.month() === j).length;
                objDataset.data.push(totPorMes);
            }

            self.dataLine.datasets.push(objDataset);
        }
    }

    buildDataPie(): void {
        const self = this;

        // Mostrar el total por mes de los 3 primeros usuario encontrados

        self.dataPie = {};
        self.dataPie.labels = ['0-50 ms', '51-100 ms', '100+ms'];

        const colors = ['#4bc0c0', '#36A2EB', '#FFCE56'];
        const colorHover = ['#4bc0c0', '#36A2EB', '#FFCE56'];

        const objDataset: any = {};
        objDataset.backgroundColor = colors;
        objDataset.hoverBackgroundColor = colorHover;

        const tot1 = self.lista.filter(m => m.executionDuration <= 50).length;
        const tot2 = self.lista.filter(m => m.executionDuration > 51 && m.executionDuration <= 100).length;
        const tot3 = self.lista.filter(m => m.executionDuration > 100).length;

        objDataset.data = [];
        objDataset.data.push(tot1);
        objDataset.data.push(tot2);
        objDataset.data.push(tot3);

        self.dataPie.datasets = [];
        self.dataPie.datasets.push(objDataset);
    }

    buildDataDoughnut(): void {
        const self = this;

        const totalCiclo = 6;

        self.dataDoughnut = {};
        self.dataDoughnut.labels = ['0', '1', '2', '3', '4', '5'];
        self.dataDoughnut.datasets = [];

        const colors = ['#FFCE56', '#36A2EB', '#4bc0c0', '#31F2EB', '#FFCE9A'];
        const hoverColors = ['#FFCE56', '#36A2EB', '#4bc0c0', '#31F2EB', '#FFCE9A'];

        const objDataset: any = {};
        objDataset.backgroundColor = colors;
        objDataset.borderColor = hoverColors;
        objDataset.data = [];

        for (let i = 0, len = totalCiclo; i < len; i++) {

            const totPorSeverity = self.lista.filter(m => m.severity === i).length;
            objDataset.data.push(totPorSeverity);
        }

        self.dataDoughnut.datasets.push(objDataset);
    }

    buildDataPolar(): void {
        const self = this;

        self.dataPolar = {};
        self.dataPolar.labels = ['0-50 ms', '51-100 ms', '100+ms'];
        self.dataPolar.datasets = [];

        const colors = ['#4bc0c0', '#36A2EB', '#FFCE56'];
        const hoverColors = ['#4bc0c0', '#36A2EB', '#FFCE56'];

        const tot1 = self.lista.filter(m => m.executionDuration <= 50).length;
        const tot2 = self.lista.filter(m => m.executionDuration > 51 && m.executionDuration <= 100).length;
        const tot3 = self.lista.filter(m => m.executionDuration > 100).length;

        const objDataset: any = {};
        objDataset.backgroundColor = colors;
        objDataset.borderColor = hoverColors;

        objDataset.data = [];
        objDataset.data.push(tot1);
        objDataset.data.push(tot2);
        objDataset.data.push(tot3);

        self.dataPolar.datasets.push(objDataset);
    }

    selectData(event) {
        const self = this;

        const dt = event.element; // [event.element._index];
        console.log(dt);
    }
}
