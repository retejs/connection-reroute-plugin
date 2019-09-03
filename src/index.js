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
            d += ' ' + ConnectionPlugin.defaultPath([...p[i - 1], ...p[i]], 0.4)


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
            const p = [{ x: x1, y: y1 }, ...pins, { x: x2, y: y2 }];
            let idx = findRightIndex(pin, p)
            pins.splice(idx, 0, pin)

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
    function findRightIndexBack(point, line = []) {
        let minIdx = -1;
        let minDist = Infinity
        for (let index = 0; index < line.length; index++) {
            const point1 = line[index];
            let dist = distance(point, point1)
            if (dist < minDist) {
                minIdx = index
                minDist = dist
            }
        }
        if (minIdx === 0) {
            return 0
        }
        if (minIdx === line.length - 1) {
            return minIdx - 1
        }
        let leftDistBwtTarget = distance(point, line[minIdx - 1])
        let leftDistBwtMinIdx = distance(line[minIdx], line[minIdx - 1])
        if (leftDistBwtTarget < leftDistBwtMinIdx) {
            return minIdx - 1
        }

        return minIdx
    }
    function distance(point0, point1) {
        return Math.sqrt(Math.pow(point1.x - point0.x, 2) + Math.pow(point1.y - point0.y, 2))
    }
    function findRightIndex(point, line = []) {
        let minIdx = -1;
        let minDist = Infinity
        for (let index = 0; index < line.length - 1; index++) {
            if (pointInBound(point, line[index], line[index + 1])) {
                let dist = distanceToLine(point, line[index], line[index + 1])
                if (dist < minDist) {
                    minIdx = index
                    minDist = dist
                }
            }

        }
        if (minIdx === -1) {
            return findRightIndexBack(point, line)
        }
        return minIdx
    }
    /**
     * 
     * @param {{x:number,y:number}} p0 
     * @param {{x:number,y:number}} p1 
     * @param {{x:number,y:number}} p2 
     */
    function pointInBound(p0, p1, p2) {
        let { x: x1, y: y1 } = p1
        let { x: x2, y: y2 } = p2
        let { x: x0, y: y0 } = p0
        if (x1 < x0 && x0 < x2 && y1 < y0 && y0 < y2) {
            return true
        }
        if (x2 < x0 && x0 < x1 && y2 < y0 && y0 < y1) {
            return true
        }
        if (x1 < x0 && x0 < x2 && y1 > y0 && y0 > y2) {
            return true
        }
        if (x2 < x0 && x0 < x1 && y2 > y0 && y0 > y1) {
            return true
        }

        return false
    }
    /**
     * 
     * @param {{x:number,y:number}} p0 
     * @param {{x:number,y:number}} p1 
     * @param {{x:number,y:number}} p2 
     */
    function distanceToLine(p0, p1, p2) {
        let top = (p2.y - p1.y) * p0.x
            - (p2.x - p1.x) * p0.y
            + p2.x * p1.y
            - p2.y * p1.x
        let bot = Math.pow((p2.y - p1.y), 2) + Math.pow((p2.x - p1.x), 2)
        return Math.abs(top) / Math.sqrt(bot)
    }
}

export default {
    install
}