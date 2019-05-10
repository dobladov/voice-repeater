const init = async () => {
    Vue.component('card', {
        props: ['image', 'foreign_curr', 'sound', 'index', 'record', 'native_curr', 'path'],
        template: `
            <div class="card">
                <div class="cardMedia">
                    <img :src='path + image' />
                    <div ref="waveform" class="wave">
                    </div>
                </div>
                <p>{{ foreign_curr }}</p>
                <p>{{ native_curr }}</p>
                <button @click="record" >Record</button>
            </div>
        `,
        mounted() {
            const wavesurfer = WaveSurfer.create({
                container: this.$refs.waveform,
                waveColor: '#8F8F8F',
                progressColor: '#FFBC40',
                responsive: true,
                autoCenter: true
            })

            wavesurfer.load(this.$props.path + this.$props.sound);

            wavesurfer.on('error', (err) => {
                console.log(err)
            })

            wavesurfer.on('seek', () => {
                if (!wavesurfer.isPlaying()) {
                    wavesurfer.play()
                }
            })
        }
    })

    Vue.component("uploadCSV", {
        props: ['upload'],
        template: `
            <div class="uploadCSV">
                <label for="upload" >Upload a CSV file</label>
                <input ref="upload" @change="upload" type="file" accept="text/csv" id="upload" webkitdirectory >
            </div>
        `,
    })

    const vm = new Vue({
        el: '#app',
        data() {
            return {
                cards: [],
                path: null
            }
        },
        methods: {
            upload: (el) => {
                vm.cards = []

                if (el.target.files) {
                    const worker = new Worker('processFolder.js')
                    worker.postMessage(el.target.files)
                    worker.onmessage = (msg) => {
                        vm.cards = msg.data.data
                        vm.path = msg.data.path
                    }
                }
            },
            getMedia: async () => {
                let stream = null

                try {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                    console.log(stream)
                } catch(err) {
                    console.log(err)
                }
            }
        },
        template: `
            <main>
                <header class="header">
                    <uploadCSV :upload="this.upload" />
                </header>

                <ul class="cards">
                    <li v-for="(element, index) in cards">
                        <card
                            :image='element.image.replace(/"/g, "#").match(/##(.*)##/)[1]'
                            :foreign_curr="element.foreign_curr"
                            :sound="element.sound.replace('[sound:', '').replace(']', '')"
                            :index="index"
                            :record="getMedia"
                            :native_curr="element.native_curr"
                            :path="path"
                        />
                    </li>
                </ul>
            </main>
        `
    })
}

init()

// Pagination
// Record voice
    // Request permision