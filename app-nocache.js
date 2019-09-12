let UIedtMain = document.querySelector('#edt-main');
let UIgrp = '7'
var initdate = new Date();
let anyorigin = 'http://anyorigin.com/go?url=';

var urledt = `https://intranet.iutrs.unistra.fr/showEDT_day/getCours/2/`;
var heureDebList = [];
var xDown = null;                                                        
var yDown = null;

window.onload = function () {
    document.addEventListener('touchstart', handleTouchStart, false);        
    document.addEventListener('touchmove', handleTouchMove, false);
    fetchEDT(initdate);
}

function fetchEDT (date) {
    let year = date.getFullYear();
    let month = parseInt('0' + date.getMonth().toString().slice(-2)) + 1;
    let day = parseInt('0' + date.getDate().toString().slice(-2));
    var dateURL = `${year}/${month}/${day}`;
    console.log(date);

    UIedtMain.innerHTML += 
    `<div class="loader animated fadeIn">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
    </div>`;
    fetch(`https://cors-anywhere.herokuapp.com/${urledt}${dateURL}`)
    .then(function(response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Response is not OK');
    })
    .then(function(data) {
        updateEDT(data, date);
    })
    .catch(function(error) {
        console.log(error.message);

        let loadererr = document.querySelector('.loader');
        loadererr.style.display = 'none'

        if (error.message == 'Cannot read property \'code_groupe\' of undefined') {
            //c'est un peu de la merde mais en gros c'est la première erreur quand y'a pas de cours

            UIedtMain.innerHTML +=
            `
            <div class="animated fadeIn">
                <div class="fail">
                    <a href="${window.location.href}">
                        <img src="img/weekend.png" alt="weekend"/>
                    </a>
                    <h3>
                        Pas de cours aujourd'hui !
                    </h3>
                </div>
            </div>`;

            initdate = date;

        } else {

            UIedtMain.innerHTML +=
            `
            <div class="animated fadeIn">
                <div class="fail">
                    <a href="${window.location.href}">
                        <img src="img/error.png" alt="error"/>
                    </a>
                    <h3>
                        Erreur de connexion
                    </h3>
                </div>
            </div>`;
        }
    });
}

function updateEDT (data, date) {
    console.log(date);
    let loader = document.querySelector('.loader');
    let month = parseInt('0' + date.getMonth().toString().slice(-2)) + 1;
    let day = parseInt('0' + date.getDate().toString().slice(-2));
    let currentDayOfWeek = date.getDay();
    let week = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    let dayOfWeek = week[currentDayOfWeek];

    loader.style.display = 'none';
    UIedtMain.innerHTML +=
    `<div class="date">
        <h2 class="animated fadeIn">
            ${dayOfWeek} ${day}/${month}
        </h2>
    </div>`;

    let seancesList = data.seances["TS20/2019s1/8"];

    for (let i = 0; i < seancesList.length; i++){

        let codeGroupe = seancesList[i].groupe.code_groupe;
        let seanceUV = seancesList[i].uv;
        let seanceSalle = seancesList[i].salle;
        let matiere = seanceUV.slice(0, 1)
        let seanceTitre = seancesList[i].typeSeance + ' ' + seanceUV.slice(0, 3);

        //création de l'affichage des profs
        let profs = '';
        for (let j = 0; j < seancesList[i].profs.length; j++) {
            profs += ` &  ${seancesList[i].profs[j].prenom} ${seancesList[i].profs[j].nom}`; 
        }
        seanceListeProfs = profs.slice(3);

        //création de l'affichage des créneaux
        let seanceCreneau = '';
        let heureDeb = `${seancesList[i].heure_debut}h${seancesList[i].min_debut}`;
        let heureFin = `${seancesList[i].heure_fin}h${seancesList[i].min_fin}`;
        seanceCreneau = `${heureDeb} - ${heureFin}`;

        //tri en fonction du groupe
        if (codeGroupe === 'TD 34' 
            || codeGroupe === '4'
                || codeGroupe === 'DUT S3') {
            
            if (!(heureDebList.includes(heureDeb))) {

                heureDebList.push(heureDeb);

                //création des divs d'emploi du temps
                UIedtMain.innerHTML += 
                `<div class="animated edt-seance fadeInUp ${matiere}">
                    
                    <img class="img-edt" src="img/${matiere}.png" alt="${matiere}"/>
                    <span class="seance-infos">
                        <p class="edt-seance-titre">
                            ${seanceTitre}
                        </p>
                        <p class="edt-seance-ssinfos">
                            ${seanceListeProfs}
                        </p>
                        <p class="edt-seance-ssinfos">
                            ${seanceSalle}
                        </p>
                        <p class="edt-seance-ssinfos">
                            ${seanceCreneau}
                        </p>
                    </span>
                </div>`;
            }
        }
    }
    initdate = date; //permet de récupérer la date dans la fonction swipe
}

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */ 
            nextDate = initdate.addDays(1);
            clearEDT();
            fetchEDT(nextDate);
        } else {
            /* right swipe */
            nextDate = initdate.addDays(-1);
            clearEDT();
            fetchEDT(nextDate);
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
        } else { 
            /* down swipe */
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function clearEDT() {
    heureDebList = [];
    UIedtMain.innerHTML = '';
}
