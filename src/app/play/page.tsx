import { Socket } from "socket.io-client";
import {
  SocketContext,
  SocketProvider,
} from "../../components/ui/SocketProvider";
import InsidePlay from "../../components/custom/InsidePlay";

export default function Play() {
  return (
    <SocketProvider>
      <InsidePlay />
    </SocketProvider>
  );
}
