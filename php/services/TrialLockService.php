<?php
class TrialLockService {
    private $settingsFile;
    private const TRIAL_DAYS = 3;
    private const TRIAL_SECONDS = 3 * 24 * 60 * 60; // 3 days in seconds

    public function __construct() {
        $this->settingsFile = BASE_PATH . '/config/system-settings.json';
    }

    /**
     * Check if system is locked and update access timestamp
     * Returns: ['locked' => bool, 'daysRemaining' => int, 'message' => string]
     */
    public function checkLock() {
        $settings = $this->readSettings();
        $currentTime = time();

        // Initialize trial if first use
        if (!isset($settings['trial']['firstUseTimestamp'])) {
            $settings['trial'] = [
                'firstUseTimestamp' => $currentTime,
                'lastAccessTimestamp' => $currentTime,
                'trialDays' => self::TRIAL_DAYS,
                'isLocked' => false
            ];
            $this->writeSettings($settings);
            return [
                'locked' => false,
                'daysRemaining' => self::TRIAL_DAYS,
                'message' => 'Trial started'
            ];
        }

        $firstUse = $settings['trial']['firstUseTimestamp'];
        $lastAccess = $settings['trial']['lastAccessTimestamp'] ?? $firstUse;

        // Protection against time manipulation:
        // 1. Current time must be >= last access time (can't go backwards)
        // 2. If time went backwards, lock the system
        if ($currentTime < $lastAccess) {
            // Time manipulation detected - lock system
            $settings['trial']['isLocked'] = true;
            $this->writeSettings($settings);
            return [
                'locked' => true,
                'daysRemaining' => 0,
                'message' => 'System locked due to time manipulation detected'
            ];
        }

        // Update last access timestamp
        $settings['trial']['lastAccessTimestamp'] = $currentTime;
        
        // Calculate elapsed time from first use
        $elapsedSeconds = $currentTime - $firstUse;
        $elapsedDays = floor($elapsedSeconds / (24 * 60 * 60));
        
        // Check if trial period expired
        if ($elapsedDays >= self::TRIAL_DAYS) {
            $settings['trial']['isLocked'] = true;
            $this->writeSettings($settings);
            return [
                'locked' => true,
                'daysRemaining' => 0,
                'message' => 'Trial period expired'
            ];
        }

        // Calculate remaining days
        $daysRemaining = self::TRIAL_DAYS - $elapsedDays;
        
        // Save updated settings
        $this->writeSettings($settings);

        return [
            'locked' => false,
            'daysRemaining' => max(0, $daysRemaining),
            'message' => "Trial active: {$daysRemaining} days remaining"
        ];
    }

    /**
     * Get trial status without updating timestamp
     */
    public function getStatus() {
        $settings = $this->readSettings();
        
        if (!isset($settings['trial']['firstUseTimestamp'])) {
            return [
                'locked' => false,
                'daysRemaining' => self::TRIAL_DAYS,
                'firstUseTimestamp' => null,
                'lastAccessTimestamp' => null,
                'isLocked' => false
            ];
        }

        $firstUse = $settings['trial']['firstUseTimestamp'];
        $lastAccess = $settings['trial']['lastAccessTimestamp'] ?? $firstUse;
        $currentTime = time();
        
        // Check if locked
        if (isset($settings['trial']['isLocked']) && $settings['trial']['isLocked']) {
            return [
                'locked' => true,
                'daysRemaining' => 0,
                'firstUseTimestamp' => $firstUse,
                'lastAccessTimestamp' => $lastAccess,
                'isLocked' => true
            ];
        }

        // Calculate elapsed time
        $elapsedSeconds = $currentTime - $firstUse;
        $elapsedDays = floor($elapsedSeconds / (24 * 60 * 60));
        
        if ($elapsedDays >= self::TRIAL_DAYS) {
            return [
                'locked' => true,
                'daysRemaining' => 0,
                'firstUseTimestamp' => $firstUse,
                'lastAccessTimestamp' => $lastAccess,
                'isLocked' => true
            ];
        }

        $daysRemaining = self::TRIAL_DAYS - $elapsedDays;

        return [
            'locked' => false,
            'daysRemaining' => max(0, $daysRemaining),
            'firstUseTimestamp' => $firstUse,
            'lastAccessTimestamp' => $lastAccess,
            'isLocked' => false
        ];
    }

    /**
     * Check if system is currently locked
     */
    public function isLocked() {
        $status = $this->getStatus();
        return $status['locked'];
    }

    private function readSettings() {
        if (!file_exists($this->settingsFile)) {
            return $this->getDefaultSettings();
        }

        $jsonContent = file_get_contents($this->settingsFile);
        $settings = json_decode($jsonContent, true);

        if ($settings === null || empty($settings)) {
            return $this->getDefaultSettings();
        }

        // Ensure trial settings exist
        if (!isset($settings['trial'])) {
            $settings['trial'] = [
                'firstUseTimestamp' => null,
                'lastAccessTimestamp' => null,
                'trialDays' => self::TRIAL_DAYS,
                'isLocked' => false
            ];
        }

        return $settings;
    }

    private function writeSettings($settings) {
        $jsonData = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($this->settingsFile, $jsonData);
        chmod($this->settingsFile, 0664);
    }

    private function getDefaultSettings() {
        return [
            'systemName' => 'MMS',
            'systemNameArabic' => 'نظام الإدارة الطبية',
            'logoPath' => '/logo.png',
            'backupPath' => '',
            'trial' => [
                'firstUseTimestamp' => null,
                'lastAccessTimestamp' => null,
                'trialDays' => self::TRIAL_DAYS,
                'isLocked' => false
            ]
        ];
    }
}
