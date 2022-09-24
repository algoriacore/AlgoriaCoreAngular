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

@Component({
    selector: 'app-google-address',
    template: `<input type="text"
                [id]="id"
                [name]="name"
                [style]="styleAttribute"
                [maxLength]="maxlength"
                [readonly]="readOnly !== undefined"
                [value]=""
                (change)="onChange($event)"
                class="form-control"
                pInputText />`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => GoogleAddressComponent),
        multi: true,
    }]
})

export class GoogleAddressComponent implements ControlValueAccessor, AfterViewInit, OnChanges {

    @Input() style: string;
    @Input() id: string;
    @Input() name: string;
    @Input() maxlength: string;
    @Input() readOnly;
    @Input() value: string;
    @Input() disabled: string;

    styleAttribute: SafeStyle;
    elementRef: ElementRef;

    autocomplete: any;

    constructor(private el: ElementRef, private sanitization: DomSanitizer) {
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

        self.autocomplete = new window['google'].maps.places.Autocomplete(<HTMLInputElement>self.elementRef.nativeElement.children[0]);

        self.autocomplete.addListener('place_changed', () => {
            self.value = self.elementRef.nativeElement.children[0].value;
            self.propagateChange(self.elementRef.nativeElement.children[0].value);

            self.elementRef.nativeElement.dispatchEvent(new Event('change'));
        });
    }

    public writeValue(value: any) {
        const self = this;

        self.value = value;
        self.elementRef.nativeElement.children[0].value = value;
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

    // Implementar la interfaz ControlValueAccesor
    private propagateChange = (_: any) => { };
}
