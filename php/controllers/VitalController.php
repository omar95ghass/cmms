<?php
class VitalController {
    private $vitalModel;
    private $patientModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->vitalModel = new Vital();
        $this->patientModel = new Patient();
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
    }

    public function create($patientId) {
        $patient = $this->patientModel->findById($patientId);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $vitalId = $this->vitalModel->create($patientId, $data);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'create',
            'vital',
            $vitalId,
            "Added vitals for patient: {$patient['patient_id']}",
            null,
            $data
        );

        http_response_code(201);
        echo json_encode(['id' => $vitalId, 'message' => 'Vitals recorded successfully']);
    }
}
