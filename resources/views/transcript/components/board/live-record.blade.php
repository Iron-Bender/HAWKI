<!-- UI Live Aufnahme -->
<div id="transcript-live-ui" class="transcript-workspace-ui hidden">
    <div class="transcript-workspace-section">

        <!-- Header Container -->
        <div class="transcript-workspace-header">
            <!-- Tabs -->
            <div class="transcript-tabs transcript-tabs-compact" id="live-record-tabs"
                style="margin: 0 auto 16px; width: fit-content;">
                <button class="transcript-tab active" data-live-tab="record" onclick="setLiveTab('record')">Aufnahme</button>
                <button class="transcript-tab" data-live-tab="live-transcript" onclick="setLiveTab('live-transcript')">Live-Transkription</button>
            </div>

            <div class="transcript-header-top" style="justify-content: flex-start; gap: 20px;">
                <div>
                    <h2 class="transcript-title"
                        style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-weight: 500;">
                        Aufnahme benennen
                        <button style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0;">
                            <x-icon name="edit" style="width: 16px; height: 16px;" />
                        </button>
                    </h2>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="transcript-content-area"
            style="display: flex; flex-direction: column; gap: 16px; padding-bottom: 24px;">
            <div id="live-record-panel" style="display: flex; flex-direction: column; gap: 16px;">
                <div id="live-record-card"
                    style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-height: 400px; gap: 16px; position: relative;">
                    <div id="live-record-badge" class="hidden"
                        style="position: absolute; top: 18px; right: 18px; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0; display: inline-flex; align-items: center; gap: 8px;">
                        <span style="width: 8px; height: 8px; background: #dc2626; border-radius: 50%;"></span>
                        LIVE
                    </div>
                    <div id="live-record-icon-wrap"
                        style="width: 96px; height: 96px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <x-icon name="microphone" style="width: 40px; height: 40px; color: #93c5fd;" />
                    </div>
                    <div style="text-align: center;">
                        <div id="live-record-status-title"
                            style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 6px;">Starten Sie
                            Ihre Aufnahme</div>
                        <div id="live-record-status-text" style="font-size: 13px; color: #94a3b8;">Wählen Sie unten ein
                            Mikrofon aus und drücken Sie Aufnahme starten.</div>
                        <div id="live-record-timer"
                            style="font-size: 32px; color: #0f5fbf; font-weight: 500; margin-top: 18px; font-variant-numeric: tabular-nums;">
                            00:00</div>
                    </div>
                </div>
            </div>

            <div id="live-transcript-panel" class="hidden">
                <div id="live-transcript-preview-card"
                    style="background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; min-height: 400px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; --live-font-size: 18px; position: relative; transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;">
                    <div id="live-transcript-preview-text" class="live-transcript-preview-text"
                        style="flex: 1; font-size: var(--live-font-size); line-height: 1.7; transition: font-size 0.2s ease;">
                    </div>
                    <button id="live-transcript-maximize-toggle" type="button" class="live-transcript-maximize-button"
                        aria-pressed="false" title="Textansicht maximieren">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M9 4H4v5"></path>
                            <path d="M15 4h5v5"></path>
                            <path d="M20 15v5h-5"></path>
                            <path d="M4 15v5h5"></path>
                            <path d="M10 4 4 10"></path>
                            <path d="m14 4 6 6"></path>
                            <path d="m20 14-6 6"></path>
                            <path d="m10 20-6-6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div
                style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-shrink: 0; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 0 0 auto;">
                    <button id="live-record-start-btn" type="button"
                        style="background: #dc2626; color: white; border: none; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">
                        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
                        Aufnahme starten
                    </button>

                    <button id="live-record-pause-btn" type="button" disabled
                        style="background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; cursor: not-allowed; opacity: 0.8;">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px;" viewBox="0 0 24 24"
                            fill="currentColor" aria-hidden="true">
                            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                        </svg>
                        Pause
                    </button>
                </div>

                <div class="select-wrapper"
                    style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 13px; color: #0f172a; display: flex; align-items: center; flex: 0 1 320px; max-width: 100%; min-width: 0; overflow: hidden;">
                    <x-icon name="microphone" class="field-icon" style="color: #1d4ed8;" />
                    <select id="live-input-device-select"
                        style="font-weight: 600; font-size: 13px; color: #0f172a; min-width: 0;">
                        <option value="">Mikrofone werden geladen...</option>
                    </select>
                </div>
            </div>
        </div>


    </div>
</div>