import { AfterViewInit, Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AppComponent } from '../../app/app.component';
import { AppConsts } from '../AppConsts';
import { StringsHelper } from '../helpers/StringsHelper';
import {
    ChatRoomChatCreateCommand, ChatRoomChatFileCreateCommand,
    ChatRoomChatFileResponse, ChatRoomChatForListResponse,
    ChatRoomChatGetListQuery, ChatRoomGetOrCreateCommand,
    ChatRoomResponse, ChatRoomServiceProxy,
    FileServiceProxy, UserServiceProxy
} from '../service-proxies/service-proxies';
import { DateTimeService } from '../services/datetime.service';
import { FileService } from '../services/file.service';

import Mention from 'quill-mention'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LazyLoadEvent } from 'primeng/api';

@Component({
    selector: 'app-chatlog',
    templateUrl: 'app.chatlog.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AppChatLogComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @Input() chatRoomId: string;
    @Input() name: string;
    @Input() description: string;

    @ViewChild('ckeContentArea', { static: false }) ckeContentArea: ElementRef;
    @ViewChild('ckeInputMessage', { static: false }) ckeInputMessage: ElementRef;
    @ViewChild('fileUpload') fileUpload: FileUpload;
    @ViewChild('attachmentWindowList', { static: false }) attachmentWindowList: ElementRef;
    @ViewChild('chatContent', { static: false }) chatContent: ElementRef;

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

    templateCurrentUser = '<div class="chatitem"> '
        + '<div style="width:90px;display:inline-block;float:left;">'
        + '<img src="{0}" alt="" style="border-radius: 64px; width: 64px; height: 64px;" />'
        + '</div>'
        + '<div class="chatitem-content">'
        + '<div class="chatitem-title-name">{1}</div>'
        + '<div class="chatitem-title-sep"></div>'
        + '<div class="chatitem-title-user">{2}</div>'
        + '<div class="chatitem-title-sep"></div>'
        + '<div class="chatitem-title-time">{3}</div>'
        + '<div class="chatitem-text">{4}{5}</div>'
        + '</div>'
        + '</div>';

    templateOtherUser = '<div class="chatitem"> '
        + '<div style="width:90px;display:inline-block;float:left;">'
        + '<img src="{0}" alt="" style="border-radius: 64px; width: 64px; height: 64px;" />'
        + '</div>'
        + '<div class="chatitem-content">'
        + '<div class="chatitem-title-name">{1}</div>'
        + '<div class="chatitem-title-user">{2}}</div>'
        + '<div class="chatitem-title-time">{3}</div>'
        + '<div class="chatitem-text">{4}{5}</div>'
        + '</div>'
        + '</div>';

    templateAttachment = '<div><span class="chatitem-file" data-file={0} data-file-name="{1}" data-file-extension="{2}" (onClick)="downloadAttachedFile($event)">'
        + '<img src="{3}" alt="" style="height: 32px; cursor: pointer; display: inline; margin-right: 5px;"/> {4} </span></div > ';

    rawTextChat: string;
    chatHTML: SafeHtml;

    // Attachment Window
    attachmentWindowBlocked = false;
    isAttachmentWindowOpen = false;

    quillInstance: any;
    quillContentInstance: any;
    mentions: Mention;

    allMessages = Array.from({ length: 10000 });
    messagesCount = 0;

    constructor(
        injector: Injector,
        private service: ChatRoomServiceProxy,
        private userService: UserServiceProxy,
        public dateTimeService: DateTimeService,
        private app: AppComponent,
        private fileLocalService: FileService,
        private fileService: FileServiceProxy,
        private renderer: Renderer2,
        private sanitizer: DomSanitizer
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
        // self.configInputMessage();
    }

    ngAfterViewInit(): void {
        const self = this;

        self.getChatRoom();
        self.isReady = true;
        self.currentModeObject.cke = self.ckeContentArea;
    }

    getChatRoom(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getChatRoomByChatRoomId(self.chatRoomId)
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
            fullPage: false,
            toolbarCanCollapse: false,
            toolbarStartupExpanded: false,
            resize_enabled: false, // eslint-disable-line @typescript-eslint/naming-convention
            readOnly: true,
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
                },
                contentDom: function (contentDom) {
                    const editable = contentDom.editor.editable();

                    for (const element of editable.editor.document.$.links) {
                        if (element.hasAttribute('data-file')) {
                            // element.addEventListener('click', function (event) {
                            //    self.downloadAttachedFile(event);
                            // });
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
                                // self.getMessages();
                                self.currentModeObject.lastScrollTop = scrollTop;
                            }
                        }
                    });
                }
            }
        };
    }

    editorOnInit(event: any) {
        const self = this;

        self.quillInstance = event.editor;
        self.mentions = new Mention(self.quillInstance, {
            mentionDenotationChars: ['@', '#'],
            source: function (searchTerm, renderList, mentionChar) {
                let values = [];

                if (mentionChar === '@') {

                    self.userService.getUserAutocompleteList(searchTerm)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            for (let i = 0, len = data.length; i < len; i++) {
                                values.push({
                                    id: data[i].id,
                                    value: (data[i].login + ' ' + data[i].fullName)
                                });
                            }
                            renderList(values, searchTerm);
                        });


                } else if (mentionChar === '#') {
                    self.userService.getUserAutocompleteList(searchTerm)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            for (let i = 0, len = data.length; i < len; i++) {
                                values.push({
                                    id: data[i].id,
                                    value: data[i].fullName
                                });
                            }
                            renderList(values, searchTerm);
                        });
                }
            }
        });
    }

    contentAreaOnInit(event: any) {
        const self = this;

        self.quillContentInstance = event.editor;
        self.quillContentInstance.disable();
    }

    addContent(content: string): void {
        const self = this;
        // const instance = self.quillContentInstance; // self.currentModeObject.cke['instance'];

        // self.currentModeObject.addedToTheEnd = false;

        // const delta = instance.clipboard.convert(content);
        // instance.setContents(delta, 'silent');
        self.rawTextChat = content + self.rawTextChat;
        self.rawTextChat = self.rawTextChat.replace('?<span', '<span');
        self.rawTextChat = self.rawTextChat.replace('span>?', 'span>');
        self.chatHTML = self.sanitizer.bypassSecurityTrustHtml(self.rawTextChat);
    }

    addContentToTheEnd(content: string): void {
        const self = this;
        // const instance = self.quillContentInstance; // self.currentModeObject.cke['instance'];

        // self.currentModeObject.addedToTheEnd = true;

        // const delta = instance.clipboard.convert(content);
        // instance.setContents(delta, 'silent');

        self.rawTextChat = self.rawTextChat + content;
        self.rawTextChat = self.rawTextChat.replace('?<span', '<span');
        self.rawTextChat = self.rawTextChat.replace('span>?', 'span>');
        self.chatHTML = self.sanitizer.bypassSecurityTrustHtml(self.rawTextChat);
    }

    loadMessages(event: LazyLoadEvent): void {
        const self = this;

        let pageN = 0;
        if (event) {
            pageN = event.first;
        }
        console.log(pageN);
        self.currentModeObject.query.pageNumber = pageN;
        self.currentModeObject.query.pageSize = 10;

        self.app.blocked = true;

        self.service.getChatRoomChatList(self.currentModeObject.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {

                self.messagesCount = data.totalCount;
                self.allMessages = data.items;
                //for (let i = 0, len = data.items.length; i < len; i++) {
                //    self.allMessages.push(data.items[i]);
                //}

                console.log(self.allMessages);
                event.forceUpdate();
            });
    }

    getMessages(): void {
        const self = this;

        
    }

    generateEntriesHTMLFromMessages(messages: ChatRoomChatForListResponse[]): string {
        const self = this;
        let res = '';

        for (const message of messages) {
            res += StringsHelper.formatString(
                message.user === self.app.currentUser.userId ? self.templateCurrentUser : self.templateOtherUser,
                [
                    self.getUrlUserPicture(message.user),
                    message.userDesc,
                    message.id,
                    self.dateTimeService.getDateTimeToDisplay(message.creationTime),
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
        const messageStr = self.quillInstance.root.innerHTML;

        if (messageStr) {
            if (self.chatRoom.id) {
                self.sendMessageAux();
            } else {
                self.app.blocked = true;

                self.service.getOrCreateChatRoom(new ChatRoomGetOrCreateCommand({
                    chatRoomId: self.chatRoomId,
                    name: self.name,
                    description: self.description
                }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.chatRoom = data;
                        self.sendMessageAux();
                    });
            }
        }
    }

    sendMessageAux(): void {
        const self = this;
        const messageStr = self.quillInstance.root.innerHTML;

        if (messageStr) {
            const taggedUsers = [];
            const files = [];
            const promises = [];
            let promise;
            let pointPosition;

            const delta = self.quillInstance.getContents();
            for (const element of delta.ops) {
                if (element.insert.mention) {
                    taggedUsers.push(element.insert.mention.id);
                }
            }

            console.log(taggedUsers);
            console.log(messageStr);

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

                        // ckeInputMessageInstance.setData('');
                        self.quillInstance.setContents('');
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

        self.app.blocked = true;

        self.fileService.getFileB64(target.getAttribute('data-file'))
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

        self.app.blocked = true;

        self.service.getChatRoomChatList(self.currentAttachmentModeObject.query)
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
