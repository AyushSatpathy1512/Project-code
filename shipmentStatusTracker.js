import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex }          from '@salesforce/apex';
import getShipmentByRecord       from '@salesforce/apex/ShipmentStatusController.getShipmentByRecord';
import refreshShipmentStatus     from '@salesforce/apex/ShipmentStatusController.refreshShipmentStatus';

const STEPS          = ['Ordered', 'Picked', 'Shipped', 'In Transit', 'Delivered'];
const ACTIVE_STATUSES = new Set(['Ordered', 'Picked', 'Shipped', 'In Transit']);

export default class ShipmentStatusTracker extends LightningElement {

    @api recordId;

    @track isLoading    = true;
    @track isRefreshing = false;
    @track errorMessage = null;
    @track _isWireError = false;

    @track cdHours   = '00';
    @track cdMinutes = '00';
    @track cdSeconds = '00';

    _wiredResult    = null;
    _shipment       = null;
    _countdownTimer = null;

    // ── Wire ──────────────────────────────────────────────────────────────────
    @wire(getShipmentByRecord, { recordId: '$recordId' })
    wiredShipment(result) {
        this._wiredResult = result;
        const { data, error } = result;
        if (data === undefined && !error) return; // not resolved yet

        this.isLoading   = false;
        this._isWireError = false;

        if (data !== undefined) {
            this._shipment = data;
            this.errorMessage = null;
            if (data) this._startCountdown();
        } else if (error) {
            this._shipment    = null;
            this._isWireError = true;
            this.errorMessage = this._extractMsg(error);
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    get shipment()       { return this._shipment; }
    get hasShipment()    { return !!this._shipment && !this.isLoading; }
    get showNoShipment() { return !this._shipment && !this.isLoading && !this._isWireError; }
    get showError()      { return this._isWireError && !this.isLoading; }
    get isActive()       { return this._shipment && ACTIVE_STATUSES.has(this._shipment.Status__c); }

    get steps() {
        if (!this._shipment) return [];
        const cur = STEPS.indexOf(this._shipment.Status__c);
        return STEPS.map((label, idx) => {
            const isDone    = idx < cur;
            const isActive  = idx === cur;
            const isPending = idx > cur;
            return {
                label,
                isDone,
                isActive,
                isPending,
                isLast         : idx === STEPS.length - 1,
                dotClass       : 'step-dot'       + (isDone ? ' done' : isActive ? ' active' : ' pending'),
                connectorClass : 'step-connector'  + (isDone || isActive ? ' done' : ''),
                labelClass     : 'step-label'      + (isDone ? ' done' : isActive ? ' active' : '')
            };
        });
    }

    get trackingLink() {
        const tn = this._shipment?.Tracking_Number__c;
        return tn ? `https://track.shipfast.io/${tn}` : '#';
    }

    get formattedETA() {
        const raw = this._shipment?.ETA__c;
        if (!raw) return 'N/A';
        const [y, m, d] = raw.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US',
            { month: 'short', day: 'numeric', year: 'numeric' });
    }

    get refreshLabel()    { return this.isRefreshing ? 'Refreshing…' : 'Refresh Status'; }
    get refreshIconClass(){ return this.isRefreshing ? 'spin spinning' : 'spin'; }

    // ── Countdown ─────────────────────────────────────────────────────────────
    _startCountdown() {
        if (this._countdownTimer) clearInterval(this._countdownTimer);
        this._tick();
        this._countdownTimer = setInterval(() => this._tick(), 1000);
    }

    _tick() {
        const raw = this._shipment?.ETA__c;
        if (!raw) return;
        const [y, m, d] = raw.split('-').map(Number);
        const eta  = new Date(y, m - 1, d, 18, 0, 0); // 6 PM delivery window
        const diff = Math.max(0, eta - Date.now());
        this.cdHours   = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
        this.cdMinutes = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
        this.cdSeconds = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0');
    }

    // ── Refresh handler ───────────────────────────────────────────────────────
    async handleRefresh() {
        if (!this._shipment?.Tracking_Number__c || this.isRefreshing) return;
        this.isRefreshing = true;
        this.errorMessage = null;
        try {
            const res = await refreshShipmentStatus({
                shipmentId    : this._shipment.Id,
                trackingNumber: this._shipment.Tracking_Number__c
            });
            if (res?.isSuccess) {
                await refreshApex(this._wiredResult); // re-query updated Shipment__c
            } else {
                this.errorMessage = res?.errorMessage || 'Failed to refresh shipment status.';
            }
        } catch (err) {
            this.errorMessage = this._extractMsg(err);
        } finally {
            this.isRefreshing = false;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    _extractMsg(err) {
        return err?.body?.message ?? err?.body?.pageErrors?.[0]?.message
            ?? err?.message ?? 'An unexpected error occurred.';
    }

    disconnectedCallback() {
        if (this._countdownTimer) {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }
    }
}
