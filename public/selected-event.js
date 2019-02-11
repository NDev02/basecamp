let hideMatchTable = false;

function getBlueAllianceMatches() {
    let allianceLength = document.querySelector("#match-alliance-length").value;
    blueRequest(`event/${selectedCode}/matches`, function (matchArray) {
        if (matchArray.length == 0)
            alert('Matches not availible');
        else {
            let moddedMatches = [];
            for (let match of matchArray) {
                let moddedMatch = {
                    "winner": match.winning_alliance,
                    "red": [],
                    "blue": []
                };
                for (let i = 0; i < parseInt(allianceLength); i++) {
                    moddedMatch["match_number"] = "qm" + match.match_number;
                    let defaultContents = JSON.parse(document.querySelector("#match-team-breakdown").value);
                    moddedMatch["red"][i] = defaultContents;
                    moddedMatch["red"][i]["team"] = match.alliances.red.team_keys[i].substring(3);
                }
                for (let i = 0; i < parseInt(allianceLength); i++) {
                    let defaultContents = JSON.parse(document.querySelector("#match-team-breakdown").value);
                    moddedMatch["blue"][i] = defaultContents;
                    moddedMatch["blue"][i]["team"] = match.alliances.blue.team_keys[i].substring(3);
                }
                moddedMatches.push(moddedMatch);
            }
            populateMatches(moddedMatches);
            apiSend(`${selectedCode}/matches`, true, moddedMatches, function (res) {
                console.log(res);
            });
        }
    });
}

function populateMatches(matchData) {
    if (!matchData)
        apiRequest(`${selectedCode}/matches`, false, populateMatches);
    else {
        matchListToggle();
        document.querySelector("#match-toggle").hidden = false;
        for (let match of matchData) {
            appendRow(match.winner, match.red, match.blue);
        }
    }
}

function appendRow(winner, red, blue) {
    let row = document.createElement('tr');
    row.appendChild(createTd(winner));
    row.appendChild(createTd(red[0].team, red[0].scouted));
    row.appendChild(createTd(red[1].team, red[1].scouted));
    row.appendChild(createTd(red[2].team, red[2].scouted));
    row.appendChild(createTd(blue[0].team, blue[0].scouted));
    row.appendChild(createTd(blue[1].team, blue[1].scouted));
    row.appendChild(createTd(blue[2].team, blue[2].scouted));
    document.querySelector('#match-table').appendChild(row);
}

function createTd(text, scouted) {
    let td = document.createElement('td');
    td.appendChild(document.createTextNode(text));
    if (scouted) {
        td.style.background = "var(--primary)";
        td.onclick = function () { alert(scouted) };
    }
    return td;
}

function matchListToggle() {
    hideMatchTable = !hideMatchTable;
    let ul = document.querySelector('#match-table').hidden = hideMatchTable;
}