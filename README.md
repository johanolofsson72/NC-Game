# NC-Game

A browser-based 2D tile RPG. The animation database dates back to 2012; in July 2025 a new HTML5 Canvas engine was bolted on top of the original map and event data so the thing actually runs in a modern browser. It is a tech demo more than a finished game. There are no graphics assets yet, so tiles and the player are drawn as flat colored squares with their tile IDs printed on them.

## What it does

You move a square (the player) around tile maps with collision. Maps load from JSON files that came from the original 2012 game. Stepping next to an event marker (a green pulsing circle) and pressing space runs that event's commands. The only command type the engine currently handles is `TRANSFERT_PLAYER`, which warps you to another map at given coordinates. That is how the office, meeting room, corridor, and bathhouse-exterior maps connect.

Five maps are wired into the buttons in `index.html`: Office, MotesRoom (meeting room), Korriodor (corridor), OutSide BadHus (bathhouse exterior), and MAP001. If a map file fails to load, the engine falls back to a generated 15x20 bordered room so the page does not break.

A debug overlay shows the player's tile position, the current map name, and FPS.

## Tech stack

- HTML5 Canvas for rendering
- Plain JavaScript (one ES6 class, no framework, no build step)
- JSON map and event files under `Data/`
- `Database/Animation.js`, the original 2012 animation data (about 260 KB), loaded but not yet played back

## Getting started

The engine uses `fetch` to load JSON, so opening `index.html` straight off the filesystem will not work in most browsers (CORS). Serve it over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Controls

- WASD or arrow keys: move one tile at a time
- Space: interact with a nearby event
- The map buttons under the canvas: jump straight to a map

## Status

Playable but bare. Movement, collision, map switching, and the transfer-event system work. Not implemented: actual sprite/tile graphics, sound, animation playback (the `playAnimation` method is a stub), dialogue, and inventory. The map and event JSON still carry fields the engine ignores. Last real work was July 2025.

Note: some folder and map names keep their original spellings (Korriodor, MotesRoom, MötesRoom, OutSide BadHus) because the engine looks them up by those exact strings.
