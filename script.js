document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Setze die Dimensionen des Canvas
    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10;

    // Spieler Objekte
    const Lila = {
        x: 50,
        y: 50,
        breite: 40,
        höhe: 30,
        rohrLänge: 22, // Länge des Rohrs
        rohrOffset: 10, // Verschiebung des Rohrs nach rechts um 5 Pixel
        farbe: '#552583',
        geschwindigkeit: 0, // Anfangsgeschwindigkeit auf 0 setzen
        maxGeschwindigkeit: 1.5, // Maximale Geschwindigkeit
        beschleunigung: 0.05, // Beschleunigungskonstante
        verzoegerung: 0.05, // Verzögerungskonstante
        drehwinkel: 0,
        drehGeschwindigkeit: 0.05, // Geschwindigkeit der Drehung
        schussCooldown: 0, // Schuss-Cooldown-Zähler
        maxSchussCooldown: 30, // Maximales Schuss-Cooldown
        leben: 100, // Startleben
        maxLeben: 100 // Maximales Leben
    };

    const Orange = {
        x: canvas.width - 100,
        y: canvas.height - 100,
        breite: 40,
        höhe: 30,
        rohrLänge: 22, // Länge des Rohrs
        rohrOffset: 10, // Verschiebung des Rohrs nach rechts um 5 Pixel
        farbe: '#F28C28	',
        geschwindigkeit: 0, // Anfangsgeschwindigkeit auf 0 setzen
        maxGeschwindigkeit: 1.5, // Maximale Geschwindigkeit
        beschleunigung: 0.05, // Beschleunigungskonstante
        verzoegerung: 0.05, // Verzögerungskonstante
        drehwinkel: Math.PI, // Orange startet mit umgedrehter Ausrichtung
        drehGeschwindigkeit: 0.05, // Geschwindigkeit der Drehung
        schussCooldown: 0, // Schuss-Cooldown-Zähler
        maxSchussCooldown: 30, // Maximales Schuss-Cooldown
        leben: 100, // Startleben
        maxLeben: 100 // Maximales Leben
    };

    // Liste der aktiven Projektile
    const projektile = [];

    // Variable für Testmodus
    const TESTMODUS = false;

    // Toleranz für Kollisionserkennung
    const TOLERANZ = 3;

    
    // Funktion zur Überprüfung von Kollisionen
    function überprüfeKollision(objekt1, objekt2) {
        return objekt1.x < objekt2.x + objekt2.breite - TOLERANZ &&
               objekt1.x + objekt1.breite - TOLERANZ > objekt2.x &&
               objekt1.y < objekt2.y + objekt2.höhe - TOLERANZ &&
               objekt1.y + objekt1.höhe - TOLERANZ > objekt2.y;
    }

    // Funktion zum Zeichnen der Hitboxen im Testmodus
    function zeichneHitbox(objekt) {
        ctx.save();
        ctx.translate(objekt.x + objekt.breite / 2, objekt.y + objekt.höhe / 2);
        ctx.rotate(objekt.drehwinkel);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(-objekt.breite / 2, -objekt.höhe / 2, objekt.breite, objekt.höhe);
        ctx.restore();
    }

    // Funktion zur Aktualisierung der Spieler-Positionen basierend auf den Tastenstatus
    function aktualisiereSpielerPositionen() {
        // Lila
        if (tastenStatus['w']) {
            Lila.geschwindigkeit += Lila.beschleunigung;
        } else if (Lila.geschwindigkeit > 0) {
            Lila.geschwindigkeit -= Lila.verzoegerung;
            if (Lila.geschwindigkeit < 0.05) { // Nahe bei 0, setze auf 0
                Lila.geschwindigkeit = 0;
            }
        }
        if (tastenStatus['a']) {
            Lila.drehwinkel -= Lila.drehGeschwindigkeit;
        }
        if (tastenStatus['s']) {
            Lila.geschwindigkeit -= Lila.beschleunigung;
        } else if (Lila.geschwindigkeit < 0) {
            Lila.geschwindigkeit += Lila.verzoegerung;
            if (Lila.geschwindigkeit > -0.05) { // Nahe bei 0, setze auf 0
                Lila.geschwindigkeit = 0;
            }
        }
        if (tastenStatus['d']) {
            Lila.drehwinkel += Lila.drehGeschwindigkeit;
        }

        // Begrenze die Geschwindigkeit von Lila
        Lila.geschwindigkeit = Math.max(-Lila.maxGeschwindigkeit, Math.min(Lila.geschwindigkeit, Lila.maxGeschwindigkeit));

        // Lila - Bewegung
        Lila.x += Lila.geschwindigkeit * Math.cos(Lila.drehwinkel);
        Lila.y += Lila.geschwindigkeit * Math.sin(Lila.drehwinkel);

        // Lila - Grenzen des Canvas
        Lila.x = Math.max(0, Math.min(Lila.x, canvas.width));
        Lila.y = Math.max(0, Math.min(Lila.y, canvas.height));

        // Orange
        if (tastenStatus['i']) {
            Orange.geschwindigkeit += Orange.beschleunigung;
        } else if (Orange.geschwindigkeit > 0) {
            Orange.geschwindigkeit -= Orange.verzoegerung;
            if (Orange.geschwindigkeit < 0.05) { // Nahe bei 0, setze auf 0
                Orange.geschwindigkeit = 0;
            }
        }
        if (tastenStatus['j']) {
            Orange.drehwinkel -= Orange.drehGeschwindigkeit;
        }
        if (tastenStatus['k']) {
            Orange.geschwindigkeit -= Orange.beschleunigung;
        } else if (Orange.geschwindigkeit < 0) {
            Orange.geschwindigkeit += Orange.verzoegerung;
            if (Orange.geschwindigkeit > -0.05) { // Nahe bei 0, setze auf 0
                Orange.geschwindigkeit = 0;
            }
        }
        if (tastenStatus['l']) {
            Orange.drehwinkel += Orange.drehGeschwindigkeit;
        }

        // Begrenze die Geschwindigkeit von Orange
        Orange.geschwindigkeit = Math.max(-Orange.maxGeschwindigkeit, Math.min(Orange.geschwindigkeit, Orange.maxGeschwindigkeit));

        // Orange - Bewegung
        Orange.x += Orange.geschwindigkeit * Math.cos(Orange.drehwinkel);
        Orange.y += Orange.geschwindigkeit * Math.sin(Orange.drehwinkel);

        // Orange - Grenzen des Canvas
        Orange.x = Math.max(0, Math.min(Orange.x, canvas.width));
        Orange.y = Math.max(0, Math.min(Orange.y, canvas.height));

        // Überprüfe Kollision zwischen den Spielern
        if (überprüfeKollision(Lila, Orange)) {
            // Berechne den Abstand zwischen den beiden Spielern
            const dx = Lila.x - Orange.x;
            const dy = Lila.y - Orange.y;
            const abstand = Math.sqrt(dx * dx + dy * dy);

            // Berechne die Verschiebung, um die Spieler voneinander wegzubewegen
            const verschiebungX = dx / abstand * 2; // Multipliziere mit 2 für stärkeren Effekt
            const verschiebungY = dy / abstand * 2; // Multipliziere mit 2 für stärkeren Effekt

            // Bewege Lila
            Lila.x += verschiebungX;
            Lila.y += verschiebungY;

            // Bewege Orange
            Orange.x -= verschiebungX;
            Orange.y -= verschiebungY;
        }
    }

    // Funktion zum Schießen
    function schieße(spieler) {
        if (spieler.schussCooldown <= 0) {
            // Erzeuge ein Projektil-Objekt
            const projektil = {
                x: spieler.x + spieler.breite / 2 + spieler.rohrOffset * Math.cos(spieler.drehwinkel),
                y: spieler.y + spieler.höhe / 2 + spieler.rohrOffset * Math.sin(spieler.drehwinkel),
                radius: 5,
                geschwindigkeit: 5,
                drehwinkel: spieler.drehwinkel,
                farbe: spieler.farbe
            };

            // Füge das Projektil der Liste der aktiven Projektile hinzu
            projektile.push(projektil);

            // Setze das Schuss-Cooldown
            spieler.schussCooldown = spieler.maxSchussCooldown;
        }
    }



   // Funktion zur Überprüfung von Kollisionen zwischen einem Projektil und einem Panzer
