# Caseinlämningar för Grebban 2025

Detta repository innehåller två separata projekt:

1. **Frontend** - ReactN-spel som är implementerat i TypeScript med Vite.js.
2. **Backend** - REST API byggt med Node.js och Express.

Varje del kan köras och testas lokalt enligt instruktionerna nedan.

---

## Frontend-uppgiften

### Live-demo(deployad)
En live-demo av frontend-implementationen finns här:

> **Länk:** [Azure-static-web-app](https://polite-mushroom-067393003.6.azurestaticapps.net/)

### Krav
Om inte redan installerat, så behövs [node](https://nodejs.org/en/download)

### Installation och körning
1. Gå in i `/frontend`:
   ```bash
   cd Intervjuer/frontend
   ```
2. Installera beroenden:
   ```bash
   npm install
   ```
3. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```
4. Öppna [http://localhost:5173](http://localhost:5173) i webbläsaren.

5. För att ändra dimensionerna av pusslet går det att ändra antalet rader och columner på rad **57** i `sliding.tsx`:
   ```typescript
    const ReactNPuzzle: React.FC<ReactNPuzzleProps> = ({ rows = x, cols = y }) =>{...}
    ```
Där `x` och `y` kan ersättas till önskat antal

---

## Backend-uppgiften

### Ramverk
- Ramverk: Express

### Krav
Om inte redan installerat, så behövs [node](https://nodejs.org/en/download)

### Installation och körning
1. Navigera till backend-mappen:
   ```bash
   cd Intervjuer/backend
   ```
2. Installera beroenden:
   ```bash
   npm install
   ```
3. (Valfritt) Kör unit-tester:
   ```bash
   npm test
   ```
De testar både `serverLocal` och `server`. 

`serverLocal` är för att testa implementationen lokalt utan live-url med möjlighet att modifiera data

4. Starta servern:
   ```bash
   node server.js
   ```
5. API:et körs nu på [http://localhost:3003](http://localhost:3003).



