import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class TracksQueueGateway {
  @WebSocketServer()
  server: Server;

  queueUpdated(queue: unknown[]) {
    this.server.emit('queueUpdated', queue, (data) =>
      console.log('queue', data),
    );
  }
}
