
const fs = require('fs');

//Datos
let rows = 5
let columns = 18

let ancho = 320
let alto = 85

let sentido_columnas = 1//1 cresciente, 0 decresciente


//Codigo
let points = [];

let alto_disponible = alto-20
let partida_fila = ((alto_disponible / 2)*-1)+12//Offset Y
// let intervalo_fila = (alto_disponible / rows)
let intervalo_fila = 17.5

let ancho_disponible = ancho-20
let intervalo_columna = ancho_disponible / (columns -1)

for(let i = 1; i<=rows; i++){
    
    let partida_columna = ((ancho_disponible / 2)*-1)+81//Offset X
    if(sentido_columnas == 0){
        for(let j = columns; j>0; j--){
            if(i>2 && j<=5){

            }else{
                points.push({
                    x: parseFloat((partida_columna).toFixed(2)),
                    y: parseFloat((partida_fila).toFixed(2)),
                    r: `${i+30}`,//Aca va segun arranque la fila en la zona
                    t: `${j}`,
                    p: "",
                    i: true
                })
            }
            
            partida_columna+=intervalo_columna;
        }
    } else{
        for(let j = 1; j<=columns; j++){
            if(i>2 && j<=5){

            }else{
                points.push({
                    x: parseFloat(partida_columna.toFixed(2)),
                    y: parseFloat(partida_fila.toFixed(2)),
                    r: `${i+30}`,
                    t: `${j+18}`,
                    p: "",
                    i: true
                })
            }
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