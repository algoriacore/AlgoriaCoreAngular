import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppSecuredImageComponent } from './app.secured.image.component';

@NgModule({
    imports: [BrowserModule],
    declarations: [AppSecuredImageComponent],
    entryComponents: [AppSecuredImageComponent]
})
export class AppSecuredImageModule {
    constructor(private injector: Injector) {

    }

    ngDoBootstrap() { }
}
