import grpc
from concurrent import futures
from django.core.management.base import BaseCommand

from users.grpc_setup import users_pb2_grpc
from users.grpc_services import UserAuthService

class Command(BaseCommand):
    help = 'Starts the gRPC Server for User Authentication'

    def handle(self, *args, **options):
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        users_pb2_grpc.add_UserAuthServicer_to_server(UserAuthService(), server)
        
        # Port dyal gRPC Server
        server.add_insecure_port('[::]:50051') 
        server.start()
        
        self.stdout.write(self.style.SUCCESS('🚀 gRPC Server started successfully on port 50051...'))
        server.wait_for_termination()