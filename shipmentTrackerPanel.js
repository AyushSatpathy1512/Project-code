import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getShipmentByRecordId from '@salesforce/apex/ShipmentTrackerController.getShipmentByRecordId';
import refreshShipmentStatus from '@salesforce/apex/ShipmentTrackerController.refreshShipmentStatus';
import logClientError from '@salesforce/apex/ShipmentTrackerController.logClientError';

// Ordered status pipeline - matches Shipment__c Status picklist
const STATUS_PIPELINE = ['Ordered', 'Picked', 'Shipped', 'In Transit', 'Delivered'];

// ShipFast tracking portal base URL
const SHIPFAST_TRACK_URL = 'https://track.shipfast.io/track?number=';

export default class ShipmentTrackerPanel extends LightningElement {
    @api recordId;

    @track shipment       = null;
    @track isLoading      = true;
    @track isRefreshing   = false;
    @track errorMessage   = '';
    @track lastRefreshed  = '';

    // Hold wired result for refreshApex
    _wiredResult;

    // ─────────────────────────────────────────────
    //  WIRE: Load shipment record from Apex
    // ─────────────────────────────────────────────
    @wire(getShipmentByRecordId, { recordId: '$recordId' })
    wiredShipment(result) {
        this._wiredResult = result;
        this.isLoading = false;

        if (result.data !== undefined) {
            this.shipment     = result.data;   // null = no shipment linked
            this.errorMessage = '';
        } else if (result.error) {
            this.errorMessage = this._extractMessage(result.error);
            this._logError('Wire load error: ' + this.errorMessage);
        }
    }

    // ─────────────────────────────────────────────
    //  GETTERS – component state
    // ─────────────────────────────────────────────
    get hasError()    { return !this.isLoading && !!this.errorMessage; }
    get noShipment()  { return !this.isLoading && !this.errorMessage && !this.shipment; }
    get refreshLabel(){ return this.isRefreshing ? 'Refreshing...' : 'Refresh Status'; }

    // ─────────────────────────────────────────────
    //  GETTERS – Progress bar steps
    // ─────────────────────────────────────────────
    get statusSteps() {
        const currentIdx = STATUS_PIPELINE.indexOf(this.shipment?.Status__c ?? '');
        return STATUS_PIPELINE.map((label, i) => {
            const done    = i <= currentIdx;
            const current = i === currentIdx;
            return {
                label,
                index         : i + 1,
                isCompleted   : done,
                containerClass: `step-container ${done ? 'step-done' : ''} ${current ? 'step-current' : ''}`,
                circleClass   : `step-circle ${done ? 'circle-done' : ''} ${current ? 'circle-current' : ''}`,
                labelClass    : `step-label ${done ? 'label-done' : ''} ${current ? 'label-current' : ''}`
            };
        });
    }

    get progressBarStyle() {
        const idx = STATUS_PIPELINE.indexOf(this.shipment?.Status__c ?? '');
        if (idx < 0) return 'width: 0%';
        const pct = (idx / (STATUS_PIPELINE.length - 1)) * 100;
        return `width: ${pct}%`;
    }

    // ─────────────────────────────────────────────
    //  GETTERS – Shipment detail display
    // ─────────────────────────────────────────────
    get trackingUrl() {
        return SHIPFAST_TRACK_URL + (this.shipment?.Tracking_Number__c ?? '');
    }

    get etaDisplay() {
        const eta = this.shipment?.ETA__c;
        if (!eta) return 'Not available';

        const etaDate   = new Date(eta);
        const today     = new Date();
        etaDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffMs   = etaDate - today;
        const diffDays = Math.ceil(diffMs / 86400000);
        const fmtDate  = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (this.shipment?.Status__c === 'Delivered') return `Delivered (ETA was ${fmtDate})`;
        if (diffDays < 0)  return `Overdue by ${Math.abs(diffDays)} day(s) — Expected ${fmtDate}`;
        if (diffDays === 0) return `Today — ${fmtDate}`;
        if (diffDays === 1) return `Tomorrow — ${fmtDate}`;
        return `${diffDays} days — ${fmtDate}`;
    }

    get etaValueClass() {
        const eta  = this.shipment?.ETA__c;
        const base = 'detail-value eta-value ';
        if (!eta || this.shipment?.Status__c === 'Delivered') return base + 'eta-delivered';

        const diffDays = Math.ceil((new Date(eta).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
        if (diffDays < 0)  return base + 'eta-overdue';
        if (diffDays <= 2) return base + 'eta-imminent';
        return base + 'eta-ok';
    }

    get statusPillClass() {
        const s = this.shipment?.Status__c;
        const base = 'status-pill ';
        if (s === 'Delivered')                     return base + 'pill-delivered';
        if (s === 'In Transit' || s === 'Shipped') return base + 'pill-transit';
        if (s === 'Picked')                        return base + 'pill-picked';
        return base + 'pill-ordered';
    }

    // ─────────────────────────────────────────────
    //  HANDLERS
    // ─────────────────────────────────────────────
    async handleRefresh() {
        if (!this.shipment?.Tracking_Number__c) {
            this._toast('Warning', 'No tracking number available to refresh.', 'warning');
            return;
        }

        this.isRefreshing = true;
        this.errorMessage = '';
        this.lastRefreshed = '';

        try {
            const updated = await refreshShipmentStatus({
                trackingNumber : this.shipment.Tracking_Number__c,
                shipmentId     : this.shipment.Id
            });

            // Update local state immediately for snappy UI
            this.shipment = updated;

            // Also re-sync the wire cache
            await refreshApex(this._wiredResult);

            this.lastRefreshed = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            this._toast('Success', 'Shipment status updated from ShipFast API.', 'success');

        } catch (err) {
            this.errorMessage = 'Refresh failed: ' + this._extractMessage(err);
            this._logError(this.errorMessage);
            this._toast('Error', this.errorMessage, 'error');
        } finally {
            this.isRefreshing = false;
        }
    }

    async handleRetry() {
        this.errorMessage = '';
        this.isLoading    = true;
        try {
            await refreshApex(this._wiredResult);
        } catch (err) {
            this.errorMessage = this._extractMessage(err);
        } finally {
            this.isLoading = false;
        }
    }

    clearError() {
        this.errorMessage = '';
    }

    // ─────────────────────────────────────────────
    //  UTILITIES
    // ─────────────────────────────────────────────
    _toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    _extractMessage(error) {
        if (typeof error === 'string')    return error;
        if (error?.body?.message)         return error.body.message;
        if (error?.message)               return error.message;
        return 'An unexpected error occurred. Please try again.';
    }

    async _logError(message) {
        try {
            await logClientError({ message, recordId: this.recordId });
        } catch (e) {
            // Nebula Logger unavailable — fail silently, still log to console
            console.error('[ShipmentTrackerPanel] Nebula Logger error:', e);
        }
    }
}
