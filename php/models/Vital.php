<?php
class Vital {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($patientId, $data) {
        $pulse = !empty($data['pulse']) ? (int)$data['pulse'] : null;
        $bmi = !empty($data['bmi']) ? (float)$data['bmi'] : null;
        $respirationRate = !empty($data['respiration_rate']) ? (int)$data['respiration_rate'] : null;
        $visualTests = !empty($data['visual_tests']) ? json_encode($data['visual_tests']) : null;
        $systemsExamination = !empty($data['systems_examination']) ? json_encode($data['systems_examination']) : null;
        
        $stmt = $this->db->prepare("
            INSERT INTO vitals (
                patient_id, weight, height, blood_pressure, 
                temperature, pulse, bmi, respiration_rate,
                visual_tests, systems_examination, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $patientId,
            $data['weight'] ?? null,
            $data['height'] ?? null,
            $data['blood_pressure'] ?? null,
            $data['temperature'] ?? null,
            $pulse,
            $bmi,
            $respirationRate,
            $visualTests,
            $systemsExamination,
            $data['notes'] ?? null,
        ]);
        
        return $this->db->lastInsertId();
    }

    public function findByPatientId($patientId) {
        $stmt = $this->db->prepare("
            SELECT * FROM vitals 
            WHERE patient_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$patientId]);
        return $stmt->fetchAll();
    }
}
