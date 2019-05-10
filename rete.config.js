import vue from 'rollup-plugin-vue';

export default {
    input: 'src/index.js',
    name: 'ConnectionReroutePlugin',
    globals: {
        'vue': 'Vue',
        'rete-connection-plugin': 'ConnectionPlugin'
    },
    plugins: [
        vue()
    ]
}