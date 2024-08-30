## [2.0.3](https://github.com/retejs/connection-reroute-plugin/compare/v2.0.2...v2.0.3) (2024-08-30)


### Bug Fixes

* update cli and fix linting errors ([a8c5694](https://github.com/retejs/connection-reroute-plugin/commit/a8c5694c375302acd15124abe76817ca701a2710))

## [2.0.2](https://github.com/retejs/connection-reroute-plugin/compare/v2.0.1...v2.0.2) (2024-08-12)


### Bug Fixes

* support shadow dom on pointerdown event ([47123b4](https://github.com/retejs/connection-reroute-plugin/commit/47123b43b46275d1c0cfc3b683bdf3ef2316e2f7))

## [2.0.1](https://github.com/retejs/connection-reroute-plugin/compare/v2.0.0...v2.0.1) (2024-01-27)


### Bug Fixes

* **build:** source maps ([9fd5dac](https://github.com/retejs/connection-reroute-plugin/commit/9fd5dacd059099ea3dd3c927cb407f3e81e469e1))

## v2.0.0-beta.7

Breaking changes:

- removed generic from `RerouteExtra` (`RerouteExtra<Schemes>` -> `RerouteExtra`)
- removed generic from `ReroutePlugin` (`new ReroutePlugin<Schemes, AreaExtra>` ->  `new ReroutePlugin<Schemes>`)
- `AreaExtra` should have specified `Area2D<Schemes>` from 'rete-area-plugin'
