import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id   = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'chat_{self.room_id}'
        user = self.scope.get('user')

        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4001)
            return

        is_member = await self.check_membership(user, self.room_id)
        if not is_member:
            await self.close(code=4003)
            return

        self.user = user
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get('type', 'chat_message')

        if msg_type == 'typing':
            await self.channel_layer.group_send(self.group_name, {
                'type':      'typing_event',
                'user_id':   self.user.id,
                'is_typing': data.get('is_typing', False),
            })
            return

        content = data.get('content', '').strip()
        if not content:
            return

        msg = await self.save_message(self.user, self.room_id, content)

        await self.channel_layer.group_send(self.group_name, {
            'type':        'chat_message',
            'message_id':  str(msg.id),
            'content':     msg.content,
            'sender_id':   self.user.id,
            'sender_name': self.user.full_name,
            'timestamp':   msg.created_at.isoformat(),
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({**event, 'type': 'chat_message'}))

    async def typing_event(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def check_membership(self, user, room_id):
        from .models import Room
        return Room.objects.filter(id=room_id, members=user).exists()

    @database_sync_to_async
    def save_message(self, user, room_id, content):
        from .models import Room, Message
        room = Room.objects.get(id=room_id)
        return Message.objects.create(room=room, sender=user, content=content)