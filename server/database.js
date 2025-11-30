const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL from environment variable
const DATABASE_URL = process.env.DATABASE || 'mongodb+srv://bethebayou:DtIBXlaiOWG8sX26@cluster0.z28u54q.mongodb.net/FinTrack?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'FinTrack';

let client = null;
let db = null;

// Collections
let usersCollection = null;
let profilesCollection = null;
let transactionsCollection = null;
let activitiesCollection = null;

// Initialize MongoDB connection
const connectDB = async () => {
    try {
        if (!client) {
            client = new MongoClient(DATABASE_URL);
            await client.connect();
            console.log('✅ Connected to MongoDB');
        }
        
        if (!db) {
            db = client.db(DATABASE_NAME);
            
            // Get collections
            usersCollection = db.collection('users');
            profilesCollection = db.collection('profiles');
            transactionsCollection = db.collection('transactions');
            activitiesCollection = db.collection('activities');
            
            // Create indexes
            await createIndexes();
            
            console.log('Database initialized successfully');
        }
        
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Create indexes for better performance
const createIndexes = async () => {
    try {
        // Users indexes
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ role: 1 });
        
        // Profiles indexes
        await profilesCollection.createIndex({ user_id: 1 }, { unique: true });
        
        // Transactions indexes
        await transactionsCollection.createIndex({ user_id: 1 });
        await transactionsCollection.createIndex({ created_at: -1 });
        
        // Activities indexes
        await activitiesCollection.createIndex({ user_id: 1 });
        await activitiesCollection.createIndex({ created_at: -1 });
        
        console.log('✅ Database indexes created');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

// Helper function to convert callback to async/await pattern
const callbackWrapper = (asyncFn, callback) => {
    asyncFn().then(result => {
        callback(null, result);
    }).catch(err => {
        callback(err, null);
        });
    };
    
// Initialize connection on module load
connectDB().then(() => {
    // Create default admin user if credentials are provided
        createDefaultAdmin();
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// User operations
const createUser = (email, passwordHash, role, callback) => {
    const userRole = role || 'user';
    const user = {
        email,
        password_hash: passwordHash,
        role: userRole,
        created_at: new Date()
    };
    
    callbackWrapper(async () => {
        await connectDB();
        const result = await usersCollection.insertOne(user);
        return {
            id: result.insertedId.toString(),
            email,
            role: userRole
        };
    }, callback);
};

const getUserByEmail = (email, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        const user = await usersCollection.findOne({ email });
        if (user) {
            return {
                id: user._id.toString(),
                email: user.email,
                password_hash: user.password_hash,
                role: user.role || 'user',
                created_at: user.created_at
            };
        }
        return null;
    }, callback);
};

const getUserById = (id, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const user = await usersCollection.findOne({ _id: new ObjectId(id) });
            if (user) {
                return {
                    id: user._id.toString(),
                    email: user.email,
                    created_at: user.created_at
                };
            }
            return null;
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return null;
            }
            throw error;
        }
    }, callback);
};

// Helper function to get user role by ID (for admin middleware)
const getUserRoleById = (id, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const user = await usersCollection.findOne(
                { _id: new ObjectId(id) },
                { projection: { role: 1 } }
            );
            if (user) {
                return {
                    role: user.role || 'user'
                };
            }
            return null;
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return null;
            }
            throw error;
        }
    }, callback);
};

// Profile operations
const createOrUpdateProfile = (userId, profileData, callback) => {
    const { name, phone_number, account_number } = profileData;

    callbackWrapper(async () => {
        await connectDB();
        try {
            const userIdObj = new ObjectId(userId);
            const profile = {
                user_id: userIdObj,
                name,
                phone_number: phone_number || null,
                account_number: account_number || null,
                created_at: new Date()
            };
            
            const existingProfile = await profilesCollection.findOne({ user_id: userIdObj });
            
            if (existingProfile) {
            // Update existing profile
                await profilesCollection.updateOne(
                    { user_id: userIdObj },
                    {
                        $set: {
                            name,
                            phone_number: phone_number || null,
                            account_number: account_number || null
                        }
                    }
            );
        } else {
            // Create new profile
                await profilesCollection.insertOne(profile);
            }
            return {};
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                throw new Error('Invalid user ID');
            }
            throw error;
        }
    }, callback);
};

