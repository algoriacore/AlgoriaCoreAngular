import { Component, Injector, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit, Input, Renderer2 } from '@angular/core';
import { AppComponentBase } from '../../app/app-component-base';
import {
    UserServiceProxy,
    ChatRoomServiceProxy,
    ChatRoomChatGetListQuery,
    ChatRoomChatForListResponse,
    ChatRoomChatCreateCommand,
    ChatRoomResponse,
    ChatRoomGetOrCreateCommand,
    FileServiceProxy,
    ChatRoomChatFileCreateCommand,
    ChatRoomChatFileResponse
} from '../service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { DateTimeService } from '../services/datetime.service';
import { AppComponent } from '../../app/app.component';
import { StringsHelper } from '../helpers/StringsHelper';
import { FileService } from '../services/file.service';
import { FileUpload } from 'primeng/fileupload';
import { AppConsts } from '../AppConsts';

@Component({
    selector: 'app-chatlog',
    templateUrl: 'app.chatlog.component.html'
})
export class AppChatLogComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {

    @Input() chatRoomId: string;
    @Input() name: string;
    @Input() description: string;

    @ViewChild('ckeContentArea', { static: false }) ckeContentArea: ElementRef;
    @ViewChild('ckeInputMessage', { static: false }) ckeInputMessage: ElementRef;
    @ViewChild('fileUpload') fileUpload: FileUpload;
    @ViewChild('attachmentWindowList', { static: false }) attachmentWindowList: ElementRef;

    configContentAreaObject: any;
    configInputMessageObject: any;

    blocked = false;
    isReady = false;

    chatRoom = new ChatRoomResponse;
    usersMentioned = [];

    isSeeAttachments = false;
    currentModeObject = {
        totalMessages: 0, cke: null, addedToTheEnd: true, lastScrollHeight: 0, lastScrollTop: 0, isFirstLoad: true,
        query: new ChatRoomChatGetListQuery()
    };
    currentAttachmentModeObject: any;

    templateCurrentUser = '<div style="text-align: right; float: right; clear: both;">'
        + '<div style = "margin-bottom: 10px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold;" > '
        + '<div style="display: inline-block; absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);">'
        + '<span>{1} {2}</span>'
        + '</div>'
        + '<img src="{0}" alt = "" style="border-radius: 32px; width: 32px; height: 32px;" />'
        + '</div>'
        + '<div style="margin-bottom:10px; margin-right:32px; background-color: #F6F7FB; border: solid 1px #C8C8C8; '
        + 'border-radius: 10px; padding: 10px; padding - bottom: 0px; padding - top: 0px; ">{3}{4}</div></div>';

    templateOtherUser = '<div style="text-align: left; float: left; clear: both;"><div style="margin-bottom: 10px; '
        + 'font-family: Arial, Helvetica, sans - serif; font - size: 12px; font - weight: bold; ">'
        + '<img src="{0}" alt = "" style="border-radius: 32px; width: 32px; height: 32px;" />'
        + '<div style="display: inline-block; absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);">'
        + '<span>{1} {2}</span>'
        + '</div>'
        + '</div>'
        + '<div style="margin-bottom:10px; margin-left:32px; background-color: #F6F7FB; border: solid 1px #C8C8C8; '
        + 'border-radius: 10px; padding: 10px; padding - bottom: 0px; padding - top: 0px; ">{3}{4}</div></div>';

    templateAttachment = '<div><a href="#" data-file={0} data-file-name="{1}" data-file-extension="{2}">'
        + '<img src = "{3}" alt = "" style = "height: 32px; cursor: pointer; display: inline; margin-right: 5px;" /> { 4} < /a></div > ';

    // Attachment Window
    attachmentWindowBlocked = false;
    isAttachmentWindowOpen = false;

