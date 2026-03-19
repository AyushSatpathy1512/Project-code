public with sharing class ShipmentStatusController {

    /**
     * Queries the most recent Shipment__c linked to the given Opportunity or Case.
     * Returns null if no shipment exists (not an exception).
     */
    @AuraEnabled(cacheable=true)
    public static Shipment__c getShipmentByRecord(Id recordId) {
        if (recordId == null) return null;
        String objType = recordId.getSObjectType().getDescribe().getName();
        try {
            if (objType == 'Opportunity') {
                List<Shipment__c> rows = [
                    SELECT Id, Status__c, Tracking_Number__c, ETA__c, Carrier__c, Last_Updated__c
                    FROM   Shipment__c
                    WHERE  Opportunity__c = :recordId
                    ORDER BY CreatedDate DESC LIMIT 1
                ];
                return rows.isEmpty() ? null : rows[0];

            } else if (objType == 'Case') {
                List<Case> cases = [SELECT Shipment__c FROM Case WHERE Id = :recordId LIMIT 1];
                if (cases.isEmpty() || cases[0].Shipment__c == null) return null;
                List<Shipment__c> rows = [
                    SELECT Id, Status__c, Tracking_Number__c, ETA__c, Carrier__c, Last_Updated__c
                    FROM   Shipment__c WHERE Id = :cases[0].Shipment__c LIMIT 1
                ];
                return rows.isEmpty() ? null : rows[0];
            }
        } catch (Exception e) {
            Logger.error('ShipmentStatusController.getShipmentByRecord failed', e).addTag('ShipFast');
            Logger.saveLog();
            throw new AuraHandledException('Failed to load shipment: ' + e.getMessage());
        }
        return null;
    }

    /**
     * Calls ShipFastCalloutHandler (existing class) for the API hit,
     * then saves Status__c / ETA__c / Last_Updated__c back to Shipment__c.
     * Callout happens before any DML — satisfies Salesforce governor rules.
     */
    @AuraEnabled
    public static ShipFastCalloutHandler.ShipFastResponse refreshShipmentStatus(
            Id shipmentId, String trackingNumber) {
        try {
            // 1. CALLOUT via existing class (no DML before this)
            ShipFastCalloutHandler.ShipFastResponse res =
                ShipFastCalloutHandler.getShipmentStatusFromLwc(trackingNumber);

            if (res.isSuccess) {
                // 2. DML only after callout completes
                Shipment__c s = new Shipment__c(Id = shipmentId);
                s.Status__c = res.status;
                if (String.isNotBlank(res.eta)) {
                    try { s.ETA__c = Date.valueOf(res.eta); } catch (Exception ignored) {}
                }
                if (String.isNotBlank(res.lastUpdated)) {
                    try {
                        s.Last_Updated__c = Datetime.valueOfGmt(
                            res.lastUpdated.replace('T', ' ').replace('Z', ''));
                    } catch (Exception ignored) {}
                }
                update s;
                Logger.info('ShipFast refreshed Shipment ' + shipmentId + ' → ' + res.status)
                      .addTag('ShipFast');
            } else {
                Logger.error('ShipFast refresh failed: [' + res.errorCode + '] ' + res.errorMessage)
                      .addTag('ShipFast');
            }
            Logger.saveLog();
            return res;

        } catch (Exception e) {
            Logger.error('ShipmentStatusController.refreshShipmentStatus exception', e)
                  .addTag('ShipFast');
            Logger.saveLog();
            ShipFastCalloutHandler.ShipFastResponse err = new ShipFastCalloutHandler.ShipFastResponse();
            err.isSuccess    = false;
            err.errorMessage = e.getMessage();
            err.errorCode    = 'APEX_EXCEPTION';
            err.statusCode   = 500;
            return err;
        }
    }
}
