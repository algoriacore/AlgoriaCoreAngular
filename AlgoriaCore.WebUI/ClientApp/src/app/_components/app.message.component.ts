import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '../app-component-base';

@Component({
    selector: 'app-message',
    templateUrl: 'app.message.component.html'
})

export class AppMessageComponent extends AppComponentBase implements OnInit, OnDestroy {
    private subscription: Subscription;

    constructor(
        injector: Injector,
        private messageService: MessageService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.subscription = this.notify.getMessage().subscribe(message => {
            if (message) {
                this.messageService.add(message);
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
