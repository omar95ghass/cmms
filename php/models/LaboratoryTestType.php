<?php
class LaboratoryTestType {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll() {
        $stmt = $this->db->query("
            SELECT id, test_name, normal_range, unit, category, description, created_at
            FROM laboratory_test_types 
            ORDER BY category, test_name
        ");
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("
            SELECT id, test_name, normal_range, unit, category, description, created_at
            FROM laboratory_test_types 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data) {
        $testName = trim($data['test_name']);
        $normalRange = !empty($data['normal_range']) ? trim($data['normal_range']) : null;
        $unit = !empty($data['unit']) ? trim($data['unit']) : null;
        $category = !empty($data['category']) ? trim($data['category']) : null;
        $description = !empty($data['description']) ? trim($data['description']) : null;

        $stmt = $this->db->prepare("
            INSERT INTO laboratory_test_types (test_name, normal_range, unit, category, description, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([$testName, $normalRange, $unit, $category, $description]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $testName = trim($data['test_name']);
        $normalRange = !empty($data['normal_range']) ? trim($data['normal_range']) : null;
        $unit = !empty($data['unit']) ? trim($data['unit']) : null;
        $category = !empty($data['category']) ? trim($data['category']) : null;
        $description = !empty($data['description']) ? trim($data['description']) : null;

        $stmt = $this->db->prepare("
            UPDATE laboratory_test_types SET
                test_name = ?, normal_range = ?, unit = ?, category = ?, description = ?
            WHERE id = ?
        ");

        $stmt->execute([$testName, $normalRange, $unit, $category, $description, $id]);

        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM laboratory_test_types WHERE id = ?");
        $stmt->execute([$id]);
        
        return $stmt->rowCount() > 0;
    }
}
