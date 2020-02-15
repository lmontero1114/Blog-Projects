/* datatableDeleteRowBtn.js */
import { LightningElement, api } from 'lwc';

export default class DatatableDeleteRowBtn extends LightningElement {
    @api rowId;

    fireDeleteRow() {
        const event = CustomEvent('deleterow', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                row: {Id: this.rowId}
            },
        });
        this.dispatchEvent(event);
    }
}