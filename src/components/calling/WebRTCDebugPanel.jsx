/**
 * WebRTCDebugPanel - Debug panel for WebRTC connection stats and diagnostics
 * Shows connection quality, bitrate, resolution, and other WebRTC metrics
 */

import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export function WebRTCDebugPanel() {
  const [stats, setStats] = useState({
    connected: false,
    iceConnectionState: 'disconnected',
    connectionState: 'disconnected',
    bitrate: 0,
    resolution: { width: 0, height: 0 },
    fps: 0,
    codec: 'Unknown',
    packetsLost: 0,
    rtt: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor WebRTC stats if peer connection is available globally
    const interval = setInterval(() => {
      if (window.peerConnection) {
        updateStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateStats = async () => {
    try {
      const pc = window.peerConnection;
      if (!pc) return;

      const connectionState = pc.connectionState || 'disconnected';
      const iceConnectionState = pc.iceConnectionState || 'disconnected';
      
      let bitrate = 0;
      let codec = 'Unknown';
      let packetsLost = 0;
      let rtt = 0;

      try {
        const stats = await pc.getStats();
        let lastBytesReceived = 0;
        let lastTimestamp = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            // Calculate bitrate
            if (lastBytesReceived && lastTimestamp) {
              const timeDiff = (report.timestamp - lastTimestamp) / 1000; // seconds
              const bytesDiff = report.bytesReceived - lastBytesReceived;
              bitrate = Math.round((bytesDiff * 8) / timeDiff); // bits per second
            }
            lastBytesReceived = report.bytesReceived;
            lastTimestamp = report.timestamp;

            // Get resolution and FPS
            if (report.frameWidth && report.frameHeight) {
              stats.resolution = {
                width: report.frameWidth,
                height: report.frameHeight
              };
            }
            if (report.framesPerSecond) {
              stats.fps = report.framesPerSecond;
            }
            if (report.packetsLost) {
              packetsLost = report.packetsLost;
            }
          }

          if (report.type === 'codec') {
            codec = report.mimeType || 'Unknown';
          }

          if (report.type === 'remote-candidate' && report.roundTripTime) {
            rtt = report.roundTripTime;
          }
        });
      } catch (err) {
        console.error('[WebRTCDebugPanel] Error getting stats:', err);
      }

      setStats({
        connected: connectionState === 'connected',
        connectionState,
        iceConnectionState,
        bitrate,
        resolution: stats.resolution,
        fps: stats.fps,
        codec,
        packetsLost,
        rtt,
      });
    } catch (err) {
      console.error('[WebRTCDebugPanel] Update stats error:', err);
    }
  };

  const getConnectionIcon = () => {
    if (!stats.connected) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (stats.bitrate > 1000000) return <Wifi className="w-4 h-4 text-green-500" />;
    return <Wifi className="w-4 h-4 text-yellow-500" />;
  };

  const getConnectionColor = () => {
    if (!stats.connected) return 'text-red-600';
    if (stats.bitrate > 1000000) return 'text-green-600';
    return 'text-yellow-600';
  };

  const formatBitrate = (bits) => {
    if (bits < 1000) return `${bits} bps`;
    if (bits < 1000000) return `${(bits / 1000).toFixed(1)} Kbps`;
    return `${(bits / 1000000).toFixed(1)} Mbps`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        title="Show WebRTC Debug Panel"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {getConnectionIcon()}
          <h3 className="font-semibold text-sm">WebRTC Debug</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Connection Status */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Connection:</span>
          <span className={getConnectionColor()}>
            {stats.connectionState}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">ICE State:</span>
          <span className={getConnectionColor()}>
            {stats.iceConnectionState}
          </span>
        </div>

        {/* Quality Metrics */}
        {stats.connected && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Bitrate:</span>
              <span className="text-blue-400">
                {formatBitrate(stats.bitrate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resolution:</span>
              <span className="text-green-400">
                {stats.resolution.width}×{stats.resolution.height}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FPS:</span>
              <span className="text-yellow-400">
                {stats.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Codec:</span>
              <span className="text-purple-400">
                {stats.codec}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Packets Lost:</span>
              <span className={stats.packetsLost > 0 ? 'text-red-400' : 'text-green-400'}>
                {stats.packetsLost}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RTT:</span>
              <span className="text-orange-400">
                {stats.rtt} ms
              </span>
            </div>
          </>
        )}

        {/* Quality Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {stats.connected ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-500 text-xs">
                  {stats.bitrate > 5000000 ? 'High Quality' : 
                   stats.bitrate > 1000000 ? 'Medium Quality' : 'Low Quality'}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-500 text-xs">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-gray-500 text-xs">
            <div>High Quality Target:</div>
            <div>• 8 Mbps bitrate</div>
            <div>• 30 FPS</div>
            <div>• Full RGB color</div>
            <div>• H264/VP9 codec</div>
          </div>
        </div>
      </div>
    </div>
  );
}
