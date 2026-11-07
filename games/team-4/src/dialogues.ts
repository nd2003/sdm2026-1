
export interface Dialogue {
  objectId: string;
  message: string;
}

export const dialogues: Dialogue[] = [
  {
    objectId: "painting",
    message: "There seems to be something unusual about this painting."
  },
  {
    objectId: "cabinet",
    message: "The cabinet is locked. You need a key."
  },
  {
    objectId: "computer",
    message: "The computer is asking for a password."
  }
];

export function getDialogue(objectId: string): string {
  const dialogue = dialogues.find(
    item => item.objectId === objectId
  );

  return dialogue?.message ?? "There is nothing unusual here.";
}
