const StyleDictionary = require('style-dictionary');
const { registerTransforms, permutateThemes } = require('@tokens-studio/sd-transforms');
const { promises } = require('fs');

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary, {
  expand: { composition: false, typography: false, border: false, shadow: false },
  excludeParentKeys: false,
});

// example value transform, which just returns the token as is
StyleDictionary.registerTransform({
  type: 'value',
  name: 'myCustomTransform',
  matcher: (token) => {},
  transformer: (token) => {
    return token; // <-- transform as needed
  },
});

// format helpers from style-dictionary
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

async function run() {
  const $themes = JSON.parse(await promises.readFile('tokens/$themes.json', 'utf-8'));
  const themes = permutateThemes($themes, { seperator: '_' });
  const configs = Object.entries(themes).map(([name, tokensets]) => ({
    source: tokensets.map(tokenset => `tokens/${tokenset}.json`),
    platforms: {
			flutter: {
				buildPath: 'build/flutter/',
				transformGroup: 'flutter',
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

run();


