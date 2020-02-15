public with sharing class RelatedContactsDataService {
    @AuraEnabled
    public static List<Contact> getRelatedContacts(Id accountId){
        List<Contact> contactsList = [SELECT Id, FirstName, LastName, Tax_Paid__c,Pre_Tax_Income__c FROM Contact WHERE accountId = :accountId];
        return contactsList; 
    }

    @AuraEnabled
    public static void upsertContacts(List<Contact> contacts){
        upsert contacts;
    }

}
