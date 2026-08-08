from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation_list'),
    path('contacts/', views.ContactsView.as_view(), name='contacts'),
    path('conversations/start/', views.ConversationStartView.as_view(), name='conversation_start'),
    path('conversations/unread/', views.UnreadMessageCountView.as_view(), name='messages_unread'),
    path('conversations/<int:conv_pk>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<int:conv_pk>/messages/', views.MessageListView.as_view(), name='message_list'),
    path('conversations/<int:conv_pk>/messages/send/', views.MessageCreateView.as_view(), name='message_send'),
]
