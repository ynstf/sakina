import grpc
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .grpc_setup import users_pb2, users_pb2_grpc

User = get_user_model()

class UserAuthService(users_pb2_grpc.UserAuthServicer):
    def VerifyToken(self, request, context):
        token_key = request.token
        try:
            # 1. Vérifier w décoder JWT access token
            validated_token = AccessToken(token_key)
            user_id = validated_token['user_id']
            
            # 2. Jbed l-user mn Database b id li lqina f token
            user = User.objects.get(id=user_id)
            
            return users_pb2.UserData(
                is_valid=True,
                id=user.id,
                username=user.username,
                email=user.email
            )
        except (InvalidToken, TokenError, User.DoesNotExist):
            # Ila token salat (expired), mkhewr, wla user ma-b9ach
            return users_pb2.UserData(is_valid=False, id=0, username="", email="")