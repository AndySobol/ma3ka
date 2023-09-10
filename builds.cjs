const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');

registerTransforms(StyleDictionary, {
  /* options here if needed */
});

async function run() {
  const $themes = JSON.parse(await promises.readFile('$themes.json', 'utf-8'));
  const themes = permutateThemes($themes, { seperator: '_' });
  const configs = Object.entries(themes).map(([name, tokensets]) => ({
    source: tokensets.map(tokenset => `${tokenset}.json`),
    platforms: {
      flutter: {
        transformGroup: 'tokens-studio',
        files: [
          {
            destination: `vars-${name}.dart`,
            format: 'flutter/class.dart',
          },
        ],
      },
    },
  }));

  configs.forEach(cfg => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms(); // optionally, cleanup files first..
    sd.buildAllPlatforms();
  });
}