function überprüfeProjektilKollision(projektil, panzer) {
    return projektil.x + projektil.radius > panzer.x &&
           projektil.x - projektil.radius < panzer.x + panzer.breite &&
           projektil.y + projektil.radius > panzer.y &&
           projektil.y - projektil.radius < panzer.y + panzer.höhe;
}

// Funktion zur Aktualisierung der Spieler-Lebenspunkte basierend auf Treffern
function aktualisiereLeben(projektil, spieler) {
    if (überprüfeProjektilKollision(projektil, spieler)) {
        // Ziehe 25% des maximalen Lebens ab
        spieler.leben -= spieler.maxLeben * 0.03;
        // Stelle sicher, dass die Lebenspunkte nicht unter 0 fallen
        spieler.leben = Math.max(0, spieler.leben);
    }
}

// Funktion zum Bewegen der Projektile und Aktualisieren der Lebenspunkte
function aktualisiereProjektile() {
    for (let i = 0; i < projektile.length; i++) {
        const projektil = projektile[i];

        // Bewege das Projektil
        projektil.x += projektil.geschwindigkeit * Math.cos(projektil.drehwinkel);
        projektil.y += projektil.geschwindigkeit * Math.sin(projektil.drehwinkel);

        // Entferne das Projektil, wenn es den Canvas verlässt
        if (projektil.x < 0 || projektil.x > canvas.width || projektil.y < 0 || projektil.y > canvas.height) {
            projektile.splice(i, 1);
            i--;
        }

        // Überprüfe Kollision mit Lila, wenn das Projektil nicht von Lila stammt
        if (projektil.farbe !== Lila.farbe) {
            aktualisiereLeben(projektil, Lila);
        }
        // Überprüfe Kollision mit Orange, wenn das Projektil nicht von Orange stammt
        if (projektil.farbe !== Orange.farbe) {
            aktualisiereLeben(projektil, Orange);
        }
    }
}


    // Funktion zum Zeichnen der Projektile
    function zeichneProjektile() {
        for (const projektil of projektile) {
            ctx.beginPath();
            ctx.arc(projektil.x, projektil.y, projektil.radius, 0, Math.PI * 2);
            ctx.fillStyle = projektil.farbe;
            ctx.fill();
        }
    }

    // Funktion zum Zeichnen der Spieler
    function zeichneSpieler(spieler) {
        ctx.save();
        ctx.translate(spieler.x + spieler.breite / 2, spieler.y + spieler.höhe / 2);
        ctx.rotate(spieler.drehwinkel);
        ctx.fillStyle = spieler.farbe;
        ctx.fillRect(-spieler.breite / 2, -spieler.höhe / 2, spieler.breite, spieler.höhe);

        // Zeichne das Rohr
        ctx.beginPath();
        ctx.moveTo(spieler.rohrOffset, 0); // Anfang des Rohrs um 5 Pixel nach rechts verschieben
        ctx.lineTo(spieler.rohrOffset + spieler.rohrLänge, 0); // Endpunkt des Rohrs
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Zeichne Hitbox im Testmodus
        if (TESTMODUS) {
            zeichneHitbox(spieler);
        }
    }

    // Funktion zum Zeichnen der Lebensanzeige
    function zeichneLebensanzeige(spieler, position) {
        const lebenProzent = spieler.leben / spieler.maxLeben;
        const barBreite = 100;
        const barHöhe = 10;
        const barX = position === 'links' ? 10 : canvas.width - barBreite - 10;
        const barY = 10;
        
        // Hintergrund der Lebensanzeige zeichnen
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barBreite, barHöhe);
        
        // Lebensanzeige zeichnen
        ctx.fillStyle = lebenProzent > 0.5 ? '#0f0' : lebenProzent > 0.2 ? '#ff0' : '#f00';
        ctx.fillRect(barX, barY, barBreite * lebenProzent, barHöhe);
        
        // Rahmen der Lebensanzeige zeichnen
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barBreite, barHöhe);
    }

    // Initialisierung der Tastenstatus für Lila und Orange
    const tastenStatus = {
        w: false,
        a: false,
        s: false,
        d: false,
        i: false,
        j: false,
        k: false,
        l: false,
        e: false, // Lila schießt mit 'e'
        u: false, // Orange schießt mit 'u'
    };

 

    // Eventlistener für Tasten-Drücken und -Loslassen
    document.addEventListener('keydown', function (event) {
        aktualisiereTastenStatus(event, true);
    });

    document.addEventListener('keyup', function (event) {
        aktualisiereTastenStatus(event, false);
    });

    // Funktion zur Aktualisierung der Tastenstatus
    function aktualisiereTastenStatus(event, status) {
        switch (event.key) {
            case 'w':
            case 'a':
            case 's':
            case 'd':
            case 'i':
            case 'j':
            case 'k':
            case 'l':
                tastenStatus[event.key] = status;
                break;
            case 'e': // Lila schießt mit 'e'
                tastenStatus[event.key] = status;
                if (status) {
                    schieße(Lila);
                }
                break;
            case 'u': // Orange schießt mit 'u'
                tastenStatus[event.key] = status;
                if (status) {
                    schieße(Orange);
                }
                break;
        }
    }

    // Aktualisiere Spielobjekte
    function aktualisiere() {
        aktualisiereSpielerPositionen();
        aktualisiereProjektile();
    }

    // Rendere das Spiel
    function rendere() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        zeichneSpieler(Lila);
        zeichneSpieler(Orange);
        zeichneProjektile();
        zeichneLebensanzeige(Lila, 'links');
        zeichneLebensanzeige(Orange, 'rechts');
    }

    // Funktion zum Schießen
