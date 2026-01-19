<?php
class LaboratoryController {
    private $labModel;
    private $patientModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->labModel = new LaboratoryTest();
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
        
        if (empty($data['test_name']) || empty($data['test_value'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Test name and value are required']);
            return;
        }

        $testId = $this->labModel->create($patientId, $data);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'create',
            'laboratory_test',
            $testId,
            "Added laboratory test for patient: {$patient['patient_id']}",
            null,
            $data
        );

        http_response_code(201);
        echo json_encode(['id' => $testId, 'message' => 'Test recorded successfully']);
    }

    public function getTestTypes() {
        $testTypes = $this->labModel->getTestTypes();
        echo json_encode($testTypes);
    }
}
