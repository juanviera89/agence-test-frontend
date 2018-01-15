import { Injectable } from '@angular/core';
import {HttpClient,HttpResponse,HttpHeaders} from '@angular/common/http'
@Injectable()
export class CommunicationsService {

  public relatorios : any;

  private _consultores : any;

  constructor(private http : HttpClient) { 
    console.log('Hello comunications provider');
    
  }

  get consultores(){
    return this._consultores;
  }

  getConsultores(){
    return new Promise( (resolve,reject) =>{
        // Development connection
        // this.http.get('http://localhost:3001/api/consultores').subscribe( data =>{
          //Production Connection
          this.http.get('http://agencebr-test.us-3.evennode.com/api/consultores').subscribe( data =>{
          console.log('se recibieron consultores');
          console.log(data);
          if (data['success']){
            if( data['body'].length == 0 ){
              console.log('No hay consultores posibles');
              
              reject ('NO');
            } else {
              this._consultores = data['body']
              resolve(data['success']);
            }
          } else  {
            console.log('Error en petición');
            
            reject ('ERR');

          }
          
        } )
    })
  }

  getRelatorios(usuarios,startDate,endDate){
    let params = {
      co_usuario : usuarios,
      dates : {
        init : startDate,
        end : endDate
      }
    }
    console.log('solicitando relatorios con datos: ');
    console.log(params);
    return new Promise( (resolve,reject) =>{
      // develop conection
        // this.http.post('http://localhost:3001/api/relatorio',params).subscribe( data =>{
          //production connection
          this.http.post('http://agencebr-test.us-3.evennode.com/api/relatorio',params).subscribe( data =>{
          console.log('se recibieron relatorios');
          console.log(data);
          if (data['success']){
            if( Object.keys(data['relatorio']).length == 0 ){
              console.log('No hay relatorios para los usuarios y periodos seleccionados');
               reject ('NO');
            } else {
              resolve({relatorios : data['relatorio']});
            }            
          } else {
            console.log('Error en la peticion');
            
            reject ('ERR');
          }
          
        })
    })
  }
}
