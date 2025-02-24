# Setting Up Server
## 1. Installing express with TypeScript
```bash
npm i -D typescript tsx @types/express
npm i express
```
## 2. Setting up tsconfig.json
```json
{
  "compilerOptions": {
    "module": "ESNext", // Use ESNext for ESM
    "target": "ES2020", // Target modern ECMAScript versions
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist", // Output directory for compiled files
    "strict": true, // Enable strict type-checking options
    "skipLibCheck": true, // Skip type checking of declaration files
    "resolveJsonModule": true, // Include JSON imports
    "forceConsistentCasingInFileNames": true,
    "noEmit": false, // Allow emitting output
    "isolatedModules": true, // Required for using ESM modules
    "baseUrl": ".", // Allow absolute imports relative to project root
    "paths": {
      "*": ["node_modules/*"]
    }
  }
}
```
## 3. Set the script inside package.json
```json
 "type": "module",
 "scripts": {
    "dev": "tsx --watch --env-file .env src/server.ts",
    "build": "tsc"
  },
```
## 4. Create the basic express server (Maintain the file structure)
- `src/server.ts`
```ts
import express from "express";

const app = express();

const PORT = process.env.PORT || 8080;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
  });

```
- Add .gitignore
```
node_modules
dist
.env
```
## 5. Setup basic middlewares (cors, helmet, morgan, winston)
```bash
npm install cors helmet morgan winston 
npm i --save-dev @types/cors @types/helmet @types/morgan @types/winston
```
- Setup cors & helmet
- Setup logging with winston & morgan (setup winston inside src/utils/logger.ts)
## 6. Setup common responses inside src/utils/responses.ts
- successResponse
- errorResponse
## 7. Setup error handling middlewares
- errorHandler
- notFoundHandler