import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';

@Component({
    templateUrl: './googlemapaddressmodal.component.html'
})
export class GoogleMapAddressModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
    form: FormGroup;

    blockedDocument = false;

    fieldLabels: any = {};

    zoom = 12;
    center: any;
    mapOptions = {
        scrollwheel: true
    };
    marker: any;

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
    }

    ngAfterViewInit(): void {
        const self = this;

        if (self.modalConfig.data.position) {
            self.center = {
                lat: self.modalConfig.data.position.lat,
                lng: self.modalConfig.data.position.lng
            };

            self.marker = {
                position: {
                    lat: self.modalConfig.data.position.lat,
                    lng: self.modalConfig.data.position.lng
                }
            };
        } else {
            self.blockedDocument = true;

            navigator.geolocation.getCurrentPosition((position) => {
                self.blockedDocument = false;

                self.center = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
            }, () => {
                self.blockedDocument = false;
                self.center = { lat: 19.434297034626233, lng: -99.13396096096983 };
            });
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

    updateMap(gAddress): void {
        const self = this;
        const place = gAddress.autocomplete.getPlace();

        if (place && place.geometry) {
            if (place.geometry.viewport) {
                self.map.fitBounds(place.geometry.viewport);
            } else {
                self.map.center = place.geometry.location;
            }

            self.handleMapClick({ latLng: place.geometry.location});
        }
    }

    handleMapClick(event) {
        const self = this;

        self.marker = {
            position: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            }
        };

        self.map.center = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
    }

    save(): void {
        const self = this;

        if (!self.marker) {
            self.alertService.error(self.l('GoogleMapAddress.MarkerNotSelected'));
            return;
        }

        self.return({ lat: self.marker.position.lat, lng: self.marker.position.lng });
    }

    return(position?: any | undefined): void {
        const self = this;

        self.modalRef.close(position);
    }
}
