export const QUEUE_EVENT = "queue-updated";

export function emitQueueUpdate() {
  window.dispatchEvent(new Event(QUEUE_EVENT));
}
