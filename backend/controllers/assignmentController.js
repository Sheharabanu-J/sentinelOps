const prisma = require('../config/prisma');

exports.createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, personnelName } = req.body;
    const userId = req.user.id;

    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.assignments.create({
        data: {
          base_id: parseInt(baseId),
          equipment_type_id: parseInt(equipmentTypeId),
          quantity: parseInt(quantity),
          personnel_name: personnelName,
          initiated_by: userId
        }
      });

      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action: 'ASSIGNMENT',
          details: `Assigned ${quantity} items (Type: ${equipmentTypeId}) to ${personnelName} at Base #${baseId}`
        }
      });
      
      return newAssignment;
    });

    res.status(201).json({ message: "Assignment created successfully", assignmentId: assignment.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Assignment failed: " + error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : undefined;
    
    const assignments = await prisma.assignments.findMany({
      where: baseId ? { base_id: baseId } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        bases: true,
        equipment_types: true
      }
    });
    
    const mapped = assignments.map(a => ({
      id: a.id,
      quantity: a.quantity,
      personnel_name: a.personnel_name,
      status: a.status,
      created_at: a.created_at,
      base_name: a.bases?.name,
      equipment_name: a.equipment_types?.name
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving assignments' });
  }
};
