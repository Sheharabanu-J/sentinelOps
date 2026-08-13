const prisma = require('../config/prisma');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.audit_logs.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        users: true
      },
      take: 100 // pagination could be implemented here
    });
    
    const mapped = logs.map(l => ({
      id: l.id,
      action: l.action,
      details: l.details,
      created_at: l.created_at,
      username: l.users?.username,
      role: l.users?.role
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving audit logs' });
  }
};
