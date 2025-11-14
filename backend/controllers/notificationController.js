import NotificationLog from '../models/NotificationLog.js';

// Obtener historial de notificaciones
export const getNotificationLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (customerId) {
      query.customer = customerId;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      NotificationLog.find(query)
        .populate('customer', 'name whatsappNumber')
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      NotificationLog.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs de notificaciones',
      error: error.message
    });
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (req, res) => {
  try {
    const stats = await NotificationLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentCount = await NotificationLog.countDocuments({
      sentAt: { $gte: last7Days }
    });
    
    res.json({
      success: true,
      data: {
        byStatus: stats,
        last7Days: recentCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};
