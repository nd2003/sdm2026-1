// Wires everything together. Keep this tiny.
// TEMP STUBS: delete once room.js / ui.js are merged
if (typeof render === "undefined") window.render = () => console.log(JSON.stringify(game));
if (typeof buildRoom === "undefined") window.buildRoom = () => {};

// Wait in the lobby: connect(name) from the Join button starts the match, and "start" calls startLoop().
buildRoom();
render();
