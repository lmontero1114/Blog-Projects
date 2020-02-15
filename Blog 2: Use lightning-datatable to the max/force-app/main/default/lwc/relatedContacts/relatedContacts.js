import { LightningElement, api, track } from 'lwc';
import getContacts from '@salesforce/apex/RelatedContactsDataService.getRelatedContacts';
import upsertContacts from '@salesforce/apex/RelatedContactsDataService.upsertContacts';
import { deleteRecord } from 'lightning/uiRecordApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Tax Paid', fieldName: 'Tax_Paid__c', editable: true, type : 'currency'},
    { label: 'Pre Tax Income', fieldName: 'Pre_Tax_Income__c', editable: true, type : 'currency'},
    { label: 'Total Income' ,fieldName:'TotalIncome', editable: true, type: 'currency'},
    { type: 'action',
      typeAttributes: { rowActions: actions },
    },
];
const columnsdemo = [
    // Your column data here
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Tax Paid', fieldName: 'Tax_Paid__c', editable: true, type : 'currency'},
    { label: 'Pre Tax Income', fieldName: 'Pre_Tax_Income__c', editable: true, type : 'currency'},
    { label: 'total Income input', fieldName: 'totalIncomeInput', type : 'currency'},
    {
        label: '',
        type: 'displayTotalIncome',
        fieldName: 'totalIncome',
        fixedWidth: 70,
        typeAttributes: {
            taxPaid: { fieldName: 'taxPaid' },
            preTax: { fieldName: 'preTax' },
        },
    },
    {
        label: '',
        type: 'deleteRowButton',
        fieldName: 'deleteButton',
        fixedWidth: 70
    },

];

const TEMP_KEYWORD = 'temp';
const DELETE_MODAL_HEADER = 'Watch out!';
const DELETE_MODAL_CONTENT = 'Are you sure you want to delete this Contact?';
const VALIDATION_ERROR_TITLE = 'Validation Error';
const VALIDATION_ERROR_MESSAGE = 'Last Name field is required.';
const FIELDS_TO_VALIDATE = ['LastName'];

export default class RelatedContacts extends LightningElement {
    @api recordId;      //AccountId

    //Start properties tied to datatable component 
    @track contacts;    //rows in the table
    @track columns = columns;   //columns for table
    @track columnsdemo = columnsdemo;
    @track tableError;  //Contains the error is specific to the table for validation purposes
    @track isLoading = true;    //determines if table will show loading icon
    //End properties tied to datatable component

    rowToDelete;        //Contains row value when a row is marked for deletion.
    @track error;       //Contains error that is specific to the entire page

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

        this.modifyForInsert(draftValues);

        upsertContacts({contacts : draftValues})
            .then(() => {
                //to clear out the save/cancel
                this.refreshData();
                this.template.querySelector('c-my-datatable').draftValues = null;
                this.showToast(true,true);//arguments (isSuccess, isSave)

            })
            .catch( error => {
                this.error = error
                this.showToast(false,true);//arguments (isSuccess, isSave)
                this.hideLoader();
            });

    }

    handleCellChange(event){
        this.calculateTotalIncome(event.detail.draftValues);
    }

    handleAddNewRow(){
        //we need to have a temporary Id so that the datatable can distinguish between components
        //if i did not set the Id, when inline editing one row without Id, it would also modify the 
        //other row without the id
        this.contacts.push({"Id":TEMP_KEYWORD+this.temporaryId});
        this.template.querySelector('c-my-datatable').data = this.contacts;
    }

    handleRowDelete(event){
        this.rowToDelete = event.detail.row;  
        //since there is ony one row action, we dont need to check which action was clicked     
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

    //Function removes the temporary Id before inserting records into DB
    modifyForInsert(draftValues){
        draftValues.forEach(contact => {
            if(contact.Id.includes(TEMP_KEYWORD)){
                delete contact.Id;
                contact.AccountId = this.recordId;
            }
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

            if((row.Id.includes(TEMP_KEYWORD) && !row.LastName) || (!row.Id.includes(TEMP_KEYWORD) && row.LastName === '') ){
                this.tableError.rows[row.Id] = {title: VALIDATION_ERROR_TITLE,
                                     messages: [VALIDATION_ERROR_MESSAGE],
                                     fieldNames: FIELDS_TO_VALIDATE
                                    }
                isValid = false;
            }
        });
        return isValid;
    }

    //removes row from table
    removeRowFromTable(){
        const { Id } = this.rowToDelete;
        const index = this.findRowIndexById(Id);
        if (index !== -1) {
            if (index !== -1) {
                this.contacts = this.contacts
                    .slice(0, index)
                    .concat(this.contacts.slice(index + 1));
            }   
        }
    }

    //function that, given the Id, it finds the row number on the table
    findRowIndexById(Id) {
        let ret = -1;
        this.contacts.some((row, index) => {
            if (row.Id === Id) {
                ret = index;
                return true;
            }
            return false;
        });

        return ret;
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

    calculateTotalIncome(draftValues){
        //i would update the totalincome from this table, but if i wanted to add more columns, it would
        //get annoying because I would have to update the contacts array with every updated value
        //since, in order to show the total value in the table, i would have to update the entire array
        // in order to update the totalIncome field
        
        //get record id
        //get index 
        //get value changed
        //get the other value from draft values
        //if not there, get it from contacts array
        this.contacts[0].taxPaid = 3;
        this.contacts[0].FirstName = 'test name';
        this.contacts[0].totalIncomeInput = 3;
        // console.log('the draft vals are ' + JSON.stringify(draftValues));
        // console.log('the contacts arr is ' + JSON.stringify(this.contacts));
    }
}