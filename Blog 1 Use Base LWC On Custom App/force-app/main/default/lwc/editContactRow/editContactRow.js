import { LightningElement, api, track } from "lwc";

export default class EditContactRow extends LightningElement {
  @api accountId;
  @api index;
  @api contactId; //record id for update form
  @track _contactId; //record id once it is inserted
  @track isReadOnly = true;
  @track totalIncome = 0;

  connectedCallback() {
    if (this.contactId === "") {
      this.editMode();
    }
  }

  //returns the id sent by the API if the value exists, if not,
  //it sends the value of the newly created record
  get contactRecordId() {
    return this.contactId ? this.contactId : this._contactId;
  }

  //updates Total Income column when pre-tax income and Tax column changes
  handleUpdateTotals() {
    let preTax = this.getNumber("[data-field='PreTaxIncome']");
    let taxPaid = this.getNumber("[data-field='TaxPaid']");
    this.totalIncome = preTax + taxPaid;
  }

  getNumber(querySelectorStr) {
    let value = this.template.querySelector(querySelectorStr).value;
    if (!value) return 0;

    let decimal = parseFloat(value);
    if (decimal) return decimal;
    return 0;
  }
  //end Total Income functions

  //called when the user clicks on the edit icon
  handleOnEdit() {
    this.editMode();
  }

  //when clicking on delete icon, a custom event will be sent with the Id
  //of the record to be deleted, and the
  //index, to know which row to remove from the array.
  handleOnDelete() {
    const deleteEvent = new CustomEvent("delete", {
      detail: { Id: this.contactRecordId, index: this.index }
    });
    this.dispatchEvent(deleteEvent);
  }

  //Called after record is saved and validation rules are performed(validation required fields)
  //pre-populate account Id before sending it to the Database
  handleSubmit(event) {
    this.sendStartLoadMessage();
    event.preventDefault(); // stop the form from submitting
    const fields = event.detail.fields;
    fields.AccountId = this.accountId;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  //Called after the record is saved successfully
  //It sends a custom event to update the record id on the contact array on parent
  handleSuccess(event) {
    this._contactId = event.detail.id;
    this.readMode();
    this.endEndLoadMessage();
    this.updateRecordIdOnParent();
  }

  updateRecordIdOnParent() {
    const updateRecordId = new CustomEvent("success", {
      detail: { Id: this.contactRecordId, index: this.index }
    });
    this.dispatchEvent(updateRecordId);
  }

  //Called if there is an error when error is saved.
  handleError() {
    this.endEndLoadMessage();
  }

  //called when editing is canceled, fields are reset to original values.
  handleCancel() {
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
        this.readMode();
      });
    }
  }

  //start loading functions
  sendStartLoadMessage() {
    this.notifyLoading(true);
  }

  endEndLoadMessage() {
    this.notifyLoading(false);
  }

  notifyLoading(isLoading) {
    this.dispatchEvent(new CustomEvent(isLoading ? "loading" : "doneloading"));
  }
  //end loading functions

  //Begins handle edit/read modes
  readMode() {
    this.isReadOnly = true;
  }

  editMode() {
    this.isReadOnly = false;
  }
  //end handle edit/read modes
}
