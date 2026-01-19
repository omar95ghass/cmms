<?php
class LaboratoryTestTypeController {
    private $testTypeModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->testTypeModel = new LaboratoryTestType();
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
        
        // Only admin can access test type management
        if ($this->user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            exit;
        }
    }

    public function index() {
        $testTypes = $this->testTypeModel->findAll();
        echo json_encode($testTypes);
    }

    public function show($id) {
        $testType = $this->testTypeModel->findById($id);
        
        if (!$testType) {
            http_response_code(404);
            echo json_encode(['error' => 'Test type not found']);
            return;
        }

        echo json_encode($testType);
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $errors = [];
        if (empty($data['test_name'])) {
            $errors['test_name'] = 'Test name is required';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        try {
            $testTypeId = $this->testTypeModel->create($data);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'create',
                'laboratory_test_type',
                $testTypeId,
                "Created laboratory test type: {$data['test_name']}",
                null,
                $data
            );

            http_response_code(201);
            echo json_encode(['id' => $testTypeId, 'success' => true, 'message' => 'Test type created successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $testType = $this->testTypeModel->findById($id);
        
        if (!$testType) {
            http_response_code(404);
            echo json_encode(['error' => 'Test type not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $beforeValue = $testType;

        // Validation
        $errors = [];
        if (empty($data['test_name'])) {
            $errors['test_name'] = 'Test name is required';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        try {
            $this->testTypeModel->update($id, $data);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'update',
                'laboratory_test_type',
                $id,
                "Updated laboratory test type: {$data['test_name']}",
                $beforeValue,
                $data
            );

            echo json_encode(['success' => true, 'message' => 'Test type updated successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        $testType = $this->testTypeModel->findById($id);
        
        if (!$testType) {
            http_response_code(404);
            echo json_encode(['error' => 'Test type not found']);
            return;
        }

        try {
            $this->testTypeModel->delete($id);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'delete',
                'laboratory_test_type',
                $id,
                "Deleted laboratory test type: {$testType['test_name']}",
                $testType,
                null
            );

            echo json_encode(['success' => true, 'message' => 'Test type deleted successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
