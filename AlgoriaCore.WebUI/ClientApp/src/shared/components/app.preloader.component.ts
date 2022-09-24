import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-preloader',
    template: `
        <div *ngIf="blocked" class="preloader-container">
            <div class="preloader">
                <div class="preloader-content">
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                    <div class="preloader-square"></div>
                </div>
            </div>
        </div>
    `
})
export class AppPreloaderComponent {
    @Input() blocked: boolean;
}