const getProfile = (userId, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const profile = await profilesCollection.findOne({ user_id: new ObjectId(userId) });
            if (profile) {
                return {
                    id: profile._id.toString(),
                    user_id: profile.user_id.toString(),
                    name: profile.name,
                    phone_number: profile.phone_number,
                    account_number: profile.account_number,
                    created_at: profile.created_at
                };
            }
            return null;
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return null;
            }
            throw error;
        }
    }, callback);
};

// Transaction operations
const createTransaction = (userId, transaction, callback) => {
    const {
        type,
        amount,
        balance,
        from_person,
        description,
        transaction_date,
        transaction_time,
        ref_no,
        sms_content
    } = transaction;

    callbackWrapper(async () => {
        await connectDB();
        try {
            const transactionDoc = {
                user_id: new ObjectId(userId),
                type,
                amount: parseFloat(amount),
                balance: balance ? parseFloat(balance) : null,
                from_person: from_person || null,
                description,
                transaction_date: transaction_date || null,
                transaction_time: transaction_time || null,
                ref_no: ref_no || null,
                sms_content: sms_content || null,
                created_at: new Date()
            };
            
            const result = await transactionsCollection.insertOne(transactionDoc);
            return { insertedId: result.insertedId.toString() };
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                throw new Error('Invalid user ID');
            }
            throw error;
        }
    }, callback);
};

const createMultipleTransactions = (userId, transactions, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const userIdObj = new ObjectId(userId);
            const errors = [];
            
            const transactionDocs = transactions.map((transaction, index) => {
                try {
                    return {
                        user_id: userIdObj,
                        type: transaction.type,
                        amount: parseFloat(transaction.amount),
                        balance: transaction.balance ? parseFloat(transaction.balance) : null,
                        from_person: transaction.from_person || null,
                        description: transaction.description,
                        transaction_date: transaction.transaction_date || null,
                        transaction_time: transaction.transaction_time || null,
                        ref_no: transaction.ref_no || null,
                        sms_content: transaction.sms_content || null,
                        created_at: new Date()
                    };
                } catch (err) {
                        errors.push({ index, error: err.message });
                    return null;
                }
            }).filter(doc => doc !== null);
            
            if (transactionDocs.length === 0) {
                return errors.length > 0 ? errors : { inserted: 0 };
            }
            
            const result = await transactionsCollection.insertMany(transactionDocs, { ordered: false });
            
            return errors.length > 0 ? errors : { inserted: result.insertedCount };
        } catch (error) {
            if (error.message && error.writeErrors) {
                // Handle bulk write errors
                const writeErrors = error.writeErrors || [];
                return writeErrors.map((err, idx) => ({
                    index: err.index,
                    error: err.errmsg
                }));
            }
            if (error.message.includes('invalid ObjectId')) {
                throw new Error('Invalid user ID');
            }
            throw error;
        }
    }, callback);
};

const getAllTransactions = (userId, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const transactions = await transactionsCollection
                .find({ user_id: new ObjectId(userId) })
                .sort({ created_at: -1 })
                .toArray();
            
            return transactions.map(t => ({
                id: t._id.toString(),
                user_id: t.user_id.toString(),
                type: t.type,
                amount: t.amount,
                balance: t.balance,
                from_person: t.from_person,
                description: t.description,
                transaction_date: t.transaction_date,
                transaction_time: t.transaction_time,
                ref_no: t.ref_no,
                sms_content: t.sms_content,
                created_at: t.created_at
            }));
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return [];
            }
            throw error;
        }
    }, callback);
};

const getAllTransactionsAdmin = (callback) => {
    callbackWrapper(async () => {
        await connectDB();
        const transactions = await transactionsCollection
            .aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: { created_at: -1 }
                },
                {
                    $project: {
                        id: { $toString: '$_id' },
                        user_id: { $toString: '$user_id' },
                        user_email: '$user.email',
                        type: 1,
                        amount: 1,
                        balance: 1,
                        from_person: 1,
                        description: 1,
                        transaction_date: 1,
                        transaction_time: 1,
                        ref_no: 1,
                        sms_content: 1,
                        created_at: 1
                    }
                }
            ])
            .toArray();
        
        return transactions.map(t => ({
            ...t,
            _id: undefined // Remove MongoDB _id from projection
        }));
    }, callback);
};

const getTransactionStats = (userId, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const stats = await transactionsCollection
                .aggregate([
                    {
                        $match: { user_id: new ObjectId(userId) }
                    },
                    {
                        $group: {
                            _id: '$type',
                            count: { $sum: 1 },
                            total: { $sum: '$amount' },
                            average: { $avg: '$amount' }
                        }
                    }
                ])
                .toArray();
            
            return stats.map(stat => ({
                type: stat._id,
                count: stat.count,
                total: stat.total || 0,
                average: stat.average || 0
            }));
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return [];
            }
            throw error;
        }
    }, callback);
};

