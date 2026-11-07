
import './style.css';

import { collectItem, getInventory } from './inventory';
import { discoverClue} from './clues';
import { interactWithObject } from './interactions';
import { getDialogue } from './dialogues';
import { renderInventory, renderClues } from './ui';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <main class="game">
    <h1>Time Loop Escape</h1>
    <p>Explore the room and discover its secrets.</p>

    <section class="room">
      <h2>Room Objects</h2>
      <button id="painting">Blue Painting</button>
      <button id="cabinet">Cabinet</button>
      <button id="computer">Computer</button>
    </section>

    <section class="panels">
      <div class="panel">
        <h2>Inventory</h2>
        <div id="inventory"></div>
      </div>

      <div class="panel">
        <h2>Discovered Clues</h2>
        <div id="clues"></div>
      </div>
    </section>

    <section class="panel">
      <h2>Dialogue</h2>
      <p id="dialogue">Click an object to investigate it.</p>
    </section>
  </main>
`;

function updatePanels() {
  document.querySelector('#inventory')!.innerHTML = renderInventory();
  document.querySelector('#clues')!.innerHTML = renderClues();
}

function handleObjectClick(objectId: string) {
  interactWithObject(objectId);

  document.querySelector('#dialogue')!.textContent =
    getDialogue(objectId);

  if (objectId === 'painting') {
    discoverClue('clue-1');
  }

  if (objectId === 'cabinet') {
    if (getInventory().some(item => item.id === 'key-1')) {
      collectItem('note-1');
      discoverClue('clue-2');
    }
  }

  updatePanels();
}

document.querySelector('#painting')!.addEventListener('click', () => {
  handleObjectClick('painting');
});

document.querySelector('#cabinet')!.addEventListener('click', () => {
  handleObjectClick('cabinet');
});

document.querySelector('#computer')!.addEventListener('click', () => {
  handleObjectClick('computer');
});

updatePanels();
