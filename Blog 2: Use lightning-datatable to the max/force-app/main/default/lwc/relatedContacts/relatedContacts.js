import { LightningElement, api, track } from 'lwc';
import getContacts from '@salesforce/apex/RelatedContactsDataService.getRelatedContacts';
import upsertContacts from '@salesforce/apex/RelatedContactsDataService.upsertContacts';
import { deleteRecord } from 'lightning/uiRecordApi';
import {findRowIndexById,
        getFieldValueFromArray,
        validateNullValue,
        validateFieldsLength,
        modifyForInsert
        } from './relatedContactsUtil.js'; 
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Tax Paid', fieldName: 'Tax_Paid__c', editable: true, type : 'currency'},
    { label: 'Pre Tax Income', fieldName: 'Pre_Tax_Income__c', editable: true, type : 'currency'},
    { label: 'Total Income' ,fieldName:'Total_Income__c', type: 'currency'},
    { type: 'button-icon',
      typeAttributes: { iconName: 'utility:delete',name:'delete' },
    },
];

const TEMP_KEYWORD = 'temp';
const DELETE_MODAL_HEADER = 'Watch out!';
const DELETE_MODAL_CONTENT = 'Are you sure you want to delete this Contact?';

export default class RelatedContacts extends LightningElement {
    @api recordId;      //AccountId

    //Start properties tied to datatable component 
    @track contacts;    //rows in the table
    columns = columns;   //columns for table
    tableError;  //Contains the error is specific to the table for validation purposes
    isLoading = true;    //determines if table will show loading icon
    //End properties tied to datatable component

    rowToDelete;        //Contains row value when a row is marked for deletion.
    error;       //Contains error that is specific to the entire page

    connectedCallback(){
        this.refreshData();
    }
    
    //function used to set temporary Id for newly added rows,these Ids are needed for the Datatable to work correctly
    get temporaryId(){
        return this.contacts.length;
    }

    handleSave(event) {
        this.showLoader();
        const draftValues = event.detail.draftValues;
        if(!this.validate(draftValues)){
            this.hideLoader();
            return;
        }

        modifyForInsert(draftValues,this.recordId);

        upsertContacts({contacts : draftValues})
            .then(() => {
                //to clear out the save/cancel
                this.refreshData();
                this.template.querySelector('lightning-datatable').draftValues = null;
                this.showToast(true,true);//arguments (isSuccess, isSave)

            })
            .catch( error => {
                this.error = error
                this.showToast(false,true);//arguments (isSuccess, isSave)
                this.hideLoader();
            });

    }

    handleCellChange(event){
        //this.calculateTotalIncome(event.detail.draftValues[0]); //on cell change only returns one item in the array
        this.updateContactsArrayWithDraftValues(event.detail.draftValues[0]);
    }

    handleAddNewRow(){
        //we need to have a temporary Id so that the datatable can distinguish between components
        //if i did not set the Id, when inline editing one row without Id, it would also modify the 
        //other row without the id
        this.contacts.push({"Id":TEMP_KEYWORD+this.temporaryId});
        this.template.querySelector('lightning-datatable').data = this.contacts;
    }

    handleRowAction(event){
        //since there is ony one row action, we dont need to check which action was clicked     
        this.rowToDelete = event.detail.row;  
        this.handleShowModal();
    }
    
    handleCancelDelete(){
        this.handleHideModal();
    }

    handleYesDelete(){
        this.handleHideModal();
        //this.handleLoading();
        if(this.rowToDelete.Id.includes(TEMP_KEYWORD)){
            this.removeRowFromTable();
            this.removeRowFromDraft();
        }else{
            this.deleteContactDB();
        }

    }
    
    deleteContactDB(){
        this.showLoader();
        //using uiRecordApi to delete record
        deleteRecord(this.rowToDelete.Id)
            .then(() => {
                this.error = undefined;
                this.removeRowFromTable();
                this.removeRowFromDraft();
                this.hideLoader();
                this.showToast(true,false);//arguments (isSuccess, isSave)
                //this.handleDoneLoading();
            })
            .catch(error => {
                this.error = error;
                this.hideLoader();
                this.showToast(false,false);//arguments (isSuccess, isSave)

                //this.handleDoneLoading();
            }); 
    }

