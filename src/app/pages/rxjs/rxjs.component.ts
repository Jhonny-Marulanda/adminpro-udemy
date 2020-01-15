import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, Observable, Subscriber } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// tslint:disable-next-line:import-blacklist

@Component({
  selector: 'app-rxjs',
  templateUrl: './rxjs.component.html',
  styles: []
})
export class RxjsComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  constructor() {

    this.subscription = this.regresaObservable()
      .subscribe(
          numero => console.log( 'Subs', numero ),
          error => console.error('Error en el obs (dos veces)', error ),
          () => console.log( 'El observador termino!' )
        );


  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  regresaObservable(): Observable<any> {

    return new Observable( (observer: Subscriber<any>) => {

      let contador = 0;

      const intervalo = setInterval( () => {

        contador++;


        const salida = {
          valor: contador
        };


        observer.next(salida);


        // if ( contador === 3 ) {
        //   clearInterval(intervalo);
        //   observer.complete();
        // }

        // if ( contador === 2 ) {
        //   // clearInterval(intervalo);
        //   observer.error('Auxilio!');
        // }

      }, 1000 );

    }).pipe(
      map( resp => resp.valor),
      filter( ( valor, index ) => {

        if (  (valor % 2) === 1 ) {
          // impar
          return true;

        } else {
          // par
          return false;
        }
      })
    );

  }

}



