const prisma = require('../config/prisma');

exports.createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const userId = req.user.id;

    const expenditure = await prisma.$transaction(async (tx) => {
      const newExp = await tx.expenditures.create({
        data: {
          base_id: parseInt(baseId),
          equipment_type_id: parseInt(equipmentTypeId),
          quantity: parseInt(quantity),
          reason: reason,
          initiated_by: userId
        }
      });

      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action: 'EXPENDITURE',
          details: `Expended ${quantity} items (Type: ${equipmentTypeId}) at Base #${baseId} for reason: ${reason}`
        }
      });
      
      return newExp;
    });

    res.status(201).json({ message: "Expenditure logged successfully", expenditureId: expenditure.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Expenditure failed: " + error.message });
  }
};

exports.getExpenditures = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : undefined;
    
    const expenditures = await prisma.expenditures.findMany({
      where: baseId ? { base_id: baseId } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        bases: true,
        equipment_types: true
      }
    });
    
    const mapped = expenditures.map(e => ({
      id: e.id,
      quantity: e.quantity,
      reason: e.reason,
      status: e.status,
      created_at: e.created_at,
      base_name: e.bases?.name,
      equipment_name: e.equipment_types?.name
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving expenditures' });
  }
};
