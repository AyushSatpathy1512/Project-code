/**
 * @description  Handles HTTP callouts to the external shipment-tracking API.
 *               Add a Named Credential called "ShipmentAPI" in Setup → Named Credentials.
 *
 *               Expected JSON response from the API:
 *               {
 *                 "status"           : "In Transit",
 *                 "trackingNumber"   : "TRK-7829304-IN",
 *                 "trackingUrl"      : "https://carrier.example.com/track?id=TRK-7829304-IN",
 *                 "estimatedDelivery": "2026-03-21T18:00:00Z"   // ISO-8601
 *               }
 *
 *  Logging: uses System.debug by default (no external dependency).
 *  To enable Nebula Logger, install it from https://github.com/jongpie/NebulaLogger
 *  and replace each System.debug(LoggingLevel.ERROR, …) block with:
 *      Logger.error('message'); Logger.saveLog();
 */
public with sharing class ShipmentStatusService {

    private static final String  NAMED_CREDENTIAL = 'callout:ShipmentAPI';
    private static final String  ENDPOINT_PATH    = '/shipments/';   // appended with recordId
    private static final Integer TIMEOUT_MS       = 10_000;

    /**
     * @description  Calls the external API for the given recordId and returns
     *               a populated wrapper.  Must be called from an @AuraEnabled
     *               method that is NOT cacheable.
     */
    public static ShipmentStatusWrapper fetchFromAPI(Id recordId) {

        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + ENDPOINT_PATH + recordId);
        req.setMethod('GET');
        req.setTimeout(TIMEOUT_MS);
        req.setHeader('Accept', 'application/json');

        Http         http = new Http();
        HttpResponse res;

        try {
            res = http.send(req);
        } catch (System.CalloutException ce) {
            System.debug(LoggingLevel.ERROR,
                'ShipmentStatusService.fetchFromAPI – callout failed'
                + ' | recordId=' + recordId
                + ' | ' + ce.getMessage()
            );
            // Nebula Logger alternative:
            // Logger.error('ShipmentStatusService callout failed | ' + ce.getMessage());
            // Logger.saveLog();
            throw new AuraHandledException(
                'Unable to reach the shipment carrier. Please try again later.'
            );
        }

        if (res.getStatusCode() != 200) {
            System.debug(LoggingLevel.WARN,
                'ShipmentStatusService.fetchFromAPI – non-200 response'
                + ' | statusCode=' + res.getStatusCode()
                + ' | status=' + res.getStatus()
                + ' | body=' + res.getBody().abbreviate(500)
            );
            // Nebula Logger alternative:
            // Logger.warn('Non-200 from carrier API: ' + res.getStatusCode()); Logger.saveLog();
            throw new AuraHandledException(
                'Carrier API returned status ' + res.getStatusCode()
                + '. Please try again later.'
            );
        }

        return parseAPIResponse(res.getBody());
    }

    /* ─────────────────────────────────────────────────
       Private helpers
    ───────────────────────────────────────────────── */

    @TestVisible
    private static ShipmentStatusWrapper parseAPIResponse(String jsonBody) {

        Map<String, Object> payload;
        try {
            payload = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        } catch (JSONException je) {
            System.debug(LoggingLevel.ERROR,
                'ShipmentStatusService.parseAPIResponse – JSON parse error'
                + ' | ' + je.getMessage()
                + ' | raw=' + jsonBody.abbreviate(500)
            );
            // Nebula Logger alternative:
            // Logger.error('JSON parse error: ' + je.getMessage()); Logger.saveLog();
            throw new AuraHandledException('Invalid response from carrier API.');
        }

        ShipmentStatusWrapper wrapper = new ShipmentStatusWrapper();
        wrapper.status         = String.valueOf(payload.get('status'));
        wrapper.trackingNumber = String.valueOf(payload.get('trackingNumber'));
        wrapper.trackingUrl    = String.valueOf(payload.get('trackingUrl'));

        String etaStr = String.valueOf(payload.get('estimatedDelivery'));
        if (String.isNotBlank(etaStr) && etaStr != 'null') {
            try {
                // JSON.deserialize handles ISO-8601 (with T and Z) cleanly
                wrapper.estimatedDelivery = (DateTime) JSON.deserialize(
                    '"' + etaStr + '"', DateTime.class
                );
            } catch (Exception e) {
                System.debug(LoggingLevel.WARN,
                    'ShipmentStatusService – could not parse ETA: ' + etaStr
                );
                // Nebula Logger alternative:
                // Logger.warn('Could not parse ETA: ' + etaStr); Logger.saveLog();
            }
        }

        return wrapper;
    }
}
