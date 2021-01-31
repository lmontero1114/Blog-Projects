import { LightningElement, api, track } from "lwc";
import getRelatedContacts from "@salesforce/apex/RelatedContactsDataService.getRelatedContacts";
import { deleteRecord } from "lightning/uiRecordApi";

export default class RelatedContacts extends LightningElement {
  @track isLoading; //drived whether the Loading icon shows or not
  @track contacts = []; //contains the list of contacts in the table
  @track error; //if the error is filled out, it will display the error in the c-error-panel component

  //properties used to store temporary information when deleting contacts
  recordIdToDelete;
  indexToDelete;
  _recordId; //contains Account Id

  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this.setAttribute("recordId", value);
    this._recordId = value;
    this.getContacts();
  }

  //populates the contacts related to the account
  getContacts() {
    if (!this._recordId) {
      return;
    }
    //cannot be set to cacheable true, otherwise we cannot edit the 'contacts'
    //property when we want to add new rows
    getRelatedContacts({ accountId: this._recordId })
      .then((data) => {
        this.error = undefined;
        this.contacts = data;
      })
      .catch((error) => {
        this.error = error;
        this.contacts = undefined;
      });
  }

  //Start loading manager functions
  handleLoading() {
    this.isLoading = true;
  }
  handleDoneLoading() {
    this.isLoading = false;
  }
  //End loading manager functions

  //when the "add new contact" button is pressed, an empty string gets
  //inserted in the contacts array, which will add a new empty entry to the table
  handleAddNewContact() {
    this.contacts.push("");
  }

  //Modal functions
  get deleteModalHeader() {
    return "Watch out!";
  }

  get deleteModalContent() {
    return "Are you sure you want to delete this Contact?";
  }
  handleShowModal() {
    const modal = this.template.querySelector("c-modal");
    modal.show();
  }

  handleHideModal() {
    console.log("hiding modal");
    const modal = this.template.querySelector("c-modal");
    modal.hide();
  }
  //end modal functions

  //once a contact is Upserted, the Id and index gets received here via an event.
  handleContactUpsert(event) {
    let recordId = event.detail.Id;
    let index = event.detail.index;
    this.contacts[index] = recordId;
  }

  //Deleting functions
  handleDeleteRow(event) {
    this.recordIdToDelete = event.detail.Id;
    this.indexToDelete = event.detail.index;
    this.handleShowModal();
  }

  handleCancelDelete() {
    this.handleHideModal();
  }

  handleYesDelete() {
    this.handleHideModal();
    this.handleLoading();
    if (this.recordIdToDelete) {
      this.deleteContactDB();
    } else {
      this.removeRowFromTable();
      this.handleDoneLoading();
    }
  }

  deleteContactDB() {
    //using uiRecordApi to delete record
    deleteRecord(this.recordIdToDelete)
      .then(() => {
        this.error = undefined;
        this.removeRowFromTable();
        this.handleDoneLoading();
      })
      .catch((error) => {
        this.error = error;
        this.handleDoneLoading();
      });
  }

  removeRowFromTable() {
    this.contacts.splice(this.indexToDelete, 1);
  }
  //End delete functions
}
