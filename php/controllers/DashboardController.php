<?php
class DashboardController {
    private $db;
    private $user;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->user = AuthMiddleware::handle();
    }

    public function stats() {
        $stats = [
            'totalPatients' => $this->getTotalPatients(),
            'todayVisits' => $this->getTodayVisits(),
            'pendingTests' => $this->getPendingTests(),
        ];

        echo json_encode($stats);
    }

    private function getTotalPatients() {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM patients");
        $result = $stmt->fetch();
        return (int)$result['count'];
    }

    private function getTodayVisits() {
        $stmt = $this->db->query("
            SELECT COUNT(*) as count 
            FROM visits 
            WHERE DATE(visit_date) = CURDATE()
        ");
        $result = $stmt->fetch();
        return (int)$result['count'];
    }

    private function getPendingTests() {
        // This is a placeholder - implement based on your business logic
        return 0;
    }
}
