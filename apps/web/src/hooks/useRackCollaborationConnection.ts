import { useEffect, useMemo, useRef, useState } from "react";

import {
  getBrowserRackSession,
  getRackCollaborationUrl,
  type RackCollaborationConnection,
  type RackCollaborationMessage,
  type RackCollaborationStatus,
} from "../lib/rack-collaboration";
import {
  runRemoteRackDocumentOperation,
  setRackDocumentOperationSender,
} from "../lib/rack-document-operations";
import { useRackDocumentStore } from "../stores/rackDocumentStore";
import { useRackPresenceStore } from "../stores/rackPresenceStore";

export function useRackCollaborationConnection() {
  const session = useMemo(() => getBrowserRackSession(), []);
  const users = useRackPresenceStore((state) => state.users);
  const setUsers = useRackPresenceStore((state) => state.setUsers);
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<RackCollaborationStatus>("connecting");

  useEffect(() => {
    setUsers([session]);

    const socket = new WebSocket(getRackCollaborationUrl(session));
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setStatus("connected");
    });

    socket.addEventListener("message", (message) => {
      const event = JSON.parse(message.data) as RackCollaborationMessage;

      if (event.type === "users") {
        setUsers(event.users);
        return;
      }

      if (event.type === "operation") {
        const documentStore = useRackDocumentStore.getState();
        const {
          rackId: currentRackId,
          revisionId: currentRevisionId,
        } = documentStore.document;

        if (event.operation.rackId !== currentRackId) {
          return;
        }

        if (event.operation.revisionId <= currentRevisionId) {
          return;
        }

        runRemoteRackDocumentOperation(() => {
          if (event.operation.type === "device.added") {
            documentStore.addDevice(event.operation.device, {
              revisionId: event.operation.revisionId,
            });
            return;
          }

          if (event.operation.type === "device.moved") {
            documentStore.updateDeviceStartU(
              event.operation.deviceId,
              event.operation.startU,
              {
                revisionId: event.operation.revisionId,
              },
            );
            return;
          }

          if (event.operation.type === "device.removed") {
            documentStore.removeDevice(event.operation.deviceId, {
              revisionId: event.operation.revisionId,
            });
            return;
          }

          if (event.operation.type === "connection.added") {
            documentStore.connectPorts(
              event.operation.connection.from,
              event.operation.connection.to,
              event.operation.connection.id,
              {
                revisionId: event.operation.revisionId,
              },
            );
            return;
          }

          documentStore.removeConnection(event.operation.connectionId, {
            revisionId: event.operation.revisionId,
          });
        });
      }
    });

    socket.addEventListener("close", () => {
      setStatus("disconnected");
    });

    socket.addEventListener("error", () => {
      setStatus("disconnected");
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [session, setUsers]);

  useEffect(() => {
    setRackDocumentOperationSender((operation) => {
      const socket = socketRef.current;

      if (socket?.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: "operation",
          operation,
        }),
      );
    });

    return () => setRackDocumentOperationSender(null);
  }, []);

  const connection = useMemo<RackCollaborationConnection>(
    () => ({
      session,
      sendPresence(presence) {
        const socket = socketRef.current;

        if (socket?.readyState !== WebSocket.OPEN) {
          return;
        }

        socket.send(
          JSON.stringify({
            type: "presence",
            ...presence,
          }),
        );
      },
    }),
    [session],
  );

  return {
    connection,
    status,
    users,
  };
}
