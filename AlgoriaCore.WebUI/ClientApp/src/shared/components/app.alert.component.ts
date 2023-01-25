import { Component, EventEmitter, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '../../app/app-component-base';
import { StringsHelper } from '../helpers/StringsHelper';

@Component({
    selector: 'app-alert',
    templateUrl: 'app.alert.component.html'
})

export class AppAlertComponent extends AppComponentBase implements OnInit, OnDestroy {

    message: any = { cancelTitle: '', acceptTitle: '' };
    display = false;
    displayConfirmation = false;
    acceptEvent: EventEmitter<any>;
    closeEvent: EventEmitter<any>;

    dialogColorStyle = '';
    buttonColorStyle = '';

    private subscription: Subscription;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
            this.dialogColorStyle = '';
            this.buttonColorStyle = '';
            this.display = false;
            this.displayConfirmation = false;

            if (message) {
                if (message.type === 'confirm') {
                    this.displayConfirmation = true;

                    if (message.colorStyle) {
                        this.dialogColorStyle = 'dialog-' + message.colorStyle;
                        this.buttonColorStyle = 'p-button-' + message.colorStyle;
                    }
                } else {
                    this.display = true;
                    this.dialogColorStyle = 'dialog-' + message.type;
                    this.buttonColorStyle = message.type === 'error' ? 'p-button-danger' : 'p-button-' + message.type;
                }
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onClose(): void {
        if (this.message.close) {
            this.closeEvent = new EventEmitter<any>();
            this.closeEvent.subscribe(this.message.close);
            this.closeEvent.emit(null);

            this.closeEvent.unsubscribe();
        }

        this.closeEvent = null;
        this.message = {};
    }

    onConfirmReject(): void {

        if (this.message.accept) {
            this.acceptEvent = new EventEmitter<any>();
            this.acceptEvent.subscribe(this.message.accept);
            this.acceptEvent.emit(false);
        }

        this.destroy();
    }

    onConfirmAccept(): void {
        if (this.message.accept) {
            this.acceptEvent = new EventEmitter<any>();
            this.acceptEvent.subscribe(this.message.accept);
            this.acceptEvent.emit(true);
        }

        this.destroy();
    }

    destroy(): void {
        if (this.acceptEvent) {
            this.acceptEvent.unsubscribe();
            this.acceptEvent = null;
        }

        this.displayConfirmation = false;
        this.message = {};
    }

    processMessage(message: string): string {
        return message ? StringsHelper.replaceAll(message, '\r\n', '<br/>') : '';
    }
}
