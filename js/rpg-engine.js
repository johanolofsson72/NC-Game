/**
 * NC-Game RPG Engine
 * A modern recreation of the classic 2012 RPG game
 */

// Initialize the Database namespace if it doesn't exist
if (typeof Database === 'undefined') {
    window.Database = {};
}

class Rpg {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.player = {
            x: 6,
            y: 10,
            mapX: 6,
            mapY: 10,
            direction: 'down',
            moving: false,
            speed: 4
        };
        this.currentMap = null;
        this.mapData = null;
        this.events = [];
        this.keys = {};
        this.animations = {};
        this.lastTime = 0;
        this.fps = 0;
        this.camera = { x: 0, y: 0 };
        
        // Bind keyboard events
        this.bindEvents();
    }

    init() {
        console.log('Initializing NC-Game RPG Engine...');
        this.loadMap('Office'); // Start with the office map
        this.gameLoop();
    }

    bindEvents() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent default behavior for game keys
            if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    async loadMap(mapName) {
        try {
            console.log(`Loading map: ${mapName}`);
            
            // Load map data
            const mapResponse = await fetch(`Data/Maps/${mapName}.json`);
            if (!mapResponse.ok) {
                throw new Error(`Failed to load map: ${mapName}`);
            }
            this.mapData = await mapResponse.json();
            this.currentMap = mapName;
            
            // Load events for this map
            await this.loadEvents(mapName);
            
            // Update UI
            document.getElementById('currentMap').textContent = mapName;
            
            console.log(`Map ${mapName} loaded successfully`);
        } catch (error) {
            console.error('Error loading map:', error);
            // Create a simple fallback map
            this.createFallbackMap(mapName);
        }
    }

    async loadEvents(mapName) {
        try {
            this.events = [];
            
            // Try to load events for this map
            const eventFiles = ['EV001', 'EV002', 'EV003', 'EV004', 'EV005', 'EV006'];
            
            for (const eventFile of eventFiles) {
                try {
                    const eventResponse = await fetch(`Data/Events/${mapName}/${eventFile}.json`);
                    if (eventResponse.ok) {
                        const eventData = await eventResponse.json();
                        this.events.push(eventData);
                    }
                } catch (e) {
                    // Event file doesn't exist, continue
                }
            }
            
            console.log(`Loaded ${this.events.length} events for ${mapName}`);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    createFallbackMap(mapName) {
        console.log(`Creating fallback map for ${mapName}`);
        
        // Create a simple 15x20 map with basic tiles
        const map = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 15; x++) {
                // Create borders and some random tiles
                if (x === 0 || x === 14 || y === 0 || y === 19) {
                    row.push([384, null, 396]); // Border tile
                } else {
                    row.push([384, null, null]); // Floor tile
                }
            }
            map.push(row);
        }
        
        this.mapData = {
            map: map,
            propreties: {
                "384": [0, 0],
                "396": [0, 15]
            }
        };
        this.currentMap = mapName;
        this.events = [];
    }

    update(deltaTime) {
        this.handleInput();
        this.updatePlayer(deltaTime);
        this.updateCamera();
    }

    handleInput() {
        if (this.player.moving) return;

        let newX = this.player.mapX;
        let newY = this.player.mapY;
        let direction = this.player.direction;
        let moved = false;

        if (this.keys['w'] || this.keys['arrowup']) {
            newY--;
            direction = 'up';
            moved = true;
        } else if (this.keys['s'] || this.keys['arrowdown']) {
            newY++;
            direction = 'down';
            moved = true;
        } else if (this.keys['a'] || this.keys['arrowleft']) {
            newX--;
            direction = 'left';
            moved = true;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            newX++;
            direction = 'right';
            moved = true;
        }

        this.player.direction = direction;

        if (moved && (newX !== this.player.mapX || newY !== this.player.mapY)) {
            if (this.canMoveTo(newX, newY)) {
                this.player.mapX = newX;
                this.player.mapY = newY;
                this.player.x = newX * this.tileSize;
                this.player.y = newY * this.tileSize;
                this.player.moving = true;
            }
        }

        // Handle interaction
        if (this.keys[' ']) {
            this.handleInteraction();
            this.keys[' '] = false; // Prevent repeated interactions
        }
    }

    canMoveTo(x, y) {
        if (!this.mapData || !this.mapData.map) return false;
        
        // Check map boundaries
        if (y < 0 || y >= this.mapData.map.length || x < 0 || x >= this.mapData.map[0].length) {
            return false;
        }
        
        // Get the tile at the target position
        const tile = this.mapData.map[y][x];
        
        // If tile is null or empty, it's passable
        if (!tile || !tile[0]) {
            return true;
        }
        
        // Check tile properties for collision
        const tileId = tile[0].toString();
        if (this.mapData.propreties && this.mapData.propreties[tileId]) {
            const properties = this.mapData.propreties[tileId];
            // Check if tile has collision flag (property[1] === 15 means impassable)
            if (properties[1] === 15) {
                return false;
            }
        }
        
        return true;
    }

    updatePlayer(deltaTime) {
        if (this.player.moving) {
            // Simple movement - instantly update position and stop moving
            this.player.x = this.player.mapX * this.tileSize;
            this.player.y = this.player.mapY * this.tileSize;
            this.player.moving = false;
        }
    }

    updateCamera() {
        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2 + this.tileSize / 2;
        this.camera.y = this.player.y - this.canvas.height / 2 + this.tileSize / 2;
    }

    handleInteraction() {
        // Check for events at player position or adjacent tiles
        for (const event of this.events) {
            if (event && event[0]) {
                const eventData = event[0];
                const eventX = eventData.x;
                const eventY = eventData.y;
                
                // Check if player is on or adjacent to event
                const dx = Math.abs(this.player.mapX - eventX);
                const dy = Math.abs(this.player.mapY - eventY);
                
                if (dx <= 1 && dy <= 1) {
                    this.triggerEvent(event);
                    return;
                }
            }
        }
    }

    triggerEvent(event) {
        if (!event || !event[1] || !event[1][0]) return;
        
        const eventCommands = event[1][0].commands;
        if (!eventCommands) return;
        
        for (const command of eventCommands) {
            console.log('Executing command:', command);
            
            if (command.startsWith('TRANSFERT_PLAYER:')) {
                // Parse the transfer command
                const jsonStr = command.substring(command.indexOf('{'));
                try {
                    const transferData = JSON.parse(jsonStr.replace(/'/g, '"'));
                    this.transferPlayer(transferData.name, transferData.x, transferData.y);
                } catch (e) {
                    console.error('Error parsing transfer command:', e);
                }
            }
        }
    }

    transferPlayer(mapName, x, y) {
        console.log(`Transferring player to ${mapName} at (${x}, ${y})`);
        this.player.mapX = x;
        this.player.mapY = y;
        this.player.x = x * this.tileSize;
        this.player.y = y * this.tileSize;
        this.loadMap(mapName);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.mapData) return;
        
        this.renderMap();
        this.renderPlayer();
        this.renderEvents();
        this.updateDebugInfo();
    }

    renderMap() {
        if (!this.mapData.map) return;
        
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = startX + Math.ceil(this.canvas.width / this.tileSize) + 1;
        const endY = startY + Math.ceil(this.canvas.height / this.tileSize) + 1;
        
        for (let y = Math.max(0, startY); y < Math.min(this.mapData.map.length, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.mapData.map[y].length, endX); x++) {
                const tile = this.mapData.map[y][x];
                this.renderTile(x, y, tile);
            }
        }
    }

    renderTile(x, y, tile) {
        const screenX = x * this.tileSize - this.camera.x;
        const screenY = y * this.tileSize - this.camera.y;
        
        if (!tile || !tile[0]) {
            // Empty tile - render as dark
            this.ctx.fillStyle = '#111111';
            this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
            return;
        }
        
        const tileId = tile[0].toString();
        
        // Create simple colored tiles based on tile ID for now
        // since we don't have the actual graphics
        let color = this.getTileColor(tileId);
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Add a border for visibility
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Render tile ID for debugging
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(tileId, screenX + this.tileSize / 2, screenY + this.tileSize / 2 + 3);
    }

    getTileColor(tileId) {
        // Map tile IDs to colors for visual representation
        const colorMap = {
            '384': '#4a5568', // Floor - gray
            '396': '#2d3748', // Wall - dark gray
            '512': '#68d391', // Green tile
            '520': '#f6e05e', // Yellow tile
            '528': '#63b3ed', // Blue tile
            '525': '#fc8181', // Red tile
            '536': '#d69e2e', // Orange tile
            '533': '#9f7aea', // Purple tile
            '544': '#38b2ac', // Teal tile
            '499': '#ed8936', // Brown tile
            '507': '#e53e3e', // Dark red tile
            '505': '#38a169'  // Dark green tile
        };
        
        return colorMap[tileId] || '#666666'; // Default gray
    }

    renderPlayer() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        
        // Render player as a simple colored square
        this.ctx.fillStyle = '#FFD700'; // Gold color
        this.ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);
        
        // Add direction indicator
        this.ctx.fillStyle = '#FF0000';
        let indicatorX = screenX + this.tileSize / 2;
        let indicatorY = screenY + this.tileSize / 2;
        
        switch (this.player.direction) {
            case 'up':
                this.ctx.fillRect(indicatorX - 2, indicatorY - 8, 4, 4);
                break;
            case 'down':
                this.ctx.fillRect(indicatorX - 2, indicatorY + 4, 4, 4);
                break;
            case 'left':
                this.ctx.fillRect(indicatorX - 8, indicatorY - 2, 4, 4);
                break;
            case 'right':
                this.ctx.fillRect(indicatorX + 4, indicatorY - 2, 4, 4);
                break;
        }
    }

    renderEvents() {
        for (const event of this.events) {
            if (event && event[0]) {
                const eventData = event[0];
                const screenX = eventData.x * this.tileSize - this.camera.x;
                const screenY = eventData.y * this.tileSize - this.camera.y;
                
                // Render event as a pulsing circle
                const time = Date.now() / 1000;
                const alpha = 0.5 + 0.3 * Math.sin(time * 3);
                
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = '#00FF00';
                this.ctx.beginPath();
                this.ctx.arc(screenX + this.tileSize / 2, screenY + this.tileSize / 2, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }
    }

    updateDebugInfo() {
        document.getElementById('playerPos').textContent = `${this.player.mapX}, ${this.player.mapY}`;
        document.getElementById('fps').textContent = Math.round(this.fps);
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Calculate FPS
        if (deltaTime > 0) {
            this.fps = 1000 / deltaTime;
        }
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Animation system (compatible with existing Database.animation structure)
    addAnimation(animationData) {
        if (animationData && animationData.name) {
            this.animations[animationData.name] = animationData;
            console.log(`Animation added: ${animationData.name}`);
        }
    }

    playAnimation(animationName, x, y) {
        const animation = this.animations[animationName];
        if (!animation) {
            console.warn(`Animation not found: ${animationName}`);
            return;
        }
        
        console.log(`Playing animation: ${animationName} at (${x}, ${y})`);
        // TODO: Implement animation playback
    }
}

// Make Rpg available globally
window.Rpg = Rpg;