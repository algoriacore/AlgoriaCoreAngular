import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import {
    APP_INITIALIZER,
    Component,
    ElementRef,
    Input,
    forwardRef,
    AfterViewInit,
    OnChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NumberFormatter } from 'src/shared/utils/numberformatter.class';

@Component({
    selector: 'app-text-number',
    template: `<input type="text"
                [id]="id"
                [name]="name"
                [style]="styleAttribute"
                [maxLength]="maxlength"
                [readonly]="readOnly !== undefined"
                [value]="formattedNumber"
                (keydown)="onkeypress($event)"
                (focus)="onFocus($event)"
                (blur)="onBlur($event)"
                class="form-control"
                pInputText />`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TextNumberComponent),
        multi: true,
    }]
})

export class TextNumberComponent implements ControlValueAccessor, AfterViewInit, OnChanges {

    @Input() decimals: string;
    @Input() useMilesSep: string;
    @Input() prefix: string;
    @Input() sufix: string;
    @Input() min: number;
    @Input() max: number;
    @Input() style: string;
    @Input() id: string;
    @Input() name: string;
    @Input() maxlength: string;
    @Input() readOnly;
    @Input() value: string;
    @Input() disabled: string;
    @Input() allowEmpty: string;
    @Input() simpleNumber: string;
    @Input() allowNegatives: any;

    formattedNumber: string;
    styleAttribute: SafeStyle;

    numberFormatter: NumberFormatter;

    constructor(private el: ElementRef, private sanitization: DomSanitizer) {

        if (!this.id || !this.name) {
            const n = Math.floor(Math.random() * 100000);

            if (!this.id) {
                this.id = 'tx' + n;
            }

            if (!this.name) {
                this.name = 'tx' + n;
            }
        }

        this.value = '0';
        this.maxlength = '15';
        this.disabled = 'false';

        this.numberFormatter = new NumberFormatter();
    }

    ngAfterViewInit(): void {
        this.value = '0';
    }

    public writeValue(obj: any) {

        if (obj === undefined || obj === '') {
            if (!this.isAllowEmptyEnabled()) {
                if (this.min) {
                    obj = this.min;
                } else {
                    obj = 0;
                }
            }
        }

        this.formatNumber(obj);
    }

    // registers 'fn' that will be fired when changes are made
    // this is how we emit the changes back to the form
    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    // not used, used for touch input
    public registerOnTouched() { }

    ngOnChanges(changes): void {
        if (changes.useMilesSep || changes.decs) {
            this.formatNumber(this.value);
        }

        if (changes.style) {
            if (this.style !== undefined) {
                this.styleAttribute = this.sanitization.bypassSecurityTrustStyle(this.style);
            }
        }
    }

