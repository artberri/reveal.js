(function(win) {
    'use strict';

    const rows = 16;
    const columns = 14;
    /*
    const urls = {
        http1Europe: 'https://demohttp1.berriart.com/images', // 'http://localhost:8080/'
        http2Europe: 'https://demohttp2.berriart.com/images', // 'http://127.0.0.1:8080/'
        http1Australia: 'https://demohttp3.berriart.com/images',
        http2Australia: 'https://demohttp4.berriart.com/images'
    };*/

    win.createTest = function(testName, url1, url2) {
        let test = new HttpTest(testName, url1, url2);
        test.startListening();
    };

    class HttpTest {
        constructor (testName, url1, url2) {
            this.url1 = url1;
            this.url2 = url2;
            this.http1 = document.getElementById(testName + '-http1');
            this.http2 = document.getElementById(testName + '-http2');
            this.http1Time = document.getElementById(testName + '-http1-time');
            this.http2Time = document.getElementById(testName + '-http2-time');
            this.run = document.getElementById(testName + '-run');
            this.resetButton = document.getElementById(testName + '-reset');
            this.timeElems = {};
            this.timeElems[url1] = this.http1Time
            this.timeElems[url2] = this.http2Time
        }

        startListening() {
            this.run.addEventListener('click', () => this.runTest(), false);
            this.resetButton.addEventListener('click', () => this.reset(), false);
        }

        reset() {
            this.times = {
                start: {}
            };
            this.http1.innerHTML = '';
            this.http2.innerHTML = '';
            this.http1Time.innerHTML = '0.000';
            this.http2Time.innerHTML = '0.000';
        }

        runTest() {
            this.reset();

            this.times.start[this.url1] = Date.now()
            requestAnimationFrame(() => this.updateTimer());
            createImageElement(this.url1, rows, columns, this.http1).then(() => {
                this.times[this.url1] = Date.now()
                this.updateTimeElement(this.url1, this.times[this.url1])
                this.times.start[this.url2] = Date.now()
                return createImageElement(this.url2, rows, columns, this.http2)
            }).then(() => {
                this.times[this.url2] = Date.now()
                this.updateTimeElement(this.url2, this.times[this.url2])
            })
        }

        updateTimer() {
            let now = Date.now()

            if (this.times.start[this.url1] && !this.times[this.url1]) {
                this.updateTimeElement(this.url1, now)
            }
            if (this.times.start[this.url2] && !this.times[this.url2]) {
                this.updateTimeElement(this.url2, now)
            }

            if (!(this.times[this.url1] && this.times[this.url2])) {
                requestAnimationFrame(() => this.updateTimer()); // continue animation until stop
            }
        }

        updateTimeElement(baseUrl, time) {
            let elem = this.timeElems[baseUrl]
            let delta = ((time - this.times.start[baseUrl]) / 1000) + ''
            elem.innerHTML = delta.padEnd(5, '0')
        }
    }

    function createImageElement(baseUrl, rows, columns, $where) {
        let promises =[]
        let $div = document.createElement('div')
        $div.className = 'demo-image';

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                let $tile = createTileElement(baseUrl, row, column)
                promises.push(addPromise($tile))

                $div.appendChild($tile)
            }
        }

        $where.appendChild($div)

        return Promise.all(promises)
    }

    function createTileElement(baseUrl, row, column) {
        let $tile = document.createElement('img')
        $tile.src = baseUrl + '/split-' + row + '-' + column + '.jpg?v=' + randomVersion()

        return $tile
    }

    function addPromise($tile) {
        return new Promise((resolve, reject) => {
            $tile.onload = function() {
                resolve()
            }
            $tile.onerror = function() {
                resolve()
            }
        })
    }

    function randomVersion() {
        return Math.floor(Math.random() * 1000000) + '-' + Date.now()
    }

})(window);
