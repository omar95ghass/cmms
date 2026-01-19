<?php
class SystemSettingsController {
    private $settingsFile;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->settingsFile = BASE_PATH . '/config/system-settings.json';
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
        
        // Only admin can access system settings
        if ($this->user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            exit;
        }
    }

    public function get() {
        // Remove auth requirement for GET (public read access)
        // But we still need to read settings file
        $settings = $this->readSettings();
        echo json_encode($settings);
    }

    public function update() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $errors = [];
        if (empty($data['systemName'])) {
            $errors['systemName'] = 'System name is required';
        }
        if (empty($data['systemNameArabic'])) {
            $errors['systemNameArabic'] = 'Arabic system name is required';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // Get old settings for activity log
        $oldSettings = $this->readSettings();

        // Prepare new settings
        $newSettings = [
            'systemName' => trim($data['systemName']),
            'systemNameArabic' => trim($data['systemNameArabic']),
            'logoPath' => !empty($data['logoPath']) ? trim($data['logoPath']) : '/logo.png',
            'backupPath' => !empty($data['backupPath']) ? trim($data['backupPath']) : '',
        ];

        // Save to JSON file
        try {
            $jsonData = json_encode($newSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            
            if (file_put_contents($this->settingsFile, $jsonData) === false) {
                throw new Exception('Failed to write settings file');
            }

            // Set file permissions (readable/writable by owner)
            chmod($this->settingsFile, 0664);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'update',
                'system_settings',
                0,
                "Updated system settings",
                $oldSettings,
                $newSettings
            );

            echo json_encode(['success' => true, 'message' => 'Settings updated successfully', 'settings' => $newSettings]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save settings: ' . $e->getMessage()]);
        }
    }

    private function readSettings() {
        // Create file if it doesn't exist with default values
        if (!file_exists($this->settingsFile)) {
            $defaultSettings = [
                'systemName' => 'MMS',
                'systemNameArabic' => 'نظام الإدارة الطبية',
                'logoPath' => '/logo.png',
                'backupPath' => ''
            ];
            $jsonData = json_encode($defaultSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            file_put_contents($this->settingsFile, $jsonData);
            chmod($this->settingsFile, 0664);
            return $defaultSettings;
        }

        $jsonContent = file_get_contents($this->settingsFile);
        $settings = json_decode($jsonContent, true);

        // If JSON is invalid or empty, return defaults
        if ($settings === null || empty($settings)) {
            $defaultSettings = [
                'systemName' => 'MMS',
                'systemNameArabic' => 'نظام الإدارة الطبية',
                'logoPath' => '/logo.png',
                'backupPath' => ''
            ];
            return $defaultSettings;
        }

        // Ensure backupPath exists in old settings (backward compatibility)
        if (!isset($settings['backupPath'])) {
            $settings['backupPath'] = '';
        }

        // Ensure trial settings exist (backward compatibility)
        if (!isset($settings['trial'])) {
            $settings['trial'] = [
                'firstUseTimestamp' => null,
                'lastAccessTimestamp' => null,
                'trialDays' => 3,
                'isLocked' => false
            ];
        }

        return $settings;
    }
}

// Create a simple public class for GET requests (without auth requirement)
class SystemSettingsPublicController {
    private $settingsFile;

    public function __construct() {
        $this->settingsFile = BASE_PATH . '/config/system-settings.json';
    }

    public function get() {
        $settings = $this->readSettings();
        echo json_encode($settings);
    }

    private function readSettings() {
        // Create file if it doesn't exist with default values
        if (!file_exists($this->settingsFile)) {
            $defaultSettings = [
                'systemName' => 'MMS',
                'systemNameArabic' => 'نظام الإدارة الطبية',
                'logoPath' => '/logo.png',
                'backupPath' => ''
            ];
            $jsonData = json_encode($defaultSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            file_put_contents($this->settingsFile, $jsonData);
            chmod($this->settingsFile, 0664);
            return $defaultSettings;
        }

        $jsonContent = file_get_contents($this->settingsFile);
        $settings = json_decode($jsonContent, true);

        // If JSON is invalid or empty, return defaults
        if ($settings === null || empty($settings)) {
            $defaultSettings = [
                'systemName' => 'MMS',
                'systemNameArabic' => 'نظام الإدارة الطبية',
                'logoPath' => '/logo.png',
                'backupPath' => ''
            ];
            return $defaultSettings;
        }

        // Ensure backupPath exists in old settings (backward compatibility)
        if (!isset($settings['backupPath'])) {
            $settings['backupPath'] = '';
        }

        return $settings;
    }
}
