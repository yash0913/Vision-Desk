import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaRegBell, FaUserEdit, FaCamera, FaSave, FaTimes } from "react-icons/fa";
import { IoMdRocket } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
import SidebarShell from '../../chatspace/components/SidebarShell.jsx';

export default function Settings() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: "VisionDesk User",
        email: "user@visiondesk.app",
        avatar: null
    });

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('vd_user_profile');
            if (savedUser) setUser(JSON.parse(savedUser));
        } catch (error) { console.error(error); }
    }, []);

    const handleSave = () => {
        setIsEditing(false);
        localStorage.setItem('vd_user_profile', JSON.stringify(user));
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-50 overflow-hidden">
            <SidebarShell />

            <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <CiSettings className="text-3xl text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                            <p className="text-slate-500 text-sm font-medium">Manage your account and workspace preferences.</p>
                        </div>
                    </div>

                    {/* --- PROFILE SECTION --- */}
                    <section>
                        <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 border-t-white/10 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 overflow-hidden flex items-center justify-center text-3xl font-bold shadow-2xl border-2 border-slate-800 ring-4 ring-indigo-500/10">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : "VD"}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute -bottom-2 -right-2 p-3 bg-[#0f172a] border border-slate-700 rounded-2xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-90"
                                >
                                    <FaCamera size={16} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }));
                                    reader.readAsDataURL(e.target.files[0]);
                                }} />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                {isEditing ? (
                                    <div className="grid gap-3">
                                        <input className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} />
                                        <input className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} />
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"><FaSave/> Save</button>
                                            <button onClick={() => setIsEditing(false)} className="bg-slate-800 text-slate-300 px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-3xl font-extrabold text-white leading-none">{user.name}</h3>
                                            <p className="text-slate-500 mt-2 font-medium tracking-wide">{user.email}</p>
                                        </div>
                                        <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                            <FaUserEdit size={14} /> Edit Profile
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* --- PREFERENCES SECTION --- */}
                    <div className="grid gap-6">
                        <section className="bg-slate-900/40 border border-slate-800 rounded-[24px] overflow-hidden divide-y divide-slate-800/50 shadow-xl">
                            {[
                                { icon: <IoMdRocket/>, title: "System Startup", desc: "Launch VisionDesk automatically", checked: false },
                                { icon: <FaRegBell/>, title: "Desktop Notifications", desc: "Show alerts for new messages", checked: true }
                            ].map((item, idx) => (
                                <div key={idx} className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-indigo-400">{item.icon}</div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-100">{item.title}</p>
                                            <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                                </div>
                            ))}
                        </section>

                        <section className="bg-red-500/5 border border-red-500/20 rounded-[24px] p-6 flex items-center justify-between group hover:bg-red-500/10 transition-all">
                            <div>
                                <p className="font-bold text-red-400 text-sm">Security & Access</p>
                                <p className="text-xs text-slate-500 font-medium">Terminate your current session on this device.</p>
                            </div>
                            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95">
                                <IoIosLogOut size={16} /> Logout
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}