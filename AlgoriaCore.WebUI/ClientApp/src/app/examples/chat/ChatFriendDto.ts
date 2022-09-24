import { FriendshipListResponse, ChatMessageListResponse, IFriendshipListResponse } from '../../../shared/service-proxies/service-proxies';

export class ChatFriendDto extends FriendshipListResponse {
    messages: ChatMessageListResponse[];
    allPreviousMessagesLoaded = false;
    messagesLoaded = false;

    constructor(data?: IFriendshipListResponse) {
        super(data);
        this.messages = [];
    }
}
