const prisma = require('../config/prisma');

exports.createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchases.create({
        data: {
          base_id: baseId,
          equipment_type_id: equipmentTypeId,
          quantity: quantity,
        }
      });

      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action: 'PURCHASE',
          details: `Purchased ${quantity} items (Type: ${equipmentTypeId}) for Base #${baseId}`
        }
      });
      
      return newPurchase;
    });

    res.status(201).json({ message: "Purchase logged successfully", purchaseId: purchase.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Purchase failed: " + error.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : undefined;
    
    const purchases = await prisma.purchases.findMany({
      where: baseId ? { base_id: baseId } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        bases: true,
        equipment_types: true
      }
    });
    
    // Map to the flat structure expected by frontend
    const mapped = purchases.map(p => ({
      id: p.id,
      quantity: p.quantity,
      created_at: p.created_at,
      base_name: p.bases?.name,
      equipment_name: p.equipment_types?.name
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving purchases' });
  }
};
