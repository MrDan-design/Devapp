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
        
        console.log('🔄 Mock Update - User ID:', userId, 'User Index:', userIndex);
        console.log('🔄 Mock Update - SQL:', sql);
        console.log('🔄 Mock Update - Params:', params);
        
        if (userIndex !== -1) {
          const user = data.users[userIndex];
          console.log('🔄 Mock Update - Before:', JSON.stringify(user, null, 2));
          
          // Parse the dynamic SQL - match field names with parameters
          const setClause = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setClause) {
            const fieldUpdates = setClause[1].split(',').map(s => s.trim());
            
            fieldUpdates.forEach((fieldUpdate, index) => {
              const fieldName = fieldUpdate.split('=')[0].trim();
              const paramValue = params[index];
              
              console.log(`🔄 Mock Update - Field: ${fieldName}, Value: ${paramValue}`);
              
              switch (fieldName) {
                case 'fullname':
                  user.fullname = paramValue;
                  break;
                case 'email':
                  user.email = paramValue;
                  break;
                case 'country':
                  user.country = paramValue;
                  break;
                case 'currency':
                  user.currency = paramValue;
                  break;
                case 'phone':
                  user.phone = paramValue;
                  break;
                case 'next_of_kin':
                  user.next_of_kin = paramValue;
                  break;
                case 'next_of_kin_phone':
                  user.next_of_kin_phone = paramValue;
                  break;
                case 'profile_image':
                  user.profile_image = paramValue;
                  break;
                case 'password':
                  user.password = paramValue;
                  break;
              }
            });
          }
          
          console.log('🔄 Mock Update - After:', JSON.stringify(user, null, 2));
          writeData(data);
          return [{ affectedRows: 1 }];
        } else {
          console.log('❌ Mock Update - User not found');
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
