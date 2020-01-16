import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';
import { UsuarioService } from '../usuario/usuario.service';
import { Hospital } from '../../models/hospital.model';
import { map } from 'rxjs/operators';


import Swal from 'sweetalert2';

@Injectable()
export class HospitalService {

  totalHospitales: number = 0;

  constructor(
    public http: HttpClient,
    public _usuarioService: UsuarioService
  ) { }

  cargarHospitales() {

    let url = URL_SERVICIOS + '/hospital';
    return this.http.get( url ).pipe(
              map( (resp: any) => {
                this.totalHospitales = resp.total;
                return resp.hospitales;
              }));

  }

  obtenerHospital( id: string ) {

    let url = URL_SERVICIOS + '/hospital/' + id;
    return this.http.get( url ).pipe(
                map( (resp: any) => resp.hospital ));

  }

  borrarHospital( id: string ) {

    let url = URL_SERVICIOS + '/hospital/' + id;
    url += '?token=' + this._usuarioService.token;

    return this.http.delete( url ).pipe(
                map( resp => {
                  //swal('Hospital Borrado', 'Eliminado correctamente', 'success') ));
                  Swal.fire({
                    title: 'Hospital Borrado',
                    text: 'Eliminado correctamente',
                    //type: 'info',
                    allowOutsideClick: false
                  });
                })
    )};

  crearHospital( nombre: string ) {

    let url = URL_SERVICIOS + '/hospital';
    url += '?token=' + this._usuarioService.token;

    return this.http.post( url, { nombre } ).pipe(
              map( (resp: any) => resp.hospital ));

  }

  buscarHospital( termino: string ) {
    let url = URL_SERVICIOS + '/busqueda/coleccion/hospitales/' + termino;
    return this.http.get( url ).pipe(
                map( (resp: any) => resp.hospitales ));

  }

  actualizarHospital( hospital: Hospital ) {

    let url = URL_SERVICIOS + '/hospital/' + hospital._id;
    url += '?token=' + this._usuarioService.token;

    return this.http.put( url, hospital ).pipe(
              map( (resp: any) => {

                //swal('Hospital Actualiado', hospital.nombre, 'success');
                Swal.fire({
                  title: 'Hospital Actualiado',
                  text: hospital.nombre,
                  //type: 'info',
                  allowOutsideClick: false
                });
                return resp.hospital;
              }));

  }

}
