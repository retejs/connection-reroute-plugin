Connection Reroute
====
#### Rete.js plugin

```js
import ConnectionReroutePlugin from 'rete-connection-reroute-plugin';

editor.use(ConnectionReroutePlugin);
```

Customize:

```js
import * as d3 from 'd3-shape';

editor.use(ConnectionReroutePlugin, {
    // defaut values
    curve: d3.curveCatmullRom.alpha(1), 
    curvature: 0.05 
});
```
