# NC-Game

Ett klassiskt 2D RPG-spel återupplivat från 2012! Detta spel har nu gjorts spelbart med en modern HTML5 Canvas-baserad RPG-engine.

## Hur man spelar

### Starta spelet
1. Öppna `index.html` i en webbläsare
2. Eller kör en lokal server och navigera till projektmappen

### Kontroller
- **WASD** eller **Piltangenter** - Förflyttar spelaren
- **Mellanslag** - Interagera med objekt/händelser
- **Musklick på kartknapparna** - Byta mellan olika kartor

### Funktioner
- ✅ Spelarrörelse med kollisionsdetektering
- ✅ Kartladdning från original JSON-data
- ✅ Händelsesystem (gröna pulsande cirklar)
- ✅ Karttransfer mellan olika områden
- ✅ Animationsdatabas från originalspelet
- ✅ Realtids-debug information
- ✅ 60 FPS spelupplevelse

### Tillgängliga kartor
- **Kontor** - Kontorsområdet
- **Mötesrum** - Mötesrummet
- **Korridor** - Korridoren
- **Utanför Badhus** - Badhusets uteområde
- **Karta 001** - Allmän spelkarta

## Teknisk information

### Arkitektur
- **HTML5 Canvas** för rendering
- **JavaScript ES6+** för spelengine
- **JSON** för kart- och händelsedata
- **Modular design** som följer original Database-mönstret

### Filer
- `index.html` - Huvudsida med spelet
- `js/rpg-engine.js` - Huvudspelengine
- `Database/Animation.js` - Originalanimationsdatabas
- `Data/Maps/` - JSON-kartdata från originalspelet
- `Data/Events/` - JSON-händelsedata från originalspelet

### Utveckling
För att köra spelet lokalt:
```bash
# Starta en lokal HTTP-server
python3 -m http.server 8000

# Navigera till http://localhost:8000
```

## Originalspel från 2012
Detta spel baseras på den ursprungliga NC-Game från 2012, med bevarad data och logik men en helt ny modern spelengine som gör det spelbart i moderna webbläsare.

### Vad som återskapats:
- ✅ Komplett kartdata och strukturer
- ✅ Händelsesystem med TRANSFERT_PLAYER-funktionalitet  
- ✅ Animationsdatabas med alla originalanimationer
- ✅ Tile-baserad rendering med kollision
- ✅ Spelarkontroller och rörelse

### Framtida förbättringar:
- [ ] Grafiska tillgångar (PNG-filer för tiles och sprites)
- [ ] Ljudeffekter och musik (OGG-filer)
- [ ] Avancerade animationer och effekter
- [ ] Dialogsystem
- [ ] Inventory och föremålssystem