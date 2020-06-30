const TEMP_KEYWORD = 'temp';
const VALIDATION_ERROR_TITLE = 'Validation Error';
const LAST_NAME_REQUIRED_MESSAGE = 'Last Name field is required.';
const FIRST_NAME_MAX_SIZE_MESSAGE = 'The First Name has to be less than 40 characters long.';
const LAST_NAME_MAX_SIZE_MESSAGE = 'The Last Name has to be less than 80 characters long.';
const TAX_PAID_MAX_SIZE_MESSAGE = 'The Tax Paid has to be less 9999999999999999.99';
const PRE_TAX_MAX_SIZE_MESSAGE = 'The Pre Tax Income has to be less than 9999999999999999.99';
const LAST_NAME = 'LastName';
const FIRST_NAME = 'FirstName';
const TAX_PAID = 'Tax_Paid__c';
const PRE_TAX = 'Pre_Tax_Income__c';

//Given an array and an Id, it fiends the index that the record occupies in the array
export function findRowIndexById(Id, arrayToSearch){
    let ret = -1;
    arrayToSearch.some((row, index) => {
        if (row.Id === Id) {
            ret = index;
            return true;
        }
        return false;
    });
    return ret;
}

//function that gets the field value from an array of records
export function getFieldValueFromArray(recordId, FieldName, arrayToSearch){
    let index = findRowIndexById(recordId, arrayToSearch);
    if(index === -1){
        return undefined;
    }
    let row = arrayToSearch[index];
    return row[FieldName];
}


export function validateNullValue(row,tableError){
    let isValid = true;
    if((row.Id.includes(TEMP_KEYWORD) && !row.LastName) || (!row.Id.includes(TEMP_KEYWORD) && row.LastName === '') ){
        addErrorMessage(tableError,row.Id,VALIDATION_ERROR_TITLE,LAST_NAME_REQUIRED_MESSAGE,LAST_NAME);
        isValid = false;
    }
    return isValid;
}

export function validateFieldsLength(row,tableError){
    let isValid = true;
    if(row.FirstName && row.FirstName.length > 40){
        addErrorMessage(tableError,row.Id,VALIDATION_ERROR_TITLE,FIRST_NAME_MAX_SIZE_MESSAGE,FIRST_NAME);
        isValid = false;
    }
    if(row.LastName && row.LastName.length > 80){
        addErrorMessage(tableError,row.Id,VALIDATION_ERROR_TITLE,LAST_NAME_MAX_SIZE_MESSAGE,LAST_NAME);
        isValid = false;
    }
    if(row.Tax_Paid__c && row.Tax_Paid__c > 9999999999999999.99){
        addErrorMessage(tableError,row.Id,VALIDATION_ERROR_TITLE,TAX_PAID_MAX_SIZE_MESSAGE,TAX_PAID);
        isValid = false;
    }
    if(row.Pre_Tax_Income__c && row.Pre_Tax_Income__c > 9999999999999999.99){
        addErrorMessage(tableError,row.Id,VALIDATION_ERROR_TITLE,PRE_TAX_MAX_SIZE_MESSAGE,PRE_TAX);
        isValid = false;
    }

    return isValid;

}


export function addErrorMessage(tableError, rowId, title, message, fieldname){
    if(tableError.rows[rowId] === undefined){
        tableError.rows[rowId] = {title: title,
                                    messages: [message],
                                    fieldNames: [fieldname]
                                    }
    }else{
        tableError.rows[rowId].messages.push(message);
        tableError.rows[rowId].fieldNames.push(fieldname);
    }
}


//Function removes the temporary Id before inserting records into DB
export function modifyForInsert(draftValues,recordId){
    draftValues.forEach(contact => {
        if(contact.Id.includes(TEMP_KEYWORD)){
            delete contact.Id;
            contact.AccountId = recordId;
        }
    });
}