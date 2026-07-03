const { sequelize } = require('../config/database');

const User = require('./User');
const Property = require('./Property');
const Room = require('./Room');
const Tenant = require('./Tenant');
const Payment = require('./Payment');
const Receipt = require('./Receipt');
const Complaint = require('./Complaint');

// Define associations
User.hasMany(Property, { foreignKey: 'landlord_id' });
Property.belongsTo(User, { foreignKey: 'landlord_id' });

Property.hasMany(Room, { foreignKey: 'property_id' });
Room.belongsTo(Property, { foreignKey: 'property_id' });

User.hasMany(Tenant, { foreignKey: 'landlord_id', as: 'LandlordTenants' });
Tenant.belongsTo(User, { foreignKey: 'landlord_id', as: 'Landlord' });

User.hasOne(Tenant, { foreignKey: 'user_id', as: 'TenantProfile' });
Tenant.belongsTo(User, { foreignKey: 'user_id', as: 'UserAccount' });

Room.hasMany(Tenant, { foreignKey: 'room_id' });
Tenant.belongsTo(Room, { foreignKey: 'room_id' });

Tenant.hasMany(Payment, { foreignKey: 'tenant_id' });
Payment.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Room.hasMany(Payment, { foreignKey: 'room_id' });
Payment.belongsTo(Room, { foreignKey: 'room_id' });

User.hasMany(Payment, { foreignKey: 'landlord_id' });
Payment.belongsTo(User, { foreignKey: 'landlord_id' });

Payment.hasOne(Receipt, { foreignKey: 'payment_id' });
Receipt.belongsTo(Payment, { foreignKey: 'payment_id' });

Tenant.hasMany(Complaint, { foreignKey: 'tenant_id' });
Complaint.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Room.hasMany(Complaint, { foreignKey: 'room_id' });
Complaint.belongsTo(Room, { foreignKey: 'room_id' });

User.hasMany(Complaint, { foreignKey: 'landlord_id' });
Complaint.belongsTo(User, { foreignKey: 'landlord_id' });

module.exports = {
  sequelize,
  User,
  Property,
  Room,
  Tenant,
  Payment,
  Receipt,
  Complaint,
};
