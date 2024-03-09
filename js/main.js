var latestEncounters = {83:{'x':110, 'y':642}, 84:{'x':190, 'y':642}, 85:{'x':270, 'y':642}, 86:{'x':350, 'y':642}, 87:{'x':430, 'y':642}};
const getFont = (font) => document.fonts.load(font);
// const getFont = (fontList) => Promise.all(fontList.map(font => document.fonts.load(font)))

var name;
var server;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

async function search() {
    document.getElementById("card").classList.add("d-none");
    document.getElementById("card").removeAttribute('src');
    var buttons = document.querySelectorAll('#jobs button');
    var specArray = ["All"];

    for (i=0; i<buttons.length; i++) {
        buttons[i].classList.add('d-none');
    }

    name = capitalizeFirstLetter(document.getElementById("Username").value.trim()).replaceAll("’", "'");
    if (!name) return;
    server = document.getElementById("Server").value.trim();
    if (!Object.keys(SERVERS).includes(server)) return;

    document.getElementById("search").setAttribute('disabled', true);
    document.getElementById("loading").classList.remove("d-none");

    for (encounterID in latestEncounters) {
        await $.ajax({
            method: "POST",
            url: "https://ko.fflogs.com/api/v2/client",
            async: true,
            contentType: "application/json",
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                query: `{
                    characterData {
                        character(name: "${name}", serverSlug: "${SERVERS[server]}", serverRegion: "KR") {
                            encounterRankings(encounterID: ${encounterID}, difficulty: 101, metric: rdps)
                        }
                    }
                }`
            }),
            success: function(data){
                try {
                    var ranks = data['data']['characterData']['character']['encounterRankings']['ranks'];
                    for (i in ranks) {
                        spec = ranks[i]['spec'];
                        if (specArray.indexOf(spec) === -1) {
                            specArray.push(spec);
                        }
                    }
                } catch(e) {}
            }
        })
    }
    for (i in specArray) {
        document.getElementById(specArray[i]).classList.remove('d-none');
    }
    getApi();
}

function getApi(job) {
    document.getElementById("card").classList.add("d-none");
    document.getElementById("card").removeAttribute('src');
    if (!name) return;
    if (!Object.keys(SERVERS).includes(server)) return;

    var specQuery = '';
    if (Object.keys(JOBS).includes(job)) {
        specQuery = `, specName: "${JOBS[job]}"`;
    }
    $.ajax({
        method: "POST",
        url: "https://ko.fflogs.com/api/v2/client",
        async: true,
        contentType: "application/json",
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            query: `{
                characterData {
                    character(name: "${name}", serverSlug: "${SERVERS[server]}", serverRegion: "KR") {
                        zoneRankings(zoneID: 54, difficulty: 101, metric: rdps${specQuery})
                    }
                }
            }`
        }),
        success: function(data){
            createCard(name, server, data);
        }
    })
}

async function fillText(ctx, text, x, y, font, textAlign, fillStyle) {
    if (text != undefined) {
        await getFont(font);
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.fillStyle = fillStyle;
        ctx.fillText(text, x, y);
    }
}

function drawImage(ctx, img, centerX, centerY, imageWidth, imageHeight, alpha=1) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, centerX-imageWidth/2, centerY-imageHeight/2, imageWidth, imageHeight);
    ctx.globalAlpha = 1;
}

const getImg = (url) => {
    const img = new Image();
    img.crossOrigin="*";
    img.src = url;

    return new Promise((res, rej) =>  {
        img.onload = () => res(img);
        img.onerror = (err) => rej(err);
    });
  }

async function createCard(name, server, data) {
    var canvas = document.getElementById('cardCanvas');
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!Object.keys(SERVERS).includes(server)) return
    try {
        var job = data['data']['characterData']['character']['zoneRankings']['allStars'][0]['spec'];

        var specClass;
        if (['Paladin', 'Warrior', 'DarkKnight', 'Gunbreaker'].includes(job)) {
            specClass = 'tank';
        }
        else if (['WhiteMage', 'Scholar', 'Astrologian', 'Sage'].includes(job)) {
            specClass = 'healer';
        }
        else {
            specClass = 'dps';
        }

        backgroundImg = await getImg('images/backgrounds/' + specClass + '.png');
        ctx.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height, 0, 0, width, height);

        topIcon = await getImg('images/top-icons/' + job + '.png');
        drawImage(ctx, topIcon, width*0.5, height*0.260, width*0.350, width*0.350);

        encounters = data['data']['characterData']['character']['zoneRankings']['rankings'];

        await fillText(ctx, new Date().toLocaleDateString('en-ZA', {timeZone: "Asia/Seoul"}).replaceAll('/', ''), width-34, 49, "18px 'PyeongChangPeace-Light'", 'right', 'white');
        await fillText(ctx, '파이널판타지14', 34, 49, "18px 'PyeongChangPeace-Light'", 'left', 'white');
        await fillText(ctx, 'ff14santa.com/card', width/2, height-34, "14px 'PyeongChangPeace-Light'", 'center', 'white');

        await fillText(ctx, name, width/2, height*0.485, "48px 'PyeongChangPeace-Bold'", 'center', 'white');
        await fillText(ctx, server + '  |  ' + '판데모니움: 연옥편', width/2, height*0.545, "22px 'PyeongChangPeace-Light'", 'center', 'white');

        await fillText(ctx, 'Best Avg', width*0.23, height*0.655, "20px 'PyeongChangPeace-Light'", 'center', 'white');
        await fillText(ctx, 'Median Avg', width/2, height*0.655, "20px 'PyeongChangPeace-Light'", 'center', 'white');
        await fillText(ctx, 'All Star Rank', width*0.77, height*0.655, "20px 'PyeongChangPeace-Light'", 'center', 'white');

        await fillText(ctx, Math.ceil(data['data']['characterData']['character']['zoneRankings']['bestPerformanceAverage'] * 10) / 10, width*0.23, height*0.705, "25px 'PyeongChangPeace-Bold'", 'center', 'white');
        await fillText(ctx, Math.ceil(data['data']['characterData']['character']['zoneRankings']['medianPerformanceAverage'] * 10) / 10, width/2, height*0.705, "25px 'PyeongChangPeace-Bold'", 'center', 'white');
        await fillText(ctx, data['data']['characterData']['character']['zoneRankings']['allStars'][0]['rank'], width*0.77, height*0.705, "25px 'PyeongChangPeace-Bold'", 'center', 'white');

        for (i in encounters) {
            encounter_id = encounters[i]['encounter']['id'];
            if (Object.keys(latestEncounters).includes(encounter_id.toString())) {
                var rankPercent = (encounters[i]['rankPercent'] == null) ? '-' : Math.floor(encounters[i]['rankPercent']);
                await fillText(ctx, rankPercent,latestEncounters[encounter_id]['x'], latestEncounters[encounter_id]['y']+40, "30px 'PyeongChangPeace-Bold'", 'center', 'white');
            }
        }
        for (i in latestEncounters) {
            await fillText(ctx, ENCOUNTERS[i], latestEncounters[i]['x'], latestEncounters[i]['y'], "20px 'PyeongChangPeace-Light'", 'center', 'white');
        }
        document.getElementById("card").src = canvas.toDataURL();
        document.getElementById("card").classList.remove("d-none");
    } finally {
        document.getElementById("loading").classList.add("d-none");
        document.getElementById("search").removeAttribute('disabled');
    }
}
