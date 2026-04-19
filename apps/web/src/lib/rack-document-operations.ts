import type { RackDocumentOperation } from "./rack-collaboration";

type OperationSender = (operation: RackDocumentOperation) => void;

let sender: OperationSender | null = null;
let applyingRemoteOperation = false;

export function setRackDocumentOperationSender(nextSender: OperationSender | null) {
  sender = nextSender;
}

export function sendRackDocumentOperation(operation: RackDocumentOperation) {
  if (!applyingRemoteOperation) {
    sender?.(operation);
  }
}

export function runRemoteRackDocumentOperation(applyOperation: () => void) {
  applyingRemoteOperation = true;
  try {
    applyOperation();
  } finally {
    applyingRemoteOperation = false;
  }
}
