import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const email = localStorage.getItem('userEmail') || 'guest@example.com';
      const payload = { ...formData, sellerEmail: email };
      
      const response = await axios.post('http://localhost:5000/api/products', payload);
      setMessage('✅ Product added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        price: '',
        category: '',
        description: '',
        location: '',
      });
    } catch (error) {
      console.error('Error adding product', error);
      setMessage('❌ Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <h1 className="page-title">Sell Your Product</h1>
      
      <div className="auth-card" style={{ maxWidth: '800px', margin: '0' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div className="form-group">
                <label>Product Title</label>
                <input 
                  className="form-input" 
                  placeholder="What are you selling?" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. 500" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Farming Equipment">Farming Equipment</option>
                  <option value="Crops / Seeds">Crops / Seeds</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Village / Location</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Pune, Warud" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="5" 
                  placeholder="Tell buyers more about your item..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Upload Images (Max 5)</label>
            <div style={{ 
              border: '2px dashed var(--glass-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '2.5rem', 
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
              <div style={{ fontWeight: '500' }}>Click to Upload or Drag & Drop (Coming Soon)</div>
              <p style={{ fontSize: '0.75rem', marginBottom: 0 }}>Supported: JPG, PNG, WEBP</p>
            </div>
          </div>

          {message && (
            <div style={{ marginTop: '1rem', textAlign: 'center', color: message.startsWith('✅') ? 'var(--success)' : 'var(--error)' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
            {loading ? 'Submitting...' : 'Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
