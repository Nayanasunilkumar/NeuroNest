import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import IncomingCallCard from "../components/video/IncomingCallCard";
import VideoCallCard from "../components/video/VideoCallCard";
import VideoCallModal from "../components/video/VideoCallModal";
import { acceptCall, declineCall, endCall, startCall } from "../api/callsApi";
import { initSocket } from "../services/socket";
import { getUser, isAuthenticated } from "../utils/auth";

const CallContext = createContext(null);

const DEFAULT_TIMEOUT = 30;

export const CallProvider = ({ children }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const incomingTimerRef = useRef(null);
  const incomingCallIdRef = useRef(null);
  const incomingCallRef = useRef(null);
  const activeCallRef = useRef(null);
  const callStatusRef = useRef("idle");

  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingTimeLeft, setIncomingTimeLeft] = useState(DEFAULT_TIMEOUT);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [statusCard, setStatusCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  const clearOutgoingTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearIncomingCountdown = useCallback(() => {
    incomingCallIdRef.current = null;
    setIncomingTimeLeft(DEFAULT_TIMEOUT);
    if (incomingTimerRef.current) {
      clearInterval(incomingTimerRef.current);
      incomingTimerRef.current = null;
    }
  }, []);

  const dismissStatusCard = useCallback(() => setStatusCard(null), []);

  const resetCallState = useCallback(() => {
    clearOutgoingTimer();
    clearIncomingCountdown();
    setIncomingCall(null);
    setActiveCall(null);
    setIsModalOpen(false);
    setCallStatus("idle");
  }, [clearOutgoingTimer, clearIncomingCountdown]);

  const startIncomingCountdown = useCallback(
    (call) => {
      clearIncomingCountdown();
      incomingCallIdRef.current = call.call_id;
      setIncomingTimeLeft(DEFAULT_TIMEOUT);
      incomingTimerRef.current = setInterval(() => {
        setIncomingTimeLeft((prev) => {
          if (prev <= 1) {
            const timedOutCallId = incomingCallIdRef.current;
            clearIncomingCountdown();
            if (timedOutCallId === call.call_id) {
              setIncomingCall(null);
              setCallStatus("idle");
              declineCall(call.call_id, "missed").catch((error) => {
                console.error("Auto-decline missed call failed:", error);
              });
            }
            return DEFAULT_TIMEOUT;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearIncomingCountdown],
  );

  const scheduleNoAnswerTimeout = useCallback(
    (callId) => {
      clearOutgoingTimer();
      timeoutRef.current = setTimeout(async () => {
        if (!activeCallRef.current || activeCallRef.current.call_id !== callId || callStatusRef.current !== "ringing") return;
        try {
          await declineCall(callId, "missed");
        } catch (error) {
          console.error("No-answer timeout update failed:", error);
        }
        setStatusCard({
          tone: "warning",
          title: "Call not answered",
          message: "The recipient did not respond within 30 seconds.",
        });
        resetCallState();
      }, DEFAULT_TIMEOUT * 1000);
    },
    [clearOutgoingTimer, resetCallState],
  );

  const startVideoCall = useCallback(
    async ({ receiverId, conversationId, callType = "video" }) => {
      const user = getUser();
      if (!user?.id || !receiverId) return null;
      if (callStatus === "connected" || callStatus === "incoming") {
        setStatusCard({
          tone: "danger",
          title: "Call unavailable",
          message: "You are already in another call.",
        });
        return null;
      }

      const session = await startCall({
        caller_id: user.id,
        receiver_id: receiverId,
        conversation_id: conversationId,
        call_type: callType,
      });

      setActiveCall(session);
      setIncomingCall(null);
      setCallStatus("ringing");
      setIsModalOpen(true);
      setStatusCard({
        tone: "info",
        title: "Calling...",
        message: `Connecting to ${session.receiver_name || "participant"}.`,
      });
      scheduleNoAnswerTimeout(session.call_id);
      return session;
    },
    [callStatus, scheduleNoAnswerTimeout],
  );

  const openConsultation = useCallback(
    (roomId) => {
      if (!roomId) return;
      navigate(`/consultation/${roomId}`);
      setIsModalOpen(false);
      setStatusCard(null);
    },
    [navigate],
  );

  const acceptIncomingCall = useCallback(
    async (callId) => {
      const session = await acceptCall(callId);
      setIncomingCall(null);
      clearIncomingCountdown();
      setActiveCall(session);
      setCallStatus("connected");
      setIsModalOpen(true);
      clearOutgoingTimer();
      setStatusCard({
        tone: "success",
        title: "Call connected",
        message: "Join the secure consultation room.",
      });
      openConsultation(session.room_id);
      return session;
    },
    [clearIncomingCountdown, clearOutgoingTimer, openConsultation],
  );

  const declineIncomingCall = useCallback(
    async (callId, reason = "declined") => {
      await declineCall(callId, reason);
      setIncomingCall(null);
      setActiveCall(null);
      setIsModalOpen(false);
      clearIncomingCountdown();
      setCallStatus("idle");
    },
    [clearIncomingCountdown],
  );

  const endActiveCall = useCallback(async () => {
    if (activeCall?.call_id) {
      try {
        await endCall(activeCall.call_id);
      } catch (error) {
        console.error("Failed to end call:", error);
      }
    }
    setStatusCard({
      tone: "info",
      title: "Call ended",
      message: "Consultation session has been closed.",
    });
    resetCallState();
  }, [activeCall, resetCallState]);

  const dismissIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    declineIncomingCall(incomingCall.call_id, "dismissed").catch((error) => {
      console.error("Dismiss call failed:", error);
    });
  }, [declineIncomingCall, incomingCall]);

  useEffect(() => {
    if (!isAuthenticated()) return undefined;
    const socket = initSocket();
    if (!socket) return undefined;

    const onIncomingCall = async (payload) => {
      if (callStatusRef.current === "connected" || incomingCallRef.current || activeCallRef.current?.status === "connected") {
        try {
          await declineCall(payload.call_id, "busy");
        } catch (error) {
          console.error("Auto-busy decline failed:", error);
        }
        return;
      }

      setIncomingCall(payload);
      setCallStatus("incoming");
      startIncomingCountdown(payload);
    };

    const onCallAccepted = (payload) => {
      setActiveCall(payload);
      setCallStatus("connected");
      setIsModalOpen(true);
      clearOutgoingTimer();
      setStatusCard({
        tone: "success",
        title: "Call accepted",
        message: `${payload.receiver_name || "Participant"} joined.`,
      });
      openConsultation(payload.room_id);
    };

    const onCallDeclined = (payload) => {
      if (activeCallRef.current?.call_id && payload.call_id !== activeCallRef.current.call_id && incomingCallRef.current?.call_id !== payload.call_id) {
        return;
      }
      clearOutgoingTimer();
      clearIncomingCountdown();
      setIncomingCall(null);
      setActiveCall(null);
      setIsModalOpen(false);
      setCallStatus("ended");
      setStatusCard({
        tone: "danger",
        title: "Call declined",
        message: "The other participant declined the call.",
      });
    };

    const onCallMissed = (payload) => {
      if (activeCallRef.current?.call_id && payload.call_id !== activeCallRef.current.call_id && incomingCallRef.current?.call_id !== payload.call_id) {
        return;
      }
      clearOutgoingTimer();
      clearIncomingCountdown();
      setIncomingCall(null);
      setActiveCall(null);
      setIsModalOpen(false);
      setCallStatus("ended");
      setStatusCard({
        tone: "warning",
        title: "Call not answered",
        message: "No response received within 30 seconds.",
      });
    };

    const onCallEnded = (payload) => {
      if (activeCallRef.current?.call_id && payload.call_id !== activeCallRef.current.call_id) return;
      resetCallState();
      setStatusCard({
        tone: "info",
        title: "Call ended",
        message: "The consultation was ended by the other participant.",
      });
    };

    socket.on("incoming_call", onIncomingCall);
    socket.on("call_accepted", onCallAccepted);
    socket.on("call_declined", onCallDeclined);
    socket.on("call_missed", onCallMissed);
    socket.on("call_ended", onCallEnded);

    return () => {
      socket.off("incoming_call", onIncomingCall);
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_declined", onCallDeclined);
      socket.off("call_missed", onCallMissed);
      socket.off("call_ended", onCallEnded);
    };
  }, [
    clearIncomingCountdown,
    clearOutgoingTimer,
    openConsultation,
    resetCallState,
    startIncomingCountdown,
  ]);

  useEffect(() => {
    return () => {
      clearOutgoingTimer();
      clearIncomingCountdown();
    };
  }, [clearIncomingCountdown, clearOutgoingTimer]);

  const contextValue = useMemo(
    () => ({
      incomingCall,
      activeCall,
      callStatus,
      startVideoCall,
      acceptIncomingCall,
      declineIncomingCall,
      dismissIncomingCall,
      endActiveCall,
    openConsultation,
      isModalOpen,
      setIsModalOpen,
    }),
    [
      incomingCall,
      activeCall,
      callStatus,
      startVideoCall,
      acceptIncomingCall,
      declineIncomingCall,
      dismissIncomingCall,
      endActiveCall,
      openConsultation,
      isModalOpen,
    ],
  );

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      <VideoCallCard
        visible={Boolean(statusCard)}
        tone={statusCard?.tone}
        title={statusCard?.title}
        message={statusCard?.message}
        onClose={dismissStatusCard}
      />

      <IncomingCallCard
        call={incomingCall}
        timeLeft={incomingTimeLeft}
        onAccept={() => incomingCall?.call_id && acceptIncomingCall(incomingCall.call_id)}
        onDecline={() => incomingCall?.call_id && declineIncomingCall(incomingCall.call_id)}
        onDismiss={dismissIncomingCall}
      />

      <VideoCallModal
        isOpen={isModalOpen && Boolean(activeCall)}
        call={activeCall}
        callStatus={callStatus}
        onClose={() => setIsModalOpen(false)}
        onEndCall={endActiveCall}
      />
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const value = useContext(CallContext);
  if (!value) {
    throw new Error("useCall must be used within CallProvider");
  }
  return value;
};
