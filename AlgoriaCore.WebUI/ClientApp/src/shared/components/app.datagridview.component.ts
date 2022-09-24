import { AfterContentInit, Component, HostListener, Injector, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AppComponentBase } from '../../app/app-component-base';

@Component({
    selector: 'app-datagridview',
    templateUrl: 'app.datagridview.component.html'
})

export class AppDataGridViewComponent extends AppComponentBase implements OnInit, OnDestroy, AfterContentInit {

    @Input()
    private tableTemplate: TemplateRef<any>;

    isExtraSmallScreen = false;
    tableDesign = 1;
    dataViewLayout = 'list';
    dataViewSortOptions: SelectItem[];
    dataViewSortKey: string;

    query: any = {};

    title: string;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        const self = this;

        self.isExtraSmallScreen = event.target.innerWidth < 450;
    }

    ngOnInit() {
        const self = this;

        self.isExtraSmallScreen = window.innerWidth < 450;
        self.tableDesign = window.innerWidth <= 640 ? 2 : 1;
    }

    ngOnDestroy() {}

    ngAfterContentInit() {
        const self = this;

        console.log(self.tableTemplate);
    }

    onDataViewSortChange(event) {
        const self = this;

        const value = event.value;

        if (value.indexOf('!') === 0) {
            self.query.sorting = value.substring(1, value.length) + ' DESC';
        } else {
            self.query.sorting = value;
        }

        self.getList();
    }

    changeTableDesign(tableDesign: number) {
        const self = this;

        self.tableDesign = tableDesign;

        if (self.tableDesign === 3) {
            self.dataViewLayout = 'grid';
        } else {
            self.dataViewLayout = 'list';
        }

        self.getList();
    }

    getList(): void {}
}
