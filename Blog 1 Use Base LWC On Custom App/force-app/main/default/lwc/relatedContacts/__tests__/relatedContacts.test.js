import { createElement } from "lwc";
import RelatedContacts from "c/relatedContacts";
import getRelatedContacts from "@salesforce/apex/RelatedContactsDataService.getRelatedContacts";

let element;

// Mocking imperative Apex method call
jest.mock(
  "@salesforce/apex/RelatedContactsDataService.getRelatedContacts",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);
function flushPromises() {
  // eslint-disable-next-line no-undef
  return new Promise((resolve) => setImmediate(resolve));
}

// Sample data for imperative Apex call
const ACCOUNT_ID = "0001";
const APEX_CONTACT_SUCCESS_0 = [];
const APEX_CONTACT_SUCCESS_1 = ["0031700000pJRRSAA4"];
const APEX_CONTACT_SUCCESS_2 = ["0031700000pJRRSAA4", "0031700000pJRRSAA3"];

// Sample error for imperative Apex call
const APEX_CONTACT_ERROR = {
  body: { message: "An internal server error has occurred" },
  ok: false,
  status: 400,
  statusText: "Bad Request"
};

describe("c-related-contacts", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  beforeEach(() => {
    element = createElement("c-related-contacts", {
      is: RelatedContacts
    });
    document.body.appendChild(element);
  });

  it("checks error when there is no account id", () => {
    const APEX_PARAMETERS = { accountId: '' };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_0);

    element.recordId = null;
    return Promise.resolve()
      .then(() => {
        //this function never gets called because recordId is null
        expect(getRelatedContacts.mock.calls.length).toEqual(0);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(0);
      });
  });
  it("checks successful query of contacts when returning 0", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_0);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        expect(getRelatedContacts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(0);
      });
  });

  it("checks successful query of contacts when returning 1", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_1);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        expect(getRelatedContacts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(1);
      });
  });

  it("checks successful query of contacts when returning 2", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_2);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        expect(getRelatedContacts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(2);
      });
  });

  it("checks error when querying of contacts", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };
    getRelatedContacts.mockRejectedValue(APEX_CONTACT_ERROR);

    element.recordId = ACCOUNT_ID;
    expect(element.recordId).toEqual(ACCOUNT_ID);
    return flushPromises().then(() => {
      //c-error-panel
      const error_panel = element.shadowRoot.querySelectorAll("c-error-panel");
      expect(error_panel.length).toEqual(1);
    });
  });

  it("checks Add New Contact button works", () =>{
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };
    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_0);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        const rowsBefore = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rowsBefore.length).toBe(0);

        element.shadowRoot.querySelector('[data-id="addNewContactButton"]').click();
        
      })
      .then(() => {
        const rowsAfter = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rowsAfter.length).toBe(1);
      });
  })

  it("checks delete button works as expected", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_1);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        expect(getRelatedContacts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(1);
        
        rows[0].dispatchEvent(new CustomEvent("delete", {detail:{Id:APEX_PARAMETERS[0]}}));
      })
      .then(() => {
        expect(element.shadowRoot.querySelectorAll('[data-id="buttonToApproveDelete"]').length).toBe(1);
        element.shadowRoot.querySelectorAll('[data-id="buttonToApproveDelete"]')[0].click();
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(0);
      });
  });

  it("checks cancel delete button works as expected", () => {
    const APEX_PARAMETERS = { accountId: ACCOUNT_ID };

    getRelatedContacts.mockResolvedValue(APEX_CONTACT_SUCCESS_1);

    element.recordId = ACCOUNT_ID;
    return Promise.resolve()
      .then(() => {
        expect(getRelatedContacts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(1);
        
        rows[0].dispatchEvent(new CustomEvent("delete", {detail:{Id:APEX_PARAMETERS[0]}}));
      })
      .then(() => {
        expect(element.shadowRoot.querySelectorAll('[data-id="buttonToCancelDelete"]').length).toBe(1);
        element.shadowRoot.querySelectorAll('[data-id="buttonToCancelDelete"]')[0].click();
      })
      .then(() => {
        const rows = element.shadowRoot.querySelectorAll("c-edit-contact-row");
        expect(rows.length).toBe(1);
      });
  });


});
