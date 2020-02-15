import { LightningElement, api } from 'lwc';

export default class TotalIncome extends LightningElement {
    @api taxPaid;
    @api preTax;

    get totalIncome(){
        return this.taxPaid + this.preTax;
    }
}