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
 */
public with sharing class ShipmentStatusService {

    private static final String NAMED_CREDENTIAL = 'callout:ShipmentAPI';
    private static final String ENDPOINT_PATH    = '/shipments/';   // + recordId
    private static final Integer TIMEOUT_MS      = 10_000;

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

        Http http = new Http();
        HttpResponse res;

        try {
            res = http.send(req);
        } catch (System.CalloutException ce) {
            Logger.error('ShipmentStatusService.fetchFromAPI – callout failed for recordId: '
                         + recordId + ' | Error: ' + ce.getMessage());
            Logger.saveLog();
            throw new AuraHandledException(
                'Unable to reach the shipment carrier. Please try again later.'
            );
        }

        if (res.getStatusCode() != 200) {
            Logger.warn('ShipmentStatusService.fetchFromAPI – non-200 response: '
                        + res.getStatusCode() + ' ' + res.getStatus()
                        + ' | body: ' + res.getBody().abbreviate(500));
            Logger.saveLog();
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
            Logger.error('ShipmentStatusService.parseAPIResponse – JSON parse error: '
                         + je.getMessage() + ' | raw: ' + jsonBody.abbreviate(500));
            Logger.saveLog();
            throw new AuraHandledException('Invalid response from carrier API.');
        }

        ShipmentStatusWrapper wrapper = new ShipmentStatusWrapper();
        wrapper.status         = String.valueOf(payload.get('status'));
        wrapper.trackingNumber = String.valueOf(payload.get('trackingNumber'));
        wrapper.trackingUrl    = String.valueOf(payload.get('trackingUrl'));

        String etaStr = String.valueOf(payload.get('estimatedDelivery'));
        if (String.isNotBlank(etaStr)) {
            try {
                // Remove 'Z' suffix – Apex DateTime.valueOf expects a space, not 'T'
                wrapper.estimatedDelivery = (DateTime) JSON.deserialize(
                    '"' + etaStr + '"', DateTime.class
                );
            } catch (Exception e) {
                Logger.warn('ShipmentStatusService – could not parse ETA: ' + etaStr);
                Logger.saveLog();
            }
        }

        return wrapper;
    }
}
