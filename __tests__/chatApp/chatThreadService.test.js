import {
  buildDeliveredReceiptUpdates,
  buildSeenReceiptUpdates,
  createOutgoingDraft,
  normalizeMessages,
} from '../../src/modules/chatApp/services/chatThread.service';

describe('chatThread service', () => {
  it('deduplicates messages by clientMessageId and sorts by createdAt', () => {
    const messages = normalizeMessages(
      {
        a1: {
          clientMessageId: 'client-1',
          createdAt: 10,
          from: 'user-a',
          messageId: 'a1',
          receipts: {},
          status: 'sent',
          text: 'older duplicate',
          type: 'text',
        },
        b1: {
          clientMessageId: 'client-2',
          createdAt: 5,
          from: 'user-b',
          messageId: 'b1',
          receipts: {},
          status: 'sent',
          text: 'first',
          type: 'text',
        },
        a2: {
          clientMessageId: 'client-1',
          createdAt: 15,
          from: 'user-a',
          messageId: 'a2',
          receipts: {},
          status: 'sent',
          text: 'newer duplicate',
          type: 'text',
        },
      },
      'user-a',
    );

    expect(messages).toHaveLength(2);
    expect(messages.map(message => message.text)).toEqual([
      'first',
      'newer duplicate',
    ]);
    expect(messages[1].fromMe).toBe(true);
  });

  it('builds delivered updates only for inbound messages that are still sent', () => {
    const updates = buildDeliveredReceiptUpdates({
      chatId: 'chat-1',
      currentUserId: 'user-b',
      messages: [
        {
          id: 'm1',
          from: 'user-a',
          receipts: {},
          status: 'sent',
        },
        {
          id: 'm2',
          from: 'user-b',
          receipts: {},
          status: 'sent',
        },
      ],
    });

    expect(updates['chats/chat-1/messages/m1/status']).toBe('delivered');
    expect(
      updates['chats/chat-1/messages/m1/receipts/user-b/deliveredAt'],
    ).toEqual(expect.any(Number));
    expect(updates['chats/chat-1/messages/m2/status']).toBeUndefined();
  });

  it('builds seen updates only after delivery has been recorded', () => {
    const updates = buildSeenReceiptUpdates({
      chatId: 'chat-1',
      currentUserId: 'user-b',
      messages: [
        {
          id: 'm1',
          from: 'user-a',
          receipts: {
            'user-b': {
              deliveredAt: 100,
            },
          },
          status: 'delivered',
        },
        {
          id: 'm2',
          from: 'user-a',
          receipts: {},
          status: 'sent',
        },
      ],
    });

    expect(updates['chats/chat-1/messages/m1/status']).toBe('seen');
    expect(updates['chats/chat-1/messages/m1/receipts/user-b/seenAt']).toEqual(
      expect.any(Number),
    );
    expect(updates['chats/chat-1/messages/m2/status']).toBeUndefined();
  });

  it('creates reusable client drafts with safe ids', () => {
    const draft = createOutgoingDraft('hello');

    expect(draft.text).toBe('hello');
    expect(draft.messageId).toMatch(/^msg_/);
    expect(draft.clientMessageId).toMatch(/^client_/);
  });
});
