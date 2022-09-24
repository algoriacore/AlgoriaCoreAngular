import { Component, ViewContainerRef, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { AppConsts } from '../shared/AppConsts';
import { LocalizationService } from 'src/shared/services/localization.service';

@Component({
    templateUrl: './account.component.html',
    styleUrls: ['../assets/theme/theme-algoriacore.css'],
    encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {

    appTitle: string = AppConsts.appTitle;
    blocked = false;

    private viewContainerRef: ViewContainerRef;
    private localizationService: LocalizationService;

    public constructor(
        injector: Injector,
        viewContainerRef: ViewContainerRef
    ) {
        // We need this small hack in order to catch application root view container ref for modals
        this.viewContainerRef = viewContainerRef;
        this.localizationService = injector.get(LocalizationService);
    }

    ngOnInit(): void {
        document.body.className = 'login-body';
    }

    l(label: string): string {
        return this.localizationService.l(label);
    }
}
