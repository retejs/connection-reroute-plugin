import Vue from 'vue';
import * as ConnectionPlugin from 'rete-connection-plugin';
import Pins from './Pins.vue';
import { findRightIndex } from './utils';

function install(editor) {
    editor.on('connectionpath', data => {
        const { connection } = data;
        const [x1, y1, x2, y2] = data.points;
        const pins = connection && connection.data.pins ? connection.data.pins : [];
        const points = [[x1, y1], ...pins.map(({ x, y }) => [x, y]), [x2, y2]];

        let d = '';

        for (var i = 1; i < points.length; i++) {
            d += ' ' + ConnectionPlugin.defaultPath([...points[i - 1], ...points[i]], 0.4);
        }

        data.d = d;
    });
    editor.on('renderconnection', ({ el, connection }) => {
        const path = el.querySelector('.connection path');
        const pins = connection.data.pins || (connection.data.pins = []);

        if (!path) throw new Error('<path> not found');

        path.addEventListener('click', () => {
            const { mouse } = editor.view.area;
            const pin = { ...mouse };
            const [x1, y1, x2, y2] = editor.view.connections.get(connection).getPoints();
            const points = [{ x: x1, y: y1 }, ...pins, { x: x2, y: y2 }];
            const index = findRightIndex(pin, points);

            pins.splice(index, 0, pin)

            app.$children[0].$forceUpdate();
            editor.view.connections.get(connection).update();
        });

        const vueContainer = document.createElement('div');

        el.appendChild(vueContainer);

        const app = new Vue({
            provide: {
                editor,
                connection
            },
            render: h => h(Pins, { props: { pins } })
        }).$mount(vueContainer)
    })
}

export default {
    name: 'connection-reroute',
    install
}