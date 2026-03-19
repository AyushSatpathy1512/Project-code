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
 *  Logging: uses System.debug by default.
 *  To switch to Nebula Logger, replace each logError() call with:
 *      Logger.error('message'); Logger.saveLog();
 */
public with sharing class ShipmentStatusController {

    /* ─────────────────────────────────────────────────────────────
       Logging helper – swap body for Nebula Logger when available
    ───────────────────────────────────────────────────────────── */
    private static void logError(String context, Id recordId, Exception e) {
        System.debug(LoggingLevel.ERROR,
            context
            + ' | recordId=' + recordId
            + ' | ' + e.getTypeName() + ': ' + e.getMessage()
            + '\n' + e.getStackTraceString()
        );
        // ── Nebula Logger (install from https://github.com/jongpie/NebulaLogger) ──
        // Logger.error(context + ' | recordId=' + recordId + ' | ' + e.getMessage());
        // Logger.saveLog();
    }

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
            logError('ShipmentStatusController.getShipmentStatus failed', recordId, e);
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
            logError('ShipmentStatusController.refreshShipmentStatus failed', recordId, e);
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
            logError('ShipmentStatusController.updateShipmentStatus | newStatus=' + newStatus, recordId, e);
            throw new AuraHandledException('Could not update status. Please try again.');
        }
    }

    /* ═════════════════════════════════════════════════════════════
       PRIVATE HELPERS
       Uses dynamic SOQL/DML so this class compiles even before
       the custom fields are created in the org.
    ═════════════════════════════════════════════════════════════ */

    private static final Set<String> SUPPORTED_OBJECTS = new Set<String>{
        'Opportunity', 'Case'
    };

    // The four custom fields required on both Opportunity and Case:
    //   Shipment_Status__c   (Picklist)
    //   Tracking_Number__c   (Text 50)
    //   Tracking_URL__c      (URL)
    //   Estimated_Delivery__c (DateTime)
    private static final String QUERY_TEMPLATE =
        'SELECT Shipment_Status__c, Tracking_Number__c, '
        + 'Tracking_URL__c, Estimated_Delivery__c '
        + 'FROM {0} WHERE Id = :recordId LIMIT 1';

    /**
     * @description  Queries the record using dynamic SOQL.
     *               Compiles regardless of whether the custom fields exist yet.
     */
    private static SObject queryRecord(Id recordId) {
        String sObjType = recordId.getSObjectType().getDescribe().getName();

        if (!SUPPORTED_OBJECTS.contains(sObjType)) {
            throw new AuraHandledException(
                'Shipment Status Tracker is not supported for ' + sObjType + ' records.'
            );
        }

        String soql = String.format(QUERY_TEMPLATE, new List<String>{ sObjType });
        List<SObject> rows = Database.query(soql);

        if (rows.isEmpty()) {
            throw new AuraHandledException(sObjType + ' not found.');
        }
        return rows[0];
    }

    /**
     * @description  Updates whichever SObject type is identified by recordId
     *               using a generic SObject so DML compiles without typed fields.
     */
    private static void saveRecord(Id recordId, ShipmentStatusWrapper w) {
        String  sObjType = recordId.getSObjectType().getDescribe().getName();

        if (!SUPPORTED_OBJECTS.contains(sObjType)) {
            throw new AuraHandledException(
                'Shipment Status Tracker is not supported for ' + sObjType + ' records.'
            );
        }

        // Build a generic SObject so we don't need compile-time field references
        SObject record = Schema.getGlobalDescribe().get(sObjType).newSObject(recordId);
        record.put('Shipment_Status__c',    w.status);
        record.put('Tracking_Number__c',    w.trackingNumber);
        record.put('Tracking_URL__c',       w.trackingUrl);
        record.put('Estimated_Delivery__c', w.estimatedDelivery);

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
