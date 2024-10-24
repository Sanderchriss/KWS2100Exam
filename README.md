# KWS-eksamen

## Linker

Nettside: https://kristiania-kws2100-2024.github.io/kws2100-exam-Sanderchriss/

## Om arbeidet

Arbeidet ble fordelt mellom gruppemedlemmene etter nødvendighet og ønsker. Dette gjorde at den første dagen av prosjektet ble likt fordelt på alle tre. De neste dagene gikk til å innføre funksjonalitet etter den valgfrie listen. Dette førte til mye prøving og feiling av hva vi ønsket å implementere. Enkelte oppgaver som styling og slikt skjedde hurtig og ofte, mens større ting tok lenger tid å få til å fungere. Vi benyttet oss også mye av par-programmering for å kunne dele ideer og løsninger effektivt.

## Tema

I oppgaven har vi valgt å gå for nødetater som tema. Dette mente vi var en viktig funksjonalitet som kunne vært oversatt til det daglige liv. Datasettene vi har valgt kommer fra https://kart.dsb.no utenom to sett: 1. Trafikkulykker som kom fra GeoNorge i GML-format vi endret til json. 2. Sykehusene var det vanskelig å finne noen konkrete tall og steder, så vi endte opp med å bruke en liste fra Wikipedia (https://no.wikipedia.org/wiki/Liste_over_norske_sykehus), finne posisjonen deres og opprette en geojson-fil i geojson.io.

## Verdt å merke seg

Vi har inkludert:

- SessionStorage
- Localstorage
- Søkefunksjon på brannstasjoner med fokus
- Clusters gjelder også symboler
- Flere ulike projections
- Tegning av features med måling, og som konverterer i mellom ulike ESPG-formater
- Group-layers (Tar litt tid å laste, men gir et flott kart om man zoomer litt inn)
- Fargelagte tunneler etter typen vei
- Matrikkelsett
- Avansert styling, det har blitt endret i blant annet OL sine controls som man kan se ved feks zoomen
- Ved å trykke på politi-logoen vil man få opp nettsiden til det distriktet som ble trykket på