    // Eventos del control
    onkeypress(event) {
        const e = event;

        // Caracteres permitidos
        const permitidos = [46, 8, 9, 27, 13, 110];

        const kc = e.keyCode ? e.keyCode : e.which;
        const valor = (<HTMLInputElement>event.target).value;

        if (this.decimals !== undefined && parseInt(this.decimals, 10) > 0) {
            permitidos.push(190);
        }

        if (permitidos.indexOf(kc) !== -1 ||
            // Allow: Ctrl+A
            (kc === 65 && e.ctrlKey === true) ||
            // Allow: Ctrl+C
            (kc === 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+V
            (kc === 86 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (kc === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (kc >= 35 && kc <= 39)) {

            if (kc === 190 && valor.indexOf('.') >= 0) {
                e.preventDefault();
            }

            const newValue = e.target.value;
            this.value = newValue;
            this.propagateChange(this.value);

            // No hace nada
            return;
        }

        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (kc < 48 || kc > 57)) && (kc < 96 || kc > 105)) {
            e.preventDefault();
        }
    }

    onFocus(event) {
        this.formattedNumber = this.unformat(this.formattedNumber);

        if (this.readOnly !== undefined) {
            setTimeout(() => {
                (<HTMLInputElement>event.target).select();
            }, 100);
        }
    }

    onBlur(event) {
        const e = event;

        if (!e.target.value) {
            if (this.isAllowEmptyEnabled()) {
                this.propagateChange('');
                this.value = '0';
                return;
            }
        }

        if (this.isSimpleNumberEnabled()) {
            this.formatNumber(e.target.value);
            this.propagateChange(e.target.value);
            return;
        }

        let newValue = e.target.value.replace(' ', '');
        if (isNaN(newValue) || newValue === '') {
            newValue = '0';
        }

        let nv = parseFloat(newValue);

        if (this.min && nv < this.min) {
            nv = this.min;
        }

        if (this.max && nv > this.max) {
            nv = this.max;
        }

        this.formatNumber(nv);
        this.propagateChange(this.value);
    }

    formatNumber(valor: any) {

        if (valor === undefined || valor === null) {
            if (this.isAllowEmptyEnabled()) {
                this.value = undefined;
                this.formattedNumber = '';
                return;
            } else {
                this.value = '0';
            }
        }

        this.value = valor;

        // Si se cumple la siguiente condición, ya no se formatea el valor
        if (this.isSimpleNumberEnabled()) {
            this.formattedNumber = this.value;
            return;
        }

        let decs = 0;
        if (this.decimals) {
            decs = parseInt(this.decimals, 10);
        }

        if (this.value === undefined) {
            this.value = '0';
        }

        this.value = this.numberFormatter.round(parseFloat(valor), decs);
        this.formattedNumber = this.numberFormatter.format(this.value, decs); // this.format(this.value, decs);

        if (!this.formattedNumber) {
            this.formattedNumber = '';
            return;
        }

        if (!this.useMilesSep || (typeof(this.useMilesSep) === 'string' && this.useMilesSep.toLowerCase() !== 'true')) {
            this.formattedNumber = this.formattedNumber.replace(/,/gi, '');
        }

        if (this.prefix) {
            this.formattedNumber = this.prefix + this.formattedNumber;
        } else {
            this.formattedNumber = ' ' + this.formattedNumber;
        }

        if (this.sufix) {
            this.formattedNumber = this.formattedNumber + this.sufix;
        }
    }

    // Implementar la interfaz ControlValueAccesor
    private propagateChange = (_: any) => { };

    private unformat(value): string {

        // Si se cumple la siguiente condición, ya no se formatea el valor
        if (this.isSimpleNumberEnabled()) {
            return value;
        }

        let valor: any = '';

        if (value === undefined) {
            value = 0;
        }

        if (this.prefix) {
            value = value.replace(this.prefix, '');
        }

        if (this.sufix) {
            value = value.replace(this.sufix, '');
        }

        if (value !== undefined && value !== null && value !== '') {
            valor = parseFloat(value.toString().replace(/,/gi, ''));
        }

        if (isNaN(valor)) {
            return;
        }

        return valor.toString().replace(/,/gi, '');
    }

    // private round(value, nDecimals): string {

    //    const num = value;
    //    if (!('' + num).includes('e')) {
    //        const esx = +(Math.round(parseFloat(num.toString() + 'e+' + nDecimals)) + 'e-' + nDecimals);
    //        return esx.toString();
    //    } else {
    //        const arr = ('' + num).split('e');
    //        let sig = '';
    //        if (+arr[1] + nDecimals > 0) {
    //            sig = '+';
    //        }

    //        const esx = +(Math.round(parseFloat(+arr[0] + 'e' + sig + (+arr[1] + nDecimals))) + 'e-' + nDecimals);

    //        return esx.toString();
    //    }
    // }

    private isAllowEmptyEnabled(): boolean {
        return (this.allowEmpty && this.allowEmpty.toLowerCase().trim() === 'true');
    }

    private isSimpleNumberEnabled(): boolean {
        return (this.simpleNumber && this.simpleNumber.toLowerCase().trim() === 'true');
    }

    private isAllowNegativesEnabled(): boolean {
        return (this.allowNegatives || (typeof (this.allowNegatives) === 'string' && this.allowNegatives
            && this.allowNegatives.toLowerCase().trim() === 'true'));
    }
}
