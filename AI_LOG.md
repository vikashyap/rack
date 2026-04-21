# AI Workflow Log

This file describes how AI was used during this assessment.

## Tools Used

- Codex
- local shell commands through the terminal

## Key Prompts Or Commands
- "When we get an ID from the device list, resolve the `templateId`, get the object, dd `startU` and `view` and render the device."
- "We only need one validation for now: items cannot be dropped on top of each other."
- "Wrap the component with `React.memo` and make sure we are not causing accidental re-renders."
- "Create separate stores for document state and interaction state."
- "We need separate stores for document state and interaction state. To avoid mixing up the two states also the calculations should be in the interaction state."
- "Simplify the whole process and remove unnecessary calculations."
- "For now, focus only on wire connections, lets create a simple wire connection system, with simple config, no need to over-engineer."
- "We already have the local inventory drag model working in our rack system. We just need to wire it into websocket sync and make sure we dont chnage anything in our rack system"
- "Keep the current local drag-and-drop flow the way it is."
- "The websocket layer should not duplicate the drag-and-drop logic."
- "Add `rackId` and `revisionId` to the system without breaking the current functionality."
- "The rack should not rely on HTML wrappers. It should be able to live inside the board. SVG nodes should be able to be dropped on the board."
- "Add React Router in the app , with home page, board page and rack page routes."
- "Create a home route with a grid of project cards."
- "Primitive names should stay generic. `ProjectCard` is too specific."
- "Lets separate theme from the rack store, and extract zoom-in and zoom-out into their own board-level state."
- "Add the assignment philosophy about projects, racks, devices, and template loading."
- "Explain the state model with IDs and concrete examples."
- "Explain how `id` and `templateKey` are different and how they flow through API load, drag-and-drop, and websocket sync."
- "Add JSON examples so the whole story feels connected."
- "Explain why `HomePage` and `BoardPage` exist, and why `RackPage` is the main workflow."
- "Explain how ports and wires are calculated from config."
- "Add clearer run instructions for the app."
- "lets scafold a monorepo with pnpm, the project should have a react web app, a server and a shared package , config and UI for device templates"
- "lets add a simple websocket server that can broadcast messages to all connected clients"



## Where AI Helped

- reading the repo structure quickly
- comparing the existing rack editor with the newer board flow without losing the older working page
- extracting reusable pieces like `RackScene`, generic cards, floating panels, and theme controls
- turning scattered interaction code into clearer store boundaries
- shaping the websocket model into two layers:
  - presence
  - committed document updates
- refining the project model so projects can scope racks and device catalogs
- helping iterate on board-vs-rack architecture without rewriting everything at once
- comparing the docs with the actual code
- rewriting the ADR into a clearer decision document
- rewriting the README into a junior-focused explanation
- turning the project, rack, device, and template-loading story into cleaner examples
- describing how IDs and `templateKey` are reused across API load, drag-and-drop, and websocket sync

## Where I Overrode AI

- I rolled back or rejected refactors that made the rack interaction path less stable, especially around wire targeting and DOM/SVG boundaries
- I kept the board racks as dummy SVG shells for now instead of forcing the full live rack editor into the board too early
- I treated `rackId` and `revisionId` as important architecture metadata, but avoided overusing them in fragile interaction paths until the model was stable
- I kept devices non-droppable on the board even when a more ambitious shared drag system was technically possible
- I corrected places where the wording blurred `id` and `templateKey`
- I kept the README focused on the whole app story, not just architecture
- I kept the ADR focused on decisions and trade-offs instead of turning it into a second README
- I treated `HomePage` and `BoardPage` as supporting context pages, while keeping `RackPage` as the main workflow

## One Decision I Would Not Trust AI To Make Alone

I would not trust AI to choose the collaboration and synchronization model on its own.

That decision affects:

- optimistic updates
- conflict resolution
- revision handling
- long-term maintainability
- how much state belongs to the board versus an individual rack
- when to use presence-only updates versus committed websocket document events

AI can help compare options, but an engineer still needs to decide how shared state should behave under real concurrent editing.
