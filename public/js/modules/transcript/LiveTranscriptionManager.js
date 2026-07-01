export class LiveTranscriptionManager {
    constructor(app) {
        this.app = app;
        this.pollingJobs = new Set();
        this.initializeState();
    }

    initializeState() {
        this.app.state.liveTranscriptFontSize = 18;
        this.app.state.liveTranscriptContrastInverted = false;
        this.app.state.liveTranscriptMaximized = false;
        this.app.state.liveInputDevices = [];
        this.app.state.liveSelectedDeviceId = '';
        this.app.state.liveMicrophonePermissionGranted = false;
        this.app.state.liveRecordingStatus = 'idle';
        this.app.state.liveRecordingError = '';
        this.app.state.liveMediaStream = null;
        this.app.state.liveRecorder = null;
        this.app.state.liveAudioChunks = [];
        this.app.state.liveRecordedFile = null;
        this.app.state.liveRecordedFileUrl = null;
        this.app.state.liveRecordingStartedAt = null;
        this.app.state.liveRecordingDurationSeconds = 0;
        this.app.state.liveRecordingTimer = null;
    }

    registerGlobalBindings(window) {
        window.setLiveTab = this.setLiveTab.bind(this);
        window.toggleLiveRecording = this.toggleLiveRecording.bind(this);
        window.initializeLiveAudioDevices = this.initializeLiveAudioDevices.bind(this);
        window.requestLiveMicrophonePermission = this.requestLiveMicrophonePermission.bind(this);
    }

    registerEventListeners() {
        const liveRecordStartBtn = document.getElementById('live-record-start-btn');
        if (liveRecordStartBtn) {
            liveRecordStartBtn.addEventListener('click', () => this.toggleLiveRecording());
        }

        const liveInputDeviceSelect = document.getElementById('live-input-device-select');
        if (liveInputDeviceSelect) {
            liveInputDeviceSelect.addEventListener('change', (event) => {
                this.app.state.liveSelectedDeviceId = event.target.value;
            });
        }
    }

    setLiveTab(tabId = 'record') {
        const normalizedTabId = tabId === 'live-transcript' ? 'live-transcript' : 'record';

        if (normalizedTabId !== 'live-transcript' && this.app.state.liveTranscriptMaximized) {
            this.app.state.liveTranscriptMaximized = false;
            document.body.classList.remove('live-transcript-maximized-active');
        }

        document.querySelectorAll('#live-record-tabs .transcript-tab[data-live-tab]')
            .forEach(tab => tab.classList.toggle('active', tab.dataset.liveTab === normalizedTabId));

        const recordPanel = document.getElementById('live-record-panel');
        const transcriptPanel = document.getElementById('live-transcript-panel');
        if (recordPanel) recordPanel.classList.toggle('hidden', normalizedTabId !== 'record');
        if (transcriptPanel) transcriptPanel.classList.toggle('hidden', normalizedTabId !== 'live-transcript');

        const recordSidebar = document.getElementById('live-record-sidebar-options');
        const transcriptSidebar = document.getElementById('live-transcript-sidebar-options');
        if (recordSidebar) recordSidebar.classList.toggle('hidden', normalizedTabId !== 'record');
        if (transcriptSidebar) transcriptSidebar.classList.toggle('hidden', normalizedTabId !== 'live-transcript');
    }

    async initializeLiveAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');

            this.app.state.liveInputDevices = audioDevices;

            const deviceSelect = document.getElementById('live-input-device-select');
            if (deviceSelect) {
                deviceSelect.innerHTML = '';
                audioDevices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Microphone ${index + 1}`;
                    deviceSelect.appendChild(option);
                });

                if (audioDevices.length > 0 && !this.app.state.liveSelectedDeviceId) {
                    this.app.state.liveSelectedDeviceId = audioDevices[0].deviceId;
                    deviceSelect.value = this.app.state.liveSelectedDeviceId;
                }
            }
        } catch (error) {
            console.error('Error enumerating audio devices:', error);
            this.app.state.liveRecordingError = 'Fehler beim Abrufen der Audiogeräte';
        }
    }

    async requestLiveMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.app.state.liveMicrophonePermissionGranted = true;
            stream.getTracks().forEach(track => track.stop());
            await this.initializeLiveAudioDevices();
        } catch (error) {
            console.error('Microphone permission denied:', error);
            this.app.state.liveMicrophonePermissionGranted = false;
            this.app.state.liveRecordingError = 'Mikrofonberechtigung verweigert';
        }
    }

    async toggleLiveRecording() {
        if (this.app.state.liveRecordingStatus === 'idle') {
            await this.startLiveRecording();
        } else if (this.app.state.liveRecordingStatus === 'recording') {
            await this.stopLiveRecording();
        }
    }

    async startLiveRecording() {
        try {
            if (!this.app.state.liveMicrophonePermissionGranted) {
                await this.requestLiveMicrophonePermission();
            }

            const constraints = {
                audio: {
                    deviceId: this.app.state.liveSelectedDeviceId
                        ? { exact: this.app.state.liveSelectedDeviceId }
                        : undefined
                }
            };

            this.app.state.liveMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.app.state.liveRecorder = new MediaRecorder(this.app.state.liveMediaStream);
            this.app.state.liveAudioChunks = [];
            this.app.state.liveRecordingStatus = 'recording';
            this.app.state.liveRecordingStartedAt = Date.now();

            this.app.state.liveRecorder.ondataavailable = (event) => {
                this.app.state.liveAudioChunks.push(event.data);
            };

            this.app.state.liveRecorder.start();
            this.updateLiveRecordingUI();
            this.startRecordingTimer();
        } catch (error) {
            console.error('Error starting recording:', error);
            this.app.state.liveRecordingError = 'Fehler beim Starten der Aufnahme';
            this.app.state.liveRecordingStatus = 'idle';
        }
    }

    async stopLiveRecording() {
        try {
            this.app.state.liveRecorder.stop();
            this.app.state.liveRecordingStatus = 'idle';
            clearInterval(this.app.state.liveRecordingTimer);

            const audioBlob = new Blob(this.app.state.liveAudioChunks, { type: 'audio/wav' });
            this.app.state.liveRecordedFile = new File(
                [audioBlob],
                'live-recording.wav',
                { type: 'audio/wav' }
            );
            this.app.state.liveRecordedFileUrl = URL.createObjectURL(audioBlob);

            this.app.state.liveMediaStream.getTracks().forEach(track => track.stop());
            this.updateLiveRecordingUI();
        } catch (error) {
            console.error('Error stopping recording:', error);
            this.app.state.liveRecordingError = 'Fehler beim Beenden der Aufnahme';
        }
    }

    startRecordingTimer() {
        this.app.state.liveRecordingTimer = setInterval(() => {
            if (this.app.state.liveRecordingStartedAt) {
                const elapsed = Math.floor((Date.now() - this.app.state.liveRecordingStartedAt) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');

                const timerElement = document.getElementById('live-record-timer');
                if (timerElement) {
                    timerElement.textContent = `${minutes}:${seconds}`;
                }
            }
        }, 1000);
    }

    updateLiveRecordingUI() {
        const badge = document.getElementById('live-record-badge');
        const statusTitle = document.getElementById('live-record-status-title');
        const statusText = document.getElementById('live-record-status-text');
        const startBtn = document.getElementById('live-record-start-btn');

        if (this.app.state.liveRecordingStatus === 'recording') {
            if (badge) badge.classList.remove('hidden');
            if (statusTitle) statusTitle.textContent = 'Aufnahme läuft...';
            if (statusText) statusText.textContent = 'Klicken Sie auf Aufnahme beenden, um zu stoppen.';
            if (startBtn) startBtn.textContent = 'Aufnahme beenden';
        } else {
            if (badge) badge.classList.add('hidden');
            if (statusTitle) statusTitle.textContent = 'Aufnahme bereit';
            if (statusText) statusText.textContent = 'Wählen Sie ein Mikrofon und starten Sie die Aufnahme.';
            if (startBtn) startBtn.textContent = 'Aufnahme starten';
        }
    }
}
