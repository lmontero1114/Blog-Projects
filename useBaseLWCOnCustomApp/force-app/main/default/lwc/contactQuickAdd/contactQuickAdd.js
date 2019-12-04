import { LightningElement, wire, track } from 'lwc';

import queryAccounts from '@salesforce/apex/ContactQuickAdd.queryAccounts';

export default class ContactQuickAdd extends LightningElement {
    @wire(queryAccounts) accounts; 
    @track value = '--None--';
    
    get options() {  
        var retOptions = [];
        var account;
        
        for (account in this.accounts.data){
            if (Object.prototype.hasOwnProperty.call(this.accounts.data, account)) {
                retOptions.push({"label": this.accounts.data[account].Name, "value": this.accounts.data[account].Id});
            }
        } 
        return retOptions; 
    }

    handleChange(event) { 
        this.value = event.detail.value;
    }

}