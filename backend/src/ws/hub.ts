import { Server as HttpServer } from "node:http";
import { WebSocketServer } from "ws";

export class WsHub {
  private readonly wss: WebSocketServer;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
  }

  public broadcast(event: string, payload: unknown): void {
    const data = JSON.stringify({ event, payload });
    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    }
  }
}