    constructor(
        injector: Injector,
        private service: ChatRoomServiceProxy,
        private userService: UserServiceProxy,
        public dateTimeService: DateTimeService,
        private app: AppComponent,
        private fileLocalService: FileService,
        private fileService: FileServiceProxy,
        private renderer: Renderer2
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.chatRoom.chatRoomId = self.chatRoomId;
        self.chatRoom.name = self.name;
        self.chatRoom.description = self.description;

        self.currentModeObject.query.chatRoomId = self.chatRoomId;
        self.currentModeObject.query.pageNumber = 0;
        self.currentModeObject.query.pageSize = 5;
        self.currentModeObject.query.skip = 0;
        self.currentModeObject.query.sorting = 'CreationTime DESC';

        self.initializeCurrentAttachmentModeObject();
        self.configContentArea();
        self.configInputMessage();
    }

    ngAfterViewInit(): void {
        const self = this;

        self.getChatRoom();
        self.isReady = true;
        self.currentModeObject.cke = self.ckeContentArea;
        self.getMessages();
    }

    ngOnDestroy() {
        const self = this;
    }

    getChatRoom(): void {
        const self = this;

        // self.blocked = true;
        self.app.blocked = true;

        self.service.getChatRoomByChatRoomId(self.chatRoomId)
            // .pipe(finalize(() => { self.blocked = false; }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                if (data) {
                    self.chatRoom = data;
                }
            });
    }

    search(opts: any, callback: any): void {
        const self = this;

        self.userService.getUserAutocompleteList(opts.query)
            .subscribe(data => {
                callback(data);
            });
    }

    configContentArea(): void {
        const self = this;

        self.configContentAreaObject = {
            baseHref: StringsHelper.addToEndIfNotExist(AppConsts.appBaseUrl, '/'),
            height: '400px',
            removePlugins: 'elementspath',
            // removePlugins: 'uploadimage,uploadwidget,widget,tableselection,
            // pastetext, pastefromword, clipboard, toolbar, elementspath',
            // removePlugins: 'uploadwidget,widget,tableselection,pastetext,
            // pastefromword, clipboard, toolbar, elementspath',
            fullPage: false,
            toolbarCanCollapse: false,
            toolbarStartupExpanded: false,
            resize_enabled: false, // eslint-disable-line @typescript-eslint/naming-convention
            readOnly: true,
            // toolbar: [],
            // stylesSet: 'my_styles',
            // contentsCss: [
            // 'http://localhost:4200/app/examples/samplechat/node_modules/font-awesome/css/font-awesome.min.css
            // '],
            extraAllowedContent: {
                a: {
                    attributes: 'data-*'
                }
            },
            on:
            {
                instanceReady: function (evt) {
                    evt.editor.setReadOnly();
                    document.getElementById(evt.editor.id + '_top').style.display = 'none';
                    // console.log(evt.editor);
                    // evt.editor.stylesSet.add('my_styles', [
                    //    { name: 'Attachment Icon', element: 'div', styles: { color: 'Blue' } }
                    // ]);
                },
                contentDom: function (contentDom) {
                    const editable = contentDom.editor.editable();

                    for (const element of editable.editor.document.$.links) {
                        if (element.hasAttribute('data-file')) {
                            element.addEventListener('click', function (event) {
                                self.downloadAttachedFile(event);
                            });
                        }
                    }

                    if (self.currentModeObject.addedToTheEnd) {
                        editable.editor.document.$.scrollingElement.scrollTop = editable.editor.document.$.scrollingElement.scrollHeight;
                    } else {
                        editable.editor.document.$.scrollingElement.scrollTop =
                            editable.editor.document.$.scrollingElement.scrollHeight - self.currentModeObject.lastScrollHeight
                            + self.currentModeObject.lastScrollTop;
                    }

                    self.currentModeObject.lastScrollHeight = editable.editor.document.$.scrollingElement.scrollHeight;
                    editable.editor.document.focus();

                    editable.attachListener(editable.getDocument(), 'scroll', function (event) {
                        const scrollTop = event.data.$.target.scrollingElement.scrollTop;

                        if (scrollTop <= 200) {
                            if (self.currentModeObject.query.skip < self.currentModeObject.totalMessages && self.blocked !== true) {
                                self.getMessages();
                                self.currentModeObject.lastScrollTop = scrollTop;
                            }
                        }
                    });
                }
            }
        };
    }

    configInputMessage(): void {
        const self = this;

        const search = (opts, callback) => {
            self.userService.getUserForEditorAutocompleteList(opts.query)
                .pipe(finalize(() => { }))
                .subscribe(data => {
                    callback(data);
                });
        };

        self.configInputMessageObject = {
            height: '100px',
            extraPlugins: 'mentions,autocomplete',
            fullPage: false,
            toolbarCanCollapse: true,
            toolbarStartupExpanded: false,
            removePlugins: 'elementspath',
            resize_enabled: false, // eslint-disable-line @typescript-eslint/naming-convention
            extraAllowedContent: {
                a: {
                    attributes: 'data-*'
                }
            },
            mentions: [{
                feed: search,
                itemTemplate: '<li data-id="{id}">' +
                    '<div class="username">{login}</div>' +
                    '<div class="fullname">{fullName}</div>' +
                    '</li>',
                outputTemplate: '<a href="" title="{fullName}" data-mention="@{login}" data-user-id="{id}">@{login}</a>&nbsp;',
                minChars: 1
            }]
        };
    }

    addContent(content: string): void {
        const self = this;
        const instance = self.currentModeObject.cke['instance'];

        self.currentModeObject.addedToTheEnd = false;
        instance.setData(content + instance.getData());
    }

    addContentToTheEnd(content: string): void {
        const self = this;
        const instance = self.currentModeObject.cke['instance'];

        self.currentModeObject.addedToTheEnd = true;
        instance.setData(instance.getData() + content);

        // console.log(instance);
        // instance.setReadOnly(false);

        // var sel = instance.getSelection();
        // var range = sel.getRanges()[0];

        // // no range, means the editor is empty. Select the range.
        // if (!range) {
        //    range = instance.createRange();
        //    range.selectNodeContents(instance.editable());
        //    sel.selectRanges([range]);
        // }

        // instance.insertHtml(content, range);
        // instance.setReadOnly(true);

        // instance.document.$.body.childNodes[0].appendChild(content);
    }

    getMessages(): void {
        const self = this;

        // self.blocked = true;
        self.app.blocked = true;

        self.service.getChatRoomChatList(self.currentModeObject.query)
            // .pipe(finalize(() => { self.blocked = false; }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.currentModeObject.query.skip += data.items.length;
                self.currentModeObject.totalMessages = data.totalCount;

                if (self.currentModeObject.totalMessages === 0) {
                    self.addContentToTheEnd(self.generateEntriesHTMLFromMessages(data.items.reverse()));
                } else {
                    self.addContent(self.generateEntriesHTMLFromMessages(data.items.reverse()));
                }

                self.currentModeObject.isFirstLoad = false;
            });
    }

    generateEntriesHTMLFromMessages(messages: ChatRoomChatForListResponse[]): string {
        const self = this;
        let res = '';

        for (const message of messages) {
            res += StringsHelper.formatString(
                message.user === self.app.currentUser.userId ? self.templateCurrentUser : self.templateOtherUser,
                [
                    self.getUrlUserPicture(message.user),
                    self.dateTimeService.getDateTimeToDisplay(message.creationTime),
                    message.userDesc,
                    message.comment,
                    self.getAttachementHTMLSection(message.files)
                ]
            );
        }

        return res;
    }

    getAttachementHTMLSection(files: ChatRoomChatFileResponse[]): string {
        const self = this;
        let res = '';

        if (files.length > 0) {
            for (const file of files) {
                res += StringsHelper.formatString(self.templateAttachment, [
                    file.file,
                    file.fileName,
                    file.fileExtension,
                    self.getAttachementDownloadIcon(file.fileExtension),
                    file.fileName + '.' + file.fileExtension
                ]);
            }

            res = '<div style="margin-top: 10px;">' + res + '</div>';
        }

        return res;
    }

    getUrlUserPicture(user: number): string {
        const self = this;

        return self.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' + user;
    }

    getAttachementDownloadIcon(extension: string): string {
        let res = '';

        switch (extension.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                res = 'jpg';
                break;
            case 'png':
                res = 'png';
                break;
            case 'pdf':
                res = 'pdf';
                break;
            case 'txt':
                res = 'txt';
                break;
            case 'doc':
            case 'docx':
                res = 'doc';
                break;
            case 'xls':
            case 'xlsx':
                res = 'xls';
                break;
            case 'pptx':
            case 'ppt':
                res = 'ppt';
                break;
            case 'csv':
                res = 'csv';
                break;
            case 'js':
                res = 'js';
                break;
            case 'css':
                res = 'css';
                break;
            case 'json':
                res = 'json';
                break;
            default:
                res = 'archivo';
                break;
        }

        return 'assets/chatlogeditor/img/' + res + '.png';
    }

    sendMessage(): void {
        const self = this;
        const ckeInputMessageInstance = self.ckeInputMessage['instance'];
        const messageStr = ckeInputMessageInstance.getData();

        if (messageStr) {
            if (self.chatRoom.id) {
                self.sendMessageAux(ckeInputMessageInstance);
            } else {
                // self.blocked = true;
                self.app.blocked = true;

                self.service.getOrCreateChatRoom(new ChatRoomGetOrCreateCommand({
                    chatRoomId: self.chatRoomId,
                    name: self.name,
                    description: self.description
                }))
                    // .pipe(finalize(() => { self.blocked = false; }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.chatRoom = data;
                        self.sendMessageAux(ckeInputMessageInstance);
                    });
            }
        }
    }

    sendMessageAux(ckeInputMessageInstance: any): void {
        const self = this;
        const messageStr = ckeInputMessageInstance.getData();

        if (messageStr) {
            const taggedUsers = [];
            const files = [];
            const promises = [];
            let promise;
            let pointPosition;

            for (const element of ckeInputMessageInstance.document.$.links) {
                if (element.hasAttribute('data-mention')) {
                    taggedUsers.push(element.getAttribute('data-user-id'));
                }
            }

            for (const file of self.fileUpload.files) {
                promise = self.fileLocalService.getBase64(file);
                promise.then(base64 => {
                    pointPosition = file.name.lastIndexOf('.');

                    files.push(new ChatRoomChatFileCreateCommand({
                        fileName: file.name.substring(0, pointPosition),
                        fileExtension: file.name.substring(pointPosition + 1),
                        base64: base64
                    }));
                });

                promises.push(promise);
            }

            Promise.all(promises).then(() => {
                // Mandar llamar servicio para agregar nuevo comentario
                // self.blocked = true;
                self.app.blocked = true;

                self.service.createChatRoomChat(new ChatRoomChatCreateCommand({
                    chatRoom: self.chatRoom.id,
                    comment: messageStr,
                    taggedUsers: taggedUsers,
                    files: files
                }))
                    // .pipe(finalize(() => { self.blocked = false; }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.currentModeObject.query.skip++;
                        self.fileUpload.clear();

                        self.addContentToTheEnd(self.generateEntriesHTMLFromMessages([new ChatRoomChatForListResponse({
                            id: data.id,
                            chatRoom: data.chatRoom,
                            creationTime: data.creationTime,
                            user: data.user,
                            userDesc: data.userDesc,
                            comment: data.comment,
                            files: data.files
                        })]));

                        ckeInputMessageInstance.setData('');
                    }, error => {
                        self.fileUpload.clear();
                    });
            });
        }
    }

    downloadAttachedFile(event: any): void {
        const self = this;
        let target = event.target;

        if (target.tagName.toUpperCase() !== 'A') {
            target = target.parentElement;
        }

        // self.blocked = true;
        self.app.blocked = true;

        self.fileService.getFileB64(target.getAttribute('data-file'))
            // .pipe(finalize(() => { self.blocked = false; }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.fileLocalService.createAndDownloadBlobFileFromBase64(
                    data,
                    target.getAttribute('data-file-name'), target.getAttribute('data-file-extension')
                );
            });
    }

    // Attachments

    initializeCurrentAttachmentModeObject(): void {
        const self = this;

        self.currentAttachmentModeObject = {
            totalMessages: 0, cke: null, addedToTheEnd: true, lastScrollHeight: 0, lastScrollTop: 0, isFirstLoad: true,
            query: new ChatRoomChatGetListQuery()
        };

        self.currentAttachmentModeObject.query.chatRoomId = self.chatRoomId;
        self.currentAttachmentModeObject.query.onlyFiles = true;
        self.currentAttachmentModeObject.query.pageNumber = 0;
        self.currentAttachmentModeObject.query.pageSize = 10;
        self.currentAttachmentModeObject.query.skip = 0;
        self.currentAttachmentModeObject.query.sorting = 'CreationTime DESC';
    }

    getAttachments(): void {
        const self = this;

        // self.attachmentWindowBlocked = true;
        self.app.blocked = true;

        self.service.getChatRoomChatList(self.currentAttachmentModeObject.query)
            // .pipe(finalize(() => { self.attachmentWindowBlocked = false; }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.currentAttachmentModeObject.query.skip += data.items.length;
                self.currentAttachmentModeObject.totalMessages = data.totalCount;

                self.getAttachmentItemHTML(data.items);
            });
    }

    getAttachmentItemHTML(messages: ChatRoomChatForListResponse[]): void {
        const self = this;
        let dvUser;
        let dvFileSection;
        let dvFile;
        let dvFileA;
        let dvFileImg;
        let dvFileAText;

        for (const message of messages) {
            dvUser = self.renderer.createElement('div');
            dvFileSection = self.renderer.createElement('div');

            dvUser.innerHTML = StringsHelper.formatString(
                '{0} {1}',
                [
                    self.dateTimeService.getDateTimeToDisplay(message.creationTime),
                    message.userDesc
                ]);

            dvUser.style = 'font-weight: 700;';
            dvFileSection.style = 'margin-top: 10px; margin-bottom: 30px;';

            self.renderer.appendChild(self.attachmentWindowList.nativeElement, dvUser);
            self.renderer.appendChild(self.attachmentWindowList.nativeElement, dvFileSection);

            for (const file of message.files) {
                dvFile = self.renderer.createElement('div');
                dvFileA = self.renderer.createElement('a');
                dvFileImg = self.renderer.createElement('img');
                dvFileAText = self.renderer.createText(file.fileName + '.' + file.fileExtension);

                dvFileA.style = 'cursor: pointer;';
                dvFileImg.style = 'height: 32px; cursor: pointer; display: inline; margin-right: 5px;';

                self.renderer.setAttribute(dvFileA, 'data-file', file.file);
                self.renderer.setAttribute(dvFileA, 'data-file-name', file.fileName);
                self.renderer.setAttribute(dvFileA, 'data-file-extension', file.fileExtension);
                self.renderer.setAttribute(dvFileImg, 'src', self.getAttachementDownloadIcon(file.fileExtension));

                self.renderer.listen(dvFileA, 'click', function (event) {
                    self.downloadAttachedFile(event);
                });

                self.renderer.appendChild(dvFileSection, dvFile);
                self.renderer.appendChild(dvFile, dvFileA);
                self.renderer.appendChild(dvFileA, dvFileImg);
                self.renderer.appendChild(dvFileA, dvFileAText);
            }
        }
    }

    openAttachmentWindow(attachmentWindow: any, event): void {
        const self = this;

        if (!self.isAttachmentWindowOpen) {
            self.initializeCurrentAttachmentModeObject();
            self.attachmentWindowList.nativeElement.innerHTML = '';
            self.getAttachments();
            attachmentWindow.show(event);
        }
    }

    onScrollAttachmentWindow(event: any): void {
        const self = this;
        const scrollTop = event.target.scrollTop;

        if (event.target.scrollHeight - scrollTop - 500 <= 100) {
            if (self.currentAttachmentModeObject.query.skip < self.currentAttachmentModeObject.totalMessages
                && self.attachmentWindowBlocked !== true) {
                self.getAttachments();
                self.currentAttachmentModeObject.lastScrollTop = scrollTop;
            }
        }
    }
}
