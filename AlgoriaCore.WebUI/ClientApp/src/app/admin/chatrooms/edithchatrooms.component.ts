import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    ChatRoomCreateCommand,
    ChatRoomForEditResponse,
    ChatRoomGetForEditQuery,
    ChatRoomServiceProxy,
    ChatRoomUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { ChangeLogService } from '../../_services/changelog.service';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './editchatrooms.component.html'
})
export class EditChatRoomsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    id?: number = null;
    model: ChatRoomForEditResponse = null;
    fieldLabels: any = {};

    languageCombo: ComboboxItemDto[] = [];
    keyCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: ChatRoomServiceProxy,
        private formService: FormService,
        private changeLogService: ChangeLogService,
        private dateTimeService: DateTimeService,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            chatRoomId: self.l('ChatRooms.ChatRoom.ChatRoomId'),
            name: self.l('ChatRooms.ChatRoom.Name'),
            description: self.l('ChatRooms.ChatRoom.Description')
        };

        self.form = self.formBuilder.group({});

        if (!(self.id)) {
            self.form.addControl('chatRoomId', new FormControl(null, [Validators.required, Validators.maxLength(50)]));
        }

        self.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(50)]));
        self.form.addControl('description', new FormControl(null, [Validators.required, Validators.maxLength(250)]));
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getChatRoomForEdit(new ChatRoomGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(data.name);
                self.f.description.setValue(data.description);
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.app.blocked = true;

        if (self.id) {
            const updateCmd = new ChatRoomUpdateCommand();
            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.description = self.f.description.value;

            self.service.updateChatRoom(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('ChatRooms.ChatRoom.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new ChatRoomCreateCommand();
            createCmd.chatRoomId = self.f.chatRoomId.value;
            createCmd.name = self.f.name.value;
            createCmd.description = self.f.description.value;

            self.service.createChatRoom(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('ChatRooms.ChatRoom.SuccessfulCreate'), self.l('Success'));
                    self.activaModoNuevo();
                });
        }
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();

        // focus
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('ChatRoom', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/chatrooms']);
    }
}
