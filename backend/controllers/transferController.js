const prisma = require('../config/prisma');

exports.createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (sourceBaseId === destinationBaseId) {
      return res.status(400).json({ error: "Source and destination base cannot be the same" });
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const newTransfer = await tx.transfers.create({
        data: {
          source_base_id: sourceBaseId,
          destination_base_id: destinationBaseId,
          equipment_type_id: equipmentTypeId,
          quantity: quantity,
          initiated_by: userId
        }
      });

      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action: 'TRANSFER',
          details: `Transferred ${quantity} items (Type: ${equipmentTypeId}) from Base #${sourceBaseId} to Base #${destinationBaseId}`
        }
      });
      
      return newTransfer;
    });

    res.status(201).json({ message: "Transfer completed successfully", transferId: transfer.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Transfer failed: " + error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : undefined;
    
    const transfers = await prisma.transfers.findMany({
      where: baseId ? {
        OR: [
          { source_base_id: baseId },
          { destination_base_id: baseId }
        ]
      } : undefined,
      orderBy: { timestamp: 'desc' },
      include: {
        bases_transfers_source_base_idTobases: true,
        bases_transfers_destination_base_idTobases: true,
        equipment_types: true
      }
    });
    
    const mapped = transfers.map(t => ({
      id: t.id,
      quantity: t.quantity,
      status: t.status,
      timestamp: t.timestamp,
      source_base: t.bases_transfers_source_base_idTobases?.name,
      dest_base: t.bases_transfers_destination_base_idTobases?.name,
      equipment_name: t.equipment_types?.name
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving transfers' });
  }
};
