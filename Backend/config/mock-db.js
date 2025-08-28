// Mock database for development when MySQL is not available
const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'mock-data.json');

// Initialize mock data structure
const initData = {
  users: [
    {
      id: 1,
      email: 'admin@devapp.com',
      fullname: 'Admin User',
      password: '$2a$10$rWJcOJk7ZvMz6LrPIZHnSuCmxvtCT.TBOQFoGcZBOy5dkO9xQHE5W', // hashed 'admin123'
      balance: 1000,
      is_admin: true,
      country: 'USA',
      currency: 'USD',
      phone: '',
      next_of_kin: '',
      next_of_kin_phone: '',
      profile_image: null,
      subscription_plan_id: null
    }
  ],
  investments: [],
  subscription_plans: [
    { id: 1, name: 'Free' },
    { id: 2, name: 'Basic' },
    { id: 3, name: 'Premium' }
  ]
};

// Read data from file
const readData = () => {
  try {
    if (fs.existsSync(dbFile)) {
      return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    } else {
      writeData(initData);
      return initData;
    }
  } catch (error) {
    console.error('Error reading mock data:', error);
    return initData;
  }
};

// Write data to file
const writeData = (data) => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing mock data:', error);
  }
};

// Mock query function that mimics MySQL query format
const mockQuery = async (sql, params = []) => {
  console.log('🔄 Mock Query:', sql);
  console.log('🔄 Mock Params:', params);
  
  const data = readData();
  
  try {
    // Parse different SQL operations
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('select')) {
      // Handle SELECT queries
      if (sqlLower.includes('from users')) {
        if (sqlLower.includes('where email = ?')) {
          const email = params[0];
          const user = data.users.find(u => u.email === email);
          return [user ? [user] : []];
        } else if (sqlLower.includes('where id = ?')) {
          const id = parseInt(params[0]);
          const user = data.users.find(u => u.id === id);
          return [user ? [user] : []];
        } else if (sqlLower.includes('count(*)')) {
          return [[{ count: data.users.length }]];
        }
      } else if (sqlLower.includes('from investments')) {
        const userId = params[0];
        const investments = data.investments.filter(inv => inv.user_id === parseInt(userId));
        return [investments];
      } else if (sqlLower.includes('from subscription_plans')) {
        const planId = params[0];
        const plan = data.subscription_plans.find(p => p.id === parseInt(planId));
        return [plan ? [plan] : []];
      }
      return [[]];
    } else if (sqlLower.startsWith('insert')) {
      // Handle INSERT queries
      if (sqlLower.includes('into users')) {
        const newUser = {
          id: Math.max(...data.users.map(u => u.id), 0) + 1,
          fullname: params[0],
          email: params[1],
          password: params[2],
          country: params[3],
          currency: params[4] || 'USD',
          next_of_kin: params[5],
          next_of_kin_number: params[6],
          balance: 0,
          is_admin: false,
          phone: '',
          next_of_kin_phone: '',
          profile_image: null,
          subscription_plan_id: null
        };
        data.users.push(newUser);
        writeData(data);
        return [{ insertId: newUser.id }];
      }
    } else if (sqlLower.startsWith('update')) {
      // Handle UPDATE queries
      if (sqlLower.includes('users set')) {
        const userId = params[params.length - 1]; // Last parameter is usually the ID
        const userIndex = data.users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex !== -1) {
          // Parse the update fields from SQL and parameters
          if (params.length >= 2) {
            const user = data.users[userIndex];
            
            // Map common update patterns
            if (sqlLower.includes('fullname')) user.fullname = params[0];
            if (sqlLower.includes('email')) user.email = params[1] || params[0];
            if (sqlLower.includes('country')) {
              const countryIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('country'));
              if (countryIndex >= 0) user.country = params[countryIndex];
            }
            if (sqlLower.includes('currency')) {
              const currencyIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('currency'));
              if (currencyIndex >= 0) user.currency = params[currencyIndex];
            }
            if (sqlLower.includes('phone')) {
              const phoneIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('phone'));
              if (phoneIndex >= 0) user.phone = params[phoneIndex];
            }
            if (sqlLower.includes('next_of_kin')) {
              const kinIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('next_of_kin') && !sqlLower.split('?')[i]?.includes('phone'));
              if (kinIndex >= 0) user.next_of_kin = params[kinIndex];
            }
            if (sqlLower.includes('next_of_kin_phone')) {
              const kinPhoneIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('next_of_kin_phone'));
              if (kinPhoneIndex >= 0) user.next_of_kin_phone = params[kinPhoneIndex];
            }
            if (sqlLower.includes('profile_image')) {
              const imgIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('profile_image'));
              if (imgIndex >= 0) user.profile_image = params[imgIndex];
            }
            if (sqlLower.includes('password')) {
              const passIndex = params.findIndex((_, i) => sqlLower.split('?')[i]?.includes('password'));
              if (passIndex >= 0) user.password = params[passIndex];
            }
            
            writeData(data);
          }
          return [{ affectedRows: 1 }];
        }
      }
      return [{ affectedRows: 0 }];
    }
    
    return [[]];
  } catch (error) {
    console.error('Mock query error:', error);
    throw error;
  }
};

module.exports = {
  query: mockQuery,
  rawConnection: null
};
