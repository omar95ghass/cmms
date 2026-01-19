<?php
class PatientController {
    private $patientModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->patientModel = new Patient();
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
    }

    public function index() {
        // Only return results if search query is provided
        // This prevents loading all patients and reduces server load
        $search = isset($_GET['search']) ? trim($_GET['search']) : null;
        
        if ($search && strlen($search) >= 2) {
            $patients = $this->patientModel->search($search);
        } else {
            // Return empty array if no search or search is too short (less than 2 characters)
            $patients = [];
        }
        
        echo json_encode($patients);
    }

    public function show($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        echo json_encode($patient);
    }

    public function getVitals($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        $vitalModel = new Vital();
        $vitals = $vitalModel->findByPatientId($id);
        
        echo json_encode([
            'patient' => $patient,
            'vitals' => $vitals
        ]);
    }

    public function getVisits($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        $visitModel = new Visit();
        $visits = $visitModel->findByPatientId($id);
        
        echo json_encode([
            'patient' => $patient,
            'visits' => $visits
        ]);
    }

    public function getLaboratory($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        $labModel = new LaboratoryTest();
        $tests = $labModel->findByPatientId($id);
        
        echo json_encode([
            'patient' => $patient,
            'tests' => $tests
        ]);
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Check if data is valid JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }

        // Check if data is empty
        if (empty($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Request body is empty']);
            return;
        }

        // Validation
        $errors = $this->validate($data);
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // Check if patient with same ID number already exists (if ID number provided)
        if (!empty($data['id_number'])) {
            $existing = $this->patientModel->findByIdNumber($data['id_number']);
            if ($existing) {
                http_response_code(409); // Conflict
                echo json_encode(['error' => 'Patient with this ID number already exists', 'patient_id' => $existing['patient_id']]);
                return;
            }
        }

        try {
            $patientId = $this->patientModel->create($data);
            $patient = $this->patientModel->findById($patientId);

            if (!$patient) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create patient']);
                return;
            }

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'create',
                'patient',
                $patientId,
                "Created patient: {$patient['patient_id']} ({$patient['full_name']})",
                null,
                $patient
            );

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Patient created successfully',
                'data' => $patient
            ]);
            
            // Ensure output is flushed
            if (ob_get_level()) {
                ob_end_flush();
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $errors = $this->validate($data, $id);
        
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        $beforeValue = $patient;
        $this->patientModel->update($id, $data);
        $afterValue = $this->patientModel->findById($id);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'update',
            'patient',
            $id,
            "Updated patient: {$afterValue['patient_id']}",
            $beforeValue,
            $afterValue
        );

        echo json_encode($afterValue);
    }

    private function validate($data, $id = null) {
        $errors = [];

        // Required fields
        if (empty($data['first_name']) || trim($data['first_name']) === '') {
            $errors['first_name'] = 'First name is required';
        } elseif (strlen(trim($data['first_name'])) < 2) {
            $errors['first_name'] = 'First name must be at least 2 characters';
        }

        if (empty($data['last_name']) || trim($data['last_name']) === '') {
            $errors['last_name'] = 'Last name is required';
        } elseif (strlen(trim($data['last_name'])) < 2) {
            $errors['last_name'] = 'Last name must be at least 2 characters';
        }

        if (empty($data['date_of_birth'])) {
            $errors['date_of_birth'] = 'Date of birth is required';
        } else {
            // Validate date format
            $date = DateTime::createFromFormat('Y-m-d', $data['date_of_birth']);
            if (!$date || $date->format('Y-m-d') !== $data['date_of_birth']) {
                $errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD';
            } else {
                // Check if date is not in the future
                $today = new DateTime();
                if ($date > $today) {
                    $errors['date_of_birth'] = 'Date of birth cannot be in the future';
                }
            }
        }

        if (empty($data['gender'])) {
            $errors['gender'] = 'Gender is required';
        } elseif (!in_array($data['gender'], ['male', 'female'])) {
            $errors['gender'] = 'Gender must be either male or female';
        }

        // Optional field validations
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }

        if (!empty($data['phone'])) {
            // Basic phone validation (allow numbers, spaces, +, -, ())
            $phone = preg_replace('/[\s\-\(\)]/', '', $data['phone']);
            if (!preg_match('/^\+?[0-9]{8,15}$/', $phone)) {
                $errors['phone'] = 'Invalid phone number format';
            }
        }

        if (!empty($data['id_number']) && strlen($data['id_number']) < 5) {
            $errors['id_number'] = 'ID number must be at least 5 characters';
        }

        return $errors;
    }

    public function uploadDocument($id) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        // Check if file was uploaded
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error']);
            return;
        }

        // Get document type (id_photo or personal_photo)
        $type = $_POST['type'] ?? null;
        if (!in_array($type, ['id_photo', 'personal_photo'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid document type. Must be id_photo or personal_photo']);
            return;
        }

        $file = $_FILES['file'];
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Allowed: JPG, PNG, GIF, PDF']);
            return;
        }

        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 5MB limit']);
            return;
        }

        // Create uploads directory if it doesn't exist
        $uploadsDir = BASE_PATH . '/uploads/patients/' . $id;
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = $type . '_' . time() . '_' . uniqid() . '.' . $extension;
        $filePath = '/uploads/patients/' . $id . '/' . $fileName;
        $fullPath = BASE_PATH . $filePath;

        // Delete old file if exists
        if (!empty($patient[$type])) {
            $oldFilePath = BASE_PATH . $patient[$type];
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }
        }

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            return;
        }

        // Update database
        $this->patientModel->updateDocument($id, $type, $filePath);
        $updatedPatient = $this->patientModel->findById($id);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'upload',
            'patient_document',
            $id,
            "Uploaded {$type} for patient: {$patient['patient_id']}",
            $patient,
            $updatedPatient
        );

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $updatedPatient
        ]);
    }

    public function deleteDocument($id, $type) {
        $patient = $this->patientModel->findById($id);
        
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
            return;
        }

        if (!in_array($type, ['id_photo', 'personal_photo'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid document type']);
            return;
        }

        // Delete file from filesystem
        $filePath = $this->patientModel->deleteDocument($id, $type);
        if ($filePath) {
            $fullPath = BASE_PATH . $filePath;
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        $updatedPatient = $this->patientModel->findById($id);

        // Log activity
        $this->activityLog->create(
            $this->user['id'],
            'delete',
            'patient_document',
            $id,
            "Deleted {$type} for patient: {$patient['patient_id']}",
            $patient,
            $updatedPatient
        );

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Document deleted successfully',
            'data' => $updatedPatient
        ]);
    }
}