    //calls DB to query for Account's contacts
    refreshData(){
        getContacts({accountId: this.recordId})
        .then(data => {
            data[0].preTax = 11;
            data[0].taxPaid = 10;
            this.contacts = data;
            this.hideLoader();
        })
        .catch(error =>
        {
            this.error = error;
            this.hideLoader();
        });
    }

    //Does validation on form, making sure Last name fiels is not blank
    validate(draftValues){

        let isValid = true;
        this.tableError = {rows: {},table:{}};

        //Iterate through draftvalues
        //If we are inserting a record the last name HAS to be in the Draft and NOT NULL
        //If we are updaring a record, if the last name is in the draft, it cannot be null
        draftValues.forEach( row => {
            let requiredValuesAreFilled = validateNullValue(row, this.tableError);
            let fieldLengthsValid = validateFieldsLength(row,this.tableError);
            isValid = requiredValuesAreFilled && fieldLengthsValid;
        });
        return isValid;
    } 

    //removes row from table
    removeRowFromTable(){
        const { Id } = this.rowToDelete;
        const index = findRowIndexById(Id, this.contacts);
        if (index !== -1) {
            if (index !== -1) {
                this.contacts = this.contacts.slice(0, index).concat(this.contacts.slice(index + 1));
            }   
        }
    }
    
    //removes row from draft
    //this is necessary, because if a row is deleted before being inserted, it also has to be deleted form the draft
    removeRowFromDraft(){
        let tableDraftValues = this.template.querySelector('lightning-datatable').draftValues;
        const { Id } = this.rowToDelete;
        const index = findRowIndexById(Id, tableDraftValues);
        if (index !== -1) {
            if (index !== -1) {
                tableDraftValues = tableDraftValues.slice(0, index).concat(tableDraftValues.slice(index + 1));
            }   
        }
        this.template.querySelector('lightning-datatable').draftValues = tableDraftValues;
    }

    //Modal functions
    get deleteModalHeader(){
        return DELETE_MODAL_HEADER;
    }

    get deleteModalContent(){
        return DELETE_MODAL_CONTENT;
    }
    
    handleShowModal() {
        const modal = this.template.querySelector('c-modal');
        modal.show();
    }

    handleHideModal() {
        const modal = this.template.querySelector('c-modal');
        modal.hide();
    }
    //end modal functions

    showLoader(){
        this.isLoading = true;
    }

    hideLoader(){
        this.isLoading = false;
    }

    showToast(isSuccess, isSave){
        this.dispatchEvent(new ShowToastEvent({
            title: isSuccess ? 'Success!!' : 'Error',
            message: isSuccess && isSave ? 'Contacts were saved Successfully.' : 
                    !isSuccess && isSave ? 'There was an issue saving the contacts.':
                    isSuccess && !isSave ? 'The contact was deleted successfully.':
                    'There was an issue deleting the contact.',
            variant: isSuccess ? 'success' : 'error'
        }),);
    }

    //Iterate through contacts array to find the edited record, and update the total income field
    updateContactsArrayWithDraftValues(draftValues){
        let recordId = draftValues.Id;
        this.contacts.forEach(row =>{
            if(row.Id !== recordId){
                return;
            }
            let taxPaid = this.getFieldValueFromDraftValues(row.Id,'Tax_Paid__c', row.Tax_Paid__c);
            let preTaxIncome = this.getFieldValueFromDraftValues(row.Id,'Pre_Tax_Income__c',row.Pre_Tax_Income__c);
            row.Total_Income__c = parseFloat(taxPaid === '' ? 0 : taxPaid) + parseFloat(preTaxIncome === '' ? 0 : preTaxIncome);
        });
    }

    //finds the field value for a specific record. First it searches on the table draft
    //if it is not there, it updates it with the table value
    getFieldValueFromDraftValues(recordId,fieldName, initialTableValue){
        let tableDraftValues = this.template.querySelector('lightning-datatable').draftValues;
        let fieldValue = getFieldValueFromArray(recordId,fieldName, tableDraftValues );
        if(fieldValue === undefined){
            fieldValue = initialTableValue;
            if(fieldValue === undefined){
                fieldValue = 0;
            }
        }
        return fieldValue;
    }

}