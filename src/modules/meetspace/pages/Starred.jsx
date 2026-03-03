import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegStar, FaLaptop, FaDesktop, FaCircle } from "react-icons/fa";
import SidebarShell from '../../chatspace/components/SidebarShell.jsx';

export default function Starred() {
    const navigate = useNavigate();
    const starredDevices = [
        { id: 1, name: "Yash - Laptop", status: "Online", type: "laptop" },
        { id: 2, name: "Office Desktop", status: "Offline", type: "desktop" },
        { id: 3, name: "Home Media PC", status: "Online", type: "desktop" }
    ];

    return (
        <div className="flex h-screen bg-[#020617] text-slate-50 overflow-hidden">
            <SidebarShell />

            <main className="flex-1 overflow-y-auto p-8 md:p-12 relative custom-scrollbar">
                {/* Background Decor */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
                    <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto space-y-12">
                    <header className="flex items-center gap-5">
                        <div className="p-4 bg-yellow-500/10 rounded-[24px] border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                            <FaRegStar className="text-3xl text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight">Starred Devices</h1>
                            <p className="text-slate-500 font-medium mt-1">Your priority workstations, ready for remote control.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {starredDevices.map((device) => {
                            const isOnline = device.status === "Online";
                            return (
                                <div key={device.id} className={`group relative p-8 rounded-[32px] bg-slate-900/40 border border-slate-800 border-t-white/10 flex flex-col gap-6 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/60 hover:border-indigo-500/50 shadow-2xl ${!isOnline && 'opacity-60 grayscale-[0.3]'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 rounded-[20px] bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl text-indigo-400 shadow-inner group-hover:text-indigo-300 transition-colors">
                                            {device.type === 'laptop' ? <FaLaptop /> : <FaDesktop />}
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                                            {device.status}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{device.name}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Session ID: VD-889-0{device.id}</p>
                                    </div>

                                    <button
                                        disabled={!isOnline}
                                        onClick={() => navigate('/workspace/desklink')}
                                        className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-xl ${isOnline 
                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-t border-white/20 shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500' 
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        {isOnline ? 'Start Remote Control' : 'Device Offline'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}