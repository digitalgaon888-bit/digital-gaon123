import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
  Plus, Users, Stethoscope, Pill, CreditCard, History, 
  Trash2, Download, Search, CheckCircle2, AlertCircle, 
  X, Phone, User, Activity, Clock, Send, FileText, ChevronRight, FileDown, MessageCircle
} from 'lucide-react';

const HealthSaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form states
  const [patientForm, setPatientForm] = useState({ name: '', phone: '', age: '', gender: 'Male' });
  const [visitForm, setVisitForm] = useState({ 
    patientId: '', patientName: '', patientPhone: '', symptoms: '', diagnosis: '', 
    prescription: [], totalAmount: '', paymentStatus: 'Paid' 
  });
  const [medForm, setMedForm] = useState({ name: '', stock: '', price: '' });

  const email = userEmail || localStorage.getItem('userEmail');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => setMsg({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API_URL}/health/patients?email=${email}`);
      setPatients(pRes.data);
      if (activeTab === 'history') {
        const vRes = await axios.get(`${API_URL}/health/visits?email=${email}`);
        setVisits(vRes.data);
      } else if (activeTab === 'stock') {
        const mRes = await axios.get(`${API_URL}/health/medicines?email=${email}`);
        setMedicines(mRes.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/health/patients`, { ...patientForm, email });
      setMsg({ text: 'Patient registered successfully!', type: 'success' });
      setPatientForm({ name: '', phone: '', age: '', gender: 'Male' });
      fetchData();
    } catch { setMsg({ text: 'Error adding patient', type: 'error' }); }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Kya aap is patient aur unka saara record delete karna chahte hain?')) return;
    try {
      await axios.delete(`${API_URL}/health/patients/${id}`);
      setMsg({ text: 'Patient record deleted', type: 'success' });
      if(visitForm.patientId === id) setVisitForm({...visitForm, patientId: '', patientName: '', patientPhone: ''});
      fetchData();
    } catch { setMsg({ text: 'Error deleting patient', type: 'error' }); }
  };

  const handleLogVisit = async (e) => {
    e.preventDefault();
    if (!visitForm.patientId) return setMsg({ text: 'Select a patient first', type: 'error' });
    try {
      await axios.post(`${API_URL}/health/visits`, { ...visitForm, email, symptoms: typeof visitForm.symptoms === 'string' ? visitForm.symptoms.split(',') : visitForm.symptoms });
      setMsg({ text: 'Visit record saved successfully!', type: 'success' });
      setVisitForm({ patientId: '', patientName: '', patientPhone: '', symptoms: '', diagnosis: '', prescription: [], totalAmount: '', paymentStatus: 'Paid' });
      fetchData();
    } catch { setMsg({ text: 'Error saving visit', type: 'error' }); }
  };

  const sendToWhatsApp = (visit) => {
    let phone = visit.patientPhone;
    if (!phone) {
        const p = patients.find(pat => pat._id === visit.patientId);
        if (p) phone = p.phone;
    }
    if (!phone) return alert('Phone number not available.');
    let message = `🏥 *HEALTH SAATHI CLINIC SLIP*\n\n👤 *Patient:* ${visit.patientName}\n📅 *Date:* ${new Date(visit.date).toLocaleDateString()}\n🩺 *Diagnosis:* ${visit.diagnosis || 'Checkup'}\n\n💊 *Prescription:*\n`;
    visit.prescription.forEach((p, i) => { message += `${i+1}. ${p.medicineName} (${p.dosage})\n`; });
    message += `\n💰 *Fees:* Rs. ${visit.totalAmount} (${visit.paymentStatus})\n\nGet well soon! ✨`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const generatePrescriptionPDF = (visit) => {
    const doc = new jsPDF();
    doc.setFillColor(239, 68, 68); doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.text('HEALTH SAATHI: CLINIC SLIP', 105, 25, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFontSize(10); doc.text(`Patient: ${visit.patientName}`, 20, 50); doc.text(`Date: ${new Date(visit.date).toLocaleString()}`, 130, 50);
    let y = 75; doc.setFontSize(12); doc.setTextColor(239, 68, 68); doc.text('DIAGNOSIS:', 20, y);
    doc.setTextColor(0, 0, 0); doc.text(visit.diagnosis || 'Checkup', 50, y);
    y += 15; doc.setTextColor(239, 68, 68); doc.text('PRESCRIPTION:', 20, y); doc.line(20, y + 2, 190, y + 2);
    y += 10; visit.prescription.forEach(p => { y += 10; doc.text(`${p.medicineName} — ${p.dosage}`, 20, y); });
    doc.save(`Prescription_${visit.patientName}.pdf`);
  };

  const generateHistoryReportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(239, 68, 68); doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.text('HEALTH SAATHI: CLINIC HISTORY', 105, 25, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFontSize(10); doc.text(`Total Visits: ${visits.length}`, 20, 50);
    let y = 65; doc.text('PATIENT', 20, y); doc.text('DATE', 80, y); doc.text('FEES', 170, y);
    visits.forEach(v => { y += 10; doc.text(v.patientName, 20, y); doc.text(new Date(v.date).toLocaleDateString(), 80, y); doc.text(`Rs. ${v.totalAmount}`, 170, y); });
    doc.save(`Clinic_History_Report.pdf`);
  };

  const ss = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '1rem', fontFamily: "'Outfit', sans-serif", color: '#fff' },
    header: { marginBottom: '2rem', textAlign: 'center' },
    title: { fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fff 20%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
    tabBar: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    tab: (active) => ({ flex: 1, minWidth: '90px', padding: '0.8rem 0.5rem', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', background: active ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 800, transition: 'all 0.3s ease', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }),
    card: { background: 'rgba(24,31,46,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginBottom: '1.5rem' },
    grid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
    gridCol: { flex: '1 1 350px', minWidth: '280px' },
    input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' },
    btn: (color) => ({ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: color || 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }),
    label: { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', fontWeight: 600, marginLeft: '0.3rem' }
  };

  return (
    <div style={ss.container} className="health-saathi-root">
      <div style={ss.header}>
        <h1 style={ss.title}>Health Saathi</h1>
        <p style={{color:'rgba(255,255,255,0.4)', fontWeight: 600, fontSize:'0.9rem'}}>Digital Clinic Management</p>
      </div>

      <div style={ss.tabBar} className="no-scrollbar mobile-tabs">
        <div style={ss.tab(activeTab === 'queue')} onClick={() => setActiveTab('queue')}>
          <Users size={18}/><span>Patients</span>
        </div>
        <div style={ss.tab(activeTab === 'visit')} onClick={() => setActiveTab('visit')}>
          <Stethoscope size={18}/><span>New Visit</span>
        </div>
        <div style={ss.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          <History size={18}/><span>History</span>
        </div>
        <div style={ss.tab(activeTab === 'stock')} onClick={() => setActiveTab('stock')}>
          <Pill size={18}/><span>Pharmacy</span>
        </div>
      </div>

      {msg.text && (
        <div className="status-msg" style={{
          padding:'1rem', borderRadius:'15px', marginBottom:'1.5rem', 
          background: msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', 
          border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}`, 
          color: msg.type==='success'?'#10b981':'#ef4444',
          display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize: '0.9rem'
        }}>
          {msg.type==='success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          {msg.text}
        </div>
      )}

      {activeTab === 'queue' && (
        <div style={ss.grid}>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 className="card-title"><Plus size={18} color="#ef4444"/> Register Patient</h3>
              <form onSubmit={handleAddPatient}>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Name</label><input style={ss.input} placeholder="Patient Name" value={patientForm.name} onChange={e=>setPatientForm({...patientForm, name:e.target.value})} required /></div>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Phone</label><input style={ss.input} placeholder="10-digit" value={patientForm.phone} onChange={e=>setPatientForm({...patientForm, phone:e.target.value})} required /></div>
                <div style={{display:'flex', gap:'0.8rem', marginBottom:'1rem'}}>
                  <div style={{flex:1}}><label style={ss.label}>Age</label><input type="number" style={ss.input} value={patientForm.age} onChange={e=>setPatientForm({...patientForm, age:e.target.value})} /></div>
                  <div style={{flex:1}}><label style={ss.label}>Gender</label>
                    <select style={{...ss.input, background: '#1e293b'}} value={patientForm.gender} onChange={e=>setPatientForm({...patientForm, gender:e.target.value})}>
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <button type="submit" style={ss.btn()}>Register Patient</button>
              </form>
            </div>
          </div>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 className="card-title">Patient Records</h3>
              <div style={{maxHeight:400, overflowY:'auto'}} className="no-scrollbar">
                {patients.map(p => (
                  <div key={p._id} className="list-item">
                    <div>
                      <div style={{fontWeight:800, fontSize:'0.9rem'}}>{p.name}</div>
                      <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.4)'}}>{p.phone}</div>
                    </div>
                    <div style={{display:'flex', gap:'0.4rem'}}>
                      <button className="action-btn-p" onClick={() => { setVisitForm({...visitForm, patientId: p._id, patientName: p.name, patientPhone: p.phone}); setActiveTab('visit'); }}>Check</button>
                      <button className="delete-btn-p" onClick={() => handleDeletePatient(p._id)}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visit' && (
        <div style={ss.card}>
          <h3 className="card-title"><Activity size={20} color="#ef4444"/> New Consultation</h3>
          <form onSubmit={handleLogVisit}>
            <div style={ss.grid}>
              <div style={ss.gridCol}>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Patient</label><div className="read-only-input">{visitForm.patientName || 'Select a patient first'}</div></div>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Symptoms</label><input style={ss.input} placeholder="Fever, Cough..." value={visitForm.symptoms} onChange={e=>setVisitForm({...visitForm, symptoms:e.target.value})} /></div>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Diagnosis</label><textarea style={{...ss.input, height:'70px'}} placeholder="Notes..." value={visitForm.diagnosis} onChange={e=>setVisitForm({...visitForm, diagnosis:e.target.value})} /></div>
              </div>
              <div style={ss.gridCol}>
                <label style={ss.label}>Prescription</label>
                <div className="presc-box">
                  <div style={{display:'flex', gap:'0.4rem', marginBottom:'0.8rem'}}>
                    <input id="medName" style={{...ss.input, flex:2}} placeholder="Med" /><input id="medDose" style={{...ss.input, flex:1}} placeholder="1-0-1" />
                    <button type="button" style={{...ss.btn(), width:'auto'}} onClick={() => {
                      const n = document.getElementById('medName').value; const d = document.getElementById('medDose').value;
                      if(n){ setVisitForm({...visitForm, prescription: [...visitForm.prescription, {medicineName:n, dosage:d, duration:'5 Days'}]}); document.getElementById('medName').value = ''; }
                    }}><Plus size={18}/></button>
                  </div>
                  {visitForm.prescription.map((p, i) => (
                    <div key={i} className="presc-item">
                      <span>{p.medicineName} ({p.dosage})</span>
                      <X size={14} onClick={() => { const n = [...visitForm.prescription]; n.splice(i,1); setVisitForm({...visitForm, prescription:n}); }}/>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex', gap:'0.8rem', marginBottom:'1.5rem'}}>
                  <div style={{flex:1}}><label style={ss.label}>Fees (₹)</label><input type="number" style={ss.input} value={visitForm.totalAmount} onChange={e=>setVisitForm({...visitForm, totalAmount:e.target.value})} required /></div>
                  <div style={{flex:1}}><label style={ss.label}>Payment</label>
                    <select style={{...ss.input, background:'#1e293b'}} value={visitForm.paymentStatus} onChange={e=>setVisitForm({...visitForm, paymentStatus:e.target.value})}>
                      <option value="Paid">Paid</option><option value="Udhaar">Udhaar</option>
                    </select>
                  </div>
                </div>
                <button type="submit" style={ss.btn()}><CheckCircle2 size={18}/> Save & Close</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={ss.card}>
          <div className="table-header-resp">
            <h3 style={{margin:0, fontSize:'1.1rem'}}>Recent History</h3>
            <button onClick={generateHistoryReportPDF} className="dl-btn-resp"><FileDown size={16}/> Report</button>
          </div>
          <div style={{overflowX:'auto'}} className="no-scrollbar">
            <table style={{width:'100%', borderCollapse:'collapse', minWidth:'500px'}}>
              <thead>
                <tr style={{textAlign:'left', color:'rgba(255,255,255,0.3)', fontSize:'0.7rem'}}>
                  <th style={{padding:'1rem'}}>Patient</th>
                  <th style={{padding:'1rem'}}>Date</th>
                  <th style={{padding:'1rem'}}>Fees</th>
                  <th style={{padding:'1rem'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v._id} className="tr-resp">
                    <td style={{padding:'1rem', fontWeight:800}}>{v.patientName}</td>
                    <td style={{padding:'1rem', opacity:0.6}}>{new Date(v.date).toLocaleDateString()}</td>
                    <td style={{padding:'1rem'}}>₹{v.totalAmount} <span style={{fontSize:'0.65rem', color:v.paymentStatus==='Paid'?'#10b981':'#ef4444'}}>({v.paymentStatus})</span></td>
                    <td style={{padding:'1rem'}}>
                      <div style={{display:'flex', gap:'0.8rem'}}>
                        <Download size={18} color="#60a5fa" onClick={() => generatePrescriptionPDF(v)} style={{cursor:'pointer'}}/>
                        <MessageCircle size={18} color="#10b981" onClick={() => sendToWhatsApp(v)} style={{cursor:'pointer'}}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div style={ss.grid}>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 className="card-title">Add Stock</h3>
              <form onSubmit={async (e) => { e.preventDefault(); await axios.post(`${API_URL}/health/medicines`, { ...medForm, email }); setMsg({ text: 'Added!', type:'success' }); setMedForm({name:'', stock:'', price:''}); fetchData(); }}>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Name</label><input style={ss.input} value={medForm.name} onChange={e=>setMedForm({...medForm, name:e.target.value})} required /></div>
                <div style={{marginBottom:'1rem'}}><label style={ss.label}>Stock</label><input type="number" style={ss.input} value={medForm.stock} onChange={e=>setMedForm({...medForm, stock:e.target.value})} required /></div>
                <button type="submit" style={ss.btn()}>Update Pharmacy</button>
              </form>
            </div>
          </div>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 className="card-title">In Stock</h3>
              <div style={{maxHeight:400, overflowY:'auto'}}>
                {medicines.map(m => (
                  <div key={m._id} className="list-item">
                    <div style={{fontWeight:700}}>{m.name}</div>
                    <div style={{color: m.stock < 10 ? '#ef4444' : '#10b981', fontWeight:900}}>{m.stock} Units</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .card-title { font-size: 1.1rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.6rem; color: #fff; }
        .read-only-input { width: 100%; padding: 0.8rem 1rem; border-radius: 12px; background: rgba(239,68,68,0.05); color: #ef4444; font-weight: 800; border: 1px solid rgba(239,68,68,0.1); box-sizing: border-box; font-size: 0.9rem; }
        .list-item { padding: 0.8rem 1rem; background: rgba(255,255,255,0.02); border-radius: 15px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.03); }
        .presc-box { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1rem; }
        .presc-item { font-size: 0.8rem; padding: 0.4rem 0.6rem; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 0.3rem; display: flex; justify-content: space-between; align-items: center; }
        .action-btn-p { background: rgba(239,68,68,0.1); border: none; color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; cursor: pointer; }
        .delete-btn-p { background: transparent; border: none; color: rgba(239,68,68,0.4); cursor: pointer; }
        .tr-resp { border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }
        .table-header-resp { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .dl-btn-resp { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 10px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; gap: 4px; font-weight: 700; }
        
        select option { background-color: #1e293b !important; color: white !important; }

        @media (max-width: 768px) {
          .mobile-tabs span { font-size: 0.7rem; }
          .card-title { font-size: 1rem; }
          .ss-gridCol { min-width: 100%; }
          .health-saathi-root { padding: 0.5rem; }
          .tr-resp td { padding: 0.8rem 0.5rem !important; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
};

export default HealthSaathi;
