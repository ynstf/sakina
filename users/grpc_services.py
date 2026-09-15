import grpc
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .grpc_setup import users_pb2, users_pb2_grpc

User = get_user_model()

import grpc
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .grpc_setup import users_pb2, users_pb2_grpc

User = get_user_model()

class UserAuthService(users_pb2_grpc.UserAuthServicer):
    def VerifyToken(self, request, context):
        token_key = request.token or ""
        
        # 1. Strip 'Bearer ' if it was passed in the string
        if token_key.startswith("Bearer "):
            token_key = token_key.split(" ")[1]

        try:
            # 2. Verify & decode JWT access token
            validated_token = AccessToken(token_key)
            user_id = validated_token.get('user_id')
            
            if not user_id:
                print("gRPC Auth Error: 'user_id' claim missing from JWT payload", flush=True)
                return users_pb2.UserData(is_valid=False, id=0, username="", email="")
            
            # 3. Retrieve user from Database (ensure integer ID lookup)
            user = User.objects.get(id=int(user_id))
            
            print(f"gRPC Auth Success: Validated user {user.username} (ID: {user.id})", flush=True)
            return users_pb2.UserData(
                is_valid=True,
                id=user.id,
                username=user.username,
                email=user.email or ""
            )

        except (InvalidToken, TokenError) as e:
            print(f"gRPC Auth Token Error: {e}", flush=True)
            return users_pb2.UserData(is_valid=False, id=0, username="", email="")
            
        except User.DoesNotExist:
            print(f"gRPC Auth Error: User with ID {user_id} does not exist in DB", flush=True)
            return users_pb2.UserData(is_valid=False, id=0, username="", email="")
            
        except Exception as e:
            print(f"gRPC Auth Unexpected Error: {repr(e)}", flush=True)
            return users_pb2.UserData(is_valid=False, id=0, username="", email="")

# class UserAuthService(users_pb2_grpc.UserAuthServicer):
#     def VerifyToken(self, request, context):
#         token_key = request.token
#         try:
#             # 1. Vérifier w décoder JWT access token
#             validated_token = AccessToken(token_key)
#             user_id = validated_token['user_id']
            
#             # 2. Jbed l-user mn Database b id li lqina f token
#             user = User.objects.get(id=user_id)
            
#             return users_pb2.UserData(
#                 is_valid=True,
#                 id=user.id,
#                 username=user.username,
#                 email=user.email
#             )
#         except (InvalidToken, TokenError, User.DoesNotExist):
#             # Ila token salat (expired), mkhewr, wla user ma-b9ach
#             return users_pb2.UserData(is_valid=False, id=0, username="", email="")

