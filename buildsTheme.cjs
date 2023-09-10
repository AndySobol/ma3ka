const StyleDictionary = require('style-dictionary');
const { registerTransforms, permutateThemes } = require('@tokens-studio/sd-transforms');
const { promises } = require('fs');

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary, {
  expand: { composition: true, typography: true, border: false, shadow: false },
  excludeParentKeys: false,
});

// example value transform, which just returns the token as is
StyleDictionary.registerTransform({
  type: 'value',
  name: 'colors/hex8flutter',
  matcher: prop => {
		return prop.attributes.category === 'colors'
	},
	transformer: prop => {
		var str = Color(prop.value).toHex8().toUpperCase();
		return `Color(0x${str.slice(6)}${str.slice(0, 6)})`;
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
				transforms: ["attribute/cti", "name/cti/camel", "color/hex8flutter", "size/flutter/remToDouble", "content/flutter/literal", "asset/flutter/literal", "font/flutter/literal", "colors/hex8flutter"],
				files: [
					{
						destination: `vars-${name}.dart`,
						format: 'flutter/class.dart',
					},
				],
			},
			flutterSeparate:{
				buildPath: 'build/flutterSeparate/',
				transforms: ["attribute/cti", "name/cti/camel", "color/hex8flutter", "size/flutter/remToDouble", "content/flutter/literal", "asset/flutter/literal", "font/flutter/literal", "colors/hex8flutter"],
				files:[{
					destination: `vars-${name}.dart`,
					format: 'flutter/class.dart',
					className:'StyleDictionaryColor',
					type: 'color',
					filter:{
						attributes:{
							category:'colors'
						},
					},
				}],
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


