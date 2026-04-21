import { useEffect, useMemo, useRef, useState } from "react";

import {
  getBrowserRackSession,
  getRackCollaborationUrl,
  type RackCollaborationConnection,
  type RackDocumentOperation,
  type RackCollaborationMessage,
  type RackCollaborationStatus,
} from "../lib/rack-collaboration";
import {
  runRemoteRackDocumentOperation,
  setRackDocumentOperationSender,
} from "../lib/rack-document-operations";
import { useRackDocumentStore } from "../stores/rackDocumentStore";
import { useRackPresenceStore } from "../stores/rackPresenceStore";

function applyRemoteOperation(operation: RackDocumentOperation) {
  const documentStore = useRackDocumentStore.getState();
  const { rackId, revisionId } = documentStore.document;

  if (operation.rackId !== rackId || operation.revisionId <= revisionId) {
    return;
  }

  runRemoteRackDocumentOperation(() => {
    if (operation.type === "device.added") {
      documentStore.addDevice(operation.device, {
        revisionId: operation.revisionId,
      });
      return;
    }

    if (operation.type === "device.moved") {
      documentStore.updateDeviceStartU(operation.deviceId, operation.startU, {
        revisionId: operation.revisionId,
      });
      return;
    }

    if (operation.type === "device.removed") {
      documentStore.removeDevice(operation.deviceId, {
        revisionId: operation.revisionId,
      });
      return;
    }

    if (operation.type === "connection.added") {
      documentStore.connectPorts(
        operation.connection.from,
        operation.connection.to,
        operation.connection.id,
        {
          revisionId: operation.revisionId,
        },
      );
      return;
    }

    documentStore.removeConnection(operation.connectionId, {
      revisionId: operation.revisionId,
    });
  });
}

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
        applyRemoteOperation(event.operation);
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
