<?php
class ActivityLogController {
    private $activityLog;
    private $user;

    public function __construct() {
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
    }

    public function index() {
        $filters = [
            'username' => $_GET['username'] ?? '',
            'action' => $_GET['action'] ?? '',
            'date_from' => $_GET['date_from'] ?? '',
            'date_to' => $_GET['date_to'] ?? '',
        ];
        
        // Remove empty filters
        $filters = array_filter($filters, function($value) {
            return $value !== '';
        });
        
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
        $logs = $this->activityLog->findAll($filters, $limit);
        echo json_encode($logs);
    }
    
    public function getFilters() {
        $actions = $this->activityLog->getUniqueActions();
        $usernames = $this->activityLog->getUniqueUsernames();
        
        echo json_encode([
            'actions' => $actions,
            'usernames' => $usernames
        ]);
    }
}
