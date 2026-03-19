import { LightningElement, api, track } from 'lwc';
import getShipmentStatus   from '@salesforce/apex/ShipmentStatusController.getShipmentStatus';
import refreshShipmentStatus from '@salesforce/apex/ShipmentStatusController.refreshShipmentStatus';

// Ordered, Picked, Shipped, In Transit, Delivered
const STATUS_STEPS = ['Ordered', 'Picked', 'Shipped', 'In Transit', 'Delivered'];

// Badge colour map  →  { bg, color }
const BADGE_STYLES = {
    'Ordered'    : { cls: 'status-badge badge-ordered'    },
    'Picked'     : { cls: 'status-badge badge-picked'     },
    'Shipped'    : { cls: 'status-badge badge-shipped'    },
    'In Transit' : { cls: 'status-badge badge-in-transit' },
    'Delivered'  : { cls: 'status-badge badge-delivered'  },
};

export default class ShipmentStatusTracker extends LightningElement {

    /* ── Public properties ── */
    @api recordId;

    /* ── Reactive state ── */
    @track shipmentData   = {};
    @track countdown      = { hours: '00', minutes: '00', seconds: '00' };
    @track isLoading      = true;
    @track isRefreshing   = false;
    @track hasError       = false;
    @track errorMessage   = '';

    _countdownInterval = null;
    _etaDate           = null;

    /* ── Lifecycle ── */
    connectedCallback() {
        this._loadShipmentStatus();
    }

    disconnectedCallback() {
        this._clearCountdown();
    }

    /* ─────────────────────────────────────────
       Data loading
    ───────────────────────────────────────── */
    async _loadShipmentStatus() {
        this.isLoading = true;
        this._resetError();
        try {
            const result = await getShipmentStatus({ recordId: this.recordId });
            this._applyData(result);
        } catch (err) {
            this._handleError(err, 'load');
        } finally {
            this.isLoading = false;
        }
    }

    async handleRefresh() {
        this.isRefreshing = true;
        this._resetError();
        try {
            const result = await refreshShipmentStatus({ recordId: this.recordId });
            this._applyData(result);
        } catch (err) {
            this._handleError(err, 'refresh');
        } finally {
            this.isRefreshing = false;
        }
    }

    /* ─────────────────────────────────────────
       Data helpers
    ───────────────────────────────────────── */
    _applyData(raw) {
        const eta = raw.estimatedDelivery ? new Date(raw.estimatedDelivery) : null;
        this._etaDate = eta;

        this.shipmentData = {
            status         : raw.status         || 'Ordered',
            trackingNumber : raw.trackingNumber  || '—',
            trackingUrl    : raw.trackingUrl     || '#',
            etaFormatted   : eta
                ? eta.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A',
        };

        this._clearCountdown();
        if (eta) {
            this._startCountdown(eta);
        }
    }

    _startCountdown(eta) {
        const tick = () => {
            const diff = Math.max(0, eta - Date.now());
            this.countdown = {
                hours  : String(Math.floor(diff / 3_600_000)).padStart(2, '0'),
                minutes: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0'),
                seconds: String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0'),
            };
        };
        tick();
        this._countdownInterval = setInterval(tick, 1_000);
    }

    _clearCountdown() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
            this._countdownInterval = null;
        }
    }

    _handleError(err, context) {
        this.hasError     = true;
        this.errorMessage = err?.body?.message
            || err?.message
            || `Failed to ${context} shipment status. Please try again.`;
    }

    _resetError() {
        this.hasError     = false;
        this.errorMessage = '';
    }

    /* ─────────────────────────────────────────
       Getters – steps
    ───────────────────────────────────────── */
    get steps() {
        const currentIdx = STATUS_STEPS.indexOf(this.shipmentData.status);

        return STATUS_STEPS.map((label, idx) => {
            const isDone    = idx < currentIdx;
            const isActive  = idx === currentIdx;
            const isPending = idx > currentIdx;
            const isFirst   = idx === 0;

            return {
                id                  : label,
                label,
                isDone,
                isActive,
                isPending,
                showConnectorBefore : !isFirst,
                dotClass            : [
                    'step-dot',
                    isDone ? 'done' : isActive ? 'active' : 'pending'
                ].join(' '),
                // connector lives BEFORE the dot (left side) from idx 1 onward
                connectorClass      : `step-connector ${isDone || isActive ? 'done' : 'pending'}`,
                labelClass          : [
                    'step-label',
                    isDone ? 'done' : isActive ? 'active' : ''
                ].join(' ').trim(),
                ariaLabel           : `${label}: ${isDone ? 'completed' : isActive ? 'current' : 'pending'}`,
            };
        });
    }

    /* ─────────────────────────────────────────
       Getters – badge / button
    ───────────────────────────────────────── */
    get statusBadgeClass() {
        return (BADGE_STYLES[this.shipmentData.status] || BADGE_STYLES['Ordered']).cls;
    }

    get showPulseDot() {
        return this.shipmentData.status === 'In Transit';
    }

    get refreshLabel() {
        return this.isRefreshing ? 'Refreshing…' : 'Refresh Status';
    }

    get refreshIconClass() {
        return this.isRefreshing ? 'spin spinning' : 'spin';
    }

    /* ─────────────────────────────────────────
       Skeleton helper
    ───────────────────────────────────────── */
    get skeletonSteps() {
        return [1, 2, 3, 4, 5];
    }
}
