import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize, first } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    ChatRoomForListResponse, ChatRoomGetListQuery, ChatRoomServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './chatrooms.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class ChatRoomsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: ChatRoomForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    loading = false;
    saving = false;
    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: ChatRoomGetListQuery = new ChatRoomGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-chatroom-filters';
    permissions: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: ChatRoomServiceProxy,
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

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-chatroom');

        self.permissions = {
            create: self.permission.isGranted('Pages.Administration.ChatRooms.Create'),
            edit: self.permission.isGranted('Pages.Administration.ChatRooms.Edit')
        };

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'id', header: this.l('Id'), width: '100px' },
            { field: 'chatRoomId', header: this.l('ChatRooms.ChatRoom.ChatRoomId') },
            { field: 'name', header: this.l('ChatRooms.ChatRoom.Name') },
            { field: 'description', header: this.l('ChatRooms.ChatRoom.Description') },
            { field: 'userCreatorDesc', header: this.l('UserCreator') },
            { field: 'creationTime', header: this.l('CreationDateTime') }
        ];
    }

    filterSearch(event: any): void {
        const self = this;

        event.preventDefault();

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.query.pageNumber = 1;
        self.table.reset();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.service.getChatRoomList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);

                // Asigno filtros para que se queden guardados en localStorage
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = 'creationTime DESC';
        }

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/admin/chatrooms/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/chatrooms/edit', id]);
    }
}
