<?php
class VisitController {
    private $visitModel;
    private $patientModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->visitModel = new Visit();
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
        
        if (empty($data['complaint'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Complaint is required']);
            return;
        }

        $visitId = $this->visitModel->create($patientId, $data, $this->user['id']);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'create',
            'visit',
            $visitId,
            "Added visit for patient: {$patient['patient_id']}",
            null,
            $data
        );

        http_response_code(201);
        echo json_encode(['id' => $visitId, 'message' => 'Visit recorded successfully']);
    }
}
