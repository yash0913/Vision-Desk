import React, { useRef, useEffect } from 'react';
import { useMeetingRemoteControl } from '../../../components/calling/meetingRemoteControlContext';

export default function RemoteControlPanel({ isOpen, onClose }) {
    const { actionLogs, activeControllerName, sessionConfig } = useMeetingRemoteControl();
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [actionLogs]);

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 h-full z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Control Activity</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Real-time session monitoring</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Active User Info */}
            <div className="p-4 bg-slate-800/50 m-3 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activeControllerName ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Current Controller</div>
                        <div className="text-sm font-medium text-slate-200">
                            {activeControllerName || 'No active control'}
                        </div>
                    </div>
                </div>
                {activeControllerName && (
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">
                        Connected via Meeting Data Channel
                    </div>
                )}
            </div>

            {/* Logs Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                    <span>Live Action Log</span>
                    <div className="flex-1 h-[1px] bg-slate-800" />
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar"
                >
                    {actionLogs.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-500 italic">No activity recorded yet</p>
                        </div>
                    ) : (
                        actionLogs.map((log) => (
                            <div key={log.id} className="group border-l-2 border-slate-700 hover:border-emerald-500 pl-3 py-1 transition-colors">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${log.type === 'system' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {log.type.toUpperCase()}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">{log.timestamp}</span>
                                </div>
                                <p className={`text-xs ${log.type === 'system' ? 'text-slate-300 italic' : 'text-slate-200'}`}>
                                    {log.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer / Session ID */}
            {sessionConfig?.sessionId && (
                <div className="p-4 border-t border-slate-700 bg-slate-900">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>Session ID</span>
                        <span>{String(sessionConfig.sessionId).substring(0, 8)}...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
