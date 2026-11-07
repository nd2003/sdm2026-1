export interface Clue {
  id: string;
  title: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
}

export interface InteractiveObject {
  id: string;
  name: string;
  description: string;
}

// All available clues
export const clues: Clue[] = [
  {
    id: "clue-1",
    title: "Blue Painting",
    description: "BLUE - 4",
  },
  {
    id: "clue-2",
    title: "Photograph",
    description: "Look closely at the year on the photograph.",
  },
];

// All available inventory items
export const items: InventoryItem[] = [
  {
    id: "key-1",
    name: "Cabinet Key",
    description: "A small key found behind the painting.",
  },
  {
    id: "note-1",
    name: "Old Note",
    description: "A mysterious note found inside the cabinet.",
  },
];

// All interactive room objects
export const objects: InteractiveObject[] = [
  {
    id: "painting",
    name: "Blue Painting",
    description: "A painting hanging on the wall.",
  },
  {
    id: "cabinet",
    name: "Locked Cabinet",
    description: "A cabinet that requires a key.",
  },
  {
    id: "computer",
    name: "Computer",
    description: "A computer waiting for a password.",
  },
];
