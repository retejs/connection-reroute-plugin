import * as ConnectionPlugin from 'rete-connection-plugin';
import Pins from './Pins.vue';
import Vue from 'vue';

function install(editor) {

    editor.on('connectionpath', data => {
        const { connection } = data;
        const [x1, y1, x2, y2] = data.points;
        const pins = connection && connection.data.pins ? connection.data.pins : [];
        const p = [[x1, y1], ...pins.map(({ x, y }) => [x, y]), [x2, y2]];

        let d = '';

        for (var i = 1; i < p.length; i++)
            d += ' '+ConnectionPlugin.defaultPath([...p[i - 1], ...p[i]], 0.4)

        data.d = d;
    });

    editor.on('renderconnection', ({ el, connection }) => {
        const path = el.querySelector('.connection path');
        const pins = connection.data.pins || (connection.data.pins = []);

        if (!path) throw new Error('<path> not found');

        path.addEventListener('click', () => {
            const { mouse } = editor.view.area;
            const pin = { ...mouse };

            pins.push(pin);
            
            app.$children[0].$forceUpdate();
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
    install
}