## [2.0.1](https://github.com/retejs/connection-reroute-plugin/compare/v2.0.0...v2.0.1) (2024-01-27)


### Bug Fixes

* **build:** source maps ([9fd5dac](https://github.com/retejs/connection-reroute-plugin/commit/9fd5dacd059099ea3dd3c927cb407f3e81e469e1))

## v2.0.0-beta.7

Breaking changes:

- removed generic from `RerouteExtra` (`RerouteExtra<Schemes>` -> `RerouteExtra`)
- removed generic from `ReroutePlugin` (`new ReroutePlugin<Schemes, AreaExtra>` ->  `new ReroutePlugin<Schemes>`)
- `AreaExtra` should have specified `Area2D<Schemes>` from 'rete-area-plugin'
