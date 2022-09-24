import { Component, Injector, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';
import { FormService } from 'src/shared/services/form.service';

@Component({
    templateUrl: './googlemapaddressmodal.component.html'
})
export class GoogleMapAddressModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    form: FormGroup;

    loading = false;
    saving = false;

    fieldLabels: any = {};
    mapOptions = {
        center: { lat: 19.434297034626233, lng: -99.13396096096983 },
        zoom: 12,
        scrollwheel: true
    };
    map: any;
    overlays = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private formService: FormService,
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

    ngAfterViewInit(): void {
        const self = this;

        if (self.modalConfig.data.position) {
            self.map.setCenter({
                lat: self.modalConfig.data.position.lat,
                lng: self.modalConfig.data.position.lng
            });

            self.overlays.push(new window['google'].maps.Marker({
                position: {
                    lat: self.modalConfig.data.position.lat,
                    lng: self.modalConfig.data.position.lng
                },
                draggable: true
            }));
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            direccion: self.l('GoogleMapAddress.Address')
        };

        self.form = self.formBuilder.group({
            direccion: [null]
        });
    }

    setMap(event) {
        const self = this;

        self.map = event.map;
    }

    updateMap(gAddress): void {
        const self = this;
        const place = gAddress.autocomplete.getPlace();

        if (place && place.geometry) {
            if (place.geometry.viewport) {
                self.map.fitBounds(place.geometry.viewport);
            } else {
                self.map.setCenter(place.geometry.location);
            }

            self.handleMapClick({ latLng: place.geometry.location});
        }
    }

    handleMapClick(event) {
        const self = this;
        const marker = new window['google'].maps.Marker({
            position: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            },
            draggable: true
        });

        if (self.overlays.length > 0) {
            self.overlays[0] = marker;
        } else {
            self.overlays.push(marker);
        }

        self.map.setCenter({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        });
    }

    save(): void {
        const self = this;

        if (!(self.overlays.length > 0 && self.overlays[0])) {
            self.alertService.error(self.l('GoogleMapAddress.MarkerNotSelected'));
            return;
        }

        self.return({ lat: self.overlays[0].position.lat(), lng: self.overlays[0].position.lng() });
    }

    return(position?: any | undefined): void {
        const self = this;

        self.modalRef.close(position);
    }
}