function schieße(spieler) {
    if (spieler.schussCooldown <= 0) {
        // Erzeuge ein Projektil-Objekt
        const projektil = {
            x: spieler.x + spieler.breite / 2 + spieler.rohrOffset * Math.cos(spieler.drehwinkel),
            y: spieler.y + spieler.höhe / 2 + spieler.rohrOffset * Math.sin(spieler.drehwinkel),
            radius: 5,
            geschwindigkeit: 5,
            drehwinkel: spieler.drehwinkel,
            farbe: spieler.farbe
        };

        // Füge das Projektil der Liste der aktiven Projektile hinzu
        projektile.push(projektil);

        // Setze das Schuss-Cooldown
        spieler.schussCooldown = spieler.maxSchussCooldown;

        // Starte den Schuss-Cooldown-Timer
        setTimeout(() => {
            spieler.schussCooldown = 0; // Setze das Schuss-Cooldown nach Ablauf des Timers auf 0
        }, 1000); // 1000 Millisekunden 
    }
}



 // Funktion zum Zeichnen des Game-Over-Bildschirms
function zeichneGameOverScreen(gewinner) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('Gewinner: Spieler ' + gewinner, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Seite neu laden, um erneut zu spielen', canvas.width / 2, canvas.height / 2 + 50);
}

// Überprüfe, ob das Spiel vorbei ist
function überprüfeSpielEnde() {
    if (Lila.leben <= 0 || Orange.leben <= 0) {
        // Bestimme den Gewinner basierend auf dem verbleibenden Leben
        const gewinner = Lila.leben > 0 ? 'Lila' : 'Orange';
        zeichneGameOverScreen(gewinner);
        // Entferne die Eventlistener für Tasten-Drücken und -Loslassen, um die Steuerung zu deaktivieren
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
    }
}

// Spiel-Schleife
function spielSchleife() {
    if (Lila.leben > 0 && Orange.leben > 0) {
        aktualisiere();
        rendere();
        requestAnimationFrame(spielSchleife);
    } else {
        überprüfeSpielEnde();
    }
}

// Starte die Spiel-Schleife
spielSchleife();

});