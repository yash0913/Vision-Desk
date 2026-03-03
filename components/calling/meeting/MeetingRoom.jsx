import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Copy,
  Check,
  Users,
} from 'lucide-react';
import MeetingTile from './MeetingTile.jsx';
import { WebRTCManager } from '../calling.webrtc.js';
import { callingApi } from '../calling.api.js';

export default function MeetingRoom({
  meetingId,
  userName,
  initialAudioEnabled = true,
  initialVideoEnabled = true,
  webrtcManager: externalManager,
  localStream: externalStream,
  onLeave,
}) {
  const [webrtcManager, setWebrtcManager] = useState(externalManager);
  const [localStream, setLocalStream] = useState(externalStream);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudioEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideoEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [meetingIdCopied, setMeetingIdCopied] = useState(false);

  useEffect(() => {
    if (!webrtcManager) {
      const manager = new WebRTCManager();
      setWebrtcManager(manager);

      manager
        .initializeLocalStream({
          audio: initialAudioEnabled,
          video: initialVideoEnabled,
        })
        .then((stream) => {
          setLocalStream(stream);
          setParticipants([
            {
              id: 'local',
              name: userName || 'You',
              stream,
              isLocal: true,
              isAudioEnabled: initialAudioEnabled,
              isVideoEnabled: initialVideoEnabled,
            },
          ]);
        })
        .catch((error) => {
          console.error('Error initializing local stream:', error);
        });
    } else {
      setLocalStream(externalStream);
      setParticipants([
        {
          id: 'local',
          name: userName || 'You',
          stream: externalStream,
          isLocal: true,
          isAudioEnabled: initialAudioEnabled,
          isVideoEnabled: initialVideoEnabled,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (!webrtcManager) return;

    webrtcManager.onRemoteStream = (peerId, stream) => {
      setParticipants((prev) => {
        const existing = prev.find((p) => p.id === peerId);
        if (existing) {
          return prev.map((p) =>
            p.id === peerId ? { ...p, stream } : p
          );
        }
        return [
          ...prev,
          {
            id: peerId,
            name: `Participant ${peerId.slice(0, 8)}`,
            stream,
            isLocal: false,
            isAudioEnabled: true,
            isVideoEnabled: true,
          },
        ];
      });
    };

    webrtcManager.onConnectionStateChange = (peerId, state) => {
      if (state === 'disconnected' || state === 'failed') {
        setParticipants((prev) => prev.filter((p) => p.id !== peerId));
      }
    };

    const activeSpeakerInterval = setInterval(() => {
      if (participants.length > 1) {
        const randomParticipant =
          participants[Math.floor(Math.random() * participants.length)];
        if (randomParticipant && !randomParticipant.isLocal) {
          setActiveSpeakerId(randomParticipant.id);
        }
      }
    }, 3000);

    return () => {
      clearInterval(activeSpeakerInterval);
    };
  }, [webrtcManager, participants.length]);

  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    if (webrtcManager) {
      webrtcManager.toggleAudio(newState);
    }
    setParticipants((prev) =>
      prev.map((p) =>
        p.isLocal ? { ...p, isAudioEnabled: newState } : p
      )
    );
  }, [isAudioEnabled, webrtcManager]);

  const toggleVideo = useCallback(async () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    if (webrtcManager) {
      await webrtcManager.toggleVideo(newState);
    }
    setParticipants((prev) =>
      prev.map((p) =>
        p.isLocal ? { ...p, isVideoEnabled: newState } : p
      )
    );
  }, [isVideoEnabled, webrtcManager]);

  const handleScreenShare = useCallback(async () => {
    if (!webrtcManager) return;

    try {
      if (isScreenSharing) {
        await webrtcManager.stopScreenShare();
        setIsScreenSharing(false);
        setParticipants((prev) => prev.filter((p) => p.id !== 'screenshare'));
      } else {
        const screenStream = await webrtcManager.startScreenShare();
        setIsScreenSharing(true);
        setParticipants((prev) => {
          const existing = prev.find((p) => p.id === 'screenshare');
          if (existing) {
            return prev.map((p) =>
              p.id === 'screenshare' ? { ...p, stream: screenStream } : p
            );
          }
          return [
            ...prev,
            {
              id: 'screenshare',
              name: `${userName}'s screen`,
              stream: screenStream,
              isLocal: true,
              isScreenShare: true,
              isAudioEnabled: true,
              isVideoEnabled: true,
            },
          ];
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [isScreenSharing, webrtcManager, userName]);

  const handleLeave = useCallback(() => {
    if (webrtcManager) {
      webrtcManager.cleanup();
    }
    if (onLeave) {
      onLeave();
    }
  }, [webrtcManager, onLeave]);

  const copyMeetingId = useCallback(() => {
    navigator.clipboard.writeText(meetingId);
    setMeetingIdCopied(true);
    setTimeout(() => setMeetingIdCopied(false), 2000);
  }, [meetingId]);

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0B1120] text-slate-50 overflow-hidden">
      
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-3 sm:px-6 py-2 sm:py-3 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-xs sm:text-sm font-medium text-slate-300">
              Meeting
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-700"></div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-400">
              {participants.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-2 sm:px-3 py-1">
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 truncate max-w-[90px] sm:max-w-none">
              {meetingId}
            </span>
            <button
              onClick={copyMeetingId}
              className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              {meetingIdCopied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 min-h-0 overflow-auto p-2 sm:p-4">
        <div className="grid gap-3 sm:gap-4 h-full auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {participants.map((participant) => (
            <MeetingTile
              key={participant.id}
              stream={participant.stream}
              isLocal={participant.isLocal}
              isActiveSpeaker={activeSpeakerId === participant.id}
              isScreenShare={participant.isScreenShare}
              participantName={participant.name}
              isAudioEnabled={participant.isAudioEnabled}
              isVideoEnabled={participant.isVideoEnabled}
              onAudioToggle={participant.isLocal ? toggleAudio : undefined}
              onVideoToggle={participant.isLocal ? toggleVideo : undefined}
            />
          ))}
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          
          <button
            onClick={toggleAudio}
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all ${
              isAudioEnabled
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all ${
              isVideoEnabled
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>

          <button
            onClick={handleScreenShare}
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all ${
              isScreenSharing
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={handleLeave}
            className="flex h-10 sm:h-12 items-center gap-2 rounded-full bg-red-600 px-4 sm:px-6 text-white transition-colors hover:bg-red-500"
          >
            <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base font-medium">
              Leave
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}