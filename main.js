const init = async () => {
    Vue.component('card', {
        props: ['image', 'foreign_curr', 'sound', 'index', 'record'],
        template: `
            <div class="card">
                <div class="cardMedia">
                    <img :src='"./data/" + image' />
                    <div ref="waveform" class="wave">
                    </div>
                </div>
                <p>{{ foreign_curr }}</p>
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

            wavesurfer.load("./data/" + this.$props.sound);

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
                <input ref="upload" @change="upload" type="file" accept="text/csv" id="upload" >
            </div>
        `,
    })

    const vm = new Vue({
        el: '#app',
        data() {
            return {
                cards: []
            }
        },
        methods: {
            parseCSV: (csv) => {
                let data = [];

                let newLinebrk = csv.split("\n");
                const titles = newLinebrk[0].split(',')
                for(let i = 1; i < newLinebrk.length; i++) {
                    const line = newLinebrk[i].split(",")
                    const obj = {}
                    titles.forEach((title, i) => {
                        obj[title] = line[i]
                    });
                    data.push(obj)
                }
                return(data)
            },
            upload: (el) => {
                vm.cards = []

                if (el.target.files && el.target.files[0]) {
                    const myFile = el.target.files[0]
                    const reader = new FileReader()
                    
                    reader.addEventListener('load', (e) => {
                        let csvdata = e.target.result 
                        const data = vm.parseCSV(csvdata)
                        console.log(data)
                        // vm.cards = data.slice(0, data.length-1)
                        vm.cards = data.slice(0, 20)
                    });
                    
                    reader.readAsText(myFile)
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