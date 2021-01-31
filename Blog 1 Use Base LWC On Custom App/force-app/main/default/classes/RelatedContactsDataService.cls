public with sharing class RelatedContactsDataService {
  @AuraEnabled
  public static List<Id> getRelatedContacts(Id accountId) {
    Set<Id> contactsSet = new Map<Id, Contact>(
        [SELECT Id FROM Contact WHERE accountId = :accountId]
      )
      .keySet();
    List<Id> contactsList = new List<Id>(contactsSet);
    return contactsList;
  }
}
