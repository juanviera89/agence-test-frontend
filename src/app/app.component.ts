import { Component } from '@angular/core';
import { CommunicationsService } from './communications.service';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  public perfomanceType = 'consultor';
  public displaySegment = '';

  public startDate = {
    year : 2000,
    month : 0
  }
  public endtDate = {
    year : 2000,
    month : 0
  }
  public years = [];
  public months = [0,1,2,3,4,5,6,7,8,9,10,11];
  public monthsLabels = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  private _consultoresList = [];
  private _consultoresSelected = [];

  private _relatorios = {};
  public relatorioMsg = '';
  public relatorioLoadingFlag = false;
  public obj = Object;

  public chart : any;

  constructor (public coms : CommunicationsService) {

    for (var index = 2000; index < 2019; index++) {
      
      this.years.push(index);
      
    }

    this.coms.getConsultores().then( res =>{
      this._consultoresList = this.coms.consultores;
    });
  }

  get consultoresList(){
    return this._consultoresList;
  }

  get consultoresSelected(){
    return this._consultoresSelected;
  }

  get relatorios(){
    //let a = Object.keys(this._relatorios);
    return this._relatorios;
  }

  private getDataForDisplay(){

    return new Promise( (resolve,reject) =>{
      let co_usuarioArr = [];
      for (let usuario of this._consultoresSelected) {
        co_usuarioArr.push(usuario['co_usuario']);
      }
      this.coms.getRelatorios(co_usuarioArr,this.startDate,this.endtDate).then( res => {
        this._relatorios = res['relatorios'];
        resolve(true);
      }).catch( err =>{
        reject(err);
      })
    })
  }

  getRelatorios(){
    this.displaySegment = '';
    this.relatorioMsg = 'Cargando relatorios, por favor espere un momento...';
    this.relatorioLoadingFlag = true;

    this.getDataForDisplay().then(res => {
      this.displaySegment = 'relatorio';
      this.relatorioLoadingFlag= false;
    }).catch(err =>{
      this.relatorioMsg = 'No existen relatorios para la combinacion de usuarios y fechas seleccionadas';
    })

  }

  getUserName(co_usuario){
    for (let usuario of this._consultoresSelected) {
      if (co_usuario == usuario['co_usuario']) return usuario['no_usuario'];
    }
  }

  getTotalPerYear(co_usuario,year){
    let total = [0,0,0,0]; // receita liquita, custo fixo, commisao, lucro
    for (var month in this._relatorios[co_usuario][year]) {
      total[0]+= this._relatorios[co_usuario][year][month]['receitaLiquida'];
      total[1]+= this._relatorios[co_usuario][year][month]['custoFijo'];
      total[2]+= this._relatorios[co_usuario][year][month]['comissao'];
      total[3]+= this._relatorios[co_usuario][year][month]['lucro'];
    }
    return total;
  }

  private getCustoFijoMedio(){

    let custoFijoMedio = 0;
    for (var co_usuario in this._relatorios) {
      let firstYear = Object.keys( this._relatorios[co_usuario])[0];
      let firstMonth = Object.keys( this._relatorios[co_usuario][firstYear])[0];
      let cf = this._relatorios[co_usuario][firstYear][firstMonth]['custoFijo'];
      console.log(`costo fijo de ${co_usuario} : ` + cf);
      custoFijoMedio += cf;
    }

    custoFijoMedio = custoFijoMedio / (Object.keys(this._relatorios).length);
    console.log('Custo fixo medio: ' + custoFijoMedio);

    return custoFijoMedio
  }

  getGrafico(){
    this.displaySegment = '';
    this.relatorioMsg = 'Cargando grafico, por favor espere un momento...';
    this.relatorioLoadingFlag = true;

    this.getDataForDisplay().then(res => {
      
      this.displaySegment = 'grafico';
      this.relatorioLoadingFlag= false;
      this.setChart();

      
    }).catch(err =>{
      this.relatorioMsg = 'No existen datos para la combinacion de usuarios y fechas seleccionadas';
    })
    
  }

  getPizza(){
    this.displaySegment = '';
    this.relatorioMsg = 'Cargando grafico de pizza, por favor espere un momento...';
    this.relatorioLoadingFlag = true;

    this.getDataForDisplay().then(res => {
      
      this.displaySegment = 'pizza';
      this.relatorioLoadingFlag= false;
      this.setPieChart();

      
    }).catch(err =>{
      this.relatorioMsg = 'No existen datos para la combinacion de usuarios y fechas seleccionadas';
    })
    
  }

  private getChartXAxisKeys(){
    let _date = new Date();
    _date.setFullYear(this.startDate.year);
    _date.setMonth(this.startDate.month);

    let _dateEnd = new Date();
    _dateEnd.setFullYear(this.endtDate.year);
    _dateEnd.setMonth(this.endtDate.month);

    let XAxisSeriesKeyGet = []; // Para recorrer el objeto de relatorios
    for (_date; _date <= _dateEnd; _date.setMonth(_date.getMonth()+1)) {
      //console.log(_date.toISOString());
      XAxisSeriesKeyGet.push([_date.getFullYear(),_date.getMonth()]);
    }

    console.log(XAxisSeriesKeyGet);

    return XAxisSeriesKeyGet;
    
  }

  private getChartXAxisLabels(arr){
    let XAxisLabels = []; // para las etiquetas del eje X
    for (let pair of arr) {
      XAxisLabels.push( pair[0] + '-' + this.monthsLabels[pair[1]].substr(0,3));
    }
    console.log(XAxisLabels);
    
    return XAxisLabels;
  }

  private getUserPerfomanceSeries(keySearchArr){
    let series = []
    for (var co_user in this._relatorios) {
      let tempSerie = {
        type: 'column',
        name: this.getUserName(co_user),
        data: []
      }
      for (let keys of keySearchArr) {
        // los keys tienen formato [year , month]
        //se debe verificar la existencia de los Keys para evitar errores de ejecucion por objetos no definidos
        if (this._relatorios[co_user].hasOwnProperty(keys[0])) {
          // verifica que hayan relatorios para e año
          if (this._relatorios[co_user][keys[0]].hasOwnProperty(keys[1])) {
            //verifica que haya relatorio del mes
            tempSerie.data.push(this._relatorios[co_user][keys[0]][keys[1]]['receitaLiquida'])
          } else {
            // si no hay relatorio se estabece su receita liquida en 0
            tempSerie.data.push(0)

          }
        } else {
          // si no hay relatorio se estabece su receita liquida en 0
          tempSerie.data.push(0)
        }
      }

      series.push(tempSerie);

    }

    // #######################################
    // Linea de costo fijo medio
    let _tempSerie = {
      type: 'line',
      name: 'Custo Fixo Medio',
      data: []
    }

    let custoFijoMedio = this.getCustoFijoMedio();

    for (var index = 0; index < keySearchArr.length; index++) {
      _tempSerie.data.push(custoFijoMedio);
      
    }

    series.push(_tempSerie);
    // #########################################

    console.log(series);
    
    return series;
  }

  private getUserPizzaSeries(keySearchArr){
    let series = [{
      name: 'Receitas liquidas',
      data: []
  }]
    for (var co_user in this._relatorios) {
      let tempPoint = {
        name: this.getUserName(co_user),
        y: 0
    }
      for (let keys of keySearchArr) {
        // los keys tienen formato [year , month]
        //se debe verificar la existencia de los Keys para evitar errores de ejecucion por objetos no definidos
        if (this._relatorios[co_user].hasOwnProperty(keys[0])) {
          // verifica que hayan relatorios para e año
          tempPoint.y += this.getTotalPerYear(co_user,keys[0])[0];
        } 
      }

      series[0].data.push(tempPoint);

    }
    console.log(series);
    
    return series;
  }

  private setPieChart(){

    let XAxisKeys = this.getChartXAxisKeys();
    let series = this.getUserPizzaSeries(XAxisKeys);


    this.chart = new Chart({
      
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    credits: {
      enabled: false
    },
    title: {
        text: `Receitas liquidas ( ${this.startDate.month + 1}-${this.startDate.year} <> ${this.endtDate.month + 1}-${this.endtDate.year} )`
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: ' {point.percentage:.1f} %'
            },
        showInLegend: true
        }
    },
    series: series

    });
  }

  private setChart(){

    let XAxisKeys = this.getChartXAxisKeys();
    let XAxisLabels = this.getChartXAxisLabels(XAxisKeys);
    let series = this.getUserPerfomanceSeries(XAxisKeys);

    this.chart = new Chart({
      
      title: {
        text: 'Desempeño de Consultores'
      },
      credits: {
        enabled: false
      },
      xAxis: {
          categories: XAxisLabels
      },
      series: series
    });
  }

  setMonth(N : number,start : boolean){
    if(start){
      this.startDate.month = N;
      
    } else {
      this.endtDate.month = N;
    }
    this.validateDates();
  }

  setYear(N : number,start : boolean){
    if(start){
      this.startDate.year = N;
      
    } else {
      this.endtDate.year = N;
    }
    this.validateDates();
  }

  validateDates(){

    if(this.endtDate.year<this.startDate.year){
      this.endtDate.year = this.startDate.year;

    }

    if (this.endtDate.month < this.startDate.month && this.endtDate.year==this.startDate.year){
      this.endtDate.month = this.startDate.month;

    }

  }

  moveConsutores(select : boolean){
    //funcion para pasar todos los consultores seleccionados a la lista de consulta y viceversa
    
    let listFrom = select ? this._consultoresList : this._consultoresSelected;
    let listTo = select ? this._consultoresSelected : this._consultoresList;
    let indexToRemove = [];
    let index = 0;
    for (let usuario of listFrom) {
      if (usuario.hasOwnProperty('selected')) {
        if (usuario['selected']){
          usuario['selected']=false; // se devuelve a false porque pasa a otra lista lista 
          listTo.push(usuario); 
          indexToRemove.push(index);
        }
        
      }
      index++;
    }

    for (let N of indexToRemove) {
      // Se remueven los usuarios fuera del primer ciclo ya que no se debe alterar 
      // la longitud del arreglo a medida que se recorreo pued presenta errores 
      // en el proceso establecido
      listFrom.splice(N,1); //los usuarios solo deben estar en una de las dos listas
    }

  }

  

}
