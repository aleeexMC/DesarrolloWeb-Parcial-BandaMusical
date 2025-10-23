const numeroAleatorio = Math.floor(Math.random()* 25)+1;

const numeroIntentos =3;

let intentos =1;

function generarNumeroAleatorio(){
    let mensaje;
    const parrafo = document.querySelector("#idParrafo");
    if(intentos<= numeroIntentos){
        let numero = prompt(
            "Que numero se ha generado (Intento " + intentos +")?"

        );
        if(numero == numeroAleatorio){
            mensaje = `Es sorprendente, pudiste adivinar el nuemro oculto (${numeroAleatorio}).
            Refresque la pagina para volver a jugar.`;
        } else if (intentos == numeroIntentos) {
            mensaje = `Su numero de intentos ha terminado.
            el numero oculto era: ${numeroAleatorio}. Refresque la pagina para volver a jugar.`;

        } else {
            //  el número buscado es más alto o más bajo
            let pista = numero < numeroAleatorio ? "más alto" : "más bajo";
            mensaje =`Incorrecto. El número es ${pista}. Vuelve a intentar. Quedan ${
                numeroIntentos - intentos
            } intentos.`;
        }

        intentos++;
    } else {
        mensaje = `Su numero de intentos ha terminado.
        El numero oculto era: ${numeroAleatorio}. Refresque la pagina para volver a jugar.`;
    }

parrafo.innerHTML = mensaje;
}