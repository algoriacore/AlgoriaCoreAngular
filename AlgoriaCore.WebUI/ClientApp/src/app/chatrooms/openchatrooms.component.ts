import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { ChatRoomForEditResponse, ChatRoomServiceProxy } from '../../shared/service-proxies/service-proxies';
import { AppComponent } from '../app.component';

@Component({
    templateUrl: './openchatrooms.component.html'
})
export class OpenChatRoomsComponent extends AppComponentBase implements OnInit {

    id?: number = null;
    model: ChatRoomForEditResponse = null;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private service: ChatRoomServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.id = Number(self.activatedRoute.snapshot.params['id']);

        self.getForEdit(self.id);
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getChatRoom(id)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
            });
    }
}
