public with sharing class ContactQuickAdd {
    @AuraEnabled(cacheable=true)
    public static List<Account> queryAccounts(){
        return [SELECT Id, Name FROM Account];
    }
}
