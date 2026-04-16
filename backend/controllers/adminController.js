const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        
        // In MongoDB, wishlist is an array in User. 
        // We can sum up the lengths or just show total users with wishlist items.
        const usersWithWishlist = await User.find({ "wishlist.0": { $exists: true } });
        const wishlistTotalCount = usersWithWishlist.reduce((acc, user) => acc + user.wishlist.length, 0);
        
        res.status(200).json({
            users: userCount,
            products: productCount,
            wishlistItems: wishlistTotalCount
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(users);
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET /api/admin/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).lean();
        
        const mapped = await Promise.all(products.map(async (p) => {
            const seller = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: seller?.name || 'Unknown'
            };
        }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Admin Fetch Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Product.findByIdAndDelete(id);
        
        // Remove from all wishlists in MongoDB
        await User.updateMany({}, { $pull: { wishlist: id } });
        
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Admin Delete Product Error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
