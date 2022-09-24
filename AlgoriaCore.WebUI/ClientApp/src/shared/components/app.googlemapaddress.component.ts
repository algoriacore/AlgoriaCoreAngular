import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DialogCustomService } from '../services/dialog.custom.service';
import { LocalizationService } from '../services/localization.service';
import { GoogleMapAddressModalComponent } from './googlemapaddressmodal.component';

@Component({
    selector: 'app-google-map-address',
    template: `<div class="p-inputgroup">
               <button pButton type="button" label="Buscar" (click)="search($event)"></button>
               <input type="text" [id]="id + 'input'" [value]="value" autocomplete="off" [maxLength]="maxlength"
                [readonly]="true" placeholder="(latitud, longitud)" (change)="onChange($event)" pInputText />
               <button pButton type="button" icon="fa fa-close" (click)="clear($event)"></button>
               </div>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => GoogleMapAddressComponent),
        multi: true,
    }]
})

export class GoogleMapAddressComponent implements ControlValueAccessor, AfterViewInit, OnChanges {

    @Input() style: string;
    @Input() id: string;
    @Input() name: string;
    @Input() maxlength: string;
    @Input() readOnly;
    @Input() value: string;
    @Input() disabled: string;

    styleAttribute: SafeStyle;
    elementRef: ElementRef;

    input: any;

    constructor(private el: ElementRef,
        private sanitization: DomSanitizer,
        private localization: LocalizationService,
        private dialogService: DialogCustomService) {
        this.elementRef = el;

        if (!this.id || !this.name) {
            const n = Math.floor(Math.random() * 100000);

            if (!this.id) {
                this.id = 'tx' + n;
            }

            if (!this.name) {
                this.name = 'tx' + n;
            }
        }

        this.maxlength = '500';
        this.disabled = 'false';
    }

    ngAfterViewInit(): void {
        const self = this;

        self.input = document.querySelector('#' + self.id + 'input');
    }

    public writeValue(value: any) {
        const self = this;

        if (self.input) {
            self.input.value = value;
        }

        self.value = value;
        this.propagateChange(value);
    }

    // registers 'fn' that will be fired when changes are made
    // this is how we emit the changes back to the form
    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    // not used, used for touch input
    public registerOnTouched() { }

    ngOnChanges(changes): void {
        if (changes.style) {
            if (this.style !== undefined) {
                this.styleAttribute = this.sanitization.bypassSecurityTrustStyle(this.style);
            }
        }
    }

    onChange(event) {
        const self = this;

        self.value = event.target.value;
        self.propagateChange(event.target.value);
    }

    search(event) {
        const self = this;
        let currentPosition;
        let valueStr: string = self.value;

        if (valueStr) {
            valueStr = valueStr.replace('(', '').replace(')', '');
            const values = valueStr.split(',');
            currentPosition = { lat: parseFloat(values[0].trim()), lng: parseFloat(values[1].trim()) };
        }

        const ref = self.dialogService.open(GoogleMapAddressModalComponent, {
            width: '50%',
            header: self.localization.l('GoogleMapAddress.Address'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                position: currentPosition
            }
        });

        ref.onClose.subscribe((position) => {
            if (position) {
                self.writeValue('(' + position.lat + ', ' + position.lng + ')');
            }
        });
    }

    clear(event) {
        const self = this;

        self.writeValue(null);
    }

    // Implementar la interfaz ControlValueAccesor
    private propagateChange = (_: any) => { };
}
