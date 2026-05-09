import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { getUser } from '../utils/auth';
import { io } from 'socket.io-client';
import { sendMessage } from '../services/api/chat';
import { getIceConfig } from '../services/api/rtc';
import { useCall } from '../context/CallContext';
import { API_BASE_URL } from '../../config/env';
import { getAppointmentCallState, leaveAppointmentCall } from '../services/api/appointments';
import { getDoctorAppointmentCallState, leaveDoctorAppointmentCall } from '../services/api/doctor';

export default function VideoConsultation() {
    const { roomId: routeRoomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();
    
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);
    const socket = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const iceCandidateQueue = useRef([]);
    const hasSentCallEndedRef = useRef(false);
    const hasSentLeaveCallRef = useRef(false);
    const selfSidRef = useRef(null);
    const remoteSidRef = useRef(null);
    const makingOfferRef = useRef(false);
    const ignoreOfferRef = useRef(false);
    const politeRef = useRef(false);
    const pendingLocalIceRef = useRef([]);
    const reconnectAttemptsRef = useRef(0);
    const restartDebounceRef = useRef(null);
    const hasSentInitialOfferRef = useRef(false);
    const hasSeenActiveCallRef = useRef(false);
    const { endActiveCall, activeCall } = useCall();
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);
    const [needsAudioResume, setNeedsAudioResume] = useState(false);
    const [mediaError, setMediaError] = useState('');
    const [resolvedRoomId, setResolvedRoomId] = useState(null);
    const [isResolvingRoom, setIsResolvingRoom] = useState(true);
    const [debugInfo, setDebugInfo] = useState({
        socketStatus: 'idle',
        peerRole: 'unknown',
        connectionState: 'new',
        iceConnectionState: 'new',
        signalingState: 'new',
        remoteStreamStatus: 'none',
        localTracks: 0,
        remoteTracks: 0,
        iceServerCount: 0,
        hasTurn: false,
        selfSid: '',
        remoteSid: '',
        lastEvent: 'initialising',
    });

    const getAppointmentIdFromRoom = (roomValue) => {
        if (!roomValue) return null;
        const appointmentPattern = /^appointment-(\d+)$/;
        const roomPattern = /^room_(\d+)_/;
        const apptMatch = String(roomValue).match(appointmentPattern);
        if (apptMatch?.[1]) return Number(apptMatch[1]);
        const roomMatch = String(roomValue).match(roomPattern);
        if (roomMatch?.[1]) return Number(roomMatch[1]);
        return null;
    };

    const stateAppointmentId = Number(location?.state?.appointmentId);
    const parsedAppointmentId = Number.isInteger(stateAppointmentId) && stateAppointmentId > 0
        ? stateAppointmentId
        : getAppointmentIdFromRoom(routeRoomId);
    const hasReturnedToChatRef = useRef(false);

    const roomId = resolvedRoomId || routeRoomId;
    const socketRoom = useMemo(() => (roomId ? `consult_${roomId}` : ''), [roomId]);

    const logVideoEvent = useCallback((event, details = {}) => {
        console.log(`[VideoConsultation] ${event}`, {
            routeRoomId,
            resolvedRoomId: resolvedRoomId || routeRoomId,
            socketRoom: (resolvedRoomId || routeRoomId) ? `consult_${resolvedRoomId || routeRoomId}` : null,
            appointmentId: parsedAppointmentId,
            role: user?.role,
            ...details,
        });
        setDebugInfo((prev) => ({
            ...prev,
            lastEvent: event,
            ...details.debug,
        }));
    }, [parsedAppointmentId, resolvedRoomId, routeRoomId, user?.role]);

    useEffect(() => {
        let cancelled = false;

        const resolveAppointmentRoom = async () => {
            if (!parsedAppointmentId) {
                setResolvedRoomId(routeRoomId || null);
                setIsResolvingRoom(false);
                return;
            }

            setIsResolvingRoom(true);
            try {
                const payload = user?.role === 'doctor'
                    ? await getDoctorAppointmentCallState(parsedAppointmentId)
                    : await getAppointmentCallState(parsedAppointmentId);
                if (cancelled) return;
                const canonicalRoomId = payload?.room_id || routeRoomId;
                setResolvedRoomId(canonicalRoomId);
                console.log('[VideoConsultation] appointment room resolved', {
                    routeRoomId,
                    canonicalRoomId,
                    appointmentId: parsedAppointmentId,
                    role: user?.role,
                });
                setDebugInfo((prev) => ({ ...prev, lastEvent: 'appointment room resolved' }));
            } catch (err) {
                if (cancelled) return;
                console.warn('[VideoConsultation] Failed to resolve appointment room, using route room id', err);
                setResolvedRoomId(routeRoomId || null);
                console.log('[VideoConsultation] appointment room resolve failed', {
                    routeRoomId,
                    appointmentId: parsedAppointmentId,
                    error: err?.response?.data || err?.message,
                });
                setDebugInfo((prev) => ({ ...prev, lastEvent: 'appointment room resolve failed' }));
            } finally {
                if (!cancelled) setIsResolvingRoom(false);
            }
        };

        resolveAppointmentRoom();
        return () => {
            cancelled = true;
        };
    }, [parsedAppointmentId, routeRoomId, user?.role]);

    const getChatReturnTarget = useCallback(() => {
        const currentUserId = user?.id;
        const activeConversationId = activeCall?.conversation_id || Number(routeRoomId);
        const callerId = activeCall?.caller_id;
        const receiverId = activeCall?.receiver_id;
        const otherUserId = String(callerId) === String(currentUserId) ? receiverId : callerId;

        if (user?.role === 'doctor') {
            if (otherUserId) {
                return {
                    pathname: '/doctor/chat',
                    search: `?patientId=${otherUserId}`,
                };
            }
            return { pathname: '/doctor/chat', search: '' };
        }

        return {
            pathname: '/messages',
            search: '',
            state: {
                conversationId: activeConversationId || null,
                otherUserId: otherUserId || null,
            },
        };
    }, [activeCall?.caller_id, activeCall?.conversation_id, activeCall?.receiver_id, routeRoomId, user?.id, user?.role]);

    const returnToChat = useCallback(() => {
        if (hasReturnedToChatRef.current) return;
        hasReturnedToChatRef.current = true;
        const target = getChatReturnTarget();
        navigate(`${target.pathname}${target.search || ''}`, {
            replace: true,
            state: target.state,
        });
    }, [getChatReturnTarget, navigate]);

    const leaveAppointmentSession = useCallback(async () => {
        if (!Number.isInteger(parsedAppointmentId) || hasSentLeaveCallRef.current) return;
        hasSentLeaveCallRef.current = true;
        try {
            if (user?.role === 'doctor') {
                await leaveDoctorAppointmentCall(parsedAppointmentId);
            } else if (user?.role === 'patient') {
                await leaveAppointmentCall(parsedAppointmentId);
            }
        } catch (err) {
            console.error("Failed to close appointment call session:", err);
        }
    }, [parsedAppointmentId, user?.role]);

    useEffect(() => {
        if (activeCall?.call_id) {
            hasSeenActiveCallRef.current = true;
        }
    }, [activeCall?.call_id]);

    useEffect(() => {
        if (isResolvingRoom || !roomId || !socketRoom) return undefined;

        const room = socketRoom;
        let isDisposed = false;
        let joinRetryTimer = null;
        let restartTimer = null;

        logVideoEvent('consultation effect start', {
            roomId,
            socketRoom: room,
            routeRoomId,
        });

        const ensureRemotePlayback = async () => {
            if (!remoteVideo.current) return;
            remoteVideo.current.muted = false;
            remoteVideo.current.volume = 1;
            try {
                await remoteVideo.current.play();
                setNeedsAudioResume(false);
            } catch (err) {
                console.warn("Remote autoplay blocked until user interaction:", err);
                setNeedsAudioResume(true);
            }
        };

        const flushQueuedIceCandidates = async () => {
            if (!peerConnection.current) return;
            logVideoEvent('queued ICE flush start', {
                count: iceCandidateQueue.current.length,
            });
            while (iceCandidateQueue.current.length > 0) {
                const candidate = iceCandidateQueue.current.shift();
                await peerConnection.current.addIceCandidate(candidate);
                logVideoEvent('queued ICE candidate added', {
                    candidateType: candidate?.type,
                    candidateProtocol: candidate?.protocol,
                });
            }
        };

        const flushPendingLocalIce = () => {
            if (!socket.current || !remoteSidRef.current) return;
            logVideoEvent('pending local ICE flush start', {
                count: pendingLocalIceRef.current.length,
                to: remoteSidRef.current,
            });
            while (pendingLocalIceRef.current.length > 0) {
                const candidate = pendingLocalIceRef.current.shift();
                socket.current.emit("ice_candidate", {
                    room,
                    to: remoteSidRef.current,
                    candidate,
                });
                logVideoEvent('pending local ICE candidate sent', {
                    to: remoteSidRef.current,
                    candidateType: candidate?.type,
                    candidateProtocol: candidate?.protocol,
                });
            }
        };

        const createAndSendOffer = async () => {
            if (!peerConnection.current || !socket.current || !remoteSidRef.current) {
                logVideoEvent('offer skipped: missing peer/socket', {
                    hasPeerConnection: Boolean(peerConnection.current),
                    hasSocket: Boolean(socket.current),
                    remoteSid: remoteSidRef.current,
                });
                return;
            }
            if (makingOfferRef.current) {
                logVideoEvent('offer skipped: already making offer');
                return;
            }
            if (peerConnection.current.signalingState !== "stable") {
                logVideoEvent('offer skipped: signaling not stable', {
                    signalingState: peerConnection.current.signalingState,
                });
                return;
            }
            // Prevent repeated offer churn that can freeze media after initial connect.
            if (hasSentInitialOfferRef.current && peerConnection.current.remoteDescription?.type) {
                logVideoEvent('offer skipped: initial offer already completed', {
                    remoteDescriptionType: peerConnection.current.remoteDescription.type,
                });
                return;
            }
            try {
                makingOfferRef.current = true;
                logVideoEvent('createOffer start', {
                    to: remoteSidRef.current,
                    signalingState: peerConnection.current.signalingState,
                });
                const offer = await peerConnection.current.createOffer();
                logVideoEvent('createOffer success', {
                    sdpType: offer?.type,
                });
                await peerConnection.current.setLocalDescription(offer);
                logVideoEvent('setLocalDescription offer success', {
                    signalingState: peerConnection.current.signalingState,
                });
                socket.current.emit("webrtc_offer", {
                    room,
                    to: remoteSidRef.current,
                    offer: peerConnection.current.localDescription,
                });
                hasSentInitialOfferRef.current = true;
                flushPendingLocalIce();
                logVideoEvent('webrtc_offer sent', {
                    room,
                    to: remoteSidRef.current,
                });
            } catch (err) {
                console.error("Error creating/sending offer:", err);
                logVideoEvent('createOffer failed', {
                    error: err?.message || String(err),
                });
            } finally {
                makingOfferRef.current = false;
            }
        };

        const restartIceAndRenegotiate = async () => {
            if (!peerConnection.current || !remoteSidRef.current) return;
            if (makingOfferRef.current) return;
            try {
                reconnectAttemptsRef.current += 1;
                const offer = await peerConnection.current.createOffer({ iceRestart: true });
                await peerConnection.current.setLocalDescription(offer);
                socket.current?.emit("webrtc_offer", {
                    room,
                    to: remoteSidRef.current,
                    offer: peerConnection.current.localDescription,
                });
                flushPendingLocalIce();
                logVideoEvent('ICE restart offer sent', {
                    attempt: reconnectAttemptsRef.current,
                    to: remoteSidRef.current,
                });
            } catch (err) {
                console.error("ICE restart renegotiation failed:", err);
                logVideoEvent('ICE restart failed', {
                    error: err?.message || String(err),
                });
            }
        };

        const getIceServers = async () => {
            try {
                const data = await getIceConfig();
                if (Array.isArray(data?.iceServers) && data.iceServers.length > 0) {
                    const hasTurn = data.iceServers.some((server) => {
                        const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
                        return urls.some((url) => String(url || '').startsWith('turn'));
                    });
                    logVideoEvent('ICE config loaded', {
                        iceServerCount: data.iceServers.length,
                        hasTurn,
                        debug: {
                            iceServerCount: data.iceServers.length,
                            hasTurn,
                        },
                    });
                    return data.iceServers;
                }
            } catch (err) {
                console.warn("Failed to fetch ICE config, using fallback STUN.", err);
                logVideoEvent('ICE config fallback', {
                    error: err?.message || String(err),
                });
            }
            return [{ urls: "stun:stun.l.google.com:19302" }];
        };

        const notifyCallEnded = async () => {
            if (hasSentCallEndedRef.current) return;
            const conversationId = Number(roomId);
            if (!Number.isInteger(conversationId)) return;
            // Consultation lifecycle chat card is initiator-only.
            // Only the caller publishes the call_ended status update.
            if (!activeCall?.caller_id || String(activeCall.caller_id) !== String(user?.id)) return;
            hasSentCallEndedRef.current = true;
            const roleLabel = user?.role === 'doctor' ? 'Doctor' : 'Patient';
            try {
                await sendMessage(
                    conversationId,
                    `${roleLabel} ended the consultation.`,
                    'call_ended',
                );
            } catch (err) {
                console.error("Failed to send call_ended message:", err);
            }
        };

        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                if (isDisposed) return;
                setMediaError('');

                localStreamRef.current = stream;
                if (localVideo.current) {
                    localVideo.current.srcObject = stream;
                }
                logVideoEvent('local media ready', {
                    videoTracks: stream.getVideoTracks().length,
                    audioTracks: stream.getAudioTracks().length,
                    debug: { localTracks: stream.getTracks().length },
                });

                const iceServers = await getIceServers();
                peerConnection.current = new RTCPeerConnection({
                    iceServers,
                });
                logVideoEvent('RTCPeerConnection created', {
                    iceServerCount: iceServers.length,
                    debug: {
                        connectionState: peerConnection.current.connectionState,
                        iceConnectionState: peerConnection.current.iceConnectionState,
                        signalingState: peerConnection.current.signalingState,
                    },
                });
                remoteStreamRef.current = new MediaStream();
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = remoteStreamRef.current;
                    remoteVideo.current.muted = false;
                    remoteVideo.current.volume = 1;
                }

                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });

                peerConnection.current.ontrack = (event) => {
                    if (!remoteVideo.current) return;
                    logVideoEvent('ontrack fired', {
                        trackKind: event.track?.kind,
                        trackId: event.track?.id,
                        streamCount: event.streams?.length || 0,
                        debug: {
                            remoteStreamStatus: 'ontrack',
                        },
                    });
                    // Safari/Brave mobile may deliver track events with empty event.streams.
                    // Build/maintain the remote MediaStream manually for maximum compatibility.
                    if (event.streams && event.streams[0]) {
                        if (remoteVideo.current.srcObject !== event.streams[0]) {
                            remoteVideo.current.srcObject = event.streams[0];
                        }
                    } else if (remoteStreamRef.current && event.track) {
                        const alreadyExists = remoteStreamRef.current
                            .getTracks()
                            .some((track) => track.id === event.track.id);
                        if (!alreadyExists) {
                            remoteStreamRef.current.addTrack(event.track);
                        }
                        remoteVideo.current.srcObject = remoteStreamRef.current;
                    }
                    const tracks = remoteVideo.current.srcObject?.getTracks?.() || [];
                    logVideoEvent('remote stream attached', {
                        trackCount: tracks.length,
                        videoTracks: remoteVideo.current.srcObject?.getVideoTracks?.().length || 0,
                        audioTracks: remoteVideo.current.srcObject?.getAudioTracks?.().length || 0,
                        muted: remoteVideo.current.muted,
                        debug: {
                            remoteStreamStatus: tracks.length ? 'attached' : 'empty',
                            remoteTracks: tracks.length,
                        },
                    });
                    void ensureRemotePlayback();
                    setIsRemoteConnected(true);
                };

                peerConnection.current.onconnectionstatechange = () => {
                    const state = peerConnection.current?.connectionState;
                    console.log("WebRTC connectionState:", state);
                    logVideoEvent('connectionState changed', {
                        state,
                        debug: { connectionState: state || 'unknown' },
                    });
                    if (state === "connected") {
                        reconnectAttemptsRef.current = 0;
                        if (restartDebounceRef.current) {
                            clearTimeout(restartDebounceRef.current);
                            restartDebounceRef.current = null;
                        }
                        setIsRemoteConnected(true);
                        return;
                    }

                    if (state === "disconnected" || state === "failed" || state === "closed") {
                        setIsRemoteConnected(false);
                    }

                    if (state === "failed" && reconnectAttemptsRef.current < 3) {
                        void restartIceAndRenegotiate();
                        return;
                    }

                    // Some browsers briefly go "disconnected" while renegotiating.
                    if (state === "disconnected" && reconnectAttemptsRef.current < 3) {
                        if (restartDebounceRef.current) clearTimeout(restartDebounceRef.current);
                        restartDebounceRef.current = setTimeout(() => {
                            void restartIceAndRenegotiate();
                        }, 1500);
                    }
                };
                // Intentionally avoid automatic onnegotiationneeded offer creation.
                // Offers are driven by explicit signaling roles (video_peer.shouldOffer)
                // to prevent glare/duplicate offers that can cause one-way/frozen video.
                peerConnection.current.oniceconnectionstatechange = () => {
                    console.log("WebRTC iceConnectionState:", peerConnection.current?.iceConnectionState);
                    logVideoEvent('iceConnectionState changed', {
                        state: peerConnection.current?.iceConnectionState,
                        debug: { iceConnectionState: peerConnection.current?.iceConnectionState || 'unknown' },
                    });
                };
                peerConnection.current.onsignalingstatechange = () => {
                    logVideoEvent('signalingState changed', {
                        state: peerConnection.current?.signalingState,
                        debug: { signalingState: peerConnection.current?.signalingState || 'unknown' },
                    });
                };
                
                const token = localStorage.getItem("neuronest_token");
                const API_URL = API_BASE_URL;
                socket.current = io(API_URL, {
                    transports: ['websocket', 'polling'],
                    query: { token },
                    reconnection: true,
                    reconnectionAttempts: Infinity,
                    reconnectionDelay: 500,
                    reconnectionDelayMax: 2000,
                    timeout: 10000,
                });

                peerConnection.current.onicecandidate = (event) => {
                    if (!event.candidate) {
                        logVideoEvent('local ICE gathering complete');
                        return;
                    }
                    if (!socket.current) {
                        logVideoEvent('local ICE candidate skipped: socket missing');
                        return;
                    }
                    if (!remoteSidRef.current) {
                        pendingLocalIceRef.current.push(event.candidate);
                        logVideoEvent('local ICE candidate queued', {
                            candidateType: event.candidate?.type,
                            candidateProtocol: event.candidate?.protocol,
                            queueLength: pendingLocalIceRef.current.length,
                        });
                        return;
                    }
                    socket.current.emit("ice_candidate", {
                        room,
                        to: remoteSidRef.current,
                        candidate: event.candidate,
                    });
                    logVideoEvent('ice_candidate sent', {
                        to: remoteSidRef.current,
                        candidateType: event.candidate?.type,
                        candidateProtocol: event.candidate?.protocol,
                    });
                };

                socket.current.on("connect_error", (err) => {
                    console.error("Video socket connect_error:", err?.message || err);
                    logVideoEvent('socket connect_error', {
                        error: err?.message || String(err),
                        debug: { socketStatus: 'connect_error' },
                    });
                });

                socket.current.on("connect", () => {
                    selfSidRef.current = socket.current?.id || null;
                    hasSentInitialOfferRef.current = false;
                    logVideoEvent('socket connected; join room', {
                        sid: selfSidRef.current,
                        room,
                        debug: {
                            socketStatus: 'connected',
                            selfSid: selfSidRef.current || '',
                        },
                    });
                    socket.current?.emit("join_video_room", { room });
                });

                socket.current.on("room_joined", (payload) => {
                    console.log("Video room joined:", payload);
                    logVideoEvent('room_joined received', {
                        payload,
                        debug: {
                            socketStatus: 'room_joined',
                            selfSid: payload?.sid || selfSidRef.current || '',
                        },
                    });
                });

                socket.current.on("video_room_state", async ({ participants }) => {
                    if (!Array.isArray(participants) || !selfSidRef.current) return;
                    const remoteParticipants = participants.filter((sid) => sid !== selfSidRef.current);
                    remoteSidRef.current = remoteParticipants[0] || null;
                    politeRef.current = participants[0] !== selfSidRef.current;
                    logVideoEvent('video_room_state received', {
                        participants,
                        remoteSid: remoteSidRef.current,
                        isPolite: politeRef.current,
                        debug: {
                            remoteSid: remoteSidRef.current || '',
                            peerRole: politeRef.current ? 'polite' : 'impolite',
                        },
                    });
                    if (!remoteSidRef.current) {
                        setIsRemoteConnected(false);
                        hasSentInitialOfferRef.current = false;
                    }
                });

                socket.current.on("video_peer", async ({ peerSid, isPolite, shouldOffer }) => {
                    remoteSidRef.current = peerSid || null;
                    politeRef.current = Boolean(isPolite);
                    logVideoEvent('video_peer received', {
                        peerSid,
                        isPolite,
                        shouldOffer,
                        debug: {
                            remoteSid: peerSid || '',
                            peerRole: isPolite ? 'polite' : 'impolite',
                        },
                    });
                    flushPendingLocalIce();
                    if (shouldOffer && remoteSidRef.current) {
                        console.log("WebRTC: peer role says shouldOffer", { peerSid, isPolite });
                        await createAndSendOffer();
                    }
                });

                socket.current.on("room_full", () => {
                    alert("Consultation room is full. Only two participants are allowed.");
                    returnToChat();
                });

                socket.current.on("user_joined", ({ sid }) => {
                    remoteSidRef.current = sid || remoteSidRef.current;
                    logVideoEvent('user_joined received', {
                        sid,
                        remoteSid: remoteSidRef.current,
                        debug: { remoteSid: remoteSidRef.current || '' },
                    });
                    flushPendingLocalIce();
                    // Fallback: if role event is delayed, caller can still issue one initial offer.
                    if (!politeRef.current && remoteSidRef.current && !hasSentInitialOfferRef.current) {
                        void createAndSendOffer();
                    }
                });

                socket.current.on("user_left", () => {
                    logVideoEvent('user_left received');
                    remoteSidRef.current = null;
                    setIsRemoteConnected(false);
                    hasSentInitialOfferRef.current = false;
                    ignoreOfferRef.current = false;
                    if (remoteVideo.current) {
                        remoteVideo.current.srcObject = null;
                    }
                    remoteStreamRef.current = new MediaStream();
                });

                socket.current.on("webrtc_offer", async (data) => {
                    if (!peerConnection.current) return;
                    try {
                        const offer = data?.offer;
                        if (!offer) return;
                        if (data?.from) remoteSidRef.current = data.from;
                        logVideoEvent('webrtc_offer received', {
                            from: data?.from,
                            offerType: offer?.type,
                            signalingState: peerConnection.current.signalingState,
                            debug: { remoteSid: remoteSidRef.current || '' },
                        });
                        const offerCollision = makingOfferRef.current || peerConnection.current.signalingState !== "stable";
                        if (offerCollision) {
                            if (!politeRef.current) {
                                console.log("WebRTC: dropping colliding offer (impolite peer)");
                                logVideoEvent('webrtc_offer dropped: collision impolite');
                                return;
                            }
                            await peerConnection.current.setLocalDescription({ type: "rollback" });
                            logVideoEvent('local description rollback success');
                        }
                        await peerConnection.current.setRemoteDescription(
                            new RTCSessionDescription(offer),
                        );
                        await flushQueuedIceCandidates();
                        logVideoEvent('setRemoteDescription offer success', {
                            signalingState: peerConnection.current.signalingState,
                        });

                        const answer = await peerConnection.current.createAnswer();
                        logVideoEvent('createAnswer success', {
                            sdpType: answer?.type,
                        });
                        await peerConnection.current.setLocalDescription(answer);
                        socket.current.emit("webrtc_answer", {
                            room,
                            to: data?.from || remoteSidRef.current,
                            answer: peerConnection.current.localDescription,
                        });
                        logVideoEvent('webrtc_answer sent', {
                            to: data?.from || remoteSidRef.current,
                        });
                        flushPendingLocalIce();
                    } catch (error) {
                        console.error("Error handling offer:", error);
                        logVideoEvent('webrtc_offer handling failed', {
                            error: error?.message || String(error),
                        });
                    }
                });

                socket.current.on("webrtc_answer", async (data) => {
                    if (!peerConnection.current) return;
                    try {
                        if (!data?.answer) return;
                        logVideoEvent('webrtc_answer received', {
                            from: data?.from,
                            answerType: data.answer?.type,
                            signalingState: peerConnection.current.signalingState,
                        });
                        await peerConnection.current.setRemoteDescription(
                            new RTCSessionDescription(data.answer),
                        );
                        await flushQueuedIceCandidates();
                        logVideoEvent('setRemoteDescription answer success', {
                            signalingState: peerConnection.current.signalingState,
                        });
                    } catch (error) {
                        console.error("Error handling answer:", error);
                        logVideoEvent('webrtc_answer handling failed', {
                            error: error?.message || String(error),
                        });
                    }
                });

                socket.current.on("ice_candidate", async (data) => {
                    if (!peerConnection.current || !data?.candidate) return;
                    try {
                        const candidate = new RTCIceCandidate(data.candidate);
                        logVideoEvent('ice_candidate received', {
                            from: data?.from,
                            candidateType: candidate?.type,
                            candidateProtocol: candidate?.protocol,
                            hasRemoteDescription: Boolean(peerConnection.current.remoteDescription?.type),
                        });
                        if (peerConnection.current.remoteDescription?.type) {
                            await peerConnection.current.addIceCandidate(candidate);
                            logVideoEvent('addIceCandidate success', {
                                candidateType: candidate?.type,
                                candidateProtocol: candidate?.protocol,
                            });
                        } else {
                            iceCandidateQueue.current.push(candidate);
                            logVideoEvent('remote ICE candidate queued', {
                                queueLength: iceCandidateQueue.current.length,
                            });
                        }
                    } catch (error) {
                        console.error("Error adding ice candidate:", error);
                        logVideoEvent('addIceCandidate failed', {
                            error: error?.message || String(error),
                        });
                    }
                });

                joinRetryTimer = setInterval(() => {
                    if (!socket.current?.connected) return;
                    if (isRemoteConnected) return;
                    logVideoEvent('join_video_room retry', {
                        room,
                        remoteSid: remoteSidRef.current,
                    });
                    socket.current.emit("join_video_room", { room });
                    if (!politeRef.current && remoteSidRef.current && !hasSentInitialOfferRef.current && peerConnection.current?.signalingState === "stable") {
                        void createAndSendOffer();
                    }
                }, 3000);

                restartTimer = setTimeout(() => {
                    if (!isRemoteConnected && remoteSidRef.current) {
                        void restartIceAndRenegotiate();
                    }
                }, 8000);

            } catch (err) {
                console.error("Error accessing media devices.", err);
                const name = err?.name || '';
                if (name === "NotAllowedError" || name === "PermissionDeniedError") {
                    setMediaError("Camera/Microphone permission denied. Please allow access and refresh.");
                } else if (name === "NotFoundError") {
                    setMediaError("No camera/microphone device found on this laptop.");
                } else {
                    setMediaError("Unable to start media devices. Please check browser/device settings.");
                }
            }
        };

        startCall();

        const remoteVideoEl = remoteVideo.current;
        return () => {
            isDisposed = true;
            logVideoEvent('consultation cleanup', {
                room,
            });
            void leaveAppointmentSession();
            void notifyCallEnded();
            if (socket.current) {
                socket.current.emit("leave_video_room", { room });
                socket.current.disconnect();
                socket.current = null;
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
            if (remoteVideoEl) {
                remoteVideoEl.srcObject = null;
            }
            remoteStreamRef.current = null;
            iceCandidateQueue.current = [];
            pendingLocalIceRef.current = [];
            reconnectAttemptsRef.current = 0;
            hasSentInitialOfferRef.current = false;
            if (restartDebounceRef.current) {
                clearTimeout(restartDebounceRef.current);
                restartDebounceRef.current = null;
            }
            if (joinRetryTimer) clearInterval(joinRetryTimer);
            if (restartTimer) clearTimeout(restartTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCall?.caller_id, isResolvingRoom, leaveAppointmentSession, logVideoEvent, returnToChat, roomId, socketRoom, user?.id, user?.role]);

    useEffect(() => {
        if (hasSeenActiveCallRef.current && !hasReturnedToChatRef.current && !activeCall?.call_id) {
            returnToChat();
        }
    }, [activeCall?.call_id, returnToChat]);

    const handleHangup = async () => {
        try {
            await leaveAppointmentSession();
            if (activeCall?.call_id) {
                await endActiveCall();
            }
        } catch (err) {
            console.error("Failed to end active call cleanly:", err);
        } finally {
            returnToChat();
        }
    };

    const resumeRemoteAudio = async () => {
        if (!remoteVideo.current) return;
        try {
            remoteVideo.current.muted = false;
            remoteVideo.current.volume = 1;
            await remoteVideo.current.play();
            setNeedsAudioResume(false);
        } catch (err) {
            console.error("Unable to resume remote audio playback:", err);
        }
    };

    const toggleAudio = () => {
        if (localVideo.current && localVideo.current.srcObject) {
            const audioTrack = localVideo.current.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localVideo.current && localVideo.current.srcObject) {
            const videoTrack = localVideo.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div className="video-call-page">
            {/* Header Bar */}
            <div className="video-call-header">
                <div className="video-call-header-left">
                    <div className="video-call-logo">
                        <Video size={20} />
                    </div>
                    <div>
                        <h2 className="video-call-title">Secure P2P Consultation</h2>
                        <span className="video-call-subtitle">Room: {roomId} • End-to-end Encrypted</span>
                        {mediaError && (
                            <span className="video-call-subtitle" style={{ color: '#fca5a5' }}>{mediaError}</span>
                        )}
                    </div>
                </div>
                <button className="video-leave-btn" onClick={handleHangup}>
                    <PhoneOff size={16} />
                    <span>Leave Call</span>
                </button>
            </div>

            {/* Main Video Stage */}
            <div className="video-stage">
                {/* Remote video */}
                <div className="video-remote-container">
                    <video
                        ref={remoteVideo}
                        autoPlay
                        playsInline
                        style={{ display: isRemoteConnected ? 'block' : 'none' }}
                    />
                    {!isRemoteConnected && (
                        <div className="video-waiting-overlay">
                            <div className="telehealth-pulse">
                                <div className="telehealth-pulse-icon">
                                    <Video size={32} color="#3b82f6" />
                                </div>
                            </div>
                            <p className="video-waiting-title">Waiting for the other participant...</p>
                            <p className="video-waiting-room">Room ID: {roomId}</p>
                            {isResolvingRoom && <p className="video-waiting-room">Resolving consultation room...</p>}
                        </div>
                    )}
                </div>

                {/* Local video */}
                <div className="video-local-container">
                    <video
                        ref={localVideo}
                        autoPlay
                        muted
                        playsInline
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="video-local-label">You</div>
                </div>

                <div className="video-debug-overlay">
                    <div><strong>Route:</strong> {routeRoomId || 'none'}</div>
                    <div><strong>Resolved:</strong> {roomId || 'none'}</div>
                    <div><strong>Socket room:</strong> {socketRoom || 'none'}</div>
                    <div><strong>Socket:</strong> {debugInfo.socketStatus}</div>
                    <div><strong>Role:</strong> {debugInfo.peerRole}</div>
                    <div><strong>Self SID:</strong> {debugInfo.selfSid || 'pending'}</div>
                    <div><strong>Remote SID:</strong> {debugInfo.remoteSid || 'pending'}</div>
                    <div><strong>ICE:</strong> {debugInfo.iceConnectionState}</div>
                    <div><strong>Signaling:</strong> {debugInfo.signalingState}</div>
                    <div><strong>PC:</strong> {debugInfo.connectionState}</div>
                    <div><strong>ICE cfg:</strong> {debugInfo.iceServerCount} ({debugInfo.hasTurn ? 'TURN+STUN' : 'STUN only'})</div>
                    <div><strong>Local tracks:</strong> {debugInfo.localTracks}</div>
                    <div><strong>Remote:</strong> {debugInfo.remoteStreamStatus} ({debugInfo.remoteTracks})</div>
                    <div><strong>Last:</strong> {debugInfo.lastEvent}</div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="video-controls-bar">
                {needsAudioResume && (
                    <button
                        className="video-control-btn"
                        onClick={resumeRemoteAudio}
                        title="Enable remote audio"
                    >
                        Enable Audio
                    </button>
                )}
                <button
                    className={`video-control-btn ${isMuted ? 'active-danger' : ''}`}
                    onClick={toggleAudio}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button
                    className={`video-control-btn ${isVideoOff ? 'active-danger' : ''}`}
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
                <button
                    className="video-control-btn hangup"
                    onClick={handleHangup}
                    title="End call"
                >
                    <PhoneOff size={22} />
                </button>
            </div>

            <style>{`
                .video-call-page {
                    height: 100vh;
                    width: 100%;
                    background: #0f172a;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .video-call-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                    gap: 12px;
                }

                .video-call-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                .video-call-logo {
                    width: 38px;
                    height: 38px;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .video-call-title {
                    margin: 0;
                    font-size: clamp(0.9rem, 2vw, 1.1rem);
                    color: white;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .video-call-subtitle {
                    font-size: 0.75rem;
                    color: #64748b;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .video-leave-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 16px;
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    border-radius: 10px;
                    color: #ef4444;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }

                .video-leave-btn:hover {
                    background: rgba(239, 68, 68, 0.22);
                }

                /* Mobile: hide text, show only icon */
                @media (max-width: 480px) {
                    .video-leave-btn span { display: none; }
                    .video-leave-btn { padding: 9px 12px; }
                    .video-call-subtitle { display: none; }
                }

                /* Video Stage */
                .video-stage {
                    flex: 1;
                    position: relative;
                    display: grid;
                    gap: 12px;
                    padding: 12px;
                    overflow: hidden;
                    /* Mobile: stack vertically */
                    grid-template-rows: 1fr 1fr;
                    grid-template-columns: 1fr;
                }

                @media (min-width: 769px) {
                    /* Desktop: side by side */
                    .video-stage {
                        grid-template-rows: 1fr;
                        grid-template-columns: 1fr 1fr;
                        align-items: center;
                    }
                }

                .video-debug-overlay {
                    position: absolute;
                    left: 18px;
                    bottom: 18px;
                    z-index: 6;
                    max-width: min(440px, calc(100vw - 36px));
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 4px 12px;
                    padding: 10px 12px;
                    border: 1px solid rgba(148, 163, 184, 0.35);
                    border-radius: 8px;
                    background: rgba(15, 23, 42, 0.82);
                    color: #cbd5e1;
                    font-size: 0.72rem;
                    line-height: 1.3;
                    backdrop-filter: blur(8px);
                    pointer-events: none;
                }

                .video-debug-overlay strong {
                    color: #f8fafc;
                    font-weight: 700;
                }

                .video-remote-container,
                .video-local-container {
                    position: relative;
                    border-radius: 14px;
                    overflow: hidden;
                    background: #111827;
                    height: 100%;
                    min-height: 0;
                }

                .video-remote-container video,
                .video-local-container video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .video-local-label {
                    position: absolute;
                    bottom: 10px;
                    left: 12px;
                    background: rgba(0,0,0,0.55);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 3px 10px;
                    border-radius: 999px;
                    backdrop-filter: blur(4px);
                }

                /* Waiting overlay */
                .video-waiting-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #0f172a;
                    color: #64748b;
                    padding: 24px;
                    text-align: center;
                }

                .telehealth-pulse {
                    animation: pulse-blue 2s infinite;
                    border-radius: 50%;
                    margin-bottom: 20px;
                }

                .telehealth-pulse-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    border: 2px solid #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(59, 130, 246, 0.1);
                }

                .video-waiting-title {
                    font-size: clamp(0.9rem, 2vw, 1.1rem);
                    font-weight: 500;
                    color: #cbd5e1;
                    margin: 0;
                }

                .video-waiting-room {
                    margin-top: 6px;
                    font-size: 0.8rem;
                    color: #475569;
                }

                /* Controls Bar */
                .video-controls-bar {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(15, 23, 42, 0.9);
                    border-top: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }

                .video-control-btn {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(30, 41, 59, 0.85);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    backdrop-filter: blur(8px);
                    transition: all 0.2s;
                }

                .video-control-btn:hover {
                    background: rgba(51, 65, 85, 0.95);
                    border-color: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }

                .video-control-btn.active-danger {
                    background: #ef4444;
                    border-color: #ef4444;
                }

                .video-control-btn.hangup {
                    background: #dc2626;
                    border-color: #dc2626;
                    width: 60px;
                    height: 60px;
                }

                .video-control-btn.hangup:hover {
                    background: #b91c1c;
                }

                @media (max-width: 480px) {
                    .video-controls-bar {
                        gap: 12px;
                        padding: 12px;
                    }

                    .video-control-btn {
                        width: 48px;
                        height: 48px;
                    }

                    .video-control-btn.hangup {
                        width: 52px;
                        height: 52px;
                    }
                }

                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 24px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
}
