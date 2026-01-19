<?php
class BackupService {
    private $db;
    private $activityLog;
    private $settingsFile;
    private $backupPath;
    
    // 6 hours in seconds
    const BACKUP_INTERVAL = 6 * 60 * 60;
    const MAX_BACKUPS = 10;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->activityLog = new ActivityLog();
        $this->settingsFile = BASE_PATH . '/config/system-settings.json';
        $this->backupPath = $this->getBackupPath();
    }

    /**
     * Get backup path from system settings
     */
    private function getBackupPath() {
        if (!file_exists($this->settingsFile)) {
            return null;
        }

        $jsonContent = file_get_contents($this->settingsFile);
        $settings = json_decode($jsonContent, true);

        if ($settings && isset($settings['backupPath']) && !empty($settings['backupPath'])) {
            $path = $settings['backupPath'];
            // Ensure directory exists
            if (!is_dir($path)) {
                @mkdir($path, 0755, true);
            }
            return $path;
        }

        return null;
    }

    /**
     * Check if backup is needed (last backup was more than 6 hours ago)
     */
    public function shouldBackup() {
        if (!$this->backupPath || !is_dir($this->backupPath)) {
            return false;
        }

        $lastBackupTime = $this->getLastBackupTime();
        
        if ($lastBackupTime === null) {
            // No backup exists, create one
            return true;
        }

        $timeSinceLastBackup = time() - $lastBackupTime;
        return $timeSinceLastBackup >= self::BACKUP_INTERVAL;
    }

    /**
     * Get timestamp of the most recent backup file
     */
    private function getLastBackupTime() {
        if (!$this->backupPath || !is_dir($this->backupPath)) {
            return null;
        }

        $files = glob($this->backupPath . '/backup_*.zip');
        
        if (empty($files)) {
            return null;
        }

        // Sort by modification time (newest first)
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        return filemtime($files[0]);
    }

    /**
     * Create database backup
     */
    public function createBackup($userId = null) {
        if (!$this->backupPath || !is_dir($this->backupPath)) {
            error_log("Backup path not configured or invalid: " . $this->backupPath);
            return false;
        }

        try {
            $timestamp = date('Y-m-d_H-i-s');
            $filename = 'backup_' . $timestamp . '.zip';
            $filepath = $this->backupPath . '/' . $filename;

            // Create ZIP file with CSV files for all tables
            $this->exportToCSV($filepath);

            // Clean up old backups (keep only MAX_BACKUPS)
            $this->cleanupOldBackups();

            // Log activity
            $this->activityLog->create(
                $userId,
                'backup_create',
                'system',
                0,
                "Database backup created: {$filename}",
                null,
                ['filepath' => $filepath, 'timestamp' => $timestamp]
            );

            return true;
        } catch (Exception $e) {
            error_log("Backup failed: " . $e->getMessage());
            $this->activityLog->create(
                $userId,
                'backup_error',
                'system',
                0,
                "Database backup failed: " . $e->getMessage(),
                null,
                null
            );
            return false;
        }
    }

    /**
     * Export all database tables to CSV files in a ZIP archive
     */
    private function exportToCSV($zipPath) {
        // Check if ZIP extension is available
        if (!extension_loaded('zip')) {
            throw new Exception('ZIP extension is not available. Please enable php_zip extension.');
        }

        $tables = $this->getAllTables();
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception('Cannot create ZIP file: ' . $zipPath);
        }

        foreach ($tables as $table) {
            // Generate CSV content for this table
            $csvContent = $this->generateCSV($table);
            
            // Sanitize table name for filename
            $csvFilename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $table) . '.csv';
            
            // Add CSV file to ZIP
            $zip->addFromString($csvFilename, $csvContent);
        }

        $zip->close();
    }

    /**
     * Generate CSV content for a table
     */
    private function generateCSV($table) {
        // Get column names
        $stmtCols = $this->db->query("SHOW COLUMNS FROM `{$table}`");
        $columns = [];
        while ($col = $stmtCols->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $col['Field'];
        }

        // Start output buffer for CSV
        $output = fopen('php://temp', 'r+');
        
        // Write BOM for UTF-8 (helps Excel recognize UTF-8)
        fwrite($output, "\xEF\xBB\xBF");

        // Write header row
        fputcsv($output, $columns);

        // Fetch and write data rows
        $stmt = $this->db->query("SELECT * FROM `{$table}`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $csvRow = [];
            foreach ($columns as $column) {
                $value = isset($row[$column]) && $row[$column] !== null ? $row[$column] : '';
                $csvRow[] = $value;
            }
            fputcsv($output, $csvRow);
        }

        // Get CSV content
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }

    /**
     * Get all table names from database
     */
    private function getAllTables() {
        $stmt = $this->db->query("SHOW TABLES");
        $tables = [];
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }
        return $tables;
    }


    /**
     * Clean up old backups, keeping only the latest MAX_BACKUPS
     */
    private function cleanupOldBackups() {
        if (!$this->backupPath || !is_dir($this->backupPath)) {
            return;
        }

        $files = glob($this->backupPath . '/backup_*.zip');
        
        if (count($files) <= self::MAX_BACKUPS) {
            return;
        }

        // Sort by modification time (oldest first)
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });

        // Delete oldest files (keep only MAX_BACKUPS)
        $filesToDelete = array_slice($files, 0, count($files) - self::MAX_BACKUPS);
        
        foreach ($filesToDelete as $file) {
            if (file_exists($file)) {
                unlink($file);
                error_log("Deleted old backup: " . basename($file));
            }
        }
    }
}
