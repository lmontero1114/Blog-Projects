import LightningDatatable from 'lightning/datatable';
import deleteRow from './deleteRow.html';
import totalIncome from './totalIncome.html';

export default class MyDatatable extends LightningDatatable {
   static customTypes = {
       deleteRowButton: {
           template: deleteRow
       },
       displayTotalIncome :{
            template: totalIncome,
            typeAttributes: ['taxPaid', 'preTax'],
       }
      //more custom types here
   };

}