const deleteTransaction = (userId, id, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const result = await transactionsCollection.deleteOne({
                _id: new ObjectId(id),
                user_id: new ObjectId(userId)
            });
            return { deletedCount: result.deletedCount };
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return { deletedCount: 0 };
            }
            throw error;
        }
    }, callback);
};

const deleteAllTransactions = (userId, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const result = await transactionsCollection.deleteMany({
                user_id: new ObjectId(userId)
            });
            return { deletedCount: result.deletedCount };
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                return { deletedCount: 0 };
            }
            throw error;
        }
    }, callback);
};

// Admin operations
const getAllUsers = (callback) => {
    callbackWrapper(async () => {
        await connectDB();
        const users = await usersCollection
            .aggregate([
                {
                    $lookup: {
                        from: 'profiles',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'profile'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'transactions'
                    }
                },
                {
                    $unwind: {
                        path: '$profile',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        id: { $toString: '$_id' },
                        email: 1,
                        role: { $ifNull: ['$role', 'user'] },
                        created_at: 1,
                        name: '$profile.name',
                        phone_number: '$profile.phone_number',
                        account_number: '$profile.account_number',
                        transaction_count: { $size: '$transactions' }
                    }
                },
                {
                    $sort: { created_at: -1 }
                }
            ])
            .toArray();
        
        return users;
    }, callback);
};

const updateUserRole = (userId, role, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { role } }
            );
            return { modifiedCount: result.modifiedCount };
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                throw new Error('Invalid user ID');
            }
            throw error;
        }
    }, callback);
};

const deleteUser = (userId, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const userIdObj = new ObjectId(userId);
            
            // Delete user and related data (cascade)
            await Promise.all([
                usersCollection.deleteOne({ _id: userIdObj }),
                profilesCollection.deleteOne({ user_id: userIdObj }),
                transactionsCollection.deleteMany({ user_id: userIdObj }),
                activitiesCollection.updateMany(
                    { user_id: userIdObj },
                    { $set: { user_id: null } }
                )
            ]);
            
            return { deleted: true };
        } catch (error) {
            if (error.message.includes('invalid ObjectId')) {
                throw new Error('Invalid user ID');
            }
            throw error;
        }
    }, callback);
};

// Major activities that should be tracked in admin dashboard
const MAJOR_ACTIVITIES = [
    'REGISTER',
    'DELETE_USER',
    'UPDATE_USER_ROLE',
    'DELETE_ALL_TRANSACTIONS',
    'DELETE_TRANSACTION'
];

// Activity logging operations
const logActivity = (activity, callback) => {
    const { user_id, action, entity_type, entity_id, details, ip_address, user_agent } = activity;
    
    callbackWrapper(async () => {
        await connectDB();
        try {
            const activityDoc = {
                user_id: user_id ? new ObjectId(user_id) : null,
                action,
                entity_type: entity_type || null,
                entity_id: entity_id ? (typeof entity_id === 'string' && ObjectId.isValid(entity_id) ? new ObjectId(entity_id) : entity_id) : null,
                details: typeof details === 'string' ? details : (details ? JSON.stringify(details) : null),
                ip_address: ip_address || null,
                user_agent: user_agent || null,
                created_at: new Date()
            };
            
            const result = await activitiesCollection.insertOne(activityDoc);
            return { id: result.insertedId.toString() };
        } catch (error) {
            // Don't fail if activity logging fails
            console.error('Error logging activity:', error);
            return { id: null };
        }
    }, callback);
};

