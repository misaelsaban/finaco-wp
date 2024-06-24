
const fs = require('fs');

//Datos
let rows = 2
let columns = 10

let ancho = 130
let alto = 22

let sentido_columnas = 1//1 cresciente, 0 decresciente


//Codigo
let points = [];

let alto_disponible = alto-20
let partida_fila = ((alto_disponible / 2)*-1)//Offset Y
// let intervalo_fila = (alto_disponible / rows)
let intervalo_fila = 10

let ancho_disponible = ancho-20
let intervalo_columna = ancho_disponible / (columns - 1)

for(let i = 0; i<rows; i++){
    
    let partida_columna = ((ancho_disponible / 2)*-1)+16//Offset X
    if(i==2){//Esto es solo para saltear la fucking fila 13 que no esta
        // continue;
    }
    if(sentido_columnas == 0){
        for(let j = columns; j>0; j--){

            points.push({
                x: parseFloat((partida_columna).toFixed(2)),
                y: parseFloat((partida_fila).toFixed(2)),
                r: `${i+41}`,//Aca va segun arranque la fila en la zona
                t: `${j+5}`,
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
                r: `${i+31}`,
                t: `${j+1}`,
                p: "",
                i: true
            })
            partida_columna+=intervalo_columna;
        }
    }
    partida_fila+=intervalo_fila;
}
console.log(points.length)

fs.writeFile('asientos.txt', JSON.stringify(points), (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File saved successfully:');
    }
});