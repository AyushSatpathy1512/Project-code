/**
 * @description  Data wrapper returned to the LWC.
 *               Serialised automatically by the Apex-LWC bridge.
 */
public with sharing class ShipmentStatusWrapper {

    @AuraEnabled public String   status;            // Picklist value
    @AuraEnabled public String   trackingNumber;
    @AuraEnabled public String   trackingUrl;
    @AuraEnabled public DateTime estimatedDelivery;

    public ShipmentStatusWrapper() {}

    /**
     * @description  Convenience constructor – builds a wrapper from an
     *               SObject that already has the four shipment fields.
     */
    public ShipmentStatusWrapper(SObject record) {
        this.status            = (String)   record.get('Shipment_Status__c');
        this.trackingNumber    = (String)   record.get('Tracking_Number__c');
        this.trackingUrl       = (String)   record.get('Tracking_URL__c');
        this.estimatedDelivery = (DateTime) record.get('Estimated_Delivery__c');
    }
}
