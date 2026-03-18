public with sharing class ShipmentTrackerController {

    /**
     * Retrieves the most recent Shipment__c related to an Opportunity or Case record.
     * Works for both record page contexts.
     */
    @AuraEnabled(cacheable=true)
    public static Shipment__c getShipmentByRecordId(String recordId) {
        try {
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
            List<Shipment__c> shipments = new List<Shipment__c>();

            if (objectType == 'Opportunity') {
                shipments = [
                    SELECT Id, Name, Tracking_Number__c, Status__c,
                           ETA__c, Carrier__c, LastModifiedDate, Opportunity__c
                    FROM Shipment__c
                    WHERE Opportunity__c = :recordId
                    ORDER BY CreatedDate DESC
                    LIMIT 1
                ];
            } else if (objectType == 'Case') {
                shipments = [
                    SELECT Id, Name, Tracking_Number__c, Status__c,
                           ETA__c, Carrier__c, LastModifiedDate, Case__c
                    FROM Shipment__c
                    WHERE Case__c = :recordId
                    ORDER BY CreatedDate DESC
                    LIMIT 1
                ];
            }

            return shipments.isEmpty() ? null : shipments[0];

        } catch (Exception e) {
            Logger.error('ShipmentTrackerController.getShipmentByRecordId error: ' + e.getMessage())
                  .setRecordId(recordId);
            Logger.saveLog();
            throw new AuraHandledException('Unable to retrieve shipment: ' + e.getMessage());
        }
    }

    /**
     * Calls the ShipFast External Service to get latest shipment status,
     * updates the Shipment__c record, then returns the refreshed record.
     */
    @AuraEnabled
    public static Shipment__c refreshShipmentStatus(String trackingNumber, String shipmentId) {
        try {
            // Call External Service - getShipmentsStatusByTrackingNumber
            ExternalService.ShipFastExternalServices_ShipmentStatus statusResult;

            ExternalService.ShipFastExternalServices.getShipmentsStatusByTrackingNumberRequest req =
                new ExternalService.ShipFastExternalServices.getShipmentsStatusByTrackingNumberRequest();
            req.trackingNumber = trackingNumber;

            ExternalService.ShipFastExternalServices.getShipmentsStatusByTrackingNumberResponse resp =
                new ExternalService.ShipFastExternalServices().getShipmentsStatusByTrackingNumber(req);

            if (resp.responseCode == 200 && resp.Code200 != null) {
                statusResult = resp.Code200;

                Shipment__c toUpdate = new Shipment__c(
                    Id = shipmentId,
                    Status__c = statusResult.status
                );

                // Update ETA if returned by API
                if (statusResult.eta != null) {
                    toUpdate.ETA__c = Date.valueOf(String.valueOf(statusResult.eta).left(10));
                }

                update toUpdate;

                Logger.info('Shipment status refreshed via API for tracking: ' + trackingNumber)
                      .setRecordId(shipmentId);
                Logger.saveLog();

            } else if (resp.responseCode == 404) {
                throw new AuraHandledException('Shipment not found in ShipFast (404). Tracking: ' + trackingNumber);
            } else if (resp.responseCode == 401) {
                throw new AuraHandledException('API authentication failed (401). Check Named Credentials.');
            } else if (resp.responseCode == 408) {
                throw new AuraHandledException('ShipFast API request timed out (408). Please try again.');
            } else {
                throw new AuraHandledException('Unexpected API response: ' + resp.responseCode);
            }

            // Return fresh record
            return [
                SELECT Id, Name, Tracking_Number__c, Status__c,
                       ETA__c, Carrier__c, LastModifiedDate
                FROM Shipment__c
                WHERE Id = :shipmentId
                LIMIT 1
            ];

        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            Logger.error('ShipmentTrackerController.refreshShipmentStatus error: ' + e.getMessage())
                  .setRecordId(shipmentId);
            Logger.saveLog();
            throw new AuraHandledException('Refresh failed: ' + e.getMessage());
        }
    }

    /**
     * Logs an error message to Nebula Logger from the client side.
     */
    @AuraEnabled
    public static void logClientError(String message, String recordId) {
        try {
            Logger.error('LWC Client Error [ShipmentTrackerPanel]: ' + message)
                  .setRecordId(recordId);
            Logger.saveLog();
        } catch (Exception e) {
            System.debug('Nebula Logger unavailable: ' + e.getMessage());
        }
    }
}
