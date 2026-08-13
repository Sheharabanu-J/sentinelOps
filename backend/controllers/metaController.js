const prisma = require('../config/prisma');

exports.getBases = async (req, res) => {
  try {
    const bases = await prisma.bases.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(bases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving bases' });
  }
};

exports.getEquipmentTypes = async (req, res) => {
  try {
    const equipment = await prisma.equipment_types.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving equipment types' });
  }
};
