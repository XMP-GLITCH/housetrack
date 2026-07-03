const { Op } = require('sequelize');
const { Property, Room, Tenant, Payment, Complaint, User, sequelize } = require('../models');

const getLandlordSummary = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalProperties = await Property.count({ where: { landlord_id: landlordId } });
    const totalRooms = await Room.count({ 
      include: [{ model: Property, where: { landlord_id: landlordId } }] 
    });
    
    const occupiedRooms = await Room.count({ 
      where: { status: 'occupied' },
      include: [{ model: Property, where: { landlord_id: landlordId } }] 
    });

    const availableRooms = await Room.count({ 
      where: { status: 'available' },
      include: [{ model: Property, where: { landlord_id: landlordId } }] 
    });

    const paidTenantsCount = await Payment.count({
      where: { 
        landlord_id: landlordId, 
        rent_month: currentMonthStr,
        payment_status: 'paid'
      }
    });

    const unpaidTenantsCount = await Payment.count({
      where: { 
        landlord_id: landlordId, 
        rent_month: currentMonthStr,
        payment_status: 'unpaid'
      }
    });

    const pendingComplaints = await Complaint.count({
      where: { landlord_id: landlordId, status: 'pending' }
    });

    const currentMonthPayments = await Payment.findAll({
      where: { landlord_id: landlordId, rent_month: currentMonthStr },
      attributes: [
        [sequelize.fn('sum', sequelize.col('amount_paid')), 'total_income']
      ]
    });

    const monthlyIncome = currentMonthPayments[0]?.dataValues?.total_income || 0;

    const overdueCount = await Payment.count({
      where: {
        landlord_id: landlordId,
        rent_month: { [Op.lt]: currentMonthStr },
        payment_status: { [Op.not]: 'paid' },
      }
    });

    res.json({
      success: true,
      data: {
        totalProperties,
        totalRooms,
        occupiedRooms,
        availableRooms,
        paidTenants: paidTenantsCount,
        unpaidTenants: unpaidTenantsCount,
        overduePayments: overdueCount,
        pendingComplaints,
        monthlyIncome
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch landlord summary' });
  }
};

const getAdminSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [
      totalLandlords,
      activeLandlords,
      suspendedLandlords,
      totalProperties,
      totalRooms,
      occupiedRooms,
      totalTenants,
      activeTenants,
      recentUsers,
      currentMonthPayments,
    ] = await Promise.all([
      User.count({ where: { role: 'landlord' } }),
      User.count({ where: { role: 'landlord', status: 'active' } }),
      User.count({ where: { role: 'landlord', status: 'inactive' } }),
      Property.count(),
      Room.count(),
      Room.count({ where: { status: 'occupied' } }),
      Tenant.count({ where: { status: 'active' } }),
      Tenant.count({ where: { status: 'active' } }),
      User.findAll({
        where: { role: { [Op.ne]: 'admin' } },
        attributes: { exclude: ['supabase_uid'] },
        order: [['created_at', 'DESC']],
        limit: 6,
      }),
      Payment.findAll({
        where: { rent_month: currentMonthStr },
        attributes: [
          [sequelize.fn('sum', sequelize.col('amount_paid')), 'total_income'],
          [sequelize.fn('count', sequelize.col('id')), 'total_payments'],
        ],
      }),
    ]);

    const totalIncome = currentMonthPayments[0]?.dataValues?.total_income || 0;
    const totalPaymentsCount = currentMonthPayments[0]?.dataValues?.total_payments || 0;

    res.json({
      success: true,
      data: {
        totalLandlords,
        activeLandlords,
        suspendedLandlords,
        totalProperties,
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        totalTenants,
        activeTenants,
        totalPaymentsThisMonth: totalPaymentsCount,
        totalPlatformIncomeThisMonth: totalIncome,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin summary' });
  }
};

// other reports logic can be added here (payments report, rooms report, income report)

module.exports = {
  getLandlordSummary,
  getAdminSummary
};
