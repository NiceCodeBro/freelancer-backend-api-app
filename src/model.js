const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3'
});

const contractStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  TERMINATED: 'terminated'
}

class Profile extends Sequelize.Model {}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM(contractStatus.NEW, contractStatus.IN_PROGRESS, contractStatus.TERMINATED)
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price:{
      type: Sequelize.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default:false
    },
    paymentDate:{
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

const profileFKs = {
  CONTRACTOR: 'ContractorId',
  CLIENT: 'ClientId'
}

const profileTypes = {
  CONTRACTOR: 'Contractor',
  CLIENT: 'Client'
}

Profile.hasMany(Contract, {as : profileTypes.CONTRACTOR, foreignKey: profileFKs.CONTRACTOR})
Contract.belongsTo(Profile, {as: profileTypes.CONTRACTOR})
Profile.hasMany(Contract, {as : profileTypes.CLIENT, foreignKey: profileFKs.CLIENT})
Contract.belongsTo(Profile, {as: profileTypes.CLIENT})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
  profileFKs,
  profileTypes,
  contractStatus
};
