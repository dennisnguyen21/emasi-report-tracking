import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle, Clock, AlertCircle, LogOut, Edit, Save, X, Mail,
    Search, Building, Shield, BarChart, List, Trash2
} from 'lucide-react';
import { BarChart as RBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { db, auth } from './firebase';
import {
    collection, doc, setDoc, updateDoc, onSnapshot, deleteDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const APP_ID = 'emasi-reporting-hub';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

// --- UI COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const bgColor = type === 'success' ? 'bg-[#bed630] text-[#005d83]' : 'bg-[#005d83] text-white';

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce font-medium border border-white/20`}>
            {type === 'success' ? <CheckCircle size={22} /> : <Mail size={22} />}
            <span>{message}</span>
        </div>
    );
};

const Badge = ({ status }) => {
    switch (status) {
        case 'Done':
            return <span className="px-3 py-1 bg-[#bed630]/20 text-[#005d83] border border-[#bed630]/50 rounded-full text-xs font-bold flex items-center w-fit shadow-sm"><CheckCircle size={12} className="mr-1" /> Done</span>;
        case 'On Process':
            return <span className="px-3 py-1 bg-[#5bcaf4]/20 text-[#005d83] border border-[#5bcaf4]/50 rounded-full text-xs font-bold flex items-center w-fit shadow-sm"><Clock size={12} className="mr-1" /> On Process</span>;
        default:
            return <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold flex items-center w-fit shadow-sm"><AlertCircle size={12} className="mr-1" /> Pending</span>;
    }
};

// --- MAIN APPLICATION ---

export default function App() {
    const [currentRole, setCurrentRole] = useState(null);
    const [requests, setRequests] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    const [accessCode, setAccessCode] = useState('');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        // Authenticate anonymously
        signInAnonymously(auth).catch(err => console.error("Auth error:", err));

        // Listen for real-time updates from Firestore
        const colRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'report_tracking_requests');
        const unsub = onSnapshot(colRef, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            setRequests(data);
        }, (error) => {
            console.error("Firestore sync error:", error);
        });

        return () => unsub();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (accessCode === '001') {
            setCurrentRole('admin');
        } else if (accessCode === '002') {
            setCurrentRole('namlong');
        } else if (accessCode === '003') {
            setCurrentRole('vanphuc');
        } else {
            setLoginError('Invalid access code. Please try again.');
        }
    };

    const handleLogout = () => {
        setCurrentRole(null);
        setAccessCode('');
        setLoginError('');
    };

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type });
    };

    if (!currentRole) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-[#005d83] rounded-b-[4rem] shadow-2xl transform -skew-y-2 origin-top-left z-0"></div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-[#5bcaf4] rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
                <div className="absolute top-20 right-20 w-40 h-40 bg-[#bed630] rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0"></div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                    <div className="flex justify-center text-white drop-shadow-lg">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border-b-4 border-[#bed630]">
                            <List size={48} className="text-[#005d83]" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md tracking-tight">
                        Gradebook Report Tracking
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#5bcaf4] font-medium">
                        EMASI Gradebook Management Portal
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                    <div className="bg-white py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#005d83] via-[#5bcaf4] to-[#bed630]"></div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-bold text-[#005d83]">
                                    System Access Code
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        id="code"
                                        type="password"
                                        required
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all bg-slate-50"
                                        placeholder="Enter authentication code..."
                                    />
                                </div>



                                {loginError && (
                                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 rounded-r-md">
                                        {loginError}
                                    </div>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#005d83] hover:bg-[#004a69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005d83] transition-all transform hover:-translate-y-0.5"
                                >
                                    Secure Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {currentRole === 'admin' ? (
                <AdminDashboard
                    requests={requests}
                    onLogout={handleLogout}
                />
            ) : (
                <TeacherDashboard
                    schoolCode={currentRole}
                    requests={requests}
                    onLogout={handleLogout}
                    showToast={showToast}
                />
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </>
    );
}

// --- TEACHER DASHBOARD ---

function TeacherDashboard({ schoolCode, requests, onLogout, showToast }) {
    const schoolName = schoolCode === 'namlong' ? 'EMASI Nam Long' : 'EMASI Vạn Phúc';

    const [formData, setFormData] = useState({
        id: null,
        teacherName: '',
        className: '',
        subject: '',
        studentStatus: 'Full',
        content: ''
    });

    const [searchName, setSearchName] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const uniqueTeachers = useMemo(() => {
        const names = requests
            .filter(r => r.school === schoolName)
            .map(r => toTitleCase(r.teacherName.trim()));
        return [...new Set(names)];
    }, [requests, schoolName]);

    const myRequests = useMemo(() => {
        const term = searchName.trim().toLowerCase();
        if (!term) return [];
        return requests
            .filter(r => r.school === schoolName && r.teacherName.toLowerCase().includes(term))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [requests, searchName, schoolName]);

    const campusRequests = useMemo(() => {
        return requests.filter(r => r.school === schoolName);
    }, [requests, schoolName]);

    const chartDataByTeacher = useMemo(() => {
        const counts = {};
        campusRequests.forEach(r => { 
            const name = toTitleCase(r.teacherName.trim());
            counts[name] = (counts[name] || 0) + 1; 
        });
        return Object.keys(counts).map(k => ({name: k, count: counts[k]})).sort((a,b)=>b.count-a.count).slice(0, 10);
    }, [campusRequests]);

    const chartDataByClass = useMemo(() => {
        const counts = {};
        campusRequests.forEach(r => { counts[r.className] = (counts[r.className] || 0) + 1; });
        return Object.keys(counts).map(k => ({name: k, count: counts[k]})).sort((a,b)=>b.count-a.count).slice(0, 10);
    }, [campusRequests]);

    const chartDataByAttendance = useMemo(() => {
        const counts = { 'Full': 0, 'Missing': 0, 'Extra': 0 };
        campusRequests.forEach(r => {
            if (counts[r.studentStatus] !== undefined) counts[r.studentStatus]++;
            else counts[r.studentStatus] = 1;
        });
        return Object.keys(counts).map(k => ({name: k, value: counts[k]})).filter(d => d.value > 0);
    }, [campusRequests]);

    const COLORS = ['#005d83', '#5bcaf4', '#bed630', '#f4a05b', '#e06b5c'];

    const teacherStats = useMemo(() => {
        return {
            total: myRequests.length,
            pending: myRequests.filter(r => r.status === 'Pending').length,
            process: myRequests.filter(r => r.status === 'On Process').length,
            done: myRequests.filter(r => r.status === 'Done').length,
        };
    }, [myRequests]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'teacherName') {
            setSearchName(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // UPDATE IN FIREBASE
                const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'report_tracking_requests', formData.id);
                await updateDoc(docRef, {
                    teacherName: formData.teacherName,
                    className: formData.className,
                    subject: formData.subject,
                    studentStatus: formData.studentStatus,
                    content: formData.content,
                    timestamp: Date.now()
                });
                showToast('Request updated successfully!');
            } else {
                // CREATE NEW IN FIREBASE
                const newId = Math.random().toString(36).substr(2, 9);
                const newRequest = {
                    ...formData,
                    id: newId,
                    school: schoolName,
                    status: 'Pending',
                    itNote: '',
                    timestamp: Date.now()
                };
                const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'report_tracking_requests', newId);
                await setDoc(docRef, newRequest);
                showToast('Report submitted successfully.', 'email');
            }

            setFormData(prev => ({
                id: null,
                teacherName: prev.teacherName,
                className: '',
                subject: '',
                studentStatus: 'Full',
                content: ''
            }));
        } catch (error) {
            console.error("Error submitting request to Firebase:", error);
            showToast('Failed to save to database. Check connection.', 'error');
        }
    };

    const handleEdit = (req) => {
        setFormData({
            id: req.id,
            teacherName: req.teacherName,
            className: req.className,
            subject: req.subject,
            studentStatus: req.studentStatus,
            content: req.content
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData(prev => ({
            id: null,
            teacherName: prev.teacherName,
            className: '',
            subject: '',
            studentStatus: 'Full',
            content: ''
        }));
    };

    const triggerDelete = (id) => setDeleteConfirmId(id);
    const cancelDelete = () => setDeleteConfirmId(null);

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'report_tracking_requests', deleteConfirmId);
            await deleteDoc(docRef);
            showToast('Request deleted successfully!', 'success');
            if (formData.id === deleteConfirmId) {
                handleCancelEdit();
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            showToast('Failed to delete request.', 'error');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="absolute top-0 left-0 w-full h-[320px] bg-[#005d83] z-0">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5bcaf4 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="pt-6 pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg">
                            <div className="bg-[#bed630] p-2 rounded-lg">
                                <Building className="text-[#005d83]" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-white tracking-tight">{schoolName}</h1>
                                <p className="text-xs text-[#5bcaf4] font-semibold uppercase tracking-wider">Gradebook Report Tracking</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 text-white hover:text-[#bed630] transition-colors bg-[#004a69] px-4 py-2.5 rounded-xl shadow-md border border-[#005d83] hover:border-[#bed630]/50"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline font-semibold text-sm">Sign Out</span>
                        </button>
                    </div>
                </header>

                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-4 flex items-center"><BarChart size={16} className="mr-2 text-[#5bcaf4]"/> Campus Classes</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartDataByClass} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#0f172a', fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <YAxis type="number" hide />
                                        <RTooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Line type="monotone" dataKey="count" stroke="#5bcaf4" strokeWidth={4} dot={{ stroke: '#5bcaf4', strokeWidth: 2, r: 4, fill: '#fff'}} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-4 flex items-center"><BarChart size={16} className="mr-2 text-[#bed630]"/> Campus Teachers</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartDataByTeacher} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#0f172a', fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <YAxis type="number" hide />
                                        <RTooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Line type="monotone" dataKey="count" stroke="#bed630" strokeWidth={4} dot={{ stroke: '#bed630', strokeWidth: 2, r: 4, fill: '#fff'}} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1 flex flex-col items-center">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-2 w-full flex items-center"><Clock size={16} className="mr-2 text-[#f4a05b]"/> Attendance Status</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartDataByAttendance} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                            {chartDataByAttendance.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                        </Pie>
                                        <RTooltip contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#0f172a'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                <div className="h-2 w-full bg-[#bed630]"></div>
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-xl font-extrabold text-[#005d83] mb-6 flex items-center">
                                        {formData.id ? (
                                            <span className="flex items-center"><span className="bg-[#5bcaf4]/20 p-2 rounded-lg mr-3"><Edit size={20} className="text-[#005d83]" /></span> Edit Request</span>
                                        ) : (
                                            <span className="flex items-center"><span className="bg-[#005d83]/10 p-2 rounded-lg mr-3"><Mail size={20} className="text-[#005d83]" /></span> New Request</span>
                                        )}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-[#005d83] mb-1.5">Teacher Name</label>
                                            <input
                                                type="text"
                                                name="teacherName"
                                                required
                                                value={formData.teacherName}
                                                onChange={handleChange}
                                                list="teacher-names"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all text-[#005d83] font-medium"
                                                placeholder="Enter your name..."
                                            />
                                            <datalist id="teacher-names">
                                                {uniqueTeachers.map((name, idx) => (
                                                    <option key={idx} value={name} />
                                                ))}
                                            </datalist>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-[#005d83] mb-1.5">Class</label>
                                                <input
                                                    type="text"
                                                    name="className"
                                                    required
                                                    value={formData.className}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all text-[#005d83] font-medium"
                                                    placeholder="e.g., 10A1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-[#005d83] mb-1.5">Subject</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all text-[#005d83] font-medium"
                                                    placeholder="e.g., Math"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#005d83] mb-1.5">Student Attendance</label>
                                            <select
                                                name="studentStatus"
                                                value={formData.studentStatus}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all text-[#005d83] font-medium"
                                            >
                                                <option value="Full">Full</option>
                                                <option value="Missing">Missing</option>
                                                <option value="Extra">Extra</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#005d83] mb-1.5">Request Details</label>
                                            <textarea
                                                name="content"
                                                required
                                                rows={4}
                                                value={formData.content}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent sm:text-sm transition-all text-[#005d83] font-medium resize-none"
                                                placeholder="Describe the issue you need IT support for..."
                                            />
                                        </div>

                                        <div className="pt-4 flex flex-col space-y-3">
                                            <button
                                                type="submit"
                                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#005d83] hover:bg-[#004a69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005d83] transition-transform transform hover:-translate-y-0.5"
                                            >
                                                {formData.id ? 'Save Changes' : 'Submit Report'}
                                            </button>
                                            {formData.id && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
                                                >
                                                    Cancel Editing
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-[#5bcaf4]/20 p-2 rounded-lg">
                                            <List size={20} className="text-[#005d83]" />
                                        </div>
                                        <h2 className="text-lg font-extrabold text-[#005d83]">Your Report History</h2>
                                    </div>
                                    <div className="relative w-full sm:w-72">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={16} className="text-[#5bcaf4]" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                            placeholder="Search by your name..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent bg-white shadow-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Teacher Task Status Summary */}
                                {myRequests.length > 0 && (
                                    <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-white shrink-0">
                                        <div className="py-3 px-4 text-center">
                                            <div className="text-2xl font-extrabold text-[#005d83]">{teacherStats.total}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</div>
                                        </div>
                                        <div className="py-3 px-4 text-center bg-slate-50/50">
                                            <div className="text-2xl font-extrabold text-slate-600">{teacherStats.pending}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</div>
                                        </div>
                                        <div className="py-3 px-4 text-center bg-[#5bcaf4]/5">
                                            <div className="text-2xl font-extrabold text-[#5bcaf4]">{teacherStats.process}</div>
                                            <div className="text-[10px] font-bold text-[#5bcaf4] uppercase tracking-wider mt-1">Process</div>
                                        </div>
                                        <div className="py-3 px-4 text-center bg-[#bed630]/10">
                                            <div className="text-2xl font-extrabold text-[#bed630]">{teacherStats.done}</div>
                                            <div className="text-[10px] font-bold text-[#bed630] uppercase tracking-wider mt-1">Done</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-grow overflow-y-auto p-2 bg-slate-50/30">
                                    {myRequests.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Search size={40} className="text-slate-300" />
                                            </div>
                                            <p className="text-[#005d83] font-bold text-lg">No history found</p>
                                            <p className="text-sm text-slate-500 mt-2 max-w-sm">Enter your exact name in the search box above to view your previous requests.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 p-4">
                                            {myRequests.map((req) => (
                                                <div key={req.id} className={`bg-white p-6 rounded-2xl border ${formData.id === req.id ? 'border-[#5bcaf4] shadow-md ring-1 ring-[#5bcaf4]/50' : 'border-slate-100 shadow-sm'} hover:shadow-md transition-all relative overflow-hidden group`}>

                                                    <div className={`absolute top-0 left-0 h-full w-1 ${req.status === 'Done' ? 'bg-[#bed630]' : req.status === 'On Process' ? 'bg-[#5bcaf4]' : 'bg-slate-300'}`}></div>

                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="font-extrabold text-[#005d83] text-lg">{req.className} <span className="text-slate-300 mx-1">/</span> {req.subject}</span>
                                                            <Badge status={req.status} />
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            {new Date(req.timestamp).toLocaleString('en-US')}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-slate-600 mb-5 leading-relaxed">
                                                        {req.content}
                                                    </div>

                                                    <div className="mb-5 p-4 bg-[#f4fbff] rounded-xl border border-[#5bcaf4]/30">
                                                        <div className="flex items-center mb-2">
                                                            <Shield size={16} className="mr-2 text-[#5bcaf4]" />
                                                            <span className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider">Admin Resolution Note</span>
                                                        </div>
                                                        {req.itNote ? (
                                                            <p className="text-sm text-[#005d83] font-medium ml-6">{req.itNote}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-400 italic ml-6">Pending review from Admin...</p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                                        <div className="text-sm text-slate-500 flex items-center">
                                                            <span className="w-2 h-2 rounded-full bg-[#bed630] mr-2"></span>
                                                            Attendance: <span className="font-bold text-[#005d83] ml-1">{req.studentStatus}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(req)}
                                                                className="flex items-center text-[#005d83] hover:text-[#005d83] font-bold text-sm bg-white border border-[#005d83]/20 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                                            >
                                                                <Edit size={14} className="mr-2" /> Modify
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete(req.id)}
                                                                className="flex items-center text-red-500 hover:text-red-500 font-bold text-sm bg-white border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                                                            >
                                                                <Trash2 size={14} className="mr-2" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            
            {/* Glassmorphism Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="relative w-full max-w-sm p-8 bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-3xl transform transition-all animate-in fade-in zoom-in-95">
                        <div className="absolute top-4 right-4">
                            <button onClick={cancelDelete} className="p-2 text-slate-400 hover:text-red-500 bg-white/50 rounded-full hover:bg-red-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                                <Trash2 size={36} className="text-red-500 drop-shadow-sm" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-[#005d83] mb-3">Delete Request?</h3>
                            <p className="text-slate-600 font-medium mb-8 text-sm leading-relaxed px-2">
                                Are you sure you want to permanently delete this report request? This action cannot be undone.
                            </p>
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-sm rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-transparent text-white font-extrabold text-sm rounded-xl shadow-md transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// --- ADMIN DASHBOARD ---

function AdminDashboard({ requests, onLogout }) {
    const [filterSchool, setFilterSchool] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [editingItState, setEditingItState] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [tempNote, setTempNote] = useState('');

    const filteredRequests = useMemo(() => {
        return requests
            .filter(r => filterSchool === 'All' || r.school === filterSchool)
            .filter(r => filterStatus === 'All' || r.status === filterStatus)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [requests, filterSchool, filterStatus]);

    const stats = useMemo(() => {
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'Pending').length,
            process: requests.filter(r => r.status === 'On Process').length,
            done: requests.filter(r => r.status === 'Done').length,
        };
    }, [requests]);

    const chartDataByTeacher = useMemo(() => {
        const counts = {};
        filteredRequests.forEach(r => {
            const name = toTitleCase(r.teacherName.trim());
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a,b) => b.count - a.count).slice(0, 10);
    }, [filteredRequests]);

    const chartDataByClass = useMemo(() => {
        const counts = {};
        filteredRequests.forEach(r => {
            counts[r.className] = (counts[r.className] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a,b) => b.count - a.count).slice(0, 10);
    }, [filteredRequests]);

    const chartDataByAttendance = useMemo(() => {
        const counts = { 'Full': 0, 'Missing': 0, 'Extra': 0 };
        filteredRequests.forEach(r => {
            if (counts[r.studentStatus] !== undefined) counts[r.studentStatus]++;
            else counts[r.studentStatus] = 1;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(d => d.value > 0);
    }, [filteredRequests]);

    const COLORS = ['#005d83', '#5bcaf4', '#bed630', '#f4a05b', '#e06b5c'];

    const handleOpenEdit = (req) => {
        setEditingItState(req.id);
        setTempStatus(req.status);
        setTempNote(req.itNote || '');
    };

    const handleSaveItState = async (id) => {
        try {
            // Update in Firestore
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'report_tracking_requests', id);
            await updateDoc(docRef, { status: tempStatus, itNote: tempNote });
            setEditingItState(null);
        } catch (error) {
            console.error("Error updating status in Firebase:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="absolute top-0 left-0 w-full h-[280px] bg-[#005d83] z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="pt-6 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg">
                            <div className="bg-[#5bcaf4] p-2 rounded-lg">
                                <Shield className="text-[#005d83]" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-white tracking-tight">Gradebook Administration</h1>
                                <p className="text-xs text-[#bed630] font-bold uppercase tracking-wider">Master Control Panel</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex flex-col text-right">
                                <span className="text-xs text-[#5bcaf4] font-bold uppercase">System Admin</span>
                                <span className="text-sm text-white font-medium">datnt@emasi.edu.vn</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 text-[#005d83] hover:text-white transition-colors bg-[#bed630] hover:bg-[#a6be25] px-4 py-2.5 rounded-xl shadow-md font-bold"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl shadow-xl p-5 border-b-4 border-slate-300 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</p>
                                <p className="text-3xl font-extrabold text-[#005d83]">{stats.total}</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-xl"><BarChart size={24} className="text-slate-400" /></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border-b-4 border-red-400 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                                <p className="text-3xl font-extrabold text-red-500">{stats.pending}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl"><AlertCircle size={24} className="text-red-400" /></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border-b-4 border-[#5bcaf4] flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Process</p>
                                <p className="text-3xl font-extrabold text-[#5bcaf4]">{stats.process}</p>
                            </div>
                            <div className="bg-[#5bcaf4]/10 p-3 rounded-xl"><Clock size={24} className="text-[#5bcaf4]" /></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border-b-4 border-[#bed630] flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Done</p>
                                <p className="text-3xl font-extrabold text-[#bed630]">{stats.done}</p>
                            </div>
                            <div className="bg-[#bed630]/20 p-3 rounded-xl"><CheckCircle size={24} className="text-[#bed630]" /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-4 flex items-center"><BarChart size={16} className="mr-2 text-[#5bcaf4]"/> Top Classes</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartDataByClass} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#0f172a', fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <YAxis type="number" hide />
                                        <RTooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Line type="monotone" dataKey="count" stroke="#5bcaf4" strokeWidth={4} dot={{ stroke: '#5bcaf4', strokeWidth: 2, r: 4, fill: '#fff'}} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-4 flex items-center"><BarChart size={16} className="mr-2 text-[#bed630]"/> Top Teachers</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartDataByTeacher} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#0f172a', fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <YAxis type="number" hide />
                                        <RTooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Line type="monotone" dataKey="count" stroke="#bed630" strokeWidth={4} dot={{ stroke: '#bed630', strokeWidth: 2, r: 4, fill: '#fff'}} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 lg:col-span-1 flex flex-col items-center">
                            <h3 className="text-sm font-extrabold text-[#005d83] uppercase tracking-wider mb-2 w-full flex items-center"><Clock size={16} className="mr-2 text-[#f4a05b]"/> Attendance Status</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartDataByAttendance}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartDataByAttendance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RTooltip contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#0f172a'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">

                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="font-bold text-[#005d83] uppercase tracking-wider text-sm flex items-center hidden sm:flex"><List size={16} className="mr-2 text-[#5bcaf4]" /> View:</span>
                                
                                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setFilterSchool('All')} 
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterSchool === 'All' ? 'bg-white text-[#005d83] shadow-sm' : 'text-slate-500 hover:text-[#005d83]'}`}
                                    >All</button>
                                    <button 
                                        onClick={() => setFilterSchool('EMASI Nam Long')} 
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterSchool === 'EMASI Nam Long' ? 'bg-[#bed630] text-[#005d83] shadow-sm' : 'text-slate-500 hover:text-[#005d83]'}`}
                                    >Nam Long</button>
                                    <button 
                                        onClick={() => setFilterSchool('EMASI Vạn Phúc')} 
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterSchool === 'EMASI Vạn Phúc' ? 'bg-[#5bcaf4] text-[#005d83] shadow-sm' : 'text-slate-500 hover:text-[#005d83]'}`}
                                    >Vạn Phúc</button>
                                </div>

                                <select
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                    className="border border-slate-200 bg-white rounded-xl py-2 px-4 text-sm font-semibold text-[#005d83] focus:ring-2 focus:ring-[#5bcaf4] focus:border-transparent shadow-sm"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="On Process">On Process</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>

                            <div className="text-sm font-bold text-[#5bcaf4] bg-[#5bcaf4]/10 px-4 py-2 rounded-xl border border-[#5bcaf4]/20">
                                Showing: {filteredRequests.length} results
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-[#005d83] text-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date & Time</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Campus</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Teacher Info</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-1/4">Request Details</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status & Admin Note</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <CheckCircle size={48} className="text-slate-200 mb-4" />
                                                    <p className="text-lg font-bold text-[#005d83]">No matching requests.</p>
                                                    <p className="text-sm mt-1">Inbox zero achieved based on current filters!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                    <div className="font-bold text-[#005d83]">{new Date(req.timestamp).toLocaleDateString('en-US')}</div>
                                                    <div className="text-slate-400 font-medium text-xs mt-0.5">{new Date(req.timestamp).toLocaleTimeString('en-US')}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${req.school === 'EMASI Nam Long' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                                        {req.school}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="font-extrabold text-[#005d83] text-sm mb-1">{req.teacherName}</div>
                                                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">{req.className} - {req.subject}</div>
                                                </td>
                                                <td className="px-6 py-5 text-sm">
                                                    <div className="text-slate-600 line-clamp-2 leading-relaxed font-medium" title={req.content}>
                                                        {req.content}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {editingItState === req.id ? (
                                                        <div className="space-y-3 p-3 bg-slate-50 border border-[#5bcaf4]/30 rounded-xl shadow-inner">
                                                            <select
                                                                value={tempStatus}
                                                                onChange={(e) => setTempStatus(e.target.value)}
                                                                className="block w-full text-sm font-bold text-[#005d83] border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5bcaf4]"
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="On Process">On Process</option>
                                                                <option value="Done">Done</option>
                                                            </select>
                                                            <textarea
                                                                rows={2}
                                                                value={tempNote}
                                                                onChange={(e) => setTempNote(e.target.value)}
                                                                placeholder="Write Admin note..."
                                                                className="block w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5bcaf4] resize-none"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Badge status={req.status} />
                                                            {req.itNote && (
                                                                <div className="text-xs font-medium text-[#005d83] bg-[#5bcaf4]/10 p-2 rounded-lg border border-[#5bcaf4]/20 flex items-start mt-2">
                                                                    <span className="mr-1.5 mt-0.5 text-[#5bcaf4]">↳</span> {req.itNote}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    {editingItState === req.id ? (
                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                onClick={() => handleSaveItState(req.id)}
                                                                className="w-full text-white font-bold text-xs flex items-center justify-center bg-[#bed630] hover:bg-[#a6be25] px-3 py-2 rounded-lg shadow-sm transition-colors"
                                                            >
                                                                <Save size={14} className="mr-1.5" /> Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingItState(null)}
                                                                className="w-full text-slate-600 font-bold text-xs flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                                                            >
                                                                <X size={14} className="mr-1.5" /> Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenEdit(req)}
                                                            className="inline-flex items-center text-[#005d83] hover:text-white font-bold text-xs bg-[#5bcaf4]/20 border border-[#5bcaf4]/50 px-3 py-2 rounded-lg hover:bg-[#005d83] transition-colors"
                                                        >
                                                            <Edit size={14} className="mr-1.5" /> Handle
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

