import { createElement } from "lwc";
import EditContactRow from "c/editContactRow";

let element;

function triggerFormOnLoad(element){
    const form = element.shadowRoot.querySelector("lightning-record-edit-form");
    expect(form).not.toBeNull();
    form.dispatchEvent(new CustomEvent("load"));

}

function checkTotalIncome(total){
    const totalIncome = element.shadowRoot.querySelector(
        "lightning-formatted-number"
    );
    expect(totalIncome.value).toBe(total);
}

describe("c-edit-contact-row", () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }
    });

    beforeEach(() =>{
        element = createElement("c-edit-contact-row", {
            is: EditContactRow
        });
        document.body.appendChild(element);
    });
    
    it("checks that total income is updated correclty on creation", () => {

        //trigger on load event
        triggerFormOnLoad(element);
        return Promise.resolve()
        .then(() => {
            checkTotalIncome(0);
        });
    
    });

    it("checks that total income is updated correctly when pre-tax income field is updated", () => {
        const PRE_TAX = '34';
        const TOTAL = 34;
        const preTax = element.shadowRoot.querySelector(
            "[data-field='PreTaxIncome']"
        );
        preTax.value = PRE_TAX;
        
        expect(preTax).not.toBeNull();
        preTax.dispatchEvent(new CustomEvent("change"));
        return Promise.resolve()
        .then(() => {
            checkTotalIncome(TOTAL);
        });
    });

    it("checks that total income is updated correctly when tax-paid field is updated", () => {
        const TAX_PAID = '34';
        const TOTAL = 34;
        const taxPaid = element.shadowRoot.querySelector(
            "[data-field='TaxPaid']"
        );
        taxPaid.value = TAX_PAID;
        
        expect(taxPaid).not.toBeNull();
        taxPaid.dispatchEvent(new CustomEvent("change"));
        return Promise.resolve()
        .then(() => {
            checkTotalIncome(TOTAL);
        });
    });

    it("checks that when input values are updated the total is calculated correclty", () =>{
        const TAX_PAID = '10';
        const PRE_TAX = '10';
        const TOTAL = 20;
        const taxPaid = element.shadowRoot.querySelector("[data-field='TaxPaid']");
        taxPaid.value = TAX_PAID;

        const preTax = element.shadowRoot.querySelector("[data-field='PreTaxIncome']" );
        preTax.value = PRE_TAX;
        
        expect(taxPaid).not.toBeNull();
        taxPaid.dispatchEvent(new CustomEvent("change"));
        return Promise.resolve()
        .then(() => {
            checkTotalIncome(TOTAL);
        });
    });

    if("changes the row to edit mode", () => {
        const editButton = element.shadowRoot.querySelector(
            "[data-label='editButton']"
        );
        expect(editButton).not.toBeNull();
        editButton.click();
        return Promise.resolve()
        .then(() => {
            const editButtonOnEditMode = element.shadowRoot.querySelector(
                "[data-label='editButton']"
            );
            expect(editButtonOnEditMode).toBeNull();

        });

    });

    if("changes the row to delete mode", () => {
        const deleteButton = element.shadowRoot.querySelector(
            "[data-label='deleteButton']"
        );
        expect(deleteButton).not.toBeNull();
        deleteButton.click();
        
        // Mock handler for toast event
        const deleteHandler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener('delete', deleteHandler);

        return Promise.resolve()
        .then(() => {
            //event has been triggered
            expect(deleteHandler).toHaveBeenCalledTimes(1);

        });
    });

});