const getActivities = (filters, callback) => {
    callbackWrapper(async () => {
        await connectDB();
        try {
            const query = {};

            // Filter to only show major activities
            query.action = { $in: MAJOR_ACTIVITIES };

            if (filters.user_id) {
                query.user_id = new ObjectId(filters.user_id);
            }

            if (filters.action) {
                // If specific action is requested, ensure it's a major activity
                if (MAJOR_ACTIVITIES.includes(filters.action)) {
                    query.action = filters.action;
                } else {
                    // Return empty if non-major activity is requested
                    return [];
                }
            }

            if (filters.start_date || filters.end_date) {
                query.created_at = {};
                if (filters.start_date) {
                    query.created_at.$gte = new Date(filters.start_date);
                }
                if (filters.end_date) {
                    query.created_at.$lte = new Date(filters.end_date);
                }
            }
            
            const activities = await activitiesCollection
                .aggregate([
                    { $match: query },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            id: { $toString: '$_id' },
                            user_id: { $cond: [{ $ne: ['$user_id', null] }, { $toString: '$user_id' }, null] },
                            user_email: '$user.email',
                            action: 1,
                            entity_type: 1,
                            entity_id: { $cond: [{ $ne: ['$entity_id', null] }, { $toString: '$entity_id' }, null] },
                            details: 1,
                            ip_address: 1,
                            user_agent: 1,
                            created_at: 1
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    },
                    {
                        $limit: filters.limit || 100
                    },
                    {
                        $skip: filters.offset || 0
                    }
                ])
                .toArray();
            
            return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }, callback);
};

const getActivityStats = (callback) => {
    callbackWrapper(async () => {
        await connectDB();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const stats = await activitiesCollection
            .aggregate([
                {
                    $match: {
                        created_at: { $gte: thirtyDaysAgo },
                        action: { $in: MAJOR_ACTIVITIES }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$created_at'
                            }
                        },
                        count: { $sum: 1 },
                        unique_users: { $addToSet: '$user_id' }
                    }
                },
                {
                    $project: {
                        date: '$_id',
                        count: 1,
                        unique_users: { $size: '$unique_users' }
                    }
                },
                {
                    $sort: { date: -1 }
                }
            ])
            .toArray();
        
        return stats;
    }, callback);
};

const getSystemStats = (callback) => {
    callbackWrapper(async () => {
        await connectDB();
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        const [usersCount, adminCount, transactionsCount, profilesCount, activitiesToday] = await Promise.all([
            usersCollection.countDocuments(),
            usersCollection.countDocuments({ role: 'admin' }),
            transactionsCollection.countDocuments(),
            profilesCollection.countDocuments(),
            activitiesCollection.countDocuments({ 
                created_at: { $gte: twentyFourHoursAgo },
                action: { $in: MAJOR_ACTIVITIES }
            })
        ]);
        
        return {
            total_users: usersCount,
            admin_count: adminCount,
            total_transactions: transactionsCount,
            total_profiles: profilesCount,
            activities_today: activitiesToday
        };
    }, callback);
};

// Function to create default admin user
const createDefaultAdmin = async () => {
    try {
        await connectDB();
        
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        
        // Skip admin creation if credentials are not provided
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.log('   Admin credentials not provided. Skipping default admin user creation.');
            console.log('   Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to auto-create admin user.');
            return;
        }
        
        const { hashPassword } = require('./utils/auth');
        
        const existingUser = await usersCollection.findOne({ email: ADMIN_EMAIL });
        
        if (existingUser) {
            // Check if user is already admin
            if (existingUser.role === 'admin') {
                console.log('✅ Default admin user already exists');
                return;
            }
            
            // Update existing user to admin
            await usersCollection.updateOne(
                { email: ADMIN_EMAIL },
                { $set: { role: 'admin' } }
            );
            console.log('✅ Default admin user role updated');
            return;
        }
        
        // Create new admin user
        const passwordHash = await hashPassword(ADMIN_PASSWORD);
        const user = {
            email: ADMIN_EMAIL,
            password_hash: passwordHash,
            role: 'admin',
            created_at: new Date()
        };
        
        await usersCollection.insertOne(user);
        console.log('✅ Default admin user created successfully');
        console.log(`   Email: ${ADMIN_EMAIL}`);
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }
};

// Export a db object for backwards compatibility (though it's not used the same way)
module.exports = {
    db: {
        // Provide a get method for admin middleware compatibility
        get: (query, params, callback) => {
            if (query.includes('SELECT role FROM users WHERE id')) {
                getUserRoleById(params[0], (err, user) => {
                    if (err) return callback(err);
                    callback(null, user || null);
                });
            } else {
                callback(new Error('Unsupported query'));
            }
        }
    },
    createUser,
    getUserByEmail,
    getUserById,
    getUserRoleById,
    createOrUpdateProfile,
    getProfile,
    createTransaction,
    createMultipleTransactions,
    getAllTransactions,
    getAllTransactionsAdmin,
    getTransactionStats,
    deleteTransaction,
    deleteAllTransactions,
    getAllUsers,
    updateUserRole,
    deleteUser,
    logActivity,
    getActivities,
    getActivityStats,
    getSystemStats,
    MAJOR_ACTIVITIES
};
