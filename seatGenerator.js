
const fs = require('fs');

let rows = 9
let columns = 18

let ancho = 270
let alto = 120

let points = [];

let alto_disponible = alto-20
let partida_fila = (alto_disponible / 2)*-1
let intervalo_fila = (alto_disponible / rows)+1

let ancho_disponible = ancho-20
let intervalo_columna = ancho_disponible / columns

let sentido_columnas = 0

for(let i = 0; i<rows; i++){
    
    let partida_columna = ((ancho_disponible / 2)*-1)
    
    if(sentido_columnas == 0){
        for(let j = columns; j>0; j--){

            points.push({
                x: parseFloat(partida_columna.toFixed(2)),
                y: parseFloat(partida_fila.toFixed(2)),
                r: `${i+1}`,
                t: `${j}`,
                p: "",
                i: true
            })
            partida_columna+=intervalo_columna;
        }
    } else{
        for(let j = 0; j<columns; j++){

            points.push({
                x: parseFloat(partida_columna.toFixed(2)),
                y: parseFloat(partida_fila.toFixed(2)),
                r: `${i+1}`,
                t: `${j+19}`,
                p: "",
                i: true
            })
            partida_columna+=intervalo_columna;
        }
    }
    partida_fila+=intervalo_fila;
}

fs.writeFile('asientos.txt', JSON.stringify(points), (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File saved successfully:');
    }
});