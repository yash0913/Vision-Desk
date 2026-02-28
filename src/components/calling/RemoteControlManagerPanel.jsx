import React, { useState } from 'react';
import { Users, UserCheck, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RemoteControlManagerPanel({ 
  participants, 
  controlRequests, 
  setControlRequests, 
  activeController, 
  setActiveController,
  socket,
  userId,
  isHost 
}) {
  const handleToggleControl = (targetUserId) => {
    if (!isHost) return; // Only host can control

    const newController = activeController === targetUserId ? null : targetUserId;
    
    // If switching to a new controller, revoke previous
    if (activeController && activeController !== targetUserId) {
      socket.emit('revoke-control', { userId: activeController });
    }

    // Grant control to new controller (or revoke if same)
    if (newController) {
      socket.emit('grant-control', { targetUserId: newController });
    }

    setActiveController(newController);

    // Update requests status
    setControlRequests(prev => 
      prev.map(req => 
        req.userId === newController 
          ? { ...req, status: newController ? 'approved' : 'pending' }
          : req
      )
    );
  };

  const getControllerCandidates = () => {
    return participants.filter(p => p.id !== userId);
  };

  const getActiveControllerName = () => {
    if (!activeController) return 'None';
    const controller = participants.find(p => p.id === activeController);
    return controller?.name || controller?.userName || 'Unknown';
  };

  return (
    <div className="bg-slate-900 rounded-lg p-4 w-80 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Remote Control Panel</h3>
      </div>

      {/* Active Controller */}
      <div className="mb-4 p-3 bg-slate-800 rounded">
        <div className="text-xs text-slate-400 mb-1">Active Controller:</div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-400" />
          <span className="text-white font-medium">{getActiveControllerName()}</span>
        </div>
      </div>

      {/* Control Requests */}
      <div>
        <div className="text-xs text-slate-400 mb-2">Requests:</div>
        <div className="space-y-2">
          {getControllerCandidates().map(participant => {
            const isActive = activeController === participant.id;
            const request = controlRequests.find(req => req.userId === participant.id);
            const isApproved = request?.status === 'approved';
            
            return (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white text-sm">
                    {participant.name || participant.userName || 'Unknown User'}
                  </span>
                  {isApproved && (
                    <span className="text-xs text-green-400 bg-green-900 px-2 py-1 rounded">Active</span>
                  )}
                </div>
                
                {isHost && (
                  <button
                    onClick={() => handleToggleControl(participant.id)}
                    className={`
                      px-3 py-1 rounded text-xs font-medium transition-colors
                      ${isActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }
                    `}
                  >
                    {isActive ? (
                      <>
                        <ToggleLeft className="w-3 h-3 inline mr-1" />
                        Revoke
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-3 h-3 inline mr-1" />
                        Grant
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
          
          {getControllerCandidates().length === 0 && (
            <div className="text-slate-400 text-sm text-center py-4">
              No other participants in meeting
            </div>
          )}
        </div>
      </div>

      {!isHost && (
        <div className="mt-4 p-2 bg-yellow-900 border border-yellow-700 rounded">
          <div className="text-yellow-300 text-xs">
            Only the meeting host can control remote access
          </div>
        </div>
      )}
    </div>
  );
}
