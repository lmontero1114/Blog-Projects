public with sharing class RelatedContactsDataService {
    @AuraEnabled
    public static List<Contact> getRelatedContacts(Id accountId){
        List<Contact> contactsList = [SELECT Id, FirstName, LastName, Tax_Paid__c,Pre_Tax_Income__c, Total_Income__c FROM Contact WHERE accountId = :accountId order by CreatedDate];
        return contactsList; 
    }

    @AuraEnabled
    public static void upsertContacts(List<Contact> contacts){
        upsert contacts;
    }

}
