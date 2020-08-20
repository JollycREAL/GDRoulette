const api = 'https://www.gdbrowser.com/api/search/'
let apiquery = ''
let list = []
let listnum = 0
let nextpercent = 1
let diffstr = ""
let custom = false

function startroulette() {
    const radios = document.getElementsByName('difficulty');
    let query = '*';
    let addons = '&count=1';

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // do whatever you want with the checked radio
            query+=radios[i].value;
            diffstr = radios[i].parentNode.innerText

            // only one radio can be logically checked, don't check the rest
            break;
        }
    }

    if (query == '*') {
        alert('Please select a difficulty!')
        return
    }

    if (query = '*custom') {
        custom = true;
        document.getElementById('settings').classList.add('animate__fadeOut')
        setTimeout(() => {
            document.getElementById('settings').classList.add('is-hidden')
            document.getElementById('settings').classList.remove('is-loading')

            document.getElementById('levels').insertAdjacentHTML('beforeend', 
            `<div class='box is-centered columns animate__animated animate__fadeInUpBig mt-1'>
                <div class="column box-content">
                    <textarea id='customs' class='textarea'></textarea>
                    <div id="startcustom" class="button is-success" onclick="startcustom()">Start</div>
                </div>
                
            </div>`)
        }, 250)
    } else {
        document.getElementById('start').classList.add('is-loading')

        setTimeout(() => { // Because js is weird
            req = new XMLHttpRequest();
            req.open("GET", api + query + addons, false);
            req.send(null);
            
            levels = JSON.parse(req.responseText)[0]["results"]


            for (i = 1; i <= levels; i++) {
                list.push(i)
            }
            list.shuffle()

            list = list.slice(0,100)

            apiquery = api + query;

            document.getElementById('settings').classList.add('animate__fadeOut')
            setTimeout(() => {
                document.getElementById('settings').classList.add('is-hidden')
                document.getElementById('settings').classList.remove('is-loading')

                getNextLvl()
            }, 250)
        })
    }
}

function getNextLvl() {
    listnum++;

    leveln = list.slice(0, 1)[0]
    console.log(leveln)
    list = list.slice(1)

    page = Math.ceil(leveln/10)

    req = new XMLHttpRequest();
    req.open("GET", apiquery + '&page=' + page, false);
    req.send(null);
    
    level = JSON.parse(req.responseText)[(leveln-1)%10]
    console.log(level)
    
    if (level != undefined) { // If the servers goof up
        document.getElementById('levels').insertAdjacentHTML('beforeend', 
        `<div class='box is-centered columns animate__animated animate__fadeInUpBig mt-1'>
            <div class="column box-content">
                <h1 class="title">#${listnum}: ${level.name}</h1>
                <h1 class="subtitle"><i>By ${level.author} (${level.id})</i></h1>
            </div>
            <div class="is-narrow column" id="temp">
                <input type="number" class="input" id="percent" placeholder="At least ${nextpercent}%">
                <div class="columns is-mobile mt-1">
                    <div class="column has-text-left">
                        <div class="button is-success" onclick="complete()" id="completion">Complete</div>
                    </div>
                    <div class="column has-text-right">
                        <div class="button is-danger" onclick="finish()">Give Up</div>
                    </div>
                </div>
            </div>
        </div>`)
        copy(level.id)
    } else {
        getNextLvl()
    }
}

function showFinalLevels() {
    let element = document.getElementById('show-remaining')
    element.removeAttribute('onclick')
    element.classList.add('is-loading')
    
    str = ''
    pages = {}

    setTimeout(() => { // Idk why but it doesn't set the loading thing correctly unless I do this.
        for (leveln of list) {
            listnum++;
            nextpercent++;
            
            if (nextpercent > 100) {
                break
            }
    
            page = Math.ceil(leveln/10)
    
            if (!pages.hasOwnProperty(page)) {
                req = new XMLHttpRequest();
                req.open("GET", apiquery + '&page=' + page, false);
                req.send(null);
    
                pages[page] = JSON.parse(req.responseText)
            }
    
            level = pages[page][(leveln-1)%10]
            console.log(leveln)
            
            if (level != undefined) { // If the servers goof up
                str += `<div class='box is-centered columns animate__animated animate__fadeInUpBig mt-1'>
                    <div class="column box-content">
                        <h1 class="title">#${listnum}: ${level.name}</h1>
                        <h1 class="subtitle"><i>By ${level.author} (${level.id})</i></h1>
                    </div>
                    <div class="is-narrow column has-text-grey-light">
                        ${nextpercent}%
                    </div>
                </div>`
            }
        }

        document.getElementById('levels').insertAdjacentHTML('beforeend', str)
        document.getElementById('rm').classList.add('is-hidden')
    })
}


function complete() {
    percent = parseInt(document.getElementById('percent').value)
    if (percent >= nextpercent && percent < 100) {
        nextpercent = percent + 1

        old = document.getElementById('temp')
        old.id = ''
        old.innerHTML = `${percent}%`
        getNextLvl()
    } else if (percent == 100) {
        nextpercent = 101
        listnum++;
        old = document.getElementById('temp')
        old.id = ''
        old.innerHTML = `${percent}%`
        finish()
    } else {
        alert('Nice try lmao')
    }
}

function finish() {
    old = document.getElementById('temp')
    if (!diffstr.includes('Demon')) {
        diffstr = diffstr + ' Level'
    }

    diffstr = diffstr + 's'

    let buttonorno = ''

    if (nextpercent < 100) {
        buttonorno = `<span id='rm'><br><br><div class='button is-danger' onclick='showFinalLevels()' id='show-remaining'>Show Remaining Levels (this may take a while)</div></span>`
    }

    if (old) {
        old.innerHTML = `Given up (${nextpercent}%)`
    }
    document.getElementById('levels').insertAdjacentHTML('beforeend', 
    `<div class='box columns is-centered has-text-centered has-text-vcentered animate__animated animate__fadeInUpBig mt-1 mb-3'>
        <div class='column'>
            <h1 class="title">
                Results -${diffstr}
            </h1>
            <div class="content">
                Number of levels: ${listnum - 1}<br>
                Highest percent: ${nextpercent - 1}%
                ${buttonorno}
            </div>
        </div>
    </div>`)
}

function copy(string) {
    var copyText = document.getElementById("copypaste");
    copyText.value = string
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
}

// https://stackoverflow.com/a/6274381/9124836
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function () {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

