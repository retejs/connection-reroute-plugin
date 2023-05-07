## v2.0.0-beta.7

Breaking changes:

- removed generic from `RerouteExtra` (`RerouteExtra<Schemes>` -> `RerouteExtra`)
- removed generic from `ReroutePlugin` (`new ReroutePlugin<Schemes, AreaExtra>` ->  `new ReroutePlugin<Schemes>`)
- `AreaExtra` should have specified `Area2D<Schemes>` from 'rete-area-plugin'
