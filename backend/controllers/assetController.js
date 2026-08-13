const prisma = require('../config/prisma');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
    const equipmentTypeId = req.query.equipmentTypeId ? parseInt(req.query.equipmentTypeId) : null;
    const startDate = req.query.startDate ? req.query.startDate : null;

    const query = `
      WITH purchase_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_purchases
        FROM purchases
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3)
      ),
      transfer_in_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_in
        FROM transfers
        WHERE ($1::int IS NULL OR destination_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
      ),
      transfer_out_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_out
        FROM transfers
        WHERE ($1::int IS NULL OR source_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
      ),
      assignments_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_assigned
        FROM assignments
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'ACTIVE'
      ),
      expenditures_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_expended
        FROM expenditures
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
      )
      SELECT
        p.total_purchases AS purchases,
        ti.total_transfer_in AS transfers_in,
        to_sum.total_transfer_out AS transfers_out,
        (p.total_purchases + ti.total_transfer_in - to_sum.total_transfer_out) AS net_movement,
        a.total_assigned AS assigned,
        e.total_expended AS expended,
        (p.total_purchases + ti.total_transfer_in - to_sum.total_transfer_out - a.total_assigned - e.total_expended) AS closing_balance
      FROM purchase_summary p, transfer_in_summary ti, transfer_out_summary to_sum, assignments_summary a, expenditures_summary e;
    `;

    const result = await prisma.$queryRawUnsafe(query, baseId, equipmentTypeId, startDate);
    const data = result[0];
    
    const metrics = {
      openingBalance: 0,
      purchases: Number(data.purchases || 0),
      transfersIn: Number(data.transfers_in || 0),
      transfersOut: Number(data.transfers_out || 0),
      netMovement: Number(data.net_movement || 0),
      assigned: Number(data.assigned || 0),
      expended: Number(data.expended || 0),
      closingBalance: Number(data.closing_balance || 0)
    };

    // Inventory Distribution by Equipment Type
    const invByEq = await prisma.$queryRawUnsafe(`
      SELECT e.name, 
             COALESCE(SUM(p.quantity), 0) + 
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE destination_base_id = $1 OR $1::int IS NULL AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE source_base_id = $1 OR $1::int IS NULL AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM expenditures WHERE base_id = $1 OR $1::int IS NULL AND equipment_type_id = e.id), 0) -
             COALESCE((SELECT SUM(quantity) FROM assignments WHERE base_id = $1 OR $1::int IS NULL AND equipment_type_id = e.id AND status = 'ACTIVE'), 0) AS value
      FROM equipment_types e
      LEFT JOIN purchases p ON p.equipment_type_id = e.id AND (p.base_id = $1 OR $1::int IS NULL)
      GROUP BY e.id, e.name
    `, baseId);
    
    const chartData = {
      inventoryData: invByEq.map(i => ({ name: i.name, value: Number(i.value || 0) })).filter(i => i.value > 0),
      movementData: [
        { name: 'Last Week', in: 120, out: 80 },
        { name: 'This Week', in: Number(data.purchases || 0) + Number(data.transfers_in || 0), out: Number(data.transfers_out || 0) }
      ],
      baseComparisonData: []
    };

    if (!baseId) {
      const bases = await prisma.bases.findMany();
      chartData.baseComparisonData = bases.map(b => ({
        name: b.name,
        stock: 1000 // simplified for now, would need full calculation per base
      }));
    }

    res.json({ metrics, chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving metrics' });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
    
    // Group everything by base and equipment
    const query = `
      SELECT b.id as base_id, b.name as base_name, e.id as equipment_type_id, e.name as equipment_name, e.category,
             COALESCE(SUM(p.quantity), 0) + 
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE destination_base_id = b.id AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE source_base_id = b.id AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM expenditures WHERE base_id = b.id AND equipment_type_id = e.id), 0) -
             COALESCE((SELECT SUM(quantity) FROM assignments WHERE base_id = b.id AND equipment_type_id = e.id AND status = 'ACTIVE'), 0) AS current_stock
      FROM bases b
      CROSS JOIN equipment_types e
      LEFT JOIN purchases p ON p.equipment_type_id = e.id AND p.base_id = b.id
      WHERE ($1::int IS NULL OR b.id = $1)
      GROUP BY b.id, e.id
      HAVING (
             COALESCE(SUM(p.quantity), 0) + 
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE destination_base_id = b.id AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM transfers WHERE source_base_id = b.id AND equipment_type_id = e.id AND status = 'COMPLETED'), 0) -
             COALESCE((SELECT SUM(quantity) FROM expenditures WHERE base_id = b.id AND equipment_type_id = e.id), 0) -
             COALESCE((SELECT SUM(quantity) FROM assignments WHERE base_id = b.id AND equipment_type_id = e.id AND status = 'ACTIVE'), 0)
      ) > 0
      ORDER BY b.name, e.name
    `;

    const result = await prisma.$queryRawUnsafe(query, baseId);
    
    const assets = result.map((r, i) => ({
      id: `AST-${r.base_id}-${r.equipment_type_id}`,
      base_name: r.base_name,
      equipment_name: r.equipment_name,
      category: r.category,
      quantity: Number(r.current_stock || 0)
    }));

    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving assets' });
  }
};
