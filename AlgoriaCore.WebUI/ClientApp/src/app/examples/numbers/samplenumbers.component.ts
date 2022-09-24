import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'moment-duration-format';
import 'moment-timezone';
import { AppComponentBase } from 'src/app/app-component-base';

@Component({
    templateUrl: './samplenumbers.component.html'
})
export class SampleNumbersComponent extends AppComponentBase implements OnInit {

    form: FormGroup;
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder
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
            simpleNumber: ['', Validators.required],
            allowEmpty: ['', Validators.required],
            simpleAndAllowEmpty: ['', Validators.required],
            integer: ['', Validators.required],
            decimals: ['', Validators.required],
            miles: ['', Validators.required],
            currency: ['', Validators.required],
            percentage: ['', Validators.required]
        });
    }

    verify(): void {
        console.log('Número simple (simpleNumber="true"): ' + this.f.simpleNumber.value);
        console.log('Permite vacíos (allowEmpty="true"): ' + this.f.allowEmpty.value);
        console.log('Número simple con(simpleNumber="true" allowEmpty="true"): ' + this.f.simpleAndAllowEmpty.value);
        console.log('Entero: ' + this.f.integer.value);
        console.log('Decimal: ' + this.f.decimals.value);
        console.log('Separador de miles: ' + this.f.miles.value);
        console.log('Moneda: ' + this.f.currency.value);
        console.log('Porcentaje: ' + this.f.percentage.value);
    }

    setear(): void {
        this.f.integer.setValue(16);
        this.f.decimals.setValue(38769.165545656);
        this.f.miles.setValue(93276);
        this.f.currency.setValue(1257);
        this.f.percentage.setValue(77.23);
    }
}
