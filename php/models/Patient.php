<?php
class Patient {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data) {
        // Generate unique Patient ID
        $patientId = $this->generatePatientId();
        
        // Clean and trim data
        $firstName = trim($data['first_name']);
        $lastName = trim($data['last_name']);
        $fatherName = !empty($data['father_name']) ? trim($data['father_name']) : null;
        $phone = !empty($data['phone']) ? trim($data['phone']) : null;
        $email = !empty($data['email']) ? trim(strtolower($data['email'])) : null;
        $address = !empty($data['address']) ? trim($data['address']) : null;
        $idNumber = !empty($data['id_number']) ? trim($data['id_number']) : null;
        $maritalStatus = !empty($data['marital_status']) ? trim($data['marital_status']) : null;
        $profession = !empty($data['profession']) ? trim($data['profession']) : null;
        $country = !empty($data['country']) ? trim($data['country']) : null;
        $nationality = !empty($data['nationality']) ? trim($data['nationality']) : null;
        $city = !empty($data['city']) ? trim($data['city']) : null;
        $idMrz = !empty($data['id_mrz']) ? trim($data['id_mrz']) : null;
        $idPassportNumber = !empty($data['id_passport_number']) ? trim($data['id_passport_number']) : null;
        $idPlaceOfIssue = !empty($data['id_place_of_issue']) ? trim($data['id_place_of_issue']) : null;
        
        $stmt = $this->db->prepare("
            INSERT INTO patients (
                patient_id, first_name, last_name, father_name, date_of_birth, 
                gender, marital_status, profession, phone, email, address, 
                country, nationality, city, id_number, id_mrz, id_passport_number, 
                id_place_of_issue, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $patientId,
            $firstName,
            $lastName,
            $fatherName,
            $data['date_of_birth'],
            $data['gender'],
            $maritalStatus,
            $profession,
            $phone,
            $email,
            $address,
            $country,
            $nationality,
            $city,
            $idNumber,
            $idMrz,
            $idPassportNumber,
            $idPlaceOfIssue,
        ]);
        
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        // Clean and trim data
        $firstName = trim($data['first_name']);
        $lastName = trim($data['last_name']);
        $fatherName = !empty($data['father_name']) ? trim($data['father_name']) : null;
        $phone = !empty($data['phone']) ? trim($data['phone']) : null;
        $email = !empty($data['email']) ? trim(strtolower($data['email'])) : null;
        $address = !empty($data['address']) ? trim($data['address']) : null;
        $idNumber = !empty($data['id_number']) ? trim($data['id_number']) : null;
        $maritalStatus = !empty($data['marital_status']) ? trim($data['marital_status']) : null;
        $profession = !empty($data['profession']) ? trim($data['profession']) : null;
        $country = !empty($data['country']) ? trim($data['country']) : null;
        $nationality = !empty($data['nationality']) ? trim($data['nationality']) : null;
        $city = !empty($data['city']) ? trim($data['city']) : null;
        $idMrz = !empty($data['id_mrz']) ? trim($data['id_mrz']) : null;
        $idPassportNumber = !empty($data['id_passport_number']) ? trim($data['id_passport_number']) : null;
        $idPlaceOfIssue = !empty($data['id_place_of_issue']) ? trim($data['id_place_of_issue']) : null;
        
        $stmt = $this->db->prepare("
            UPDATE patients SET
                first_name = ?, last_name = ?, father_name = ?, date_of_birth = ?,
                gender = ?, marital_status = ?, profession = ?, phone = ?, email = ?, address = ?, 
                country = ?, nationality = ?, city = ?, id_number = ?, id_mrz = ?, 
                id_passport_number = ?, id_place_of_issue = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $firstName,
            $lastName,
            $fatherName,
            $data['date_of_birth'],
            $data['gender'],
            $maritalStatus,
            $profession,
            $phone,
            $email,
            $address,
            $country,
            $nationality,
            $city,
            $idNumber,
            $idMrz,
            $idPassportNumber,
            $idPlaceOfIssue,
            $id,
        ]);
        
        return $stmt->rowCount() > 0;
    }

    public function updateDocument($id, $type, $filePath) {
        // type is either 'id_photo' or 'personal_photo'
        $stmt = $this->db->prepare("
            UPDATE patients SET
                {$type} = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([$filePath, $id]);
        
        return $stmt->rowCount() > 0;
    }

    public function deleteDocument($id, $type) {
        // Get current file path to delete it
        $patient = $this->findById($id);
        $filePath = $patient[$type] ?? null;
        
        // Clear the file path in database
        $stmt = $this->db->prepare("
            UPDATE patients SET
                {$type} = NULL, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([$id]);
        
        // Return file path for deletion
        return $filePath;
    }

    public function findAll() {
        $stmt = $this->db->query("
            SELECT id, patient_id, 
                   CONCAT(first_name, ' ', last_name) as full_name,
                   date_of_birth, gender, phone, email, created_at
            FROM patients
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("
            SELECT *, CONCAT(first_name, ' ', last_name) as full_name
            FROM patients WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function findByPatientId($patientId) {
        $stmt = $this->db->prepare("SELECT * FROM patients WHERE patient_id = ?");
        $stmt->execute([$patientId]);
        return $stmt->fetch();
    }

    public function findByIdNumber($idNumber) {
        $stmt = $this->db->prepare("SELECT * FROM patients WHERE id_number = ?");
        $stmt->execute([$idNumber]);
        return $stmt->fetch();
    }

    public function search($query) {
        $searchTerm = "%{$query}%";
        $stmt = $this->db->prepare("
            SELECT id, patient_id, 
                   CONCAT(
                       COALESCE(first_name, ''), ' ',
                       COALESCE(father_name, ''), ' ',
                       COALESCE(last_name, '')
                   ) as full_name,
                   first_name, last_name, father_name,
                   date_of_birth, gender, phone, email, created_at
            FROM patients
            WHERE first_name LIKE ? 
               OR last_name LIKE ? 
               OR father_name LIKE ?
               OR patient_id LIKE ?
               OR phone LIKE ?
               OR id_number LIKE ?
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        return $stmt->fetchAll();
    }

    private function generatePatientId() {
        do {
            $prefix = 'PAT';
            $random = strtoupper(substr(uniqid(), -6));
            $patientId = $prefix . $random;
        } while ($this->findByPatientId($patientId));
        
        return $patientId;
    }
}
