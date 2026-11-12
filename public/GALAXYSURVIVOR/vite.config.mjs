import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The standalone preview deliberately uses classic scripts. Copy those exact files
// into the Vite bundle because Vite does not bundle classic <script> elements.
function copyClassicScripts() {
  return {
    name: 'copy-classic-game-scripts',
    generateBundle() {
      for (const name of ['season-config.js', 'season-pass-config.js', 'drop-config.js', 'shop-catalog.js', 'pixel-art.js', 'boss-explosion.js', 'game-config.js', 'web-ads-config.js', 'web-ads.js', 'game-audio.js', 'app.js']) {
        this.emitFile({ type: 'asset', fileName: name, source: readFileSync(resolve(name)) });
      }
      this.emitFile({ type: 'asset', fileName: 'assets/escort-drone.svg', source: readFileSync(resolve('assets/escort-drone.svg')) });
      for (const name of ['ship-ark-v1.png','ship-manta-v1.png','ship-forge-v1.png','drone-ark-v1.png','drone-manta-v1.png','drone-forge-v1.png','pilot-select-v1.png','augment-icons-pixel-v2.png','player-arcade-v1.png','escort-arcade-v1.png','station-arcade-v1.png','hangar-arcade-v1.png','boss-arcade-0.png','boss-arcade-1.png','boss-arcade-2.png','boss-arcade-3.png','boss-arcade-4.png','boss-arcade-5.png','enemy-scout-arcade-v1.png','enemy-hunter-arcade-v1.png','enemy-gunner-arcade-v1.png','enemy-charger-arcade-v1.png','enemy-venom-arcade-v1.png','enemy-side-arcade-v1.png','enemy-turret-arcade-v1.png']) this.emitFile({ type: 'asset', fileName: 'assets/'+name, source: readFileSync(resolve('assets',name)) });
    },
  };
}
export default defineConfig({ base: './', plugins: [copyClassicScripts()] });

