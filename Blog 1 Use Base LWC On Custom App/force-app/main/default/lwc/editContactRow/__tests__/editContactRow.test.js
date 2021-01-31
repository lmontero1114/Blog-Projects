import { createElement } from "lwc";
import EditContactRow from "c/editContactRow";

let element;

function triggerFormOnLoad(element) {
  const form = element.shadowRoot.querySelector("lightning-record-edit-form");
  expect(form).not.toBeNull();
  form.dispatchEvent(new CustomEvent("load"));
}

function checkTotalIncome(total) {
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

  beforeEach(() => {
    element = createElement("c-edit-contact-row", {
      is: EditContactRow
    });
    document.body.appendChild(element);
  });

  it("checks that total income is updated correclty on creation", () => {
    //trigger on load event
    triggerFormOnLoad(element);
    return Promise.resolve().then(() => {
      checkTotalIncome(0);
    });
  });

  it("checks that total income is updated correctly when pre-tax income field is updated", () => {
    const PRE_TAX = "34";
    const TOTAL = 34;
    const preTax = element.shadowRoot.querySelector(
      "[data-field='PreTaxIncome']"
    );
    preTax.value = PRE_TAX;

    expect(preTax).not.toBeNull();
    preTax.dispatchEvent(new CustomEvent("change"));
    return Promise.resolve().then(() => {
      checkTotalIncome(TOTAL);
    });
  });

  it("checks that total income is updated correctly when tax-paid field is updated", () => {
    const TAX_PAID = "34";
    const TOTAL = 34;
    const taxPaid = element.shadowRoot.querySelector("[data-field='TaxPaid']");
    taxPaid.value = TAX_PAID;

    expect(taxPaid).not.toBeNull();
    taxPaid.dispatchEvent(new CustomEvent("change"));
    return Promise.resolve().then(() => {
      checkTotalIncome(TOTAL);
    });
  });

  it("checks that when input values are updated the total is calculated correclty", () => {
    const TAX_PAID = "10";
    const PRE_TAX = "10";
    const TOTAL = 20;
    const taxPaid = element.shadowRoot.querySelector("[data-field='TaxPaid']");
    taxPaid.value = TAX_PAID;

    const preTax = element.shadowRoot.querySelector(
      "[data-field='PreTaxIncome']"
    );
    preTax.value = PRE_TAX;

    expect(taxPaid).not.toBeNull();
    taxPaid.dispatchEvent(new CustomEvent("change"));
    return Promise.resolve().then(() => {
      checkTotalIncome(TOTAL);
    });
  });

  it("changes the row to edit mode", () => {
    const editButton = element.shadowRoot.querySelector(
      "[data-label='editButton']"
    );
    expect(editButton).not.toBeNull();
    editButton.click();
    return Promise.resolve().then(() => {
      const editButtonOnEditMode = element.shadowRoot.querySelector(
        "[data-label='editButton']"
      );
      expect(editButtonOnEditMode).toBeNull();
    });
  });

  it("changes the row to delete mode", () => {
    // Mock handler for delete event
    const deleteHandler = jest.fn();
    element.addEventListener("delete", deleteHandler);

    const deleteButton = element.shadowRoot.querySelector(
      "[data-label='deleteButton']"
    );
    expect(deleteButton).not.toBeNull();
    deleteButton.click();

    return Promise.resolve().then(() => {
      //event has been triggered
      expect(deleteHandler).toHaveBeenCalledTimes(1);
    });
  });

  it("checks when record is submitted it calls to load the page", () => {
    // Mock handler for loader event
    const loadingHandler = jest.fn();
    element.addEventListener("loading", loadingHandler);

    const form = element.shadowRoot.querySelector("lightning-record-edit-form");
    //mocks the submit function for lightning-record-edit-form
    form.submit = jest.fn();
    form.dispatchEvent(new CustomEvent("submit", { detail: { fields: {} } }));

    return Promise.resolve().then(() => {
      //make sure the loading event was fired when submitting the form
      expect(loadingHandler).toHaveBeenCalledTimes(1);
    });
  });

  it("checks when form succeeds it calls to stop loading the page", () => {
    const doneLoading = jest.fn();
    element.addEventListener("doneloading", doneLoading);

    //submit success event from the Form
    const form = element.shadowRoot.querySelector("lightning-record-edit-form");
    form.dispatchEvent(new CustomEvent("success", { detail: { id: {} } }));

    return Promise.resolve().then(() => {
      expect(doneLoading).toHaveBeenCalled();
    });
  });

  it("checks when form errors out it calls to stop loading the page", () => {
    const doneLoading = jest.fn();
    element.addEventListener("doneloading", doneLoading);

    //submit success event from the Form
    const form = element.shadowRoot.querySelector("lightning-record-edit-form");
    form.dispatchEvent(new CustomEvent("error"));

    return Promise.resolve().then(() => {
      expect(doneLoading).toHaveBeenCalled();
    });
  });

  it("checks when form is cancelled the form goes back to read mode", () => {
    //set edit mode
    const editButton = element.shadowRoot.querySelector(
      "[data-label='editButton']"
    );
    expect(editButton).not.toBeNull();
    editButton.click();

    return Promise.resolve()
      .then(() => {
        //populate tax paid field
        const TAX_PAID = "10";
        const taxPaid = element.shadowRoot.querySelector(
          "[data-field='TaxPaid']"
        );
        expect(taxPaid).not.toBeNull();
        taxPaid.value = TAX_PAID;

        //click on cancel button
        const cancelButton = element.shadowRoot.querySelector(
          "[data-label='cancelButton']"
        );
        expect(cancelButton).not.toBeNull();
        cancelButton.click();
      })
      .then(() => {
        const cancelButton = element.shadowRoot.querySelector(
          "[data-label='cancelButton']"
        );
        expect(cancelButton).toBeNull();
      });
  });
});
