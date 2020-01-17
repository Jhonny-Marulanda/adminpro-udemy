import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';

//import swal from 'sweetalert';
import Swal from 'sweetalert2';


//import { Observable } from 'rxjs/Observable';
//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/catch';

import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
//import { map } from 'rxjs/operators';

@Injectable()
export class UsuarioService {

  usuario: Usuario;
  token: string;
  menu: any[] = [];

  constructor(
    public http: HttpClient,
    public router: Router,
    public _subirArchivoService: SubirArchivoService
  ) {
    this.cargarStorage();
  }


  renuevaToken() {

    let url = URL_SERVICIOS + '/login/renuevatoken';
    url += '?token=' + this.token;

    return this.http.get( url ).pipe(
                map( (resp: any) => {

                  this.token = resp.token;
                  localStorage.setItem('token', this.token );
                  console.log('Token renovado');

                  return true;
                }),
                catchError( err => {
                //.catch( err => {
                  this.router.navigate(['/login']);
                  //swal( 'No se pudo renovar token', 'No fue posible renovar token', 'error' );
                  Swal.fire({
                    title: 'No se puedo renovar token',
                    text: 'No fue posible renovar token',
                    //type: 'info',
                    allowOutsideClick: false
                  });

                  return Observable.throw( err );
                }));


  }


  estaLogueado() {
    return ( this.token.length > 5 ) ? true : false;
  }

  cargarStorage() {

    if ( localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse( localStorage.getItem('usuario') );
      this.menu = JSON.parse( localStorage.getItem('menu') );
    } else {
      this.token = '';
      this.usuario = null;
      this.menu = [];
    }

  }

  guardarStorage( id: string, token: string, usuario: Usuario, menu: any ) {

    localStorage.setItem('id', id );
    localStorage.setItem('token', token );
    localStorage.setItem('usuario', JSON.stringify(usuario) );
    localStorage.setItem('menu', JSON.stringify(menu) );

    this.usuario = usuario;
    this.token = token;
    this.menu = menu;
  }

  logout() {
    this.usuario = null;
    this.token = '';
    this.menu = [];

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('menu');

    this.router.navigate(['/login']);
  }

  loginGoogle( token: string ) {

    let url = URL_SERVICIOS + '/login/google';

    return this.http.post( url, { token } ).pipe(
                map( (resp: any) => {
                  this.guardarStorage( resp.id, resp.token, resp.usuario, resp.menu );
                  return true;
                }));


  }

  login( usuario: Usuario, recordar: boolean = false ) {

    if ( recordar ) {
      localStorage.setItem('email', usuario.email );
    }else {
      localStorage.removeItem('email');
    }

    let url = URL_SERVICIOS + '/login';
    return this.http.post( url, usuario ).pipe(
                map( (resp: any) => {
                  this.guardarStorage( resp.id, resp.token, resp.usuario, resp.menu );
                  return true;
                }),
                catchError( err => {
                //.catch( err => {

                  //swal( 'Error en el login', err.error.mensaje, 'error' );
                  Swal.fire({
                    title: 'Error en el login',
                    text: err.error.mensaje,
                    //type: 'info',
                    allowOutsideClick: false
                  });

                  return Observable.throw( err );
                }));

  }


  crearUsuario( usuario: Usuario ) {

    let url = URL_SERVICIOS + '/usuario';

    return this.http.post( url, usuario ).pipe(
              map( (resp: any) => {

                //swal('Usuario creado', usuario.email, 'success' );
                return resp.usuario;
              }),
              catchError( err => {
              //.catch( err => {
                //swal( err.error.mensaje, err.error.errors.message, 'error' );
                Swal.fire({
                  title: err.error.mensaje,
                  text: err.error.errors.message,
                  //type: 'info',
                  allowOutsideClick: false
                });

                return Observable.throw( err );
              }));
  }

  actualizarUsuario( usuario: Usuario ) {

    let url = URL_SERVICIOS + '/usuario/' + usuario._id;
    url += '?token=' + this.token;

    return this.http.put( url, usuario ).pipe(
                map( (resp: any) => {

                  if ( usuario._id === this.usuario._id ) {
                    let usuarioDB: Usuario = resp.usuario;
                    this.guardarStorage( usuarioDB._id, this.token, usuarioDB, this.menu );
                  }

                  //swal('Usuario actualizado', usuario.nombre, 'success' );
                  Swal.fire({
                    title: 'Usuario actualizado',
                    text: usuario.nombre,
                    //type: 'info',
                    allowOutsideClick: false
                  });

                  return true;
                }),
                catchError ( err => {
                //.catch( err => {
                  //swal( err.error.mensaje, err.error.errors.message, 'error' );
                  Swal.fire({
                    title: err.error.mensaje,
                    text: err.error.errors.message,
                    //type: 'info',
                    allowOutsideClick: false
                  });

                  return Observable.throw( err );
                }));

  }

  cambiarImagen( archivo: File, id: string ) {

    this._subirArchivoService.subirArchivo( archivo, 'usuarios', id )
          .then( (resp: any) => {

            this.usuario.img = resp.usuario.img;
            //swal( 'Imagen Actualizada', this.usuario.nombre, 'success' );
            Swal.fire({
              title: 'Imagen Actualizada',
              text: this.usuario.nombre,
              //type: 'info',
              allowOutsideClick: false
            });

            this.guardarStorage( id, this.token, this.usuario, this.menu );

          })
          .catch( resp => {
            console.log( resp );
          }) ;

  }

  cargarUsuarios( desde: number = 0 ) {

    let url = URL_SERVICIOS + '/usuario?desde=' + desde;
    return this.http.get( url );

  }

  buscarUsuarios( termino: string ) {

    let url = URL_SERVICIOS + '/busqueda/coleccion/usuarios/' + termino;
    return this.http.get( url ).pipe(
                map( (resp: any) => resp.usuarios ));

  }

  borrarUsuario( id: string ) {

    let url = URL_SERVICIOS + '/usuario/' + id;
    url += '?token=' + this.token;

    return this.http.delete( url ).pipe(
                map( resp => {
                  //swal('Usuario borrado', 'El usuario a sido eliminado correctamente', 'success');
                  Swal.fire({
                    title: 'Usuario borrado',
                    text: 'El usuario a sido eliminado correctamente',
                    //type: 'info',
                    allowOutsideClick: false
                  });

                  return true;
                }));

  }

}
