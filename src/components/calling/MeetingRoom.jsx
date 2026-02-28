/**
 * MeetingRoom - Full meeting interface with Zoom-style UI
 * Includes bottom toolbar, grid layout, and all meeting controls
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Users,
  MessageSquare,
  Smile,
  Share2,
  Settings,
  Info,
  MoreVertical,
} from 'lucide-react';
import { useDeskLinkWebRTC } from '../../modules/desklink/hooks/useDeskLinkWebRTC.js';

export default function MeetingRoom({
  roomId,
  userName,
  isHost = false,
  initialAudioEnabled = true,
  initialVideoEnabled = true,
  localStream: externalStream,
  onLeave,
  sessionId,
  remoteDeviceId,
  sessionToken,
  token,
}) {
  const userId = useMemo(() => crypto.randomUUID(), []);

  const {
    connectionState,
    iceConnectionState,
    remoteStream,
    stats,
    startAsCaller,
    handleOffer,
    addIceCandidate,
    sendControlMessage,
    stopSession,
    setOnDataMessage,
    setOnConnected,
    setOnDisconnected,
  } = useDeskLinkWebRTC();

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [isAnyDeskActive, setIsAnyDeskActive] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  // Update remote video
  useEffect(() => {
    if (remoteVideoRefs.current.get('remote') && remoteStream) {
      remoteVideoRefs.current.get('remote').srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle connection events
  useEffect(() => {
    setOnConnected(() => {
      console.log('[MeetingRoom] WebRTC connected');
    });
    
    setOnDisconnected(() => {
      console.log('[MeetingRoom] WebRTC disconnected');
    });
    
    setOnDataMessage((message) => {
      console.log('[MeetingRoom] Data message received:', message);
    });
  }, [setOnConnected, setOnDisconnected, setOnDataMessage]);

  // Start WebRTC connection when we have all required data
  useEffect(() => {
    if (!sessionId || !remoteDeviceId || !userId || !sessionToken) {
      console.log('[MeetingRoom] Waiting for connection data:', {
        sessionId: !!sessionId,
        remoteDeviceId: !!remoteDeviceId,
        userId: !!userId,
        sessionToken: !!sessionToken
      });
      return;
    }

    console.log('[MeetingRoom] Starting WebRTC connection');
    startAsCaller({
      sessionId,
      authToken: token,
      sessionToken,
      localUserId: userId,
      localDeviceId: `web-${userId}`,
      remoteDeviceId,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
  }, [sessionId, remoteDeviceId, userId, sessionToken, token, startAsCaller]);

  const handleLeave = useCallback(() => {
    stopSession();
    if (onLeave) {
      onLeave();
    }
  }, [stopSession, onLeave]);

  // Calculate grid layout
  const getGridCols = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    if (count <= 16) return 'grid-cols-4';
    return 'grid-cols-5';
  };

  const allParticipants = [
    ...(remoteStream ? [{
      id: 'remote',
      name: 'Remote Desktop',
      stream: remoteStream,
      isLocal: false,
      isScreenShare: false,
    }] : []),
  ].filter((p) => p.stream);

  const totalParticipants = allParticipants.length;

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0F172A] text-white overflow-hidden">
      {/* Video Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`grid ${getGridCols(totalParticipants)} gap-4 h-full`}>
          {allParticipants.map((participant) => {
            // Create ref if it doesn't exist
            if (!remoteVideoRefs.current.get(participant.id)) {
              const ref = React.createRef();
              remoteVideoRefs.current.set(participant.id, ref);
            }

            return (
              <div
                key={participant.id}
                className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 ring-2 ring-slate-800"
              >
                {participant.stream ? (
                  <video
                    ref={remoteVideoRefs.current.get(participant.id)}
                    autoPlay
                    playsInline
                    muted={false}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700">
                        <span className="text-2xl font-semibold text-slate-300">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-300">{participant.name}</span>
                      <span className="text-xs text-slate-400">Connection State: {connectionState}</span>
                      <span className="text-xs text-slate-400">ICE State: {iceConnectionState}</span>
                    </div>
                  </div>
                )}

                {/* Username overlay - lower left corner */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{participant.name}</span>
                    <div className="flex items-center gap-1">
                      {connectionState === 'connected' && (
                        <div className="flex h-2 w-2 items-center justify-center rounded-full bg-green-500"></div>
                      )}
                      {connectionState !== 'connected' && (
                        <div className="flex h-2 w-2 items-center justify-center rounded-full bg-yellow-500"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Toolbar - Simplified for Remote Desktop */}
      <div className="border-t border-slate-800 bg-[#1E293B] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - Connection info */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Connection: <span className="font-mono text-white">{connectionState}</span>
            </div>
            <div className="text-sm text-slate-400">
              ICE: <span className="font-mono text-white">{iceConnectionState}</span>
            </div>
          </div>

          {/* Center - Main controls */}
          <div className="flex items-center gap-2">
            {/* Leave button */}
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Session</span>
            </button>
          </div>

          {/* Right side - Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div>Bitrate: {Math.round(stats.bitrate)} kbps</div>
            <div>RTT: {stats.rtt} ms</div>
            <div>FPS: {stats.fps}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
              
