from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer,
    UserSerializer, UpdateProfileSerializer,
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        tokens = get_tokens(user)
        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.validated_data['user']
        tokens = get_tokens(user)
        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data,
        })


class LogoutView(APIView):
    def post(self, request):
        try:
            RefreshToken(request.data['refresh']).blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return UpdateProfileSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    filter_backends  = [SearchFilter]
    search_fields    = ['username', 'first_name', 'last_name', 'area_name']

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).filter(is_active=True)


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    queryset         = User.objects.filter(is_active=True)