import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const charactersDir = resolve(__dirname, '../../assets/data/characters');

/** Dev-only: POST /__studio/save writes a validated CharacterDef back into the repo. */
function saveCharacters(): Plugin {
  return {
    name: 'bb-save-characters',
    configureServer(server) {
      server.middlewares.use('/__studio/save', (req, res) => {
        if (req.method !== 'POST') return void res.writeHead(405).end();
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', async () => {
          // Load the schema through Vite: the config itself runs in plain Node, which can't import TS packages.
          const { CharacterDef } = (await server.ssrLoadModule('@bb/schema')) as typeof import('@bb/schema');
          const parsed = CharacterDef.safeParse(JSON.parse(body));
          if (!parsed.success) return void res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify(parsed.error.issues));
          writeFileSync(`${charactersDir}/${parsed.data.id}.json`, JSON.stringify(parsed.data, null, 2) + '\n');
          res.writeHead(200).end('saved');
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), saveCharacters()],
  server: { host: true, port: 5174 },
  build: { chunkSizeWarningLimit: 2000 },
});
