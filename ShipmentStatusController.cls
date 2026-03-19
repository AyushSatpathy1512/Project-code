/**
 * @description  AuraEnabled controller for the shipmentStatusTracker LWC.
 *
 *  Required custom fields on both Opportunity and Case
 *  ─────────────────────────────────────────────────────
 *  | API Name                  | Type      | Notes                       |
 *  |---------------------------|-----------|-----------------------------|
 *  | Shipment_Status__c        | Picklist  | Ordered, Picked, Shipped,   |
 *  |                           |           | In Transit, Delivered        |
 *  | Tracking_Number__c        | Text(50)  |                             |
 *  | Tracking_URL__c           | URL       |                             |
 *  | Estimated_Delivery__c     | DateTime  |                             |
 *  ─────────────────────────────────────────────────────
 *
 *  Error logging uses Nebula Logger (https://github.com/jongpie/NebulaLogger).
 *  If you are not using Nebula Logger, replace Logger.* calls with
 *  System.debug() or your preferred logging library.
 */
public with sharing class ShipmentStatusController {

    /* ─────────────────────────────────────────────────────────────
       1. LOAD  –  called on component init (cacheable for perf)
    ───────────────────────────────────────────────────────────── */
    @AuraEnabled(cacheable=true)
    public static ShipmentStatusWrapper getShipmentStatus(Id recordId) {
        try {
            SObject record = queryRecord(recordId);
            return new ShipmentStatusWrapper(record);
        } catch (AuraHandledException ahe) {
            throw ahe;  // already formatted – re-throw as-is
        } catch (Exception e) {
            Logger.error(
                'ShipmentStatusController.getShipmentStatus failed'
                + ' | recordId=' + recordId
                + ' | ' + e.getTypeName() + ': ' + e.getMessage()
                + '\n' + e.getStackTraceString()
            );
            Logger.saveLog();
            throw new AuraHandledException(
                'Could not load shipment information. Please reload the page.'
            );
        }
    }

    /* ─────────────────────────────────────────────────────────────
       2. REFRESH  –  hits the external API, writes back, returns
                      the freshest wrapper to the component
    ───────────────────────────────────────────────────────────── */
    @AuraEnabled
    public static ShipmentStatusWrapper refreshShipmentStatus(Id recordId) {
        try {
            // ① Call external carrier API
            ShipmentStatusWrapper fresh = ShipmentStatusService.fetchFromAPI(recordId);

            // ② Persist to Salesforce
            saveRecord(recordId, fresh);

            return fresh;

        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            Logger.error(
                'ShipmentStatusController.refreshShipmentStatus failed'
                + ' | recordId=' + recordId
                + ' | ' + e.getTypeName() + ': ' + e.getMessage()
                + '\n' + e.getStackTraceString()
            );
            Logger.saveLog();
            throw new AuraHandledException(
                'Refresh failed. Please try again.'
            );
        }
    }

    /* ─────────────────────────────────────────────────────────────
       3. UPDATE STATUS (optional endpoint for direct UI edits)
          E.g. if you add an inline status-change control to the card
    ───────────────────────────────────────────────────────────── */
    @AuraEnabled
    public static ShipmentStatusWrapper updateShipmentStatus(Id recordId, String newStatus) {
        try {
            validateStatus(newStatus);

            SObject existing = queryRecord(recordId);
            ShipmentStatusWrapper wrapper = new ShipmentStatusWrapper(existing);
            wrapper.status = newStatus;

            saveRecord(recordId, wrapper);
            return wrapper;

        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            Logger.error(
                'ShipmentStatusController.updateShipmentStatus failed'
                + ' | recordId=' + recordId
                + ' | newStatus=' + newStatus
                + ' | ' + e.getTypeName() + ': ' + e.getMessage()
                + '\n' + e.getStackTraceString()
            );
            Logger.saveLog();
            throw new AuraHandledException('Could not update status. Please try again.');
        }
    }

    /* ═════════════════════════════════════════════════════════════
       PRIVATE HELPERS
    ═════════════════════════════════════════════════════════════ */

    /**
     * @description  Dynamically queries the correct SObject type so the same
     *               controller works for both Opportunity and Case without
     *               duplication.
     */
    private static SObject queryRecord(Id recordId) {
        String sObjType = recordId.getSObjectType().getDescribe().getName();

        if (sObjType == 'Opportunity') {
            List<Opportunity> rows = [
                SELECT Shipment_Status__c,
                       Tracking_Number__c,
                       Tracking_URL__c,
                       Estimated_Delivery__c
                FROM   Opportunity
                WHERE  Id = :recordId
                LIMIT  1
            ];
            if (rows.isEmpty()) {
                throw new AuraHandledException('Opportunity not found.');
            }
            return rows[0];

        } else if (sObjType == 'Case') {
            List<Case> rows = [
                SELECT Shipment_Status__c,
                       Tracking_Number__c,
                       Tracking_URL__c,
                       Estimated_Delivery__c
                FROM   Case
                WHERE  Id = :recordId
                LIMIT  1
            ];
            if (rows.isEmpty()) {
                throw new AuraHandledException('Case not found.');
            }
            return rows[0];
        }

        throw new AuraHandledException(
            'Shipment Status Tracker is not supported for ' + sObjType + ' records.'
        );
    }

    /**
     * @description  Updates whichever SObject type is identified by recordId.
     */
    private static void saveRecord(Id recordId, ShipmentStatusWrapper w) {
        String sObjType = recordId.getSObjectType().getDescribe().getName();
        SObject record;

        if (sObjType == 'Opportunity') {
            record = new Opportunity(
                Id                   = recordId,
                Shipment_Status__c   = w.status,
                Tracking_Number__c   = w.trackingNumber,
                Tracking_URL__c      = w.trackingUrl,
                Estimated_Delivery__c = w.estimatedDelivery
            );
        } else if (sObjType == 'Case') {
            record = new Case(
                Id                   = recordId,
                Shipment_Status__c   = w.status,
                Tracking_Number__c   = w.trackingNumber,
                Tracking_URL__c      = w.trackingUrl,
                Estimated_Delivery__c = w.estimatedDelivery
            );
        } else {
            throw new AuraHandledException(
                'Shipment Status Tracker is not supported for ' + sObjType + ' records.'
            );
        }

        update record;
    }

    /**
     * @description  Validates that the provided status is a recognised value.
     */
    private static final Set<String> VALID_STATUSES = new Set<String>{
        'Ordered', 'Picked', 'Shipped', 'In Transit', 'Delivered'
    };

    private static void validateStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new AuraHandledException(
                'Invalid shipment status: "' + status + '".'
            );
        }
    }
}
