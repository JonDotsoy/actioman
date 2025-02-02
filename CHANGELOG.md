# Changelog

## [0.4.0](https://github.com/JonDotsoy/actioman/compare/actioman-v0.3.0...actioman-v0.4.0) (2025-02-02)


### Features

* **actions:** add configs to Actions.fromModule ([bb2b8bc](https://github.com/JonDotsoy/actioman/commit/bb2b8bc31979ea132d6e9c24e2f3210b1593607d))
* **auth:** Implement JWT-based authentication ([b361302](https://github.com/JonDotsoy/actioman/commit/b361302cebe75080e8cd6022a10cd574c3075bc3))
* **configs:** add integration module and configs class ([d84d68d](https://github.com/JonDotsoy/actioman/commit/d84d68df1692b3dbceb05e1bd19df579353aeda7))
* **http-router:** add optional configs to HTTPLister.fromModule ([6b20c38](https://github.com/JonDotsoy/actioman/commit/6b20c381cfcccc70462dbeaf4a871d09b81ff192))
* **http-router:** add support for custom configs ([5de5bfd](https://github.com/JonDotsoy/actioman/commit/5de5bfd57a3639c6e3f0a1e2e0b903921d8c2110))
* **shell:** Add process ID to background shell and ability to kill it ([7d76d09](https://github.com/JonDotsoy/actioman/commit/7d76d0930a17fa3b1bfe21e2c9feecd7e28a65b6))

## [0.3.0](https://github.com/JonDotsoy/actioman/compare/actioman-v0.2.0...actioman-v0.3.0) (2025-02-01)


### Features

* Add Configs class to manage application settings ([0d8a184](https://github.com/JonDotsoy/actioman/commit/0d8a1842ed85baafe7b9e98039b7653919ca41d3))
* Add Configs module import to bootstrap script ([f5f7573](https://github.com/JonDotsoy/actioman/commit/f5f7573591a7cb13f61f9af93bdcd5964196ccb7))
* add function to find configs factory file module ([e6fcd08](https://github.com/JonDotsoy/actioman/commit/e6fcd08337225036d40bc92f5451f63f4b218099))
* add module loaders for various file formats ([c72cf24](https://github.com/JonDotsoy/actioman/commit/c72cf243fbc66cf9f4ffa88814f39ea3f927bfe3))
* **configs/modules/factory:** Add support for multiple config file formats ([ef20fbb](https://github.com/JonDotsoy/actioman/commit/ef20fbb19bd651da16e81b1b1107d85ed869ba06))
* **http-listen-action:** Add configs factory and workspace location ([66d86c8](https://github.com/JonDotsoy/actioman/commit/66d86c87a98ce963608228b721acb01a44f9d982))
* **http-listen-action:** add configs to HTTPLister ([983073f](https://github.com/JonDotsoy/actioman/commit/983073fd1570b8ce0005e2b95840aa06d5b61a2e))
* **server-script:** Add configs factory module to server script ([1822dd7](https://github.com/JonDotsoy/actioman/commit/1822dd7eb8ff0b89a174e810d640bb37e4813902))

## [0.2.0](https://github.com/JonDotsoy/actioman/compare/actioman-v0.1.0...actioman-v0.2.0) (2025-01-31)


### Features

* Add `// [@ts-nocheck](https://github.com/ts-nocheck)` to generated code ([3e8f38e](https://github.com/JonDotsoy/actioman/commit/3e8f38e2fd72d00b290c402699793b4a6b2bd866))

## [0.1.0](https://github.com/JonDotsoy/actioman/compare/actioman-v0.0.8...actioman-v0.1.0) (2025-01-30)


### Features

* **actioman-lock-document:** add JSON serialization and deserialization ([ca48a2a](https://github.com/JonDotsoy/actioman/commit/ca48a2ab01414b6c6660ea0678a28046bf398bfd))
* **actioman-lock-document:** Add keys() method to return record keys ([14ff71c](https://github.com/JonDotsoy/actioman/commit/14ff71cbfb1a0201be06d6e706d9275f6a295c88))
* **actioman-lock-document:** Implement JSONL-based document storage ([edd718d](https://github.com/JonDotsoy/actioman/commit/edd718d6a6095da7329a47fa9828de497ecb88e9))
* **actioman-lock-file:** add SHA-256 hash to lock file ([d7eb266](https://github.com/JonDotsoy/actioman/commit/d7eb2664282a3861eecdddf100b6e0e807961d86))
* **actioman:** add README with basic usage ([d6928c8](https://github.com/JonDotsoy/actioman/commit/d6928c84bff2281f1f08b55ffae0a8d71a083f06))
* **actioman:** Improve test setup and add new action ([43666f5](https://github.com/JonDotsoy/actioman/commit/43666f50890d14ce84afd0dc7677d759e8d67bbe))
* **actions-target:** add input and output validation ([1f6db79](https://github.com/JonDotsoy/actioman/commit/1f6db796ee49772b2164f093327cfcd7924f1150))
* **actions:** add export for shared actions ([94a42ff](https://github.com/JonDotsoy/actioman/commit/94a42ff32e737c0fc03075f6b55a07986ff157b4))
* **actions:** add new actions and tests ([041cd91](https://github.com/JonDotsoy/actioman/commit/041cd91e5cacb862261be5665afa1a650dfe9ac4))
* add --cwd flag to serve command ([fff34a3](https://github.com/JonDotsoy/actioman/commit/fff34a39848b899a726f6bda380bb86821a582dd))
* add .editorconfig file for consistent coding style ([b94c6e9](https://github.com/JonDotsoy/actioman/commit/b94c6e965966ac3e75917122d616e7cbd529e291))
* add .gitignore file for Node.js project ([8e356f7](https://github.com/JonDotsoy/actioman/commit/8e356f7da44a6a5d9d669b560bd257798c219708))
* add 'lib' directory to .gitignore ([e596dfa](https://github.com/JonDotsoy/actioman/commit/e596dfafcbf174c00c03445026d7c35eddb30c59))
* Add @jondotsoy/splitg dependency and CLI entry point ([f0f9b35](https://github.com/JonDotsoy/actioman/commit/f0f9b358d4338f4ead684cad6f0df8490d3cdff5))
* Add Actioman lock file location utility ([0b7dd39](https://github.com/JonDotsoy/actioman/commit/0b7dd39705e3136d229369a3f2a94b5c237340d2))
* add action document template ([8cf9897](https://github.com/JonDotsoy/actioman/commit/8cf9897885be652e5b071d3ec090f04c122cffcb))
* add ActionmanLockFile class ([5e72470](https://github.com/JonDotsoy/actioman/commit/5e724704246059da0b4e23e8377fc41c17a7a1f2))
* Add Bun and Node.js versions to .tool-versions ([4e05a89](https://github.com/JonDotsoy/actioman/commit/4e05a897ab49f6f9e73022c4e9d132df62dfad6c))
* Add command-line interface for Actioman ([0657225](https://github.com/JonDotsoy/actioman/commit/0657225d6be84bd529f6367ebdfafd80cc0397df))
* add new test case for action serving ([10e3c0a](https://github.com/JonDotsoy/actioman/commit/10e3c0a9317d6ce5db3aee462523fcd0116f9dc3))
* add port and host to serve command ([db0491e](https://github.com/JonDotsoy/actioman/commit/db0491e060f72b8572f8b92cb99c2d15239ba4b5))
* add remote actions lock file management ([a39ec35](https://github.com/JonDotsoy/actioman/commit/a39ec35328ede48bb9d694beb6d2a3a0f6538a60))
* Add remote management to ActionmanLockFile ([dc0d691](https://github.com/JonDotsoy/actioman/commit/dc0d6915600e61c44a4235a8f806a55640e0bd40))
* add support for importing remote actions ([6bcd300](https://github.com/JonDotsoy/actioman/commit/6bcd300bc2ad51a8a4b598886a1ad2f3310bcd81))
* add TypeScript types to package.json exports ([8274021](https://github.com/JonDotsoy/actioman/commit/8274021e00cf039a6026ae1a1339683402d1bf92))
* **build:** add build script and clean target ([fe500b3](https://github.com/JonDotsoy/actioman/commit/fe500b392e3bc9bd43f6d4844be246979d9232c1))
* Bump version to 0.0.3 ([48d3b76](https://github.com/JonDotsoy/actioman/commit/48d3b76350b7549314260a63cb96a7b9c1d88dc1))
* **cli:** Add getCWD utility function ([0c5f2d8](https://github.com/JonDotsoy/actioman/commit/0c5f2d810a7ad5cb9b87f488e2b0807b29c3a1c5))
* **cli:** Add help message for template command ([bf6f86e](https://github.com/JonDotsoy/actioman/commit/bf6f86eec7fd5eff716826c59cd8472b95623cfa))
* **cli:** add install command to prepare remotes ([a4a9345](https://github.com/JonDotsoy/actioman/commit/a4a934594bc1c91fd48cf9edadb61489868fa9bc))
* **cli:** add serve command and actions support ([be110df](https://github.com/JonDotsoy/actioman/commit/be110dfb8ce95386ceca279601e87746be874eba))
* **cli:** add support for custom working directory ([bba092e](https://github.com/JonDotsoy/actioman/commit/bba092eccf6e6178d1f900a6ca911aefeed3ac61))
* **dependencies:** Add optional Express and types ([f71db0c](https://github.com/JonDotsoy/actioman/commit/f71db0c0b4d6adfddb9836d1176697ac87b30349))
* **exporter-actions:** Add actionsTargetModuleLocation parameter ([4d4429c](https://github.com/JonDotsoy/actioman/commit/4d4429c737900bbd99a42236d164fab6d14490d2))
* **exporter-actions:** add support for creating ActionsDocument from HTTP server ([a2fa97e](https://github.com/JonDotsoy/actioman/commit/a2fa97ec5cdb8ecab2cc893433ca95ec7bcfb803))
* **exporter-actions:** add support for importing actions from HTTP server ([dfece00](https://github.com/JonDotsoy/actioman/commit/dfece00293409cf7077ab4a80245f96a6d438483))
* **exporter-actions:** Add tests and implementation for exporting and importing actions ([d45cf55](https://github.com/JonDotsoy/actioman/commit/d45cf551112e7257ed89c21c3e3387d17309dd95))
* **exporter-actions:** deprecate legacy actions import/export ([9f65b29](https://github.com/JonDotsoy/actioman/commit/9f65b2940e79b00372fce6bf615dad651da0a9dd))
* **http-listen-action:** Add HTTP listener functionality ([276d9fc](https://github.com/JonDotsoy/actioman/commit/276d9fcfda1123e687e3141fb703f30a504a0e78))
* **http-listen-action:** add support for environment variables ([8e75243](https://github.com/JonDotsoy/actioman/commit/8e75243cc0501ce06d091904fc6ae9cd3e0ba97d))
* **http-listener:** add silent option to listen method ([6ea6244](https://github.com/JonDotsoy/actioman/commit/6ea6244369ee26e1351b582d93ec57aabb0b7720))
* **http-listener:** Implement HTTP listener with automatic port discovery ([9b7dfe1](https://github.com/JonDotsoy/actioman/commit/9b7dfe1aceba892d9036ae9b23aa3887216eaf73))
* **http-router:** add actions metadata endpoint and improve error handling ([dde0416](https://github.com/JonDotsoy/actioman/commit/dde041649d3417dd2b3642c0d82ecd82b745eb0e))
* **http-router:** Implement HTTP router for Actioman actions ([8f12950](https://github.com/JonDotsoy/actioman/commit/8f12950addf4c7da222eddfc927c35116597c64b))
* **http-router:** Simplify action imports and remove zod-to-json-schema ([e23a2c2](https://github.com/JonDotsoy/actioman/commit/e23a2c2bf6c285cef3b27346826d020b3f913956))
* Implement a simple JSON database ([339c007](https://github.com/JonDotsoy/actioman/commit/339c007d14ea7c34725224fa9781e4925a3d437f))
* Implement cache-based workspace setup ([715ac0a](https://github.com/JonDotsoy/actioman/commit/715ac0a234c6fcbd33e2e574b23bc9d65c233b65))
* Implement prepare-workspace utility ([ada2ddb](https://github.com/JonDotsoy/actioman/commit/ada2ddb98b2781c0da6224834b111f5720953d74))
* Implement shell command execution and testing ([ece583e](https://github.com/JonDotsoy/actioman/commit/ece583ec8b4574622da288eb5e434ad2fc70e467))
* **import-remote-actions:** Add DTS file generation ([3c171a5](https://github.com/JonDotsoy/actioman/commit/3c171a5b00c09e37951161d22e6b4f5ef0e9407e))
* **import-remote-actions:** Add functionality to import remote actions ([360077b](https://github.com/JonDotsoy/actioman/commit/360077ba1f105cb4cf98e7fda7b50d59c7ee07d1))
* **import-remote-actions:** Add support for tracking imported actions ([69d5c3f](https://github.com/JonDotsoy/actioman/commit/69d5c3f4eb3bce7a615526caf5e3ffba10124b68))
* **import-remote-actions:** Implement remote action import ([b8e6e54](https://github.com/JonDotsoy/actioman/commit/b8e6e5413fd53677cc487b7918d054b5cc12da6b))
* **import-remote-actions:** Improve error handling and file path ([19b575b](https://github.com/JonDotsoy/actioman/commit/19b575b53f3747bb1249808ae969205bdd007a3c))
* **import-remote-actions:** Refactor JsonDB and use ActionmanLockFile ([f45c1ad](https://github.com/JonDotsoy/actioman/commit/f45c1ad46f199541b593bce3b7f89923d64e2f64))
* Improve actions document generation ([71ef60f](https://github.com/JonDotsoy/actioman/commit/71ef60fffe20f772db24e1779637bd04a28faa21))
* Improve HTTP router and action handling ([be66d5b](https://github.com/JonDotsoy/actioman/commit/be66d5b1a404d7cccba1ad736a58421a8389f256))
* improve workspace preparation for tests ([8d14c76](https://github.com/JonDotsoy/actioman/commit/8d14c76989ff1b12101d84b2b5ac3e3d1be6381d))
* **install:** Add support for installing remote actions ([1a1ced8](https://github.com/JonDotsoy/actioman/commit/1a1ced866995e609dba48d7d05390e1250b43c02))
* **package.json:** add ESM exports for actions ([55630a3](https://github.com/JonDotsoy/actioman/commit/55630a3f72a1e0455462f56263f263817c871eca))
* **package.json:** add new package dependencies and scripts ([cd02128](https://github.com/JonDotsoy/actioman/commit/cd021281ac330120e1ae2fc7f1503ea73d95dddd))
* **prepare-workspace:** add verbose option and rename showLogs ([8462c84](https://github.com/JonDotsoy/actioman/commit/8462c84305c624924caa94df642a06bc306e4b8b))
* **release:** Add GitHub Actions workflow for package release ([8662d20](https://github.com/JonDotsoy/actioman/commit/8662d2014bafa84fb515bcff4a3ccb5264c9216f))
* **scripts:** add functions to find actioman modules ([8b980c9](https://github.com/JonDotsoy/actioman/commit/8b980c943f0f2e7285824bda79e2e83e5cb9c33c))
* **serve:** Add support for custom HTTP port ([1c57df8](https://github.com/JonDotsoy/actioman/commit/1c57df8c95bebfb16f89ee967f2ba598c8e5c506))
* **serve:** Add unit tests for serve command ([53013c0](https://github.com/JonDotsoy/actioman/commit/53013c0d2530360a7fc75de886af2bf8fa4a67be))
* **server-script:** Generate bootstrap HTTP listener file ([8cfd5d1](https://github.com/JonDotsoy/actioman/commit/8cfd5d1e9d4a51cfef132f795bd412447d87bb5b))
* **share-actions-document:** add unit tests for share actions template ([215471e](https://github.com/JonDotsoy/actioman/commit/215471e0ac3aa3a4ac28c9a4efd0a849907a903f))
* **share-actions:** Add empty share actions module ([bd35f72](https://github.com/JonDotsoy/actioman/commit/bd35f72c666642f290cfcf5082669fe0c1b810cb))
* **share-actions:** Rename `shareActions` to `____shareActions` ([3a6cfe8](https://github.com/JonDotsoy/actioman/commit/3a6cfe88d20f4ccfa876b11adce5c69c3987352e))
* **shell:** add "pipe" output mode and background execution ([951ec62](https://github.com/JonDotsoy/actioman/commit/951ec6215fd80a3845cddaea480339da328c3fd7))
* **shell:** add `appendEnvs` method and improve `quiet` method ([6709a9c](https://github.com/JonDotsoy/actioman/commit/6709a9cf3c9a2501d41ced5ec04294b628c8cb0f))
* **shell:** add background execution and abort support ([8ced24a](https://github.com/JonDotsoy/actioman/commit/8ced24aee281cc7013c86da7b15b3747256fcd37))
* **shell:** add cwd and env helpers ([16e7991](https://github.com/JonDotsoy/actioman/commit/16e799184728da90c72c5e7ef4c1d5df94caa591))
* **tsconfig:** add tsconfig.esm.json for ESM builds ([e3bcfc5](https://github.com/JonDotsoy/actioman/commit/e3bcfc5f26089644c1b2ae838b7a22e2033d3740))
* **tsconfig:** enable latest TypeScript features ([0eaa88f](https://github.com/JonDotsoy/actioman/commit/0eaa88f675dbd2e385d78cc8d436bd4efb90213b))
* Update CLI commands and tests ([60263a7](https://github.com/JonDotsoy/actioman/commit/60263a7a6405510738f5049c7ae43c9a1b8a715e))


### Bug Fixes

* **http-router:** Use ES module syntax for imports ([4280e1a](https://github.com/JonDotsoy/actioman/commit/4280e1af448f1e011d482f00c822516fb49c54cc))
* **package.json:** update ([55630a3](https://github.com/JonDotsoy/actioman/commit/55630a3f72a1e0455462f56263f263817c871eca))
* **templates:** update action document template path ([ca9a872](https://github.com/JonDotsoy/actioman/commit/ca9a87294de593fb554669a4eaa1e31295e8d8f2))
