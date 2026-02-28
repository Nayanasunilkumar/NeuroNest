--
-- PostgreSQL database dump
--

\restrict fadAwwjnfZwihevVzwer7PqDoa5AePwaNYaqLNTVxa2fB2nwdQdPle0hnLcdNWM

-- Dumped from database version 18.2 (Postgres.app)
-- Dumped by pg_dump version 18.2 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.slot_event_logs DROP CONSTRAINT IF EXISTS slot_event_logs_slot_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slot_event_logs DROP CONSTRAINT IF EXISTS slot_event_logs_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slot_event_logs DROP CONSTRAINT IF EXISTS slot_event_logs_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slot_event_logs DROP CONSTRAINT IF EXISTS slot_event_logs_actor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.security_activity DROP CONSTRAINT IF EXISTS security_activity_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_tags DROP CONSTRAINT IF EXISTS review_tags_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_moderation_logs DROP CONSTRAINT IF EXISTS review_moderation_logs_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_moderation_logs DROP CONSTRAINT IF EXISTS review_moderation_logs_performed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.review_escalations DROP CONSTRAINT IF EXISTS review_escalations_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_escalations DROP CONSTRAINT IF EXISTS review_escalations_escalated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.record_tags DROP CONSTRAINT IF EXISTS record_tags_record_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prescription_items DROP CONSTRAINT IF EXISTS prescription_items_prescription_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_status_logs DROP CONSTRAINT IF EXISTS patient_status_logs_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_status_logs DROP CONSTRAINT IF EXISTS patient_status_logs_admin_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS patient_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_medications DROP CONSTRAINT IF EXISTS patient_medications_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_flags DROP CONSTRAINT IF EXISTS patient_flags_resolved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_flags DROP CONSTRAINT IF EXISTS patient_flags_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_flags DROP CONSTRAINT IF EXISTS patient_flags_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_conditions DROP CONSTRAINT IF EXISTS patient_conditions_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_audit_logs DROP CONSTRAINT IF EXISTS patient_audit_logs_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_audit_logs DROP CONSTRAINT IF EXISTS patient_audit_logs_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.patient_allergies DROP CONSTRAINT IF EXISTS patient_allergies_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.participants DROP CONSTRAINT IF EXISTS participants_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.participants DROP CONSTRAINT IF EXISTS participants_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_records DROP CONSTRAINT IF EXISTS medical_records_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_records DROP CONSTRAINT IF EXISTS medical_records_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_record_audit_logs DROP CONSTRAINT IF EXISTS medical_record_audit_logs_performed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_record_audit_logs DROP CONSTRAINT IF EXISTS medical_record_audit_logs_medical_record_id_fkey;
ALTER TABLE IF EXISTS ONLY public.in_app_notifications DROP CONSTRAINT IF EXISTS in_app_notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS fk_patient;
ALTER TABLE IF EXISTS ONLY public.medical_records DROP CONSTRAINT IF EXISTS fk_medical_records_uploaded_by_users;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS fk_appointments_slot_id;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS fk_appointments_extended_from;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS fk_appointments_doctor;
ALTER TABLE IF EXISTS ONLY public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_status_logs DROP CONSTRAINT IF EXISTS doctor_status_logs_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_status_logs DROP CONSTRAINT IF EXISTS doctor_status_logs_admin_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_slot_overrides DROP CONSTRAINT IF EXISTS doctor_slot_overrides_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_slot_overrides DROP CONSTRAINT IF EXISTS doctor_slot_overrides_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_schedule_settings DROP CONSTRAINT IF EXISTS doctor_schedule_settings_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_profiles DROP CONSTRAINT IF EXISTS doctor_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_privacy_settings DROP CONSTRAINT IF EXISTS doctor_privacy_settings_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_notification_settings DROP CONSTRAINT IF EXISTS doctor_notification_settings_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_expertise_tags DROP CONSTRAINT IF EXISTS doctor_expertise_tags_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_consultation_settings DROP CONSTRAINT IF EXISTS doctor_consultation_settings_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_blocked_dates DROP CONSTRAINT IF EXISTS doctor_blocked_dates_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_availability DROP CONSTRAINT IF EXISTS doctor_availability_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_audit_logs DROP CONSTRAINT IF EXISTS doctor_audit_logs_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctor_audit_logs DROP CONSTRAINT IF EXISTS doctor_audit_logs_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clinical_remarks DROP CONSTRAINT IF EXISTS clinical_remarks_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clinical_remarks DROP CONSTRAINT IF EXISTS clinical_remarks_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_slots DROP CONSTRAINT IF EXISTS appointment_slots_held_by_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_slots DROP CONSTRAINT IF EXISTS appointment_slots_doctor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.announcement_targets DROP CONSTRAINT IF EXISTS announcement_targets_announcement_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcement_reads DROP CONSTRAINT IF EXISTS announcement_reads_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcement_reads DROP CONSTRAINT IF EXISTS announcement_reads_announcement_id_fkey;
DROP INDEX IF EXISTS public.unique_primary_contact;
DROP INDEX IF EXISTS public.ix_system_settings_setting_key;
DROP INDEX IF EXISTS public.ix_slot_event_logs_slot_id;
DROP INDEX IF EXISTS public.ix_slot_event_logs_event_type;
DROP INDEX IF EXISTS public.ix_slot_event_logs_doctor_user_id;
DROP INDEX IF EXISTS public.ix_slot_event_logs_created_at;
DROP INDEX IF EXISTS public.ix_slot_event_logs_correlation_id;
DROP INDEX IF EXISTS public.ix_slot_event_logs_appointment_id;
DROP INDEX IF EXISTS public.ix_slot_event_logs_actor_user_id;
DROP INDEX IF EXISTS public.ix_security_activity_user_id;
DROP INDEX IF EXISTS public.ix_modules_module_key;
DROP INDEX IF EXISTS public.ix_in_app_notifications_user_id;
DROP INDEX IF EXISTS public.ix_doctor_slot_overrides_override_date;
DROP INDEX IF EXISTS public.ix_doctor_slot_overrides_is_active;
DROP INDEX IF EXISTS public.ix_doctor_slot_overrides_doctor_user_id;
DROP INDEX IF EXISTS public.ix_doctor_schedule_settings_doctor_user_id;
DROP INDEX IF EXISTS public.ix_doctor_privacy_settings_doctor_user_id;
DROP INDEX IF EXISTS public.ix_doctor_notification_settings_doctor_user_id;
DROP INDEX IF EXISTS public.ix_doctor_consultation_settings_doctor_user_id;
DROP INDEX IF EXISTS public.ix_appointment_slots_status;
DROP INDEX IF EXISTS public.ix_appointment_slots_slot_start_utc;
DROP INDEX IF EXISTS public.ix_appointment_slots_slot_date_local;
DROP INDEX IF EXISTS public.ix_appointment_slots_doctor_user_id;
DROP INDEX IF EXISTS public.ix_appointment_slots_booked_appointment_id;
DROP INDEX IF EXISTS public.idx_slot_override_doctor_date;
DROP INDEX IF EXISTS public.idx_slot_event_slot_created;
DROP INDEX IF EXISTS public.idx_slot_event_doctor_created;
DROP INDEX IF EXISTS public.idx_slot_doctor_date_status;
DROP INDEX IF EXISTS public.idx_record_tags_tag_name;
DROP INDEX IF EXISTS public.idx_record_tags_record_id;
DROP INDEX IF EXISTS public.idx_patient_medications_patient_active;
DROP INDEX IF EXISTS public.idx_patient_conditions_patient_status;
DROP INDEX IF EXISTS public.idx_patient_allergies_patient_status;
DROP INDEX IF EXISTS public.idx_message_status_user;
DROP INDEX IF EXISTS public.idx_conversation_participants_user;
DROP INDEX IF EXISTS public.idx_appointments_slot_id;
DROP INDEX IF EXISTS public.idx_appointments_patient_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.record_tags DROP CONSTRAINT IF EXISTS uq_record_tag_name;
ALTER TABLE IF EXISTS ONLY public.patient_conditions DROP CONSTRAINT IF EXISTS uq_patient_condition_name;
ALTER TABLE IF EXISTS ONLY public.patient_allergies DROP CONSTRAINT IF EXISTS uq_patient_allergy_name;
ALTER TABLE IF EXISTS ONLY public.appointment_slots DROP CONSTRAINT IF EXISTS uq_doctor_slot_start;
ALTER TABLE IF EXISTS ONLY public.announcement_reads DROP CONSTRAINT IF EXISTS uq_announcement_user_read;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS unique_doctor_slot;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.slot_event_logs DROP CONSTRAINT IF EXISTS slot_event_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.security_activity DROP CONSTRAINT IF EXISTS security_activity_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_appointment_id_key;
ALTER TABLE IF EXISTS ONLY public.review_tags DROP CONSTRAINT IF EXISTS review_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.review_moderation_logs DROP CONSTRAINT IF EXISTS review_moderation_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.review_escalations DROP CONSTRAINT IF EXISTS review_escalations_pkey;
ALTER TABLE IF EXISTS ONLY public.record_tags DROP CONSTRAINT IF EXISTS record_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.prescription_items DROP CONSTRAINT IF EXISTS prescription_items_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_status_logs DROP CONSTRAINT IF EXISTS patient_status_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS patient_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS patient_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_medications DROP CONSTRAINT IF EXISTS patient_medications_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_flags DROP CONSTRAINT IF EXISTS patient_flags_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_conditions DROP CONSTRAINT IF EXISTS patient_conditions_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_audit_logs DROP CONSTRAINT IF EXISTS patient_audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.patient_allergies DROP CONSTRAINT IF EXISTS patient_allergies_pkey;
ALTER TABLE IF EXISTS ONLY public.participants DROP CONSTRAINT IF EXISTS participants_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_key;
ALTER TABLE IF EXISTS ONLY public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_pkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.message_status DROP CONSTRAINT IF EXISTS message_status_pkey;
ALTER TABLE IF EXISTS ONLY public.message_status DROP CONSTRAINT IF EXISTS message_status_message_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_pkey;
ALTER TABLE IF EXISTS ONLY public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_message_id_user_id_reaction_type_key;
ALTER TABLE IF EXISTS ONLY public.medical_records DROP CONSTRAINT IF EXISTS medical_records_pkey;
ALTER TABLE IF EXISTS ONLY public.medical_record_audit_logs DROP CONSTRAINT IF EXISTS medical_record_audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.in_app_notifications DROP CONSTRAINT IF EXISTS in_app_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_status_logs DROP CONSTRAINT IF EXISTS doctor_status_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_slot_overrides DROP CONSTRAINT IF EXISTS doctor_slot_overrides_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_schedule_settings DROP CONSTRAINT IF EXISTS doctor_schedule_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_profiles DROP CONSTRAINT IF EXISTS doctor_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.doctor_profiles DROP CONSTRAINT IF EXISTS doctor_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_profiles DROP CONSTRAINT IF EXISTS doctor_profiles_license_number_key;
ALTER TABLE IF EXISTS ONLY public.doctor_privacy_settings DROP CONSTRAINT IF EXISTS doctor_privacy_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_notification_settings DROP CONSTRAINT IF EXISTS doctor_notification_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_expertise_tags DROP CONSTRAINT IF EXISTS doctor_expertise_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_consultation_settings DROP CONSTRAINT IF EXISTS doctor_consultation_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_blocked_dates DROP CONSTRAINT IF EXISTS doctor_blocked_dates_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_availability DROP CONSTRAINT IF EXISTS doctor_availability_pkey;
ALTER TABLE IF EXISTS ONLY public.doctor_audit_logs DROP CONSTRAINT IF EXISTS doctor_audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_pkey;
ALTER TABLE IF EXISTS ONLY public.conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.clinical_structures DROP CONSTRAINT IF EXISTS clinical_structures_pkey;
ALTER TABLE IF EXISTS ONLY public.clinical_remarks DROP CONSTRAINT IF EXISTS clinical_remarks_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.appointment_slots DROP CONSTRAINT IF EXISTS appointment_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.announcement_targets DROP CONSTRAINT IF EXISTS announcement_targets_pkey;
ALTER TABLE IF EXISTS ONLY public.announcement_reads DROP CONSTRAINT IF EXISTS announcement_reads_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.slot_event_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.security_activity ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_moderation_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_escalations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.record_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.prescriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.prescription_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_status_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_medications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_flags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_conditions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patient_allergies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.participants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notification_preferences ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.modules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_status ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_reactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.medical_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.medical_record_audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.in_app_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.emergency_contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_status_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_slot_overrides ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_schedule_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_privacy_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_notification_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_expertise_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_consultation_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_blocked_dates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_availability ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctor_audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversation_participants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clinical_structures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clinical_remarks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointment_slots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcement_targets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcement_reads ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_roles;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP SEQUENCE IF EXISTS public.slot_event_logs_id_seq;
DROP TABLE IF EXISTS public.slot_event_logs;
DROP SEQUENCE IF EXISTS public.security_activity_id_seq;
DROP TABLE IF EXISTS public.security_activity;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.reviews_id_seq;
DROP TABLE IF EXISTS public.reviews;
DROP SEQUENCE IF EXISTS public.review_tags_id_seq;
DROP TABLE IF EXISTS public.review_tags;
DROP SEQUENCE IF EXISTS public.review_moderation_logs_id_seq;
DROP TABLE IF EXISTS public.review_moderation_logs;
DROP SEQUENCE IF EXISTS public.review_escalations_id_seq;
DROP TABLE IF EXISTS public.review_escalations;
DROP SEQUENCE IF EXISTS public.record_tags_id_seq;
DROP TABLE IF EXISTS public.record_tags;
DROP SEQUENCE IF EXISTS public.prescriptions_id_seq;
DROP TABLE IF EXISTS public.prescriptions;
DROP SEQUENCE IF EXISTS public.prescription_items_id_seq;
DROP TABLE IF EXISTS public.prescription_items;
DROP SEQUENCE IF EXISTS public.patient_status_logs_id_seq;
DROP TABLE IF EXISTS public.patient_status_logs;
DROP SEQUENCE IF EXISTS public.patient_profiles_id_seq;
DROP TABLE IF EXISTS public.patient_profiles;
DROP SEQUENCE IF EXISTS public.patient_medications_id_seq;
DROP TABLE IF EXISTS public.patient_medications;
DROP SEQUENCE IF EXISTS public.patient_flags_id_seq;
DROP TABLE IF EXISTS public.patient_flags;
DROP SEQUENCE IF EXISTS public.patient_conditions_id_seq;
DROP TABLE IF EXISTS public.patient_conditions;
DROP SEQUENCE IF EXISTS public.patient_audit_logs_id_seq;
DROP TABLE IF EXISTS public.patient_audit_logs;
DROP SEQUENCE IF EXISTS public.patient_allergies_id_seq;
DROP TABLE IF EXISTS public.patient_allergies;
DROP SEQUENCE IF EXISTS public.participants_id_seq;
DROP TABLE IF EXISTS public.participants;
DROP SEQUENCE IF EXISTS public.notification_preferences_id_seq;
DROP TABLE IF EXISTS public.notification_preferences;
DROP SEQUENCE IF EXISTS public.modules_id_seq;
DROP TABLE IF EXISTS public.modules;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.message_status_id_seq;
DROP TABLE IF EXISTS public.message_status;
DROP SEQUENCE IF EXISTS public.message_reactions_id_seq;
DROP TABLE IF EXISTS public.message_reactions;
DROP SEQUENCE IF EXISTS public.medical_records_id_seq;
DROP TABLE IF EXISTS public.medical_records;
DROP SEQUENCE IF EXISTS public.medical_record_audit_logs_id_seq;
DROP TABLE IF EXISTS public.medical_record_audit_logs;
DROP SEQUENCE IF EXISTS public.in_app_notifications_id_seq;
DROP TABLE IF EXISTS public.in_app_notifications;
DROP SEQUENCE IF EXISTS public.emergency_contacts_id_seq;
DROP TABLE IF EXISTS public.emergency_contacts;
DROP SEQUENCE IF EXISTS public.doctor_status_logs_id_seq;
DROP TABLE IF EXISTS public.doctor_status_logs;
DROP SEQUENCE IF EXISTS public.doctor_slot_overrides_id_seq;
DROP TABLE IF EXISTS public.doctor_slot_overrides;
DROP SEQUENCE IF EXISTS public.doctor_schedule_settings_id_seq;
DROP TABLE IF EXISTS public.doctor_schedule_settings;
DROP SEQUENCE IF EXISTS public.doctor_profiles_id_seq;
DROP TABLE IF EXISTS public.doctor_profiles;
DROP SEQUENCE IF EXISTS public.doctor_privacy_settings_id_seq;
DROP TABLE IF EXISTS public.doctor_privacy_settings;
DROP SEQUENCE IF EXISTS public.doctor_notification_settings_id_seq;
DROP TABLE IF EXISTS public.doctor_notification_settings;
DROP SEQUENCE IF EXISTS public.doctor_expertise_tags_id_seq;
DROP TABLE IF EXISTS public.doctor_expertise_tags;
DROP SEQUENCE IF EXISTS public.doctor_consultation_settings_id_seq;
DROP TABLE IF EXISTS public.doctor_consultation_settings;
DROP SEQUENCE IF EXISTS public.doctor_blocked_dates_id_seq;
DROP TABLE IF EXISTS public.doctor_blocked_dates;
DROP SEQUENCE IF EXISTS public.doctor_availability_id_seq;
DROP TABLE IF EXISTS public.doctor_availability;
DROP SEQUENCE IF EXISTS public.doctor_audit_logs_id_seq;
DROP TABLE IF EXISTS public.doctor_audit_logs;
DROP SEQUENCE IF EXISTS public.conversations_id_seq;
DROP TABLE IF EXISTS public.conversations;
DROP SEQUENCE IF EXISTS public.conversation_participants_id_seq;
DROP TABLE IF EXISTS public.conversation_participants;
DROP SEQUENCE IF EXISTS public.clinical_structures_id_seq;
DROP TABLE IF EXISTS public.clinical_structures;
DROP SEQUENCE IF EXISTS public.clinical_remarks_id_seq;
DROP TABLE IF EXISTS public.clinical_remarks;
DROP SEQUENCE IF EXISTS public.appointments_id_seq;
DROP TABLE IF EXISTS public.appointments;
DROP SEQUENCE IF EXISTS public.appointment_slots_id_seq;
DROP TABLE IF EXISTS public.appointment_slots;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
DROP SEQUENCE IF EXISTS public.announcement_targets_id_seq;
DROP TABLE IF EXISTS public.announcement_targets;
DROP SEQUENCE IF EXISTS public.announcement_reads_id_seq;
DROP TABLE IF EXISTS public.announcement_reads;
DROP FUNCTION IF EXISTS public.update_prescription_updated_at();
DROP TYPE IF EXISTS public.slot_status_enum;
DROP TYPE IF EXISTS public.slot_source_enum;
DROP TYPE IF EXISTS public.slot_override_scope_enum;
DROP TYPE IF EXISTS public.prescription_status;
DROP TYPE IF EXISTS public.booking_mode_enum;
DROP TYPE IF EXISTS public.approval_mode_enum;
DROP TYPE IF EXISTS public.appointment_status;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled_by_patient',
    'cancelled_by_doctor',
    'completed',
    'no_show',
    'rescheduled'
);


--
-- Name: approval_mode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.approval_mode_enum AS ENUM (
    'auto_confirm',
    'doctor_approval'
);


--
-- Name: booking_mode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_mode_enum AS ENUM (
    'auto_confirm',
    'doctor_approval'
);


--
-- Name: prescription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prescription_status AS ENUM (
    'draft',
    'active',
    'expired',
    'cancelled'
);


--
-- Name: slot_override_scope_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.slot_override_scope_enum AS ENUM (
    'full_day',
    'range'
);


--
-- Name: slot_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.slot_source_enum AS ENUM (
    'generated',
    'manual_override',
    'emergency_block'
);


--
-- Name: slot_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.slot_status_enum AS ENUM (
    'available',
    'held',
    'booked',
    'blocked',
    'cancelled'
);


--
-- Name: update_prescription_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_prescription_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcement_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement_reads (
    id integer NOT NULL,
    announcement_id integer NOT NULL,
    user_id integer NOT NULL,
    is_read boolean,
    acknowledged boolean,
    read_at timestamp without time zone
);


--
-- Name: announcement_reads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcement_reads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcement_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcement_reads_id_seq OWNED BY public.announcement_reads.id;


--
-- Name: announcement_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement_targets (
    id integer NOT NULL,
    announcement_id integer NOT NULL,
    target_type character varying(50) NOT NULL,
    target_value character varying(100),
    created_at timestamp without time zone
);


--
-- Name: announcement_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcement_targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcement_targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcement_targets_id_seq OWNED BY public.announcement_targets.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(100),
    priority character varying(20),
    status character varying(20),
    publish_at timestamp without time zone,
    expiry_at timestamp without time zone,
    created_by integer,
    updated_by integer,
    is_pinned boolean,
    require_acknowledgement boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: appointment_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_slots (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    slot_start_utc timestamp with time zone NOT NULL,
    slot_end_utc timestamp with time zone NOT NULL,
    slot_date_local date NOT NULL,
    status public.slot_status_enum NOT NULL,
    held_by_patient_id integer,
    held_until_utc timestamp with time zone,
    booked_appointment_id integer,
    source public.slot_source_enum NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT ck_slot_end_after_start CHECK ((slot_end_utc > slot_start_utc))
);


--
-- Name: appointment_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointment_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointment_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointment_slots_id_seq OWNED BY public.appointment_slots.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    reason character varying(255),
    notes text,
    status public.appointment_status DEFAULT 'pending'::public.appointment_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    doctor_id integer NOT NULL,
    slot_id integer,
    booking_mode public.booking_mode_enum DEFAULT 'auto_confirm'::public.booking_mode_enum NOT NULL,
    delay_reason text,
    extended_from_appointment_id integer,
    feedback_given boolean DEFAULT false
);


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: clinical_remarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinical_remarks (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: clinical_remarks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinical_remarks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clinical_remarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinical_remarks_id_seq OWNED BY public.clinical_remarks.id;


--
-- Name: clinical_structures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinical_structures (
    id integer NOT NULL,
    sector character varying(100) NOT NULL,
    specialty character varying(100) NOT NULL,
    is_active boolean,
    created_at timestamp without time zone
);


--
-- Name: clinical_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinical_structures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clinical_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinical_structures_id_seq OWNED BY public.clinical_structures.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_participants (
    id integer NOT NULL,
    conversation_id integer,
    user_id integer NOT NULL,
    role character varying(20),
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversation_participants_role_check CHECK (((role)::text = ANY (ARRAY[('patient'::character varying)::text, ('doctor'::character varying)::text])))
);


--
-- Name: conversation_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_participants_id_seq OWNED BY public.conversation_participants.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    type character varying(20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: doctor_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_audit_logs (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    actor_id integer NOT NULL,
    action_type character varying(100) NOT NULL,
    description text,
    action_metadata json,
    ip_address character varying(45),
    user_agent character varying(255),
    created_at timestamp without time zone
);


--
-- Name: doctor_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_audit_logs_id_seq OWNED BY public.doctor_audit_logs.id;


--
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_availability (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_availability_id_seq OWNED BY public.doctor_availability.id;


--
-- Name: doctor_blocked_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_blocked_dates (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    date date NOT NULL,
    reason character varying(255)
);


--
-- Name: doctor_blocked_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_blocked_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_blocked_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_blocked_dates_id_seq OWNED BY public.doctor_blocked_dates.id;


--
-- Name: doctor_consultation_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_consultation_settings (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    consultation_fee double precision NOT NULL,
    consultation_mode character varying(50),
    cancellation_policy_hours integer,
    auto_cancel_unpaid_minutes integer,
    created_at timestamp without time zone
);


--
-- Name: doctor_consultation_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_consultation_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_consultation_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_consultation_settings_id_seq OWNED BY public.doctor_consultation_settings.id;


--
-- Name: doctor_expertise_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_expertise_tags (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    tag_name character varying(100) NOT NULL
);


--
-- Name: doctor_expertise_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_expertise_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_expertise_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_expertise_tags_id_seq OWNED BY public.doctor_expertise_tags.id;


--
-- Name: doctor_notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_notification_settings (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    email_on_booking boolean,
    sms_on_booking boolean,
    in_app_notifications boolean,
    reminder_before_minutes integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: doctor_notification_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_notification_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_notification_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_notification_settings_id_seq OWNED BY public.doctor_notification_settings.id;


--
-- Name: doctor_privacy_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_privacy_settings (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    show_profile_publicly boolean,
    show_consultation_fee boolean,
    allow_chat_before_booking boolean,
    allow_reviews_publicly boolean,
    created_at timestamp without time zone
);


--
-- Name: doctor_privacy_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_privacy_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_privacy_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_privacy_settings_id_seq OWNED BY public.doctor_privacy_settings.id;


--
-- Name: doctor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    specialization character varying(100),
    license_number character varying(50),
    qualification character varying(100),
    experience_years integer,
    department character varying(100),
    phone character varying(20),
    gender character varying(20),
    dob date,
    bio text,
    hospital_name character varying(200),
    consultation_fee double precision,
    consultation_mode character varying(50),
    profile_image character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    sector character varying(50) DEFAULT 'North Sector'::character varying
);


--
-- Name: doctor_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_profiles_id_seq OWNED BY public.doctor_profiles.id;


--
-- Name: doctor_schedule_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_schedule_settings (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    slot_duration_minutes integer NOT NULL,
    buffer_minutes integer NOT NULL,
    approval_mode public.approval_mode_enum NOT NULL,
    timezone character varying(64) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    accepting_new_bookings boolean DEFAULT true NOT NULL
);


--
-- Name: doctor_schedule_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_schedule_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_schedule_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_schedule_settings_id_seq OWNED BY public.doctor_schedule_settings.id;


--
-- Name: doctor_slot_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_slot_overrides (
    id integer NOT NULL,
    doctor_user_id integer NOT NULL,
    override_date date NOT NULL,
    scope public.slot_override_scope_enum NOT NULL,
    start_time_utc timestamp with time zone,
    end_time_utc timestamp with time zone,
    reason character varying(255),
    created_by integer,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT ck_slot_override_scope CHECK ((scope = ANY (ARRAY['full_day'::public.slot_override_scope_enum, 'range'::public.slot_override_scope_enum]))),
    CONSTRAINT ck_slot_override_time_scope CHECK ((((scope = 'full_day'::public.slot_override_scope_enum) AND (start_time_utc IS NULL) AND (end_time_utc IS NULL)) OR ((scope = 'range'::public.slot_override_scope_enum) AND (start_time_utc IS NOT NULL) AND (end_time_utc IS NOT NULL) AND (end_time_utc > start_time_utc))))
);


--
-- Name: doctor_slot_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_slot_overrides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_slot_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_slot_overrides_id_seq OWNED BY public.doctor_slot_overrides.id;


--
-- Name: doctor_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_status_logs (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    admin_id integer NOT NULL,
    previous_status character varying(50),
    new_status character varying(50) NOT NULL,
    reason text,
    created_at timestamp without time zone
);


--
-- Name: doctor_status_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_status_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_status_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_status_logs_id_seq OWNED BY public.doctor_status_logs.id;


--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_contacts (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    contact_name character varying(100) NOT NULL,
    relationship character varying(50),
    phone character varying(20) NOT NULL,
    alternate_phone character varying(20),
    email character varying(120),
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emergency_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;


--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.in_app_notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    payload json,
    is_read boolean NOT NULL,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: in_app_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.in_app_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: in_app_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.in_app_notifications_id_seq OWNED BY public.in_app_notifications.id;


--
-- Name: medical_record_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_record_audit_logs (
    id integer NOT NULL,
    medical_record_id integer,
    action character varying(100),
    performed_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: medical_record_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medical_record_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medical_record_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medical_record_audit_logs_id_seq OWNED BY public.medical_record_audit_logs.id;


--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_records (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    file_path character varying(500) NOT NULL,
    doctor_name character varying(120),
    appointment_id integer,
    description text,
    record_date date,
    verified_by_doctor boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    file_type character varying(50),
    file_size_bytes bigint,
    hospital_name character varying(200),
    notes text,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    uploaded_by integer
);


--
-- Name: medical_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medical_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medical_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medical_records_id_seq OWNED BY public.medical_records.id;


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reactions (
    id integer NOT NULL,
    message_id integer,
    user_id integer NOT NULL,
    reaction_type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: message_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_reactions_id_seq OWNED BY public.message_reactions.id;


--
-- Name: message_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_status (
    id integer NOT NULL,
    message_id integer,
    user_id integer NOT NULL,
    status character varying(20) DEFAULT 'sent'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT message_status_status_check CHECK (((status)::text = ANY (ARRAY[('sent'::character varying)::text, ('delivered'::character varying)::text, ('read'::character varying)::text])))
);


--
-- Name: message_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_status_id_seq OWNED BY public.message_status.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    type character varying(20),
    is_read boolean,
    is_deleted boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    module_key character varying(120) NOT NULL,
    display_name character varying(150) NOT NULL,
    is_enabled boolean NOT NULL,
    roles_allowed json NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer,
    email_appointments boolean DEFAULT true,
    email_prescriptions boolean DEFAULT true,
    email_messages boolean DEFAULT true,
    email_announcements boolean DEFAULT true,
    email_feedback boolean DEFAULT true,
    sms_appointments boolean DEFAULT false,
    sms_prescriptions boolean DEFAULT false,
    inapp_appointments boolean DEFAULT true,
    inapp_prescriptions boolean DEFAULT true,
    inapp_messages boolean DEFAULT true,
    inapp_announcements boolean DEFAULT true,
    allow_doctor_followup boolean DEFAULT true,
    allow_promotions boolean DEFAULT false,
    allow_anonymous_feedback boolean DEFAULT true,
    share_history_with_doctors boolean DEFAULT true,
    allow_analytics boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    sms_messages boolean DEFAULT false,
    sms_announcements boolean DEFAULT false
);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participants (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone
);


--
-- Name: participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.participants_id_seq OWNED BY public.participants.id;


--
-- Name: patient_allergies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_allergies (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    allergy_name character varying(120) NOT NULL,
    reaction character varying(255),
    severity character varying(20) NOT NULL,
    diagnosed_date date,
    status character varying(30) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    created_by_user_id integer,
    created_by_role character varying(20) DEFAULT 'patient'::character varying NOT NULL
);


--
-- Name: patient_allergies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_allergies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_allergies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_allergies_id_seq OWNED BY public.patient_allergies.id;


--
-- Name: patient_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_audit_logs (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    actor_id integer NOT NULL,
    action_type character varying(100) NOT NULL,
    description text,
    audit_metadata json,
    ip_address character varying(45),
    user_agent character varying(255),
    created_at timestamp without time zone
);


--
-- Name: patient_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_audit_logs_id_seq OWNED BY public.patient_audit_logs.id;


--
-- Name: patient_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_conditions (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    condition_name character varying(120) NOT NULL,
    diagnosed_date date,
    status character varying(30) NOT NULL,
    last_reviewed date,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    under_treatment boolean DEFAULT true NOT NULL,
    created_by_user_id integer,
    created_by_role character varying(20) DEFAULT 'patient'::character varying NOT NULL
);


--
-- Name: patient_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_conditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_conditions_id_seq OWNED BY public.patient_conditions.id;


--
-- Name: patient_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_flags (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    reporter_id integer NOT NULL,
    category character varying(100) NOT NULL,
    reason text NOT NULL,
    severity character varying(20),
    is_resolved boolean,
    resolved_at timestamp without time zone,
    resolved_by integer,
    resolution_note text,
    created_at timestamp without time zone
);


--
-- Name: patient_flags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_flags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_flags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_flags_id_seq OWNED BY public.patient_flags.id;


--
-- Name: patient_medications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_medications (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    drug_name character varying(150) NOT NULL,
    dosage character varying(80),
    frequency character varying(80),
    start_date date,
    end_date date,
    prescribed_by character varying(120),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    created_by_user_id integer,
    created_by_role character varying(20) DEFAULT 'patient'::character varying NOT NULL,
    medication_origin character varying(30) DEFAULT 'past_external'::character varying NOT NULL,
    source_hospital_name character varying(200)
);


--
-- Name: patient_medications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_medications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_medications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_medications_id_seq OWNED BY public.patient_medications.id;


--
-- Name: patient_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    phone character varying(20),
    date_of_birth date,
    gender character varying(20),
    blood_group character varying(5),
    height_cm integer,
    weight_kg integer,
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    pincode character varying(20),
    allergies text,
    chronic_conditions text,
    profile_image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: patient_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_profiles_id_seq OWNED BY public.patient_profiles.id;


--
-- Name: patient_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_status_logs (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    admin_id integer NOT NULL,
    previous_status character varying(50),
    new_status character varying(50) NOT NULL,
    reason text,
    created_at timestamp without time zone
);


--
-- Name: patient_status_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_status_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_status_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_status_logs_id_seq OWNED BY public.patient_status_logs.id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription_items (
    id integer NOT NULL,
    prescription_id integer NOT NULL,
    medicine_name character varying(255) NOT NULL,
    dosage character varying(100) NOT NULL,
    frequency character varying(100) NOT NULL,
    duration character varying(100) NOT NULL,
    instructions text,
    duration_days integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prescription_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prescription_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prescription_items_id_seq OWNED BY public.prescription_items.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescriptions (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    patient_id integer NOT NULL,
    appointment_id integer,
    diagnosis text NOT NULL,
    notes text,
    status public.prescription_status,
    valid_until date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    issued_date date DEFAULT CURRENT_DATE,
    is_deleted boolean DEFAULT false
);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: record_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record_tags (
    id integer NOT NULL,
    record_id integer NOT NULL,
    tag_name character varying(80) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: record_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_tags_id_seq OWNED BY public.record_tags.id;


--
-- Name: review_escalations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_escalations (
    id integer NOT NULL,
    review_id integer NOT NULL,
    escalated_by integer NOT NULL,
    reason text,
    status character varying(20),
    created_at timestamp without time zone
);


--
-- Name: review_escalations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_escalations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_escalations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_escalations_id_seq OWNED BY public.review_escalations.id;


--
-- Name: review_moderation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_moderation_logs (
    id integer NOT NULL,
    review_id integer NOT NULL,
    action character varying(50) NOT NULL,
    performed_by integer NOT NULL,
    note text,
    created_at timestamp without time zone
);


--
-- Name: review_moderation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_moderation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_moderation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_moderation_logs_id_seq OWNED BY public.review_moderation_logs.id;


--
-- Name: review_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_tags (
    id integer NOT NULL,
    review_id integer NOT NULL,
    tag character varying(50) NOT NULL
);


--
-- Name: review_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_tags_id_seq OWNED BY public.review_tags.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    appointment_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    rating integer NOT NULL,
    review_text text,
    sentiment character varying(20),
    is_hidden boolean,
    is_flagged boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: security_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_activity (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    description text,
    ip_address character varying(45),
    user_agent character varying(255),
    created_at timestamp without time zone
);


--
-- Name: security_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.security_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: security_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.security_activity_id_seq OWNED BY public.security_activity.id;


--
-- Name: slot_event_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slot_event_logs (
    id integer NOT NULL,
    event_type character varying(80) NOT NULL,
    doctor_user_id integer,
    slot_id integer,
    appointment_id integer,
    actor_user_id integer,
    source character varying(80) NOT NULL,
    reason character varying(255),
    correlation_id character varying(100),
    previous_status character varying(50),
    new_status character varying(50),
    metadata_json json,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: slot_event_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.slot_event_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: slot_event_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.slot_event_logs_id_seq OWNED BY public.slot_event_logs.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    setting_type character varying(50),
    setting_group character varying(50),
    updated_by integer,
    updated_at timestamp without time zone
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50),
    full_name character varying(100),
    account_status character varying(20) DEFAULT 'active'::character varying,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_email_verified boolean DEFAULT false,
    is_phone_verified boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    preferred_language character varying(20) DEFAULT 'en'::character varying,
    is_two_factor_enabled boolean DEFAULT false
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcement_reads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads ALTER COLUMN id SET DEFAULT nextval('public.announcement_reads_id_seq'::regclass);


--
-- Name: announcement_targets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_targets ALTER COLUMN id SET DEFAULT nextval('public.announcement_targets_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: appointment_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_slots ALTER COLUMN id SET DEFAULT nextval('public.appointment_slots_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: clinical_remarks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_remarks ALTER COLUMN id SET DEFAULT nextval('public.clinical_remarks_id_seq'::regclass);


--
-- Name: clinical_structures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_structures ALTER COLUMN id SET DEFAULT nextval('public.clinical_structures_id_seq'::regclass);


--
-- Name: conversation_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants ALTER COLUMN id SET DEFAULT nextval('public.conversation_participants_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: doctor_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.doctor_audit_logs_id_seq'::regclass);


--
-- Name: doctor_availability id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability ALTER COLUMN id SET DEFAULT nextval('public.doctor_availability_id_seq'::regclass);


--
-- Name: doctor_blocked_dates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_blocked_dates ALTER COLUMN id SET DEFAULT nextval('public.doctor_blocked_dates_id_seq'::regclass);


--
-- Name: doctor_consultation_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_consultation_settings ALTER COLUMN id SET DEFAULT nextval('public.doctor_consultation_settings_id_seq'::regclass);


--
-- Name: doctor_expertise_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_expertise_tags ALTER COLUMN id SET DEFAULT nextval('public.doctor_expertise_tags_id_seq'::regclass);


--
-- Name: doctor_notification_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_notification_settings ALTER COLUMN id SET DEFAULT nextval('public.doctor_notification_settings_id_seq'::regclass);


--
-- Name: doctor_privacy_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_privacy_settings ALTER COLUMN id SET DEFAULT nextval('public.doctor_privacy_settings_id_seq'::regclass);


--
-- Name: doctor_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_profiles ALTER COLUMN id SET DEFAULT nextval('public.doctor_profiles_id_seq'::regclass);


--
-- Name: doctor_schedule_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_schedule_settings ALTER COLUMN id SET DEFAULT nextval('public.doctor_schedule_settings_id_seq'::regclass);


--
-- Name: doctor_slot_overrides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_slot_overrides ALTER COLUMN id SET DEFAULT nextval('public.doctor_slot_overrides_id_seq'::regclass);


--
-- Name: doctor_status_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_status_logs ALTER COLUMN id SET DEFAULT nextval('public.doctor_status_logs_id_seq'::regclass);


--
-- Name: emergency_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN id SET DEFAULT nextval('public.emergency_contacts_id_seq'::regclass);


--
-- Name: in_app_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.in_app_notifications ALTER COLUMN id SET DEFAULT nextval('public.in_app_notifications_id_seq'::regclass);


--
-- Name: medical_record_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_record_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.medical_record_audit_logs_id_seq'::regclass);


--
-- Name: medical_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN id SET DEFAULT nextval('public.medical_records_id_seq'::regclass);


--
-- Name: message_reactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions ALTER COLUMN id SET DEFAULT nextval('public.message_reactions_id_seq'::regclass);


--
-- Name: message_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_status ALTER COLUMN id SET DEFAULT nextval('public.message_status_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants ALTER COLUMN id SET DEFAULT nextval('public.participants_id_seq'::regclass);


--
-- Name: patient_allergies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_allergies ALTER COLUMN id SET DEFAULT nextval('public.patient_allergies_id_seq'::regclass);


--
-- Name: patient_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.patient_audit_logs_id_seq'::regclass);


--
-- Name: patient_conditions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_conditions ALTER COLUMN id SET DEFAULT nextval('public.patient_conditions_id_seq'::regclass);


--
-- Name: patient_flags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_flags ALTER COLUMN id SET DEFAULT nextval('public.patient_flags_id_seq'::regclass);


--
-- Name: patient_medications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_medications ALTER COLUMN id SET DEFAULT nextval('public.patient_medications_id_seq'::regclass);


--
-- Name: patient_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles ALTER COLUMN id SET DEFAULT nextval('public.patient_profiles_id_seq'::regclass);


--
-- Name: patient_status_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_status_logs ALTER COLUMN id SET DEFAULT nextval('public.patient_status_logs_id_seq'::regclass);


--
-- Name: prescription_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN id SET DEFAULT nextval('public.prescription_items_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: record_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_tags ALTER COLUMN id SET DEFAULT nextval('public.record_tags_id_seq'::regclass);


--
-- Name: review_escalations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_escalations ALTER COLUMN id SET DEFAULT nextval('public.review_escalations_id_seq'::regclass);


--
-- Name: review_moderation_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs ALTER COLUMN id SET DEFAULT nextval('public.review_moderation_logs_id_seq'::regclass);


--
-- Name: review_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_tags ALTER COLUMN id SET DEFAULT nextval('public.review_tags_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: security_activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_activity ALTER COLUMN id SET DEFAULT nextval('public.security_activity_id_seq'::regclass);


--
-- Name: slot_event_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs ALTER COLUMN id SET DEFAULT nextval('public.slot_event_logs_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: announcement_reads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcement_reads (id, announcement_id, user_id, is_read, acknowledged, read_at) FROM stdin;
\.


--
-- Data for Name: announcement_targets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcement_targets (id, announcement_id, target_type, target_value, created_at) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, category, priority, status, publish_at, expiry_at, created_by, updated_by, is_pinned, require_acknowledgement, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointment_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_slots (id, doctor_user_id, slot_start_utc, slot_end_utc, slot_date_local, status, held_by_patient_id, held_until_utc, booked_appointment_id, source, created_at, updated_at) FROM stdin;
1	8	2026-03-28 09:00:00+05:30	2026-03-28 09:30:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.563079+05:30	2026-02-19 05:10:51.563081+05:30
2	8	2026-03-28 09:30:00+05:30	2026-03-28 09:40:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.566955+05:30	2026-02-19 05:10:51.566956+05:30
3	8	2026-03-28 09:40:00+05:30	2026-03-28 10:10:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.568167+05:30	2026-02-19 05:10:51.568168+05:30
4	8	2026-03-28 10:10:00+05:30	2026-03-28 10:20:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.569235+05:30	2026-02-19 05:10:51.569235+05:30
5	8	2026-03-28 10:20:00+05:30	2026-03-28 10:50:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.570495+05:30	2026-02-19 05:10:51.570496+05:30
6	8	2026-03-28 10:50:00+05:30	2026-03-28 11:00:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.572006+05:30	2026-02-19 05:10:51.572007+05:30
7	8	2026-03-28 11:00:00+05:30	2026-03-28 11:30:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.573774+05:30	2026-02-19 05:10:51.573777+05:30
8	8	2026-03-28 11:30:00+05:30	2026-03-28 11:40:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.575335+05:30	2026-02-19 05:10:51.575336+05:30
9	8	2026-03-28 11:40:00+05:30	2026-03-28 12:10:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.57676+05:30	2026-02-19 05:10:51.576761+05:30
10	8	2026-03-28 12:10:00+05:30	2026-03-28 12:20:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.578993+05:30	2026-02-19 05:10:51.578996+05:30
11	8	2026-03-28 12:20:00+05:30	2026-03-28 12:50:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.580584+05:30	2026-02-19 05:10:51.580585+05:30
12	8	2026-03-28 12:50:00+05:30	2026-03-28 13:00:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.584159+05:30	2026-02-19 05:10:51.584169+05:30
13	8	2026-03-28 13:00:00+05:30	2026-03-28 13:30:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.587239+05:30	2026-02-19 05:10:51.587244+05:30
14	8	2026-03-28 13:30:00+05:30	2026-03-28 13:40:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.59077+05:30	2026-02-19 05:10:51.590776+05:30
15	8	2026-03-28 13:40:00+05:30	2026-03-28 14:10:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.593563+05:30	2026-02-19 05:10:51.59357+05:30
16	8	2026-03-28 14:10:00+05:30	2026-03-28 14:20:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.596393+05:30	2026-02-19 05:10:51.596397+05:30
17	8	2026-03-28 14:20:00+05:30	2026-03-28 14:50:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.599278+05:30	2026-02-19 05:10:51.599283+05:30
18	8	2026-03-28 14:50:00+05:30	2026-03-28 15:00:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.601991+05:30	2026-02-19 05:10:51.601996+05:30
19	8	2026-03-28 15:00:00+05:30	2026-03-28 15:30:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.60565+05:30	2026-02-19 05:10:51.605656+05:30
20	8	2026-03-28 15:30:00+05:30	2026-03-28 15:40:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.609399+05:30	2026-02-19 05:10:51.609405+05:30
21	8	2026-03-28 15:40:00+05:30	2026-03-28 16:10:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.612971+05:30	2026-02-19 05:10:51.612977+05:30
22	8	2026-03-28 16:10:00+05:30	2026-03-28 16:20:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.617345+05:30	2026-02-19 05:10:51.617355+05:30
23	8	2026-03-28 16:20:00+05:30	2026-03-28 16:50:00+05:30	2026-03-28	available	\N	\N	\N	generated	2026-02-19 05:10:51.620525+05:30	2026-02-19 05:10:51.620531+05:30
24	8	2026-03-28 16:50:00+05:30	2026-03-28 17:00:00+05:30	2026-03-28	blocked	\N	\N	\N	generated	2026-02-19 05:10:51.62422+05:30	2026-02-19 05:10:51.624225+05:30
49	8	2026-02-19 09:00:00+05:30	2026-02-19 09:30:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.615822+05:30	2026-02-19 06:04:04.615825+05:30
50	8	2026-02-19 09:30:00+05:30	2026-02-19 09:40:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.624962+05:30	2026-02-19 06:04:04.624963+05:30
51	8	2026-02-19 09:40:00+05:30	2026-02-19 10:10:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.62653+05:30	2026-02-19 06:04:04.626531+05:30
52	8	2026-02-19 10:10:00+05:30	2026-02-19 10:20:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.627978+05:30	2026-02-19 06:04:04.627979+05:30
53	8	2026-02-19 10:20:00+05:30	2026-02-19 10:50:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.629725+05:30	2026-02-19 06:04:04.629726+05:30
54	8	2026-02-19 10:50:00+05:30	2026-02-19 11:00:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.631137+05:30	2026-02-19 06:04:04.631138+05:30
55	8	2026-02-19 11:00:00+05:30	2026-02-19 11:30:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.632612+05:30	2026-02-19 06:04:04.632614+05:30
56	8	2026-02-19 11:30:00+05:30	2026-02-19 11:40:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.634414+05:30	2026-02-19 06:04:04.634415+05:30
57	8	2026-02-19 11:40:00+05:30	2026-02-19 12:10:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.636214+05:30	2026-02-19 06:04:04.636216+05:30
58	8	2026-02-19 12:10:00+05:30	2026-02-19 12:20:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.638396+05:30	2026-02-19 06:04:04.638398+05:30
59	8	2026-02-19 12:20:00+05:30	2026-02-19 12:50:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.640508+05:30	2026-02-19 06:04:04.640511+05:30
60	8	2026-02-19 12:50:00+05:30	2026-02-19 13:00:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.642914+05:30	2026-02-19 06:04:04.642916+05:30
61	8	2026-02-19 13:00:00+05:30	2026-02-19 13:30:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.645166+05:30	2026-02-19 06:04:04.645169+05:30
62	8	2026-02-19 13:30:00+05:30	2026-02-19 13:40:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.64706+05:30	2026-02-19 06:04:04.647063+05:30
63	8	2026-02-19 13:40:00+05:30	2026-02-19 14:10:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.648704+05:30	2026-02-19 06:04:04.648706+05:30
64	8	2026-02-19 14:10:00+05:30	2026-02-19 14:20:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.650226+05:30	2026-02-19 06:04:04.650227+05:30
65	8	2026-02-19 14:20:00+05:30	2026-02-19 14:50:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.651639+05:30	2026-02-19 06:04:04.651641+05:30
66	8	2026-02-19 14:50:00+05:30	2026-02-19 15:00:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.653407+05:30	2026-02-19 06:04:04.653409+05:30
67	8	2026-02-19 15:00:00+05:30	2026-02-19 15:30:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.655329+05:30	2026-02-19 06:04:04.655331+05:30
68	8	2026-02-19 15:30:00+05:30	2026-02-19 15:40:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.657269+05:30	2026-02-19 06:04:04.657271+05:30
69	8	2026-02-19 15:40:00+05:30	2026-02-19 16:10:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.659051+05:30	2026-02-19 06:04:04.659052+05:30
70	8	2026-02-19 16:10:00+05:30	2026-02-19 16:20:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.66087+05:30	2026-02-19 06:04:04.660872+05:30
71	8	2026-02-19 16:20:00+05:30	2026-02-19 16:50:00+05:30	2026-02-19	available	\N	\N	\N	generated	2026-02-19 06:04:04.662766+05:30	2026-02-19 06:04:04.662767+05:30
72	8	2026-02-19 16:50:00+05:30	2026-02-19 17:00:00+05:30	2026-02-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.66486+05:30	2026-02-19 06:04:04.664862+05:30
73	8	2026-02-21 09:00:00+05:30	2026-02-21 09:30:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.666673+05:30	2026-02-19 06:04:04.666675+05:30
74	8	2026-02-21 09:30:00+05:30	2026-02-21 09:40:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.668228+05:30	2026-02-19 06:04:04.668229+05:30
75	8	2026-02-21 09:40:00+05:30	2026-02-21 10:10:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.670299+05:30	2026-02-19 06:04:04.6703+05:30
76	8	2026-02-21 10:10:00+05:30	2026-02-21 10:20:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.672387+05:30	2026-02-19 06:04:04.672389+05:30
77	8	2026-02-21 10:20:00+05:30	2026-02-21 10:50:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.674583+05:30	2026-02-19 06:04:04.674585+05:30
78	8	2026-02-21 10:50:00+05:30	2026-02-21 11:00:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.677296+05:30	2026-02-19 06:04:04.677298+05:30
79	8	2026-02-21 11:00:00+05:30	2026-02-21 11:30:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.679932+05:30	2026-02-19 06:04:04.679934+05:30
80	8	2026-02-21 11:30:00+05:30	2026-02-21 11:40:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.681835+05:30	2026-02-19 06:04:04.681837+05:30
81	8	2026-02-21 11:40:00+05:30	2026-02-21 12:10:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.683762+05:30	2026-02-19 06:04:04.683763+05:30
82	8	2026-02-21 12:10:00+05:30	2026-02-21 12:20:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.685698+05:30	2026-02-19 06:04:04.685699+05:30
83	8	2026-02-21 12:20:00+05:30	2026-02-21 12:50:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.687588+05:30	2026-02-19 06:04:04.687589+05:30
84	8	2026-02-21 12:50:00+05:30	2026-02-21 13:00:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.689625+05:30	2026-02-19 06:04:04.689627+05:30
86	8	2026-02-21 13:30:00+05:30	2026-02-21 13:40:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.693865+05:30	2026-02-19 06:04:04.693866+05:30
87	8	2026-02-21 13:40:00+05:30	2026-02-21 14:10:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.695998+05:30	2026-02-19 06:04:04.696+05:30
88	8	2026-02-21 14:10:00+05:30	2026-02-21 14:20:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.698273+05:30	2026-02-19 06:04:04.698278+05:30
89	8	2026-02-21 14:20:00+05:30	2026-02-21 14:50:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.700159+05:30	2026-02-19 06:04:04.700161+05:30
90	8	2026-02-21 14:50:00+05:30	2026-02-21 15:00:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.703889+05:30	2026-02-19 06:04:04.703891+05:30
91	8	2026-02-21 15:00:00+05:30	2026-02-21 15:30:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.705946+05:30	2026-02-19 06:04:04.705948+05:30
92	8	2026-02-21 15:30:00+05:30	2026-02-21 15:40:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.7079+05:30	2026-02-19 06:04:04.707901+05:30
93	8	2026-02-21 15:40:00+05:30	2026-02-21 16:10:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.710135+05:30	2026-02-19 06:04:04.710136+05:30
94	8	2026-02-21 16:10:00+05:30	2026-02-21 16:20:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.712223+05:30	2026-02-19 06:04:04.712226+05:30
95	8	2026-02-21 16:20:00+05:30	2026-02-21 16:50:00+05:30	2026-02-21	available	\N	\N	\N	generated	2026-02-19 06:04:04.714753+05:30	2026-02-19 06:04:04.714755+05:30
96	8	2026-02-21 16:50:00+05:30	2026-02-21 17:00:00+05:30	2026-02-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.717333+05:30	2026-02-19 06:04:04.717335+05:30
97	8	2026-02-23 09:00:00+05:30	2026-02-23 09:30:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.719264+05:30	2026-02-19 06:04:04.719266+05:30
98	8	2026-02-23 09:30:00+05:30	2026-02-23 09:40:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.72104+05:30	2026-02-19 06:04:04.721041+05:30
99	8	2026-02-23 10:00:00+05:30	2026-02-23 10:30:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.72303+05:30	2026-02-19 06:04:04.723031+05:30
100	8	2026-02-23 10:30:00+05:30	2026-02-23 10:40:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.72542+05:30	2026-02-19 06:04:04.725422+05:30
101	8	2026-02-23 10:40:00+05:30	2026-02-23 11:10:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.72757+05:30	2026-02-19 06:04:04.727572+05:30
102	8	2026-02-23 11:10:00+05:30	2026-02-23 11:20:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.729798+05:30	2026-02-19 06:04:04.7298+05:30
103	8	2026-02-23 11:20:00+05:30	2026-02-23 11:50:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.731909+05:30	2026-02-19 06:04:04.731911+05:30
104	8	2026-02-23 11:50:00+05:30	2026-02-23 12:00:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.734088+05:30	2026-02-19 06:04:04.73409+05:30
105	8	2026-02-23 09:40:00+05:30	2026-02-23 10:10:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.738579+05:30	2026-02-19 06:04:04.738581+05:30
106	8	2026-02-23 10:10:00+05:30	2026-02-23 10:20:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.740975+05:30	2026-02-19 06:04:04.740977+05:30
107	8	2026-02-23 10:20:00+05:30	2026-02-23 10:50:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.7432+05:30	2026-02-19 06:04:04.743201+05:30
108	8	2026-02-23 10:50:00+05:30	2026-02-23 11:00:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.745514+05:30	2026-02-19 06:04:04.745516+05:30
109	8	2026-02-23 11:00:00+05:30	2026-02-23 11:30:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.748132+05:30	2026-02-19 06:04:04.748135+05:30
110	8	2026-02-23 11:30:00+05:30	2026-02-23 11:40:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.750149+05:30	2026-02-19 06:04:04.750151+05:30
111	8	2026-02-23 11:40:00+05:30	2026-02-23 12:10:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.752174+05:30	2026-02-19 06:04:04.752176+05:30
112	8	2026-02-23 12:10:00+05:30	2026-02-23 12:20:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.754702+05:30	2026-02-19 06:04:04.754704+05:30
113	8	2026-02-23 12:20:00+05:30	2026-02-23 12:50:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.758926+05:30	2026-02-19 06:04:04.758927+05:30
114	8	2026-02-23 12:50:00+05:30	2026-02-23 13:00:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.7609+05:30	2026-02-19 06:04:04.760902+05:30
115	8	2026-02-23 13:00:00+05:30	2026-02-23 13:30:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.762862+05:30	2026-02-19 06:04:04.762865+05:30
116	8	2026-02-23 13:30:00+05:30	2026-02-23 13:40:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.764615+05:30	2026-02-19 06:04:04.764618+05:30
117	8	2026-02-23 13:40:00+05:30	2026-02-23 14:10:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.766351+05:30	2026-02-19 06:04:04.766353+05:30
118	8	2026-02-23 14:10:00+05:30	2026-02-23 14:20:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.768003+05:30	2026-02-19 06:04:04.768005+05:30
119	8	2026-02-23 14:20:00+05:30	2026-02-23 14:50:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.769721+05:30	2026-02-19 06:04:04.769723+05:30
120	8	2026-02-23 14:50:00+05:30	2026-02-23 15:00:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.771548+05:30	2026-02-19 06:04:04.77155+05:30
121	8	2026-02-23 15:00:00+05:30	2026-02-23 15:30:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.773535+05:30	2026-02-19 06:04:04.773538+05:30
122	8	2026-02-23 15:30:00+05:30	2026-02-23 15:40:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.77544+05:30	2026-02-19 06:04:04.775442+05:30
123	8	2026-02-23 15:40:00+05:30	2026-02-23 16:10:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.777501+05:30	2026-02-19 06:04:04.777503+05:30
124	8	2026-02-23 16:10:00+05:30	2026-02-23 16:20:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.779916+05:30	2026-02-19 06:04:04.77992+05:30
125	8	2026-02-23 16:20:00+05:30	2026-02-23 16:50:00+05:30	2026-02-23	available	\N	\N	\N	generated	2026-02-19 06:04:04.782245+05:30	2026-02-19 06:04:04.782249+05:30
126	8	2026-02-23 16:50:00+05:30	2026-02-23 17:00:00+05:30	2026-02-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:04.783835+05:30	2026-02-19 06:04:04.783837+05:30
355	8	2026-03-10 09:00:00+05:30	2026-03-10 09:30:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.143042+05:30	2026-02-19 06:04:05.143043+05:30
356	8	2026-03-10 09:30:00+05:30	2026-03-10 09:40:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.144338+05:30	2026-02-19 06:04:05.144339+05:30
357	8	2026-03-10 09:40:00+05:30	2026-03-10 10:10:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.145621+05:30	2026-02-19 06:04:05.145622+05:30
358	8	2026-03-10 10:10:00+05:30	2026-03-10 10:20:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.146873+05:30	2026-02-19 06:04:05.146874+05:30
359	8	2026-03-10 10:20:00+05:30	2026-03-10 10:50:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.148128+05:30	2026-02-19 06:04:05.148129+05:30
360	8	2026-03-10 10:50:00+05:30	2026-03-10 11:00:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.149353+05:30	2026-02-19 06:04:05.149354+05:30
361	8	2026-03-10 11:00:00+05:30	2026-03-10 11:30:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.15052+05:30	2026-02-19 06:04:05.15052+05:30
362	8	2026-03-10 11:30:00+05:30	2026-03-10 11:40:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.151634+05:30	2026-02-19 06:04:05.151634+05:30
363	8	2026-03-10 11:40:00+05:30	2026-03-10 12:10:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.152873+05:30	2026-02-19 06:04:05.152873+05:30
364	8	2026-03-10 12:10:00+05:30	2026-03-10 12:20:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.154166+05:30	2026-02-19 06:04:05.154166+05:30
365	8	2026-03-10 12:20:00+05:30	2026-03-10 12:50:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.155359+05:30	2026-02-19 06:04:05.15536+05:30
366	8	2026-03-10 12:50:00+05:30	2026-03-10 13:00:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.156525+05:30	2026-02-19 06:04:05.156525+05:30
367	8	2026-03-10 13:00:00+05:30	2026-03-10 13:30:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.157686+05:30	2026-02-19 06:04:05.157687+05:30
368	8	2026-03-10 13:30:00+05:30	2026-03-10 13:40:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.158771+05:30	2026-02-19 06:04:05.158772+05:30
369	8	2026-03-10 13:40:00+05:30	2026-03-10 14:10:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.159834+05:30	2026-02-19 06:04:05.159835+05:30
370	8	2026-03-10 14:10:00+05:30	2026-03-10 14:20:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.160913+05:30	2026-02-19 06:04:05.160914+05:30
371	8	2026-03-10 14:20:00+05:30	2026-03-10 14:50:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.162164+05:30	2026-02-19 06:04:05.162165+05:30
372	8	2026-03-10 14:50:00+05:30	2026-03-10 15:00:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.163518+05:30	2026-02-19 06:04:05.163519+05:30
373	8	2026-03-10 15:00:00+05:30	2026-03-10 15:30:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.164453+05:30	2026-02-19 06:04:05.164454+05:30
374	8	2026-03-10 15:30:00+05:30	2026-03-10 15:40:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.165296+05:30	2026-02-19 06:04:05.165297+05:30
375	8	2026-03-10 15:40:00+05:30	2026-03-10 16:10:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.166114+05:30	2026-02-19 06:04:05.166115+05:30
376	8	2026-03-10 16:10:00+05:30	2026-03-10 16:20:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.166955+05:30	2026-02-19 06:04:05.166956+05:30
377	8	2026-03-10 16:20:00+05:30	2026-03-10 16:50:00+05:30	2026-03-10	available	\N	\N	\N	generated	2026-02-19 06:04:05.167772+05:30	2026-02-19 06:04:05.167773+05:30
378	8	2026-03-10 16:50:00+05:30	2026-03-10 17:00:00+05:30	2026-03-10	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.168781+05:30	2026-02-19 06:04:05.168781+05:30
379	8	2026-03-11 09:00:00+05:30	2026-03-11 09:30:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.169951+05:30	2026-02-19 06:04:05.169951+05:30
380	8	2026-03-11 09:30:00+05:30	2026-03-11 09:40:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.171103+05:30	2026-02-19 06:04:05.171104+05:30
381	8	2026-03-11 09:40:00+05:30	2026-03-11 10:10:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.172296+05:30	2026-02-19 06:04:05.172296+05:30
382	8	2026-03-11 10:10:00+05:30	2026-03-11 10:20:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.17357+05:30	2026-02-19 06:04:05.17357+05:30
383	8	2026-03-11 10:20:00+05:30	2026-03-11 10:50:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.174689+05:30	2026-02-19 06:04:05.17469+05:30
384	8	2026-03-11 10:50:00+05:30	2026-03-11 11:00:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.175768+05:30	2026-02-19 06:04:05.175769+05:30
385	8	2026-03-11 11:00:00+05:30	2026-03-11 11:30:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.176844+05:30	2026-02-19 06:04:05.176845+05:30
386	8	2026-03-11 11:30:00+05:30	2026-03-11 11:40:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.178014+05:30	2026-02-19 06:04:05.178015+05:30
387	8	2026-03-11 11:40:00+05:30	2026-03-11 12:10:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.178778+05:30	2026-02-19 06:04:05.178778+05:30
388	8	2026-03-11 12:10:00+05:30	2026-03-11 12:20:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.179551+05:30	2026-02-19 06:04:05.179552+05:30
389	8	2026-03-11 12:20:00+05:30	2026-03-11 12:50:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.180503+05:30	2026-02-19 06:04:05.180503+05:30
390	8	2026-03-11 12:50:00+05:30	2026-03-11 13:00:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.18162+05:30	2026-02-19 06:04:05.181621+05:30
391	8	2026-03-11 13:00:00+05:30	2026-03-11 13:30:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.182687+05:30	2026-02-19 06:04:05.182687+05:30
392	8	2026-03-11 13:30:00+05:30	2026-03-11 13:40:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.183716+05:30	2026-02-19 06:04:05.183717+05:30
393	8	2026-03-11 13:40:00+05:30	2026-03-11 14:10:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.184741+05:30	2026-02-19 06:04:05.184741+05:30
394	8	2026-03-11 14:10:00+05:30	2026-03-11 14:20:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.185768+05:30	2026-02-19 06:04:05.185768+05:30
395	8	2026-03-11 14:20:00+05:30	2026-03-11 14:50:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.186898+05:30	2026-02-19 06:04:05.186899+05:30
396	8	2026-03-11 14:50:00+05:30	2026-03-11 15:00:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.188049+05:30	2026-02-19 06:04:05.188049+05:30
397	8	2026-03-11 15:00:00+05:30	2026-03-11 15:30:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.189195+05:30	2026-02-19 06:04:05.189196+05:30
398	8	2026-03-11 15:30:00+05:30	2026-03-11 15:40:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.190032+05:30	2026-02-19 06:04:05.190032+05:30
399	8	2026-03-11 15:40:00+05:30	2026-03-11 16:10:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.190773+05:30	2026-02-19 06:04:05.190773+05:30
400	8	2026-03-11 16:10:00+05:30	2026-03-11 16:20:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.191555+05:30	2026-02-19 06:04:05.191556+05:30
401	8	2026-03-11 16:20:00+05:30	2026-03-11 16:50:00+05:30	2026-03-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.192651+05:30	2026-02-19 06:04:05.192652+05:30
402	8	2026-03-11 16:50:00+05:30	2026-03-11 17:00:00+05:30	2026-03-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.1937+05:30	2026-02-19 06:04:05.193701+05:30
403	8	2026-03-12 09:00:00+05:30	2026-03-12 09:30:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.194844+05:30	2026-02-19 06:04:05.194845+05:30
404	8	2026-03-12 09:30:00+05:30	2026-03-12 09:40:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.195609+05:30	2026-02-19 06:04:05.19561+05:30
405	8	2026-03-12 09:40:00+05:30	2026-03-12 10:10:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.196897+05:30	2026-02-19 06:04:05.196898+05:30
406	8	2026-03-12 10:10:00+05:30	2026-03-12 10:20:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.197708+05:30	2026-02-19 06:04:05.197709+05:30
407	8	2026-03-12 10:20:00+05:30	2026-03-12 10:50:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.198466+05:30	2026-02-19 06:04:05.198466+05:30
408	8	2026-03-12 10:50:00+05:30	2026-03-12 11:00:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.199252+05:30	2026-02-19 06:04:05.199253+05:30
409	8	2026-03-12 11:00:00+05:30	2026-03-12 11:30:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.203587+05:30	2026-02-19 06:04:05.203588+05:30
410	8	2026-03-12 11:30:00+05:30	2026-03-12 11:40:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.204948+05:30	2026-02-19 06:04:05.204949+05:30
411	8	2026-03-12 11:40:00+05:30	2026-03-12 12:10:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.206331+05:30	2026-02-19 06:04:05.206332+05:30
412	8	2026-03-12 12:10:00+05:30	2026-03-12 12:20:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.207583+05:30	2026-02-19 06:04:05.207583+05:30
413	8	2026-03-12 12:20:00+05:30	2026-03-12 12:50:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.208741+05:30	2026-02-19 06:04:05.208742+05:30
414	8	2026-03-12 12:50:00+05:30	2026-03-12 13:00:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.20987+05:30	2026-02-19 06:04:05.20987+05:30
415	8	2026-03-12 13:00:00+05:30	2026-03-12 13:30:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.210999+05:30	2026-02-19 06:04:05.210999+05:30
416	8	2026-03-12 13:30:00+05:30	2026-03-12 13:40:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.212197+05:30	2026-02-19 06:04:05.212198+05:30
417	8	2026-03-12 13:40:00+05:30	2026-03-12 14:10:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.213319+05:30	2026-02-19 06:04:05.21332+05:30
418	8	2026-03-12 14:10:00+05:30	2026-03-12 14:20:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.214467+05:30	2026-02-19 06:04:05.214468+05:30
419	8	2026-03-12 14:20:00+05:30	2026-03-12 14:50:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.215584+05:30	2026-02-19 06:04:05.215584+05:30
420	8	2026-03-12 14:50:00+05:30	2026-03-12 15:00:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.21668+05:30	2026-02-19 06:04:05.216681+05:30
421	8	2026-03-12 15:00:00+05:30	2026-03-12 15:30:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.217779+05:30	2026-02-19 06:04:05.217779+05:30
422	8	2026-03-12 15:30:00+05:30	2026-03-12 15:40:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.218863+05:30	2026-02-19 06:04:05.218864+05:30
423	8	2026-03-12 15:40:00+05:30	2026-03-12 16:10:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.220104+05:30	2026-02-19 06:04:05.220105+05:30
424	8	2026-03-12 16:10:00+05:30	2026-03-12 16:20:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.221448+05:30	2026-02-19 06:04:05.221449+05:30
425	8	2026-03-12 16:20:00+05:30	2026-03-12 16:50:00+05:30	2026-03-12	available	\N	\N	\N	generated	2026-02-19 06:04:05.2227+05:30	2026-02-19 06:04:05.2227+05:30
426	8	2026-03-12 16:50:00+05:30	2026-03-12 17:00:00+05:30	2026-03-12	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.223932+05:30	2026-02-19 06:04:05.223933+05:30
427	8	2026-03-14 09:00:00+05:30	2026-03-14 09:30:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.225139+05:30	2026-02-19 06:04:05.22514+05:30
428	8	2026-03-14 09:30:00+05:30	2026-03-14 09:40:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.226234+05:30	2026-02-19 06:04:05.226235+05:30
429	8	2026-03-14 09:40:00+05:30	2026-03-14 10:10:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.227326+05:30	2026-02-19 06:04:05.227327+05:30
430	8	2026-03-14 10:10:00+05:30	2026-03-14 10:20:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.228415+05:30	2026-02-19 06:04:05.228416+05:30
431	8	2026-03-14 10:20:00+05:30	2026-03-14 10:50:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.229566+05:30	2026-02-19 06:04:05.229566+05:30
432	8	2026-03-14 10:50:00+05:30	2026-03-14 11:00:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.23077+05:30	2026-02-19 06:04:05.23077+05:30
433	8	2026-03-14 11:00:00+05:30	2026-03-14 11:30:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.231917+05:30	2026-02-19 06:04:05.231918+05:30
434	8	2026-03-14 11:30:00+05:30	2026-03-14 11:40:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.233012+05:30	2026-02-19 06:04:05.233012+05:30
435	8	2026-03-14 11:40:00+05:30	2026-03-14 12:10:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.234095+05:30	2026-02-19 06:04:05.234096+05:30
436	8	2026-03-14 12:10:00+05:30	2026-03-14 12:20:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.235164+05:30	2026-02-19 06:04:05.235164+05:30
437	8	2026-03-14 12:20:00+05:30	2026-03-14 12:50:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.236916+05:30	2026-02-19 06:04:05.236917+05:30
438	8	2026-03-14 12:50:00+05:30	2026-03-14 13:00:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.238464+05:30	2026-02-19 06:04:05.238465+05:30
439	8	2026-03-14 13:00:00+05:30	2026-03-14 13:30:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.239676+05:30	2026-02-19 06:04:05.239676+05:30
440	8	2026-03-14 13:30:00+05:30	2026-03-14 13:40:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.240913+05:30	2026-02-19 06:04:05.240913+05:30
441	8	2026-03-14 13:40:00+05:30	2026-03-14 14:10:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.242095+05:30	2026-02-19 06:04:05.242095+05:30
442	8	2026-03-14 14:10:00+05:30	2026-03-14 14:20:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.24337+05:30	2026-02-19 06:04:05.243371+05:30
443	8	2026-03-14 14:20:00+05:30	2026-03-14 14:50:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.244658+05:30	2026-02-19 06:04:05.244659+05:30
444	8	2026-03-14 14:50:00+05:30	2026-03-14 15:00:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.246136+05:30	2026-02-19 06:04:05.246138+05:30
445	8	2026-03-14 15:00:00+05:30	2026-03-14 15:30:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.247253+05:30	2026-02-19 06:04:05.247254+05:30
446	8	2026-03-14 15:30:00+05:30	2026-03-14 15:40:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.248101+05:30	2026-02-19 06:04:05.248102+05:30
447	8	2026-03-14 15:40:00+05:30	2026-03-14 16:10:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.248888+05:30	2026-02-19 06:04:05.248889+05:30
448	8	2026-03-14 16:10:00+05:30	2026-03-14 16:20:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.249706+05:30	2026-02-19 06:04:05.249707+05:30
449	8	2026-03-14 16:20:00+05:30	2026-03-14 16:50:00+05:30	2026-03-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.250554+05:30	2026-02-19 06:04:05.250554+05:30
450	8	2026-03-14 16:50:00+05:30	2026-03-14 17:00:00+05:30	2026-03-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.251412+05:30	2026-02-19 06:04:05.251413+05:30
451	8	2026-03-16 09:00:00+05:30	2026-03-16 09:30:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.25232+05:30	2026-02-19 06:04:05.252321+05:30
452	8	2026-03-16 09:30:00+05:30	2026-03-16 09:40:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.253282+05:30	2026-02-19 06:04:05.253283+05:30
453	8	2026-03-16 10:00:00+05:30	2026-03-16 10:30:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.254241+05:30	2026-02-19 06:04:05.254241+05:30
454	8	2026-03-16 10:30:00+05:30	2026-03-16 10:40:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.255564+05:30	2026-02-19 06:04:05.255565+05:30
455	8	2026-03-16 10:40:00+05:30	2026-03-16 11:10:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.256759+05:30	2026-02-19 06:04:05.25676+05:30
456	8	2026-03-16 11:10:00+05:30	2026-03-16 11:20:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.257884+05:30	2026-02-19 06:04:05.257885+05:30
457	8	2026-03-16 11:20:00+05:30	2026-03-16 11:50:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.259015+05:30	2026-02-19 06:04:05.259015+05:30
458	8	2026-03-16 11:50:00+05:30	2026-03-16 12:00:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.260231+05:30	2026-02-19 06:04:05.260231+05:30
459	8	2026-03-16 09:40:00+05:30	2026-03-16 10:10:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.262759+05:30	2026-02-19 06:04:05.26276+05:30
460	8	2026-03-16 10:10:00+05:30	2026-03-16 10:20:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.263949+05:30	2026-02-19 06:04:05.26395+05:30
461	8	2026-03-16 10:20:00+05:30	2026-03-16 10:50:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.265083+05:30	2026-02-19 06:04:05.265084+05:30
462	8	2026-03-16 10:50:00+05:30	2026-03-16 11:00:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.266166+05:30	2026-02-19 06:04:05.266167+05:30
463	8	2026-03-16 11:00:00+05:30	2026-03-16 11:30:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.267246+05:30	2026-02-19 06:04:05.267247+05:30
464	8	2026-03-16 11:30:00+05:30	2026-03-16 11:40:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.268388+05:30	2026-02-19 06:04:05.268389+05:30
465	8	2026-03-16 11:40:00+05:30	2026-03-16 12:10:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.269599+05:30	2026-02-19 06:04:05.2696+05:30
466	8	2026-03-16 12:10:00+05:30	2026-03-16 12:20:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.27076+05:30	2026-02-19 06:04:05.270761+05:30
467	8	2026-03-16 12:20:00+05:30	2026-03-16 12:50:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.271932+05:30	2026-02-19 06:04:05.271933+05:30
468	8	2026-03-16 12:50:00+05:30	2026-03-16 13:00:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.273068+05:30	2026-02-19 06:04:05.273069+05:30
469	8	2026-03-16 13:00:00+05:30	2026-03-16 13:30:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.274176+05:30	2026-02-19 06:04:05.274176+05:30
470	8	2026-03-16 13:30:00+05:30	2026-03-16 13:40:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.275275+05:30	2026-02-19 06:04:05.275276+05:30
471	8	2026-03-16 13:40:00+05:30	2026-03-16 14:10:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.276452+05:30	2026-02-19 06:04:05.276453+05:30
472	8	2026-03-16 14:10:00+05:30	2026-03-16 14:20:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.277687+05:30	2026-02-19 06:04:05.277688+05:30
473	8	2026-03-16 14:20:00+05:30	2026-03-16 14:50:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.278845+05:30	2026-02-19 06:04:05.278846+05:30
474	8	2026-03-16 14:50:00+05:30	2026-03-16 15:00:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.280062+05:30	2026-02-19 06:04:05.280063+05:30
475	8	2026-03-16 15:00:00+05:30	2026-03-16 15:30:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.280963+05:30	2026-02-19 06:04:05.280964+05:30
476	8	2026-03-16 15:30:00+05:30	2026-03-16 15:40:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.281844+05:30	2026-02-19 06:04:05.281845+05:30
477	8	2026-03-16 15:40:00+05:30	2026-03-16 16:10:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.282742+05:30	2026-02-19 06:04:05.282743+05:30
478	8	2026-03-16 16:10:00+05:30	2026-03-16 16:20:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.283639+05:30	2026-02-19 06:04:05.28364+05:30
479	8	2026-03-16 16:20:00+05:30	2026-03-16 16:50:00+05:30	2026-03-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.284517+05:30	2026-02-19 06:04:05.284518+05:30
480	8	2026-03-16 16:50:00+05:30	2026-03-16 17:00:00+05:30	2026-03-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.285455+05:30	2026-02-19 06:04:05.285456+05:30
481	8	2026-03-17 09:00:00+05:30	2026-03-17 09:30:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.286565+05:30	2026-02-19 06:04:05.286566+05:30
482	8	2026-03-17 09:30:00+05:30	2026-03-17 09:40:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.287821+05:30	2026-02-19 06:04:05.287821+05:30
483	8	2026-03-17 09:40:00+05:30	2026-03-17 10:10:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.289129+05:30	2026-02-19 06:04:05.28913+05:30
484	8	2026-03-17 10:10:00+05:30	2026-03-17 10:20:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.2903+05:30	2026-02-19 06:04:05.2903+05:30
485	8	2026-03-17 10:20:00+05:30	2026-03-17 10:50:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.291413+05:30	2026-02-19 06:04:05.291414+05:30
486	8	2026-03-17 10:50:00+05:30	2026-03-17 11:00:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.292547+05:30	2026-02-19 06:04:05.292547+05:30
487	8	2026-03-17 11:00:00+05:30	2026-03-17 11:30:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.293657+05:30	2026-02-19 06:04:05.293658+05:30
488	8	2026-03-17 11:30:00+05:30	2026-03-17 11:40:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.294848+05:30	2026-02-19 06:04:05.294849+05:30
489	8	2026-03-17 11:40:00+05:30	2026-03-17 12:10:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.296016+05:30	2026-02-19 06:04:05.296017+05:30
490	8	2026-03-17 12:10:00+05:30	2026-03-17 12:20:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.297137+05:30	2026-02-19 06:04:05.297138+05:30
491	8	2026-03-17 12:20:00+05:30	2026-03-17 12:50:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.298249+05:30	2026-02-19 06:04:05.298249+05:30
492	8	2026-03-17 12:50:00+05:30	2026-03-17 13:00:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.299405+05:30	2026-02-19 06:04:05.299406+05:30
493	8	2026-03-17 13:00:00+05:30	2026-03-17 13:30:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.300565+05:30	2026-02-19 06:04:05.300566+05:30
494	8	2026-03-17 13:30:00+05:30	2026-03-17 13:40:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.301704+05:30	2026-02-19 06:04:05.301705+05:30
495	8	2026-03-17 13:40:00+05:30	2026-03-17 14:10:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.302976+05:30	2026-02-19 06:04:05.302977+05:30
496	8	2026-03-17 14:10:00+05:30	2026-03-17 14:20:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.30425+05:30	2026-02-19 06:04:05.304251+05:30
497	8	2026-03-17 14:20:00+05:30	2026-03-17 14:50:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.305427+05:30	2026-02-19 06:04:05.305428+05:30
498	8	2026-03-17 14:50:00+05:30	2026-03-17 15:00:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.306759+05:30	2026-02-19 06:04:05.306759+05:30
499	8	2026-03-17 15:00:00+05:30	2026-03-17 15:30:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.307963+05:30	2026-02-19 06:04:05.307963+05:30
500	8	2026-03-17 15:30:00+05:30	2026-03-17 15:40:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.309108+05:30	2026-02-19 06:04:05.309108+05:30
501	8	2026-03-17 15:40:00+05:30	2026-03-17 16:10:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.310226+05:30	2026-02-19 06:04:05.310227+05:30
502	8	2026-03-17 16:10:00+05:30	2026-03-17 16:20:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.311442+05:30	2026-02-19 06:04:05.311443+05:30
503	8	2026-03-17 16:20:00+05:30	2026-03-17 16:50:00+05:30	2026-03-17	available	\N	\N	\N	generated	2026-02-19 06:04:05.312609+05:30	2026-02-19 06:04:05.31261+05:30
504	8	2026-03-17 16:50:00+05:30	2026-03-17 17:00:00+05:30	2026-03-17	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.313677+05:30	2026-02-19 06:04:05.313677+05:30
505	8	2026-03-18 09:00:00+05:30	2026-03-18 09:30:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.314592+05:30	2026-02-19 06:04:05.314593+05:30
506	8	2026-03-18 09:30:00+05:30	2026-03-18 09:40:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.315482+05:30	2026-02-19 06:04:05.315483+05:30
507	8	2026-03-18 09:40:00+05:30	2026-03-18 10:10:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.316398+05:30	2026-02-19 06:04:05.316399+05:30
508	8	2026-03-18 10:10:00+05:30	2026-03-18 10:20:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.317344+05:30	2026-02-19 06:04:05.317344+05:30
509	8	2026-03-18 10:20:00+05:30	2026-03-18 10:50:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.318258+05:30	2026-02-19 06:04:05.318259+05:30
510	8	2026-03-18 10:50:00+05:30	2026-03-18 11:00:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.319158+05:30	2026-02-19 06:04:05.319159+05:30
511	8	2026-03-18 11:00:00+05:30	2026-03-18 11:30:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.320204+05:30	2026-02-19 06:04:05.320204+05:30
512	8	2026-03-18 11:30:00+05:30	2026-03-18 11:40:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.321218+05:30	2026-02-19 06:04:05.321218+05:30
513	8	2026-03-18 11:40:00+05:30	2026-03-18 12:10:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.32217+05:30	2026-02-19 06:04:05.32217+05:30
514	8	2026-03-18 12:10:00+05:30	2026-03-18 12:20:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.323053+05:30	2026-02-19 06:04:05.323054+05:30
515	8	2026-03-18 12:20:00+05:30	2026-03-18 12:50:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.323907+05:30	2026-02-19 06:04:05.323908+05:30
516	8	2026-03-18 12:50:00+05:30	2026-03-18 13:00:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.324807+05:30	2026-02-19 06:04:05.324808+05:30
517	8	2026-03-18 13:00:00+05:30	2026-03-18 13:30:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.325704+05:30	2026-02-19 06:04:05.325705+05:30
518	8	2026-03-18 13:30:00+05:30	2026-03-18 13:40:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.326483+05:30	2026-02-19 06:04:05.326484+05:30
519	8	2026-03-18 13:40:00+05:30	2026-03-18 14:10:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.327324+05:30	2026-02-19 06:04:05.327325+05:30
520	8	2026-03-18 14:10:00+05:30	2026-03-18 14:20:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.328288+05:30	2026-02-19 06:04:05.328289+05:30
521	8	2026-03-18 14:20:00+05:30	2026-03-18 14:50:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.329928+05:30	2026-02-19 06:04:05.329931+05:30
522	8	2026-03-18 14:50:00+05:30	2026-03-18 15:00:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.330951+05:30	2026-02-19 06:04:05.330952+05:30
523	8	2026-03-18 15:00:00+05:30	2026-03-18 15:30:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.33168+05:30	2026-02-19 06:04:05.331681+05:30
524	8	2026-03-18 15:30:00+05:30	2026-03-18 15:40:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.332446+05:30	2026-02-19 06:04:05.332447+05:30
525	8	2026-03-18 15:40:00+05:30	2026-03-18 16:10:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.333164+05:30	2026-02-19 06:04:05.333164+05:30
526	8	2026-03-18 16:10:00+05:30	2026-03-18 16:20:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.333886+05:30	2026-02-19 06:04:05.333887+05:30
527	8	2026-03-18 16:20:00+05:30	2026-03-18 16:50:00+05:30	2026-03-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.33469+05:30	2026-02-19 06:04:05.334691+05:30
528	8	2026-03-18 16:50:00+05:30	2026-03-18 17:00:00+05:30	2026-03-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.335437+05:30	2026-02-19 06:04:05.335438+05:30
529	8	2026-03-19 09:00:00+05:30	2026-03-19 09:30:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.336159+05:30	2026-02-19 06:04:05.33616+05:30
530	8	2026-03-19 09:30:00+05:30	2026-03-19 09:40:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.336987+05:30	2026-02-19 06:04:05.336987+05:30
531	8	2026-03-19 09:40:00+05:30	2026-03-19 10:10:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.337953+05:30	2026-02-19 06:04:05.337953+05:30
532	8	2026-03-19 10:10:00+05:30	2026-03-19 10:20:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.339119+05:30	2026-02-19 06:04:05.33912+05:30
533	8	2026-03-19 10:20:00+05:30	2026-03-19 10:50:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.340217+05:30	2026-02-19 06:04:05.340218+05:30
534	8	2026-03-19 10:50:00+05:30	2026-03-19 11:00:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.341269+05:30	2026-02-19 06:04:05.34127+05:30
535	8	2026-03-19 11:00:00+05:30	2026-03-19 11:30:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.3423+05:30	2026-02-19 06:04:05.342301+05:30
536	8	2026-03-19 11:30:00+05:30	2026-03-19 11:40:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.343316+05:30	2026-02-19 06:04:05.343317+05:30
537	8	2026-03-19 11:40:00+05:30	2026-03-19 12:10:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.344416+05:30	2026-02-19 06:04:05.344417+05:30
538	8	2026-03-19 12:10:00+05:30	2026-03-19 12:20:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.345447+05:30	2026-02-19 06:04:05.345448+05:30
539	8	2026-03-19 12:20:00+05:30	2026-03-19 12:50:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.34619+05:30	2026-02-19 06:04:05.346191+05:30
540	8	2026-03-19 12:50:00+05:30	2026-03-19 13:00:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.346914+05:30	2026-02-19 06:04:05.346914+05:30
541	8	2026-03-19 13:00:00+05:30	2026-03-19 13:30:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.347657+05:30	2026-02-19 06:04:05.347657+05:30
542	8	2026-03-19 13:30:00+05:30	2026-03-19 13:40:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.348388+05:30	2026-02-19 06:04:05.348389+05:30
543	8	2026-03-19 13:40:00+05:30	2026-03-19 14:10:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.349102+05:30	2026-02-19 06:04:05.349102+05:30
544	8	2026-03-19 14:10:00+05:30	2026-03-19 14:20:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.349904+05:30	2026-02-19 06:04:05.349904+05:30
545	8	2026-03-19 14:20:00+05:30	2026-03-19 14:50:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.350648+05:30	2026-02-19 06:04:05.350649+05:30
546	8	2026-03-19 14:50:00+05:30	2026-03-19 15:00:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.351391+05:30	2026-02-19 06:04:05.351391+05:30
547	8	2026-03-19 15:00:00+05:30	2026-03-19 15:30:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.352151+05:30	2026-02-19 06:04:05.352152+05:30
548	8	2026-03-19 15:30:00+05:30	2026-03-19 15:40:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.352996+05:30	2026-02-19 06:04:05.352997+05:30
549	8	2026-03-19 15:40:00+05:30	2026-03-19 16:10:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.353889+05:30	2026-02-19 06:04:05.35389+05:30
550	8	2026-03-19 16:10:00+05:30	2026-03-19 16:20:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.354724+05:30	2026-02-19 06:04:05.354725+05:30
551	8	2026-03-19 16:20:00+05:30	2026-03-19 16:50:00+05:30	2026-03-19	available	\N	\N	\N	generated	2026-02-19 06:04:05.355578+05:30	2026-02-19 06:04:05.355579+05:30
552	8	2026-03-19 16:50:00+05:30	2026-03-19 17:00:00+05:30	2026-03-19	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.356491+05:30	2026-02-19 06:04:05.356491+05:30
553	8	2026-03-21 09:00:00+05:30	2026-03-21 09:30:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.357385+05:30	2026-02-19 06:04:05.357386+05:30
554	8	2026-03-21 09:30:00+05:30	2026-03-21 09:40:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.358361+05:30	2026-02-19 06:04:05.358362+05:30
555	8	2026-03-21 09:40:00+05:30	2026-03-21 10:10:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.359152+05:30	2026-02-19 06:04:05.359152+05:30
556	8	2026-03-21 10:10:00+05:30	2026-03-21 10:20:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.360003+05:30	2026-02-19 06:04:05.360004+05:30
557	8	2026-03-21 10:20:00+05:30	2026-03-21 10:50:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.360788+05:30	2026-02-19 06:04:05.360789+05:30
558	8	2026-03-21 10:50:00+05:30	2026-03-21 11:00:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.361658+05:30	2026-02-19 06:04:05.361659+05:30
559	8	2026-03-21 11:00:00+05:30	2026-03-21 11:30:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.362578+05:30	2026-02-19 06:04:05.362579+05:30
560	8	2026-03-21 11:30:00+05:30	2026-03-21 11:40:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.363414+05:30	2026-02-19 06:04:05.363415+05:30
561	8	2026-03-21 11:40:00+05:30	2026-03-21 12:10:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.364306+05:30	2026-02-19 06:04:05.364306+05:30
562	8	2026-03-21 12:10:00+05:30	2026-03-21 12:20:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.365381+05:30	2026-02-19 06:04:05.365382+05:30
563	8	2026-03-21 12:20:00+05:30	2026-03-21 12:50:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.366309+05:30	2026-02-19 06:04:05.366309+05:30
564	8	2026-03-21 12:50:00+05:30	2026-03-21 13:00:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.367165+05:30	2026-02-19 06:04:05.367166+05:30
565	8	2026-03-21 13:00:00+05:30	2026-03-21 13:30:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.367981+05:30	2026-02-19 06:04:05.367982+05:30
566	8	2026-03-21 13:30:00+05:30	2026-03-21 13:40:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.368801+05:30	2026-02-19 06:04:05.368802+05:30
567	8	2026-03-21 13:40:00+05:30	2026-03-21 14:10:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.369617+05:30	2026-02-19 06:04:05.369617+05:30
568	8	2026-03-21 14:10:00+05:30	2026-03-21 14:20:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.370425+05:30	2026-02-19 06:04:05.370426+05:30
569	8	2026-03-21 14:20:00+05:30	2026-03-21 14:50:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.37121+05:30	2026-02-19 06:04:05.371211+05:30
570	8	2026-03-21 14:50:00+05:30	2026-03-21 15:00:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.371998+05:30	2026-02-19 06:04:05.371999+05:30
571	8	2026-03-21 15:00:00+05:30	2026-03-21 15:30:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.372779+05:30	2026-02-19 06:04:05.37278+05:30
572	8	2026-03-21 15:30:00+05:30	2026-03-21 15:40:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.37355+05:30	2026-02-19 06:04:05.373551+05:30
573	8	2026-03-21 15:40:00+05:30	2026-03-21 16:10:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.374351+05:30	2026-02-19 06:04:05.374352+05:30
574	8	2026-03-21 16:10:00+05:30	2026-03-21 16:20:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.375084+05:30	2026-02-19 06:04:05.375084+05:30
575	8	2026-03-21 16:20:00+05:30	2026-03-21 16:50:00+05:30	2026-03-21	available	\N	\N	\N	generated	2026-02-19 06:04:05.375825+05:30	2026-02-19 06:04:05.375826+05:30
576	8	2026-03-21 16:50:00+05:30	2026-03-21 17:00:00+05:30	2026-03-21	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.376577+05:30	2026-02-19 06:04:05.376578+05:30
577	8	2026-03-23 09:00:00+05:30	2026-03-23 09:30:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.377338+05:30	2026-02-19 06:04:05.377338+05:30
578	8	2026-03-23 09:30:00+05:30	2026-03-23 09:40:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.378178+05:30	2026-02-19 06:04:05.378179+05:30
579	8	2026-03-23 10:00:00+05:30	2026-03-23 10:30:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.379082+05:30	2026-02-19 06:04:05.379083+05:30
580	8	2026-03-23 10:30:00+05:30	2026-03-23 10:40:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.380189+05:30	2026-02-19 06:04:05.38019+05:30
581	8	2026-03-23 10:40:00+05:30	2026-03-23 11:10:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.381182+05:30	2026-02-19 06:04:05.381183+05:30
582	8	2026-03-23 11:10:00+05:30	2026-03-23 11:20:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.382011+05:30	2026-02-19 06:04:05.382012+05:30
583	8	2026-03-23 11:20:00+05:30	2026-03-23 11:50:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.382755+05:30	2026-02-19 06:04:05.382755+05:30
584	8	2026-03-23 11:50:00+05:30	2026-03-23 12:00:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.383515+05:30	2026-02-19 06:04:05.383515+05:30
585	8	2026-03-23 09:40:00+05:30	2026-03-23 10:10:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.385042+05:30	2026-02-19 06:04:05.385043+05:30
586	8	2026-03-23 10:10:00+05:30	2026-03-23 10:20:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.385885+05:30	2026-02-19 06:04:05.385886+05:30
587	8	2026-03-23 10:20:00+05:30	2026-03-23 10:50:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.386751+05:30	2026-02-19 06:04:05.386751+05:30
588	8	2026-03-23 10:50:00+05:30	2026-03-23 11:00:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.387628+05:30	2026-02-19 06:04:05.387629+05:30
589	8	2026-03-23 11:00:00+05:30	2026-03-23 11:30:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.388558+05:30	2026-02-19 06:04:05.388558+05:30
590	8	2026-03-23 11:30:00+05:30	2026-03-23 11:40:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.389465+05:30	2026-02-19 06:04:05.389465+05:30
591	8	2026-03-23 11:40:00+05:30	2026-03-23 12:10:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.390235+05:30	2026-02-19 06:04:05.390236+05:30
592	8	2026-03-23 12:10:00+05:30	2026-03-23 12:20:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.390985+05:30	2026-02-19 06:04:05.390986+05:30
593	8	2026-03-23 12:20:00+05:30	2026-03-23 12:50:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.391736+05:30	2026-02-19 06:04:05.391737+05:30
594	8	2026-03-23 12:50:00+05:30	2026-03-23 13:00:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.392482+05:30	2026-02-19 06:04:05.392483+05:30
595	8	2026-03-23 13:00:00+05:30	2026-03-23 13:30:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.393265+05:30	2026-02-19 06:04:05.393266+05:30
596	8	2026-03-23 13:30:00+05:30	2026-03-23 13:40:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.394115+05:30	2026-02-19 06:04:05.394116+05:30
597	8	2026-03-23 13:40:00+05:30	2026-03-23 14:10:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.394983+05:30	2026-02-19 06:04:05.394984+05:30
598	8	2026-03-23 14:10:00+05:30	2026-03-23 14:20:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.395881+05:30	2026-02-19 06:04:05.395882+05:30
599	8	2026-03-23 14:20:00+05:30	2026-03-23 14:50:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.396871+05:30	2026-02-19 06:04:05.396871+05:30
600	8	2026-03-23 14:50:00+05:30	2026-03-23 15:00:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.397738+05:30	2026-02-19 06:04:05.397739+05:30
601	8	2026-03-23 15:00:00+05:30	2026-03-23 15:30:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.398558+05:30	2026-02-19 06:04:05.398559+05:30
602	8	2026-03-23 15:30:00+05:30	2026-03-23 15:40:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.399336+05:30	2026-02-19 06:04:05.399336+05:30
603	8	2026-03-23 15:40:00+05:30	2026-03-23 16:10:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.400103+05:30	2026-02-19 06:04:05.400104+05:30
604	8	2026-03-23 16:10:00+05:30	2026-03-23 16:20:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.400894+05:30	2026-02-19 06:04:05.400895+05:30
605	8	2026-03-23 16:20:00+05:30	2026-03-23 16:50:00+05:30	2026-03-23	available	\N	\N	\N	generated	2026-02-19 06:04:05.401698+05:30	2026-02-19 06:04:05.401698+05:30
606	8	2026-03-23 16:50:00+05:30	2026-03-23 17:00:00+05:30	2026-03-23	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.402531+05:30	2026-02-19 06:04:05.402532+05:30
607	8	2026-03-24 09:00:00+05:30	2026-03-24 09:30:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.403405+05:30	2026-02-19 06:04:05.403406+05:30
608	8	2026-03-24 09:30:00+05:30	2026-03-24 09:40:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.40427+05:30	2026-02-19 06:04:05.404271+05:30
609	8	2026-03-24 09:40:00+05:30	2026-03-24 10:10:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.405196+05:30	2026-02-19 06:04:05.405197+05:30
610	8	2026-03-24 10:10:00+05:30	2026-03-24 10:20:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.40607+05:30	2026-02-19 06:04:05.40607+05:30
611	8	2026-03-24 10:20:00+05:30	2026-03-24 10:50:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.406903+05:30	2026-02-19 06:04:05.406904+05:30
612	8	2026-03-24 10:50:00+05:30	2026-03-24 11:00:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.407714+05:30	2026-02-19 06:04:05.407715+05:30
613	8	2026-03-24 11:00:00+05:30	2026-03-24 11:30:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.408515+05:30	2026-02-19 06:04:05.408515+05:30
614	8	2026-03-24 11:30:00+05:30	2026-03-24 11:40:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.40932+05:30	2026-02-19 06:04:05.409321+05:30
615	8	2026-03-24 11:40:00+05:30	2026-03-24 12:10:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.410128+05:30	2026-02-19 06:04:05.410129+05:30
616	8	2026-03-24 12:10:00+05:30	2026-03-24 12:20:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.410965+05:30	2026-02-19 06:04:05.410966+05:30
617	8	2026-03-24 12:20:00+05:30	2026-03-24 12:50:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.411995+05:30	2026-02-19 06:04:05.411996+05:30
618	8	2026-03-24 12:50:00+05:30	2026-03-24 13:00:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.413573+05:30	2026-02-19 06:04:05.413576+05:30
619	8	2026-03-24 13:00:00+05:30	2026-03-24 13:30:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.414826+05:30	2026-02-19 06:04:05.414826+05:30
620	8	2026-03-24 13:30:00+05:30	2026-03-24 13:40:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.415773+05:30	2026-02-19 06:04:05.415774+05:30
621	8	2026-03-24 13:40:00+05:30	2026-03-24 14:10:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.416656+05:30	2026-02-19 06:04:05.416657+05:30
622	8	2026-03-24 14:10:00+05:30	2026-03-24 14:20:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.417544+05:30	2026-02-19 06:04:05.417545+05:30
623	8	2026-03-24 14:20:00+05:30	2026-03-24 14:50:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.418469+05:30	2026-02-19 06:04:05.41847+05:30
624	8	2026-03-24 14:50:00+05:30	2026-03-24 15:00:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.419378+05:30	2026-02-19 06:04:05.419379+05:30
625	8	2026-03-24 15:00:00+05:30	2026-03-24 15:30:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.420308+05:30	2026-02-19 06:04:05.420308+05:30
626	8	2026-03-24 15:30:00+05:30	2026-03-24 15:40:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.421324+05:30	2026-02-19 06:04:05.421324+05:30
627	8	2026-03-24 15:40:00+05:30	2026-03-24 16:10:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.422312+05:30	2026-02-19 06:04:05.422313+05:30
628	8	2026-03-24 16:10:00+05:30	2026-03-24 16:20:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.423163+05:30	2026-02-19 06:04:05.423163+05:30
629	8	2026-03-24 16:20:00+05:30	2026-03-24 16:50:00+05:30	2026-03-24	available	\N	\N	\N	generated	2026-02-19 06:04:05.423998+05:30	2026-02-19 06:04:05.423999+05:30
630	8	2026-03-24 16:50:00+05:30	2026-03-24 17:00:00+05:30	2026-03-24	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.424874+05:30	2026-02-19 06:04:05.424875+05:30
631	8	2026-03-25 09:00:00+05:30	2026-03-25 09:30:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.425719+05:30	2026-02-19 06:04:05.42572+05:30
632	8	2026-03-25 09:30:00+05:30	2026-03-25 09:40:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.42663+05:30	2026-02-19 06:04:05.426631+05:30
633	8	2026-03-25 09:40:00+05:30	2026-03-25 10:10:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.428029+05:30	2026-02-19 06:04:05.42803+05:30
634	8	2026-03-25 10:10:00+05:30	2026-03-25 10:20:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.429404+05:30	2026-02-19 06:04:05.429404+05:30
635	8	2026-03-25 10:20:00+05:30	2026-03-25 10:50:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.430275+05:30	2026-02-19 06:04:05.430276+05:30
636	8	2026-03-25 10:50:00+05:30	2026-03-25 11:00:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.431143+05:30	2026-02-19 06:04:05.431144+05:30
637	8	2026-03-25 11:00:00+05:30	2026-03-25 11:30:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.43204+05:30	2026-02-19 06:04:05.43204+05:30
638	8	2026-03-25 11:30:00+05:30	2026-03-25 11:40:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.432929+05:30	2026-02-19 06:04:05.43293+05:30
639	8	2026-03-25 11:40:00+05:30	2026-03-25 12:10:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.433836+05:30	2026-02-19 06:04:05.433836+05:30
640	8	2026-03-25 12:10:00+05:30	2026-03-25 12:20:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.434692+05:30	2026-02-19 06:04:05.434693+05:30
641	8	2026-03-25 12:20:00+05:30	2026-03-25 12:50:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.435595+05:30	2026-02-19 06:04:05.435595+05:30
642	8	2026-03-25 12:50:00+05:30	2026-03-25 13:00:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.436633+05:30	2026-02-19 06:04:05.436633+05:30
643	8	2026-03-25 13:00:00+05:30	2026-03-25 13:30:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.437538+05:30	2026-02-19 06:04:05.437539+05:30
644	8	2026-03-25 13:30:00+05:30	2026-03-25 13:40:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.438448+05:30	2026-02-19 06:04:05.438449+05:30
645	8	2026-03-25 13:40:00+05:30	2026-03-25 14:10:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.439344+05:30	2026-02-19 06:04:05.439345+05:30
646	8	2026-03-25 14:10:00+05:30	2026-03-25 14:20:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.440254+05:30	2026-02-19 06:04:05.440254+05:30
647	8	2026-03-25 14:20:00+05:30	2026-03-25 14:50:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.441197+05:30	2026-02-19 06:04:05.441198+05:30
648	8	2026-03-25 14:50:00+05:30	2026-03-25 15:00:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.442219+05:30	2026-02-19 06:04:05.44222+05:30
649	8	2026-03-25 15:00:00+05:30	2026-03-25 15:30:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.44304+05:30	2026-02-19 06:04:05.443041+05:30
650	8	2026-03-25 15:30:00+05:30	2026-03-25 15:40:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.443854+05:30	2026-02-19 06:04:05.443855+05:30
651	8	2026-03-25 15:40:00+05:30	2026-03-25 16:10:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.444765+05:30	2026-02-19 06:04:05.444765+05:30
652	8	2026-03-25 16:10:00+05:30	2026-03-25 16:20:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.445559+05:30	2026-02-19 06:04:05.44556+05:30
653	8	2026-03-25 16:20:00+05:30	2026-03-25 16:50:00+05:30	2026-03-25	available	\N	\N	\N	generated	2026-02-19 06:04:05.446648+05:30	2026-02-19 06:04:05.446649+05:30
654	8	2026-03-25 16:50:00+05:30	2026-03-25 17:00:00+05:30	2026-03-25	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.447622+05:30	2026-02-19 06:04:05.447623+05:30
655	8	2026-03-26 09:00:00+05:30	2026-03-26 09:30:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.448492+05:30	2026-02-19 06:04:05.448493+05:30
656	8	2026-03-26 09:30:00+05:30	2026-03-26 09:40:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.4493+05:30	2026-02-19 06:04:05.4493+05:30
657	8	2026-03-26 09:40:00+05:30	2026-03-26 10:10:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.450094+05:30	2026-02-19 06:04:05.450095+05:30
658	8	2026-03-26 10:10:00+05:30	2026-03-26 10:20:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.450968+05:30	2026-02-19 06:04:05.450969+05:30
659	8	2026-03-26 10:20:00+05:30	2026-03-26 10:50:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.451851+05:30	2026-02-19 06:04:05.451852+05:30
660	8	2026-03-26 10:50:00+05:30	2026-03-26 11:00:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.453084+05:30	2026-02-19 06:04:05.453084+05:30
661	8	2026-03-26 11:00:00+05:30	2026-03-26 11:30:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.454302+05:30	2026-02-19 06:04:05.454303+05:30
662	8	2026-03-26 11:30:00+05:30	2026-03-26 11:40:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.455554+05:30	2026-02-19 06:04:05.455555+05:30
663	8	2026-03-26 11:40:00+05:30	2026-03-26 12:10:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.456483+05:30	2026-02-19 06:04:05.456483+05:30
664	8	2026-03-26 12:10:00+05:30	2026-03-26 12:20:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.457376+05:30	2026-02-19 06:04:05.457377+05:30
665	8	2026-03-26 12:20:00+05:30	2026-03-26 12:50:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.45826+05:30	2026-02-19 06:04:05.45826+05:30
666	8	2026-03-26 12:50:00+05:30	2026-03-26 13:00:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.459156+05:30	2026-02-19 06:04:05.459157+05:30
667	8	2026-03-26 13:00:00+05:30	2026-03-26 13:30:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.460071+05:30	2026-02-19 06:04:05.460072+05:30
668	8	2026-03-26 13:30:00+05:30	2026-03-26 13:40:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.461+05:30	2026-02-19 06:04:05.461+05:30
669	8	2026-03-26 13:40:00+05:30	2026-03-26 14:10:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.462051+05:30	2026-02-19 06:04:05.462051+05:30
670	8	2026-03-26 14:10:00+05:30	2026-03-26 14:20:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.463028+05:30	2026-02-19 06:04:05.463028+05:30
671	8	2026-03-26 14:20:00+05:30	2026-03-26 14:50:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.464032+05:30	2026-02-19 06:04:05.464033+05:30
672	8	2026-03-26 14:50:00+05:30	2026-03-26 15:00:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.465151+05:30	2026-02-19 06:04:05.465151+05:30
673	8	2026-03-26 15:00:00+05:30	2026-03-26 15:30:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.46613+05:30	2026-02-19 06:04:05.466131+05:30
674	8	2026-03-26 15:30:00+05:30	2026-03-26 15:40:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.467052+05:30	2026-02-19 06:04:05.467052+05:30
675	8	2026-03-26 15:40:00+05:30	2026-03-26 16:10:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.468064+05:30	2026-02-19 06:04:05.468065+05:30
676	8	2026-03-26 16:10:00+05:30	2026-03-26 16:20:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.470741+05:30	2026-02-19 06:04:05.470742+05:30
677	8	2026-03-26 16:20:00+05:30	2026-03-26 16:50:00+05:30	2026-03-26	available	\N	\N	\N	generated	2026-02-19 06:04:05.471715+05:30	2026-02-19 06:04:05.471716+05:30
678	8	2026-03-26 16:50:00+05:30	2026-03-26 17:00:00+05:30	2026-03-26	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.472612+05:30	2026-02-19 06:04:05.472612+05:30
679	8	2026-03-30 09:00:00+05:30	2026-03-30 09:30:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.483619+05:30	2026-02-19 06:04:05.483621+05:30
680	8	2026-03-30 09:30:00+05:30	2026-03-30 09:40:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.484564+05:30	2026-02-19 06:04:05.484565+05:30
681	8	2026-03-30 10:00:00+05:30	2026-03-30 10:30:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.485384+05:30	2026-02-19 06:04:05.485385+05:30
682	8	2026-03-30 10:30:00+05:30	2026-03-30 10:40:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.486289+05:30	2026-02-19 06:04:05.48629+05:30
683	8	2026-03-30 10:40:00+05:30	2026-03-30 11:10:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.487171+05:30	2026-02-19 06:04:05.487172+05:30
684	8	2026-03-30 11:10:00+05:30	2026-03-30 11:20:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.488063+05:30	2026-02-19 06:04:05.488064+05:30
685	8	2026-03-30 11:20:00+05:30	2026-03-30 11:50:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.488903+05:30	2026-02-19 06:04:05.488904+05:30
686	8	2026-03-30 11:50:00+05:30	2026-03-30 12:00:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.489741+05:30	2026-02-19 06:04:05.489742+05:30
687	8	2026-03-30 09:40:00+05:30	2026-03-30 10:10:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.491488+05:30	2026-02-19 06:04:05.491489+05:30
688	8	2026-03-30 10:10:00+05:30	2026-03-30 10:20:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.492531+05:30	2026-02-19 06:04:05.492531+05:30
689	8	2026-03-30 10:20:00+05:30	2026-03-30 10:50:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.493525+05:30	2026-02-19 06:04:05.493525+05:30
690	8	2026-03-30 10:50:00+05:30	2026-03-30 11:00:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.494455+05:30	2026-02-19 06:04:05.494455+05:30
691	8	2026-03-30 11:00:00+05:30	2026-03-30 11:30:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.495471+05:30	2026-02-19 06:04:05.495472+05:30
692	8	2026-03-30 11:30:00+05:30	2026-03-30 11:40:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.496809+05:30	2026-02-19 06:04:05.49681+05:30
693	8	2026-03-30 11:40:00+05:30	2026-03-30 12:10:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.4977+05:30	2026-02-19 06:04:05.497701+05:30
694	8	2026-03-30 12:10:00+05:30	2026-03-30 12:20:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.498488+05:30	2026-02-19 06:04:05.498489+05:30
695	8	2026-03-30 12:20:00+05:30	2026-03-30 12:50:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.499267+05:30	2026-02-19 06:04:05.499267+05:30
696	8	2026-03-30 12:50:00+05:30	2026-03-30 13:00:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.500072+05:30	2026-02-19 06:04:05.500073+05:30
697	8	2026-03-30 13:00:00+05:30	2026-03-30 13:30:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.500912+05:30	2026-02-19 06:04:05.500913+05:30
698	8	2026-03-30 13:30:00+05:30	2026-03-30 13:40:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.501684+05:30	2026-02-19 06:04:05.501685+05:30
699	8	2026-03-30 13:40:00+05:30	2026-03-30 14:10:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.502468+05:30	2026-02-19 06:04:05.502469+05:30
700	8	2026-03-30 14:10:00+05:30	2026-03-30 14:20:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.503398+05:30	2026-02-19 06:04:05.503399+05:30
701	8	2026-03-30 14:20:00+05:30	2026-03-30 14:50:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.504419+05:30	2026-02-19 06:04:05.504419+05:30
702	8	2026-03-30 14:50:00+05:30	2026-03-30 15:00:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.505426+05:30	2026-02-19 06:04:05.505426+05:30
703	8	2026-03-30 15:00:00+05:30	2026-03-30 15:30:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.506374+05:30	2026-02-19 06:04:05.506375+05:30
704	8	2026-03-30 15:30:00+05:30	2026-03-30 15:40:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.507354+05:30	2026-02-19 06:04:05.507355+05:30
705	8	2026-03-30 15:40:00+05:30	2026-03-30 16:10:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.508279+05:30	2026-02-19 06:04:05.50828+05:30
706	8	2026-03-30 16:10:00+05:30	2026-03-30 16:20:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.509355+05:30	2026-02-19 06:04:05.509355+05:30
707	8	2026-03-30 16:20:00+05:30	2026-03-30 16:50:00+05:30	2026-03-30	available	\N	\N	\N	generated	2026-02-19 06:04:05.510282+05:30	2026-02-19 06:04:05.510283+05:30
708	8	2026-03-30 16:50:00+05:30	2026-03-30 17:00:00+05:30	2026-03-30	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.51125+05:30	2026-02-19 06:04:05.511251+05:30
709	8	2026-03-31 09:00:00+05:30	2026-03-31 09:30:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.512209+05:30	2026-02-19 06:04:05.512209+05:30
710	8	2026-03-31 09:30:00+05:30	2026-03-31 09:40:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.513132+05:30	2026-02-19 06:04:05.513133+05:30
711	8	2026-03-31 09:40:00+05:30	2026-03-31 10:10:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.514086+05:30	2026-02-19 06:04:05.514087+05:30
712	8	2026-03-31 10:10:00+05:30	2026-03-31 10:20:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.515084+05:30	2026-02-19 06:04:05.515084+05:30
713	8	2026-03-31 10:20:00+05:30	2026-03-31 10:50:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.516049+05:30	2026-02-19 06:04:05.51605+05:30
714	8	2026-03-31 10:50:00+05:30	2026-03-31 11:00:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.517012+05:30	2026-02-19 06:04:05.517013+05:30
715	8	2026-03-31 11:00:00+05:30	2026-03-31 11:30:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.51791+05:30	2026-02-19 06:04:05.517911+05:30
716	8	2026-03-31 11:30:00+05:30	2026-03-31 11:40:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.518845+05:30	2026-02-19 06:04:05.518845+05:30
717	8	2026-03-31 11:40:00+05:30	2026-03-31 12:10:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.519814+05:30	2026-02-19 06:04:05.519815+05:30
718	8	2026-03-31 12:10:00+05:30	2026-03-31 12:20:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.520768+05:30	2026-02-19 06:04:05.520768+05:30
719	8	2026-03-31 12:20:00+05:30	2026-03-31 12:50:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.521717+05:30	2026-02-19 06:04:05.521718+05:30
720	8	2026-03-31 12:50:00+05:30	2026-03-31 13:00:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.522612+05:30	2026-02-19 06:04:05.522612+05:30
721	8	2026-03-31 13:00:00+05:30	2026-03-31 13:30:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.523526+05:30	2026-02-19 06:04:05.523527+05:30
722	8	2026-03-31 13:30:00+05:30	2026-03-31 13:40:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.524521+05:30	2026-02-19 06:04:05.524522+05:30
723	8	2026-03-31 13:40:00+05:30	2026-03-31 14:10:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.525466+05:30	2026-02-19 06:04:05.525467+05:30
724	8	2026-03-31 14:10:00+05:30	2026-03-31 14:20:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.52638+05:30	2026-02-19 06:04:05.52638+05:30
725	8	2026-03-31 14:20:00+05:30	2026-03-31 14:50:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.527288+05:30	2026-02-19 06:04:05.527288+05:30
726	8	2026-03-31 14:50:00+05:30	2026-03-31 15:00:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.528205+05:30	2026-02-19 06:04:05.528206+05:30
727	8	2026-03-31 15:00:00+05:30	2026-03-31 15:30:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.529513+05:30	2026-02-19 06:04:05.529514+05:30
728	8	2026-03-31 15:30:00+05:30	2026-03-31 15:40:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.530455+05:30	2026-02-19 06:04:05.530456+05:30
729	8	2026-03-31 15:40:00+05:30	2026-03-31 16:10:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.531277+05:30	2026-02-19 06:04:05.531277+05:30
730	8	2026-03-31 16:10:00+05:30	2026-03-31 16:20:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.532068+05:30	2026-02-19 06:04:05.532069+05:30
731	8	2026-03-31 16:20:00+05:30	2026-03-31 16:50:00+05:30	2026-03-31	available	\N	\N	\N	generated	2026-02-19 06:04:05.532862+05:30	2026-02-19 06:04:05.532862+05:30
732	8	2026-03-31 16:50:00+05:30	2026-03-31 17:00:00+05:30	2026-03-31	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.533633+05:30	2026-02-19 06:04:05.533633+05:30
733	8	2026-04-01 09:00:00+05:30	2026-04-01 09:30:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.534458+05:30	2026-02-19 06:04:05.534459+05:30
734	8	2026-04-01 09:30:00+05:30	2026-04-01 09:40:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.535396+05:30	2026-02-19 06:04:05.535397+05:30
735	8	2026-04-01 09:40:00+05:30	2026-04-01 10:10:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.536499+05:30	2026-02-19 06:04:05.536501+05:30
736	8	2026-04-01 10:10:00+05:30	2026-04-01 10:20:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.537497+05:30	2026-02-19 06:04:05.537498+05:30
737	8	2026-04-01 10:20:00+05:30	2026-04-01 10:50:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.538442+05:30	2026-02-19 06:04:05.538443+05:30
738	8	2026-04-01 10:50:00+05:30	2026-04-01 11:00:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.539354+05:30	2026-02-19 06:04:05.539355+05:30
739	8	2026-04-01 11:00:00+05:30	2026-04-01 11:30:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.540091+05:30	2026-02-19 06:04:05.540092+05:30
740	8	2026-04-01 11:30:00+05:30	2026-04-01 11:40:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.540929+05:30	2026-02-19 06:04:05.540929+05:30
741	8	2026-04-01 11:40:00+05:30	2026-04-01 12:10:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.541685+05:30	2026-02-19 06:04:05.541685+05:30
742	8	2026-04-01 12:10:00+05:30	2026-04-01 12:20:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.54256+05:30	2026-02-19 06:04:05.54256+05:30
743	8	2026-04-01 12:20:00+05:30	2026-04-01 12:50:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.543413+05:30	2026-02-19 06:04:05.543414+05:30
744	8	2026-04-01 12:50:00+05:30	2026-04-01 13:00:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.544299+05:30	2026-02-19 06:04:05.5443+05:30
745	8	2026-04-01 13:00:00+05:30	2026-04-01 13:30:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.545262+05:30	2026-02-19 06:04:05.545263+05:30
746	8	2026-04-01 13:30:00+05:30	2026-04-01 13:40:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.546238+05:30	2026-02-19 06:04:05.54624+05:30
747	8	2026-04-01 13:40:00+05:30	2026-04-01 14:10:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.54746+05:30	2026-02-19 06:04:05.547462+05:30
748	8	2026-04-01 14:10:00+05:30	2026-04-01 14:20:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.548542+05:30	2026-02-19 06:04:05.548543+05:30
749	8	2026-04-01 14:20:00+05:30	2026-04-01 14:50:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.549544+05:30	2026-02-19 06:04:05.549545+05:30
750	8	2026-04-01 14:50:00+05:30	2026-04-01 15:00:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.551113+05:30	2026-02-19 06:04:05.551115+05:30
751	8	2026-04-01 15:00:00+05:30	2026-04-01 15:30:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.552304+05:30	2026-02-19 06:04:05.552306+05:30
752	8	2026-04-01 15:30:00+05:30	2026-04-01 15:40:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.553299+05:30	2026-02-19 06:04:05.5533+05:30
753	8	2026-04-01 15:40:00+05:30	2026-04-01 16:10:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.554232+05:30	2026-02-19 06:04:05.554233+05:30
754	8	2026-04-01 16:10:00+05:30	2026-04-01 16:20:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.555236+05:30	2026-02-19 06:04:05.555236+05:30
755	8	2026-04-01 16:20:00+05:30	2026-04-01 16:50:00+05:30	2026-04-01	available	\N	\N	\N	generated	2026-02-19 06:04:05.556198+05:30	2026-02-19 06:04:05.556199+05:30
756	8	2026-04-01 16:50:00+05:30	2026-04-01 17:00:00+05:30	2026-04-01	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.557074+05:30	2026-02-19 06:04:05.557074+05:30
757	8	2026-04-02 09:00:00+05:30	2026-04-02 09:30:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.557896+05:30	2026-02-19 06:04:05.557897+05:30
758	8	2026-04-02 09:30:00+05:30	2026-04-02 09:40:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.558859+05:30	2026-02-19 06:04:05.55886+05:30
759	8	2026-04-02 09:40:00+05:30	2026-04-02 10:10:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.559754+05:30	2026-02-19 06:04:05.559755+05:30
760	8	2026-04-02 10:10:00+05:30	2026-04-02 10:20:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.560553+05:30	2026-02-19 06:04:05.560554+05:30
761	8	2026-04-02 10:20:00+05:30	2026-04-02 10:50:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.561516+05:30	2026-02-19 06:04:05.561518+05:30
762	8	2026-04-02 10:50:00+05:30	2026-04-02 11:00:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.562595+05:30	2026-02-19 06:04:05.562596+05:30
763	8	2026-04-02 11:00:00+05:30	2026-04-02 11:30:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.563628+05:30	2026-02-19 06:04:05.56363+05:30
764	8	2026-04-02 11:30:00+05:30	2026-04-02 11:40:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.564655+05:30	2026-02-19 06:04:05.564658+05:30
765	8	2026-04-02 11:40:00+05:30	2026-04-02 12:10:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.565737+05:30	2026-02-19 06:04:05.565739+05:30
766	8	2026-04-02 12:10:00+05:30	2026-04-02 12:20:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.566895+05:30	2026-02-19 06:04:05.566896+05:30
767	8	2026-04-02 12:20:00+05:30	2026-04-02 12:50:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.567992+05:30	2026-02-19 06:04:05.567994+05:30
768	8	2026-04-02 12:50:00+05:30	2026-04-02 13:00:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.569078+05:30	2026-02-19 06:04:05.569078+05:30
769	8	2026-04-02 13:00:00+05:30	2026-04-02 13:30:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.570846+05:30	2026-02-19 06:04:05.570848+05:30
770	8	2026-04-02 13:30:00+05:30	2026-04-02 13:40:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.572115+05:30	2026-02-19 06:04:05.572116+05:30
771	8	2026-04-02 13:40:00+05:30	2026-04-02 14:10:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.573019+05:30	2026-02-19 06:04:05.573019+05:30
772	8	2026-04-02 14:10:00+05:30	2026-04-02 14:20:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.573927+05:30	2026-02-19 06:04:05.573928+05:30
773	8	2026-04-02 14:20:00+05:30	2026-04-02 14:50:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.574927+05:30	2026-02-19 06:04:05.574928+05:30
774	8	2026-04-02 14:50:00+05:30	2026-04-02 15:00:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.575889+05:30	2026-02-19 06:04:05.575889+05:30
775	8	2026-04-02 15:00:00+05:30	2026-04-02 15:30:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.577254+05:30	2026-02-19 06:04:05.577254+05:30
776	8	2026-04-02 15:30:00+05:30	2026-04-02 15:40:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.578248+05:30	2026-02-19 06:04:05.578249+05:30
777	8	2026-04-02 15:40:00+05:30	2026-04-02 16:10:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.579178+05:30	2026-02-19 06:04:05.579179+05:30
778	8	2026-04-02 16:10:00+05:30	2026-04-02 16:20:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.5803+05:30	2026-02-19 06:04:05.580302+05:30
779	8	2026-04-02 16:20:00+05:30	2026-04-02 16:50:00+05:30	2026-04-02	available	\N	\N	\N	generated	2026-02-19 06:04:05.581394+05:30	2026-02-19 06:04:05.581396+05:30
780	8	2026-04-02 16:50:00+05:30	2026-04-02 17:00:00+05:30	2026-04-02	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.582447+05:30	2026-02-19 06:04:05.582448+05:30
781	8	2026-04-04 09:00:00+05:30	2026-04-04 09:30:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.583451+05:30	2026-02-19 06:04:05.583452+05:30
782	8	2026-04-04 09:30:00+05:30	2026-04-04 09:40:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.58446+05:30	2026-02-19 06:04:05.584462+05:30
783	8	2026-04-04 09:40:00+05:30	2026-04-04 10:10:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.585458+05:30	2026-02-19 06:04:05.585459+05:30
784	8	2026-04-04 10:10:00+05:30	2026-04-04 10:20:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.586836+05:30	2026-02-19 06:04:05.586839+05:30
785	8	2026-04-04 10:20:00+05:30	2026-04-04 10:50:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.588065+05:30	2026-02-19 06:04:05.588066+05:30
786	8	2026-04-04 10:50:00+05:30	2026-04-04 11:00:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.589031+05:30	2026-02-19 06:04:05.589032+05:30
787	8	2026-04-04 11:00:00+05:30	2026-04-04 11:30:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.589925+05:30	2026-02-19 06:04:05.589926+05:30
788	8	2026-04-04 11:30:00+05:30	2026-04-04 11:40:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.590888+05:30	2026-02-19 06:04:05.590888+05:30
789	8	2026-04-04 11:40:00+05:30	2026-04-04 12:10:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.591854+05:30	2026-02-19 06:04:05.591855+05:30
790	8	2026-04-04 12:10:00+05:30	2026-04-04 12:20:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.592784+05:30	2026-02-19 06:04:05.592784+05:30
791	8	2026-04-04 12:20:00+05:30	2026-04-04 12:50:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.593704+05:30	2026-02-19 06:04:05.593705+05:30
792	8	2026-04-04 12:50:00+05:30	2026-04-04 13:00:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.59467+05:30	2026-02-19 06:04:05.59467+05:30
793	8	2026-04-04 13:00:00+05:30	2026-04-04 13:30:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.595694+05:30	2026-02-19 06:04:05.595696+05:30
794	8	2026-04-04 13:30:00+05:30	2026-04-04 13:40:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.596898+05:30	2026-02-19 06:04:05.5969+05:30
795	8	2026-04-04 13:40:00+05:30	2026-04-04 14:10:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.598053+05:30	2026-02-19 06:04:05.598055+05:30
796	8	2026-04-04 14:10:00+05:30	2026-04-04 14:20:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.599163+05:30	2026-02-19 06:04:05.599165+05:30
797	8	2026-04-04 14:20:00+05:30	2026-04-04 14:50:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.60021+05:30	2026-02-19 06:04:05.600212+05:30
798	8	2026-04-04 14:50:00+05:30	2026-04-04 15:00:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.601227+05:30	2026-02-19 06:04:05.601229+05:30
799	8	2026-04-04 15:00:00+05:30	2026-04-04 15:30:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.602519+05:30	2026-02-19 06:04:05.602522+05:30
800	8	2026-04-04 15:30:00+05:30	2026-04-04 15:40:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.603795+05:30	2026-02-19 06:04:05.603796+05:30
801	8	2026-04-04 15:40:00+05:30	2026-04-04 16:10:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.605062+05:30	2026-02-19 06:04:05.605063+05:30
802	8	2026-04-04 16:10:00+05:30	2026-04-04 16:20:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.606367+05:30	2026-02-19 06:04:05.606368+05:30
803	8	2026-04-04 16:20:00+05:30	2026-04-04 16:50:00+05:30	2026-04-04	available	\N	\N	\N	generated	2026-02-19 06:04:05.607492+05:30	2026-02-19 06:04:05.607493+05:30
804	8	2026-04-04 16:50:00+05:30	2026-04-04 17:00:00+05:30	2026-04-04	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.60859+05:30	2026-02-19 06:04:05.60859+05:30
805	8	2026-04-06 09:00:00+05:30	2026-04-06 09:30:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.609664+05:30	2026-02-19 06:04:05.609664+05:30
806	8	2026-04-06 09:30:00+05:30	2026-04-06 09:40:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.610728+05:30	2026-02-19 06:04:05.610729+05:30
807	8	2026-04-06 10:00:00+05:30	2026-04-06 10:30:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.61187+05:30	2026-02-19 06:04:05.611871+05:30
808	8	2026-04-06 10:30:00+05:30	2026-04-06 10:40:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.613058+05:30	2026-02-19 06:04:05.613061+05:30
809	8	2026-04-06 10:40:00+05:30	2026-04-06 11:10:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.614512+05:30	2026-02-19 06:04:05.614514+05:30
810	8	2026-04-06 11:10:00+05:30	2026-04-06 11:20:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.615842+05:30	2026-02-19 06:04:05.615844+05:30
811	8	2026-04-06 11:20:00+05:30	2026-04-06 11:50:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.617171+05:30	2026-02-19 06:04:05.617174+05:30
812	8	2026-04-06 11:50:00+05:30	2026-04-06 12:00:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.618459+05:30	2026-02-19 06:04:05.618461+05:30
813	8	2026-04-06 09:40:00+05:30	2026-04-06 10:10:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.622389+05:30	2026-02-19 06:04:05.622392+05:30
814	8	2026-04-06 10:10:00+05:30	2026-04-06 10:20:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.623429+05:30	2026-02-19 06:04:05.62343+05:30
815	8	2026-04-06 10:20:00+05:30	2026-04-06 10:50:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.62452+05:30	2026-02-19 06:04:05.624521+05:30
816	8	2026-04-06 10:50:00+05:30	2026-04-06 11:00:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.625383+05:30	2026-02-19 06:04:05.625384+05:30
817	8	2026-04-06 11:00:00+05:30	2026-04-06 11:30:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.626245+05:30	2026-02-19 06:04:05.626246+05:30
818	8	2026-04-06 11:30:00+05:30	2026-04-06 11:40:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.627104+05:30	2026-02-19 06:04:05.627104+05:30
819	8	2026-04-06 11:40:00+05:30	2026-04-06 12:10:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.628025+05:30	2026-02-19 06:04:05.628026+05:30
820	8	2026-04-06 12:10:00+05:30	2026-04-06 12:20:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.629007+05:30	2026-02-19 06:04:05.629008+05:30
821	8	2026-04-06 12:20:00+05:30	2026-04-06 12:50:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.630236+05:30	2026-02-19 06:04:05.630238+05:30
822	8	2026-04-06 12:50:00+05:30	2026-04-06 13:00:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.631479+05:30	2026-02-19 06:04:05.631481+05:30
823	8	2026-04-06 13:00:00+05:30	2026-04-06 13:30:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.632812+05:30	2026-02-19 06:04:05.632814+05:30
824	8	2026-04-06 13:30:00+05:30	2026-04-06 13:40:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.634113+05:30	2026-02-19 06:04:05.634115+05:30
825	8	2026-04-06 13:40:00+05:30	2026-04-06 14:10:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.635247+05:30	2026-02-19 06:04:05.635248+05:30
826	8	2026-04-06 14:10:00+05:30	2026-04-06 14:20:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.637072+05:30	2026-02-19 06:04:05.637075+05:30
827	8	2026-04-06 14:20:00+05:30	2026-04-06 14:50:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.638188+05:30	2026-02-19 06:04:05.638189+05:30
828	8	2026-04-06 14:50:00+05:30	2026-04-06 15:00:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.639121+05:30	2026-02-19 06:04:05.639122+05:30
829	8	2026-04-06 15:00:00+05:30	2026-04-06 15:30:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.63993+05:30	2026-02-19 06:04:05.63993+05:30
830	8	2026-04-06 15:30:00+05:30	2026-04-06 15:40:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.640682+05:30	2026-02-19 06:04:05.640683+05:30
831	8	2026-04-06 15:40:00+05:30	2026-04-06 16:10:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.641757+05:30	2026-02-19 06:04:05.641757+05:30
832	8	2026-04-06 16:10:00+05:30	2026-04-06 16:20:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.642809+05:30	2026-02-19 06:04:05.64281+05:30
833	8	2026-04-06 16:20:00+05:30	2026-04-06 16:50:00+05:30	2026-04-06	available	\N	\N	\N	generated	2026-02-19 06:04:05.64394+05:30	2026-02-19 06:04:05.64394+05:30
834	8	2026-04-06 16:50:00+05:30	2026-04-06 17:00:00+05:30	2026-04-06	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.645168+05:30	2026-02-19 06:04:05.645168+05:30
835	8	2026-04-07 09:00:00+05:30	2026-04-07 09:30:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.64629+05:30	2026-02-19 06:04:05.646291+05:30
836	8	2026-04-07 09:30:00+05:30	2026-04-07 09:40:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.647612+05:30	2026-02-19 06:04:05.647614+05:30
837	8	2026-04-07 09:40:00+05:30	2026-04-07 10:10:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.648941+05:30	2026-02-19 06:04:05.648943+05:30
838	8	2026-04-07 10:10:00+05:30	2026-04-07 10:20:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.650149+05:30	2026-02-19 06:04:05.650151+05:30
839	8	2026-04-07 10:20:00+05:30	2026-04-07 10:50:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.651447+05:30	2026-02-19 06:04:05.651449+05:30
840	8	2026-04-07 10:50:00+05:30	2026-04-07 11:00:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.652765+05:30	2026-02-19 06:04:05.652767+05:30
841	8	2026-04-07 11:00:00+05:30	2026-04-07 11:30:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.654238+05:30	2026-02-19 06:04:05.65424+05:30
842	8	2026-04-07 11:30:00+05:30	2026-04-07 11:40:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.655344+05:30	2026-02-19 06:04:05.655345+05:30
843	8	2026-04-07 11:40:00+05:30	2026-04-07 12:10:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.656201+05:30	2026-02-19 06:04:05.656201+05:30
844	8	2026-04-07 12:10:00+05:30	2026-04-07 12:20:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.65698+05:30	2026-02-19 06:04:05.656981+05:30
845	8	2026-04-07 12:20:00+05:30	2026-04-07 12:50:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.657745+05:30	2026-02-19 06:04:05.657745+05:30
846	8	2026-04-07 12:50:00+05:30	2026-04-07 13:00:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.658488+05:30	2026-02-19 06:04:05.658489+05:30
847	8	2026-04-07 13:00:00+05:30	2026-04-07 13:30:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.65923+05:30	2026-02-19 06:04:05.659231+05:30
848	8	2026-04-07 13:30:00+05:30	2026-04-07 13:40:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.659997+05:30	2026-02-19 06:04:05.659998+05:30
849	8	2026-04-07 13:40:00+05:30	2026-04-07 14:10:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.660944+05:30	2026-02-19 06:04:05.660945+05:30
850	8	2026-04-07 14:10:00+05:30	2026-04-07 14:20:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.662075+05:30	2026-02-19 06:04:05.662075+05:30
851	8	2026-04-07 14:20:00+05:30	2026-04-07 14:50:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.664886+05:30	2026-02-19 06:04:05.66489+05:30
852	8	2026-04-07 14:50:00+05:30	2026-04-07 15:00:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.666336+05:30	2026-02-19 06:04:05.666339+05:30
853	8	2026-04-07 15:00:00+05:30	2026-04-07 15:30:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.667814+05:30	2026-02-19 06:04:05.667817+05:30
854	8	2026-04-07 15:30:00+05:30	2026-04-07 15:40:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.669108+05:30	2026-02-19 06:04:05.66911+05:30
855	8	2026-04-07 15:40:00+05:30	2026-04-07 16:10:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.67056+05:30	2026-02-19 06:04:05.670562+05:30
856	8	2026-04-07 16:10:00+05:30	2026-04-07 16:20:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.671933+05:30	2026-02-19 06:04:05.671934+05:30
857	8	2026-04-07 16:20:00+05:30	2026-04-07 16:50:00+05:30	2026-04-07	available	\N	\N	\N	generated	2026-02-19 06:04:05.672995+05:30	2026-02-19 06:04:05.672995+05:30
858	8	2026-04-07 16:50:00+05:30	2026-04-07 17:00:00+05:30	2026-04-07	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.674025+05:30	2026-02-19 06:04:05.674026+05:30
859	8	2026-04-08 09:00:00+05:30	2026-04-08 09:30:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.67497+05:30	2026-02-19 06:04:05.67497+05:30
860	8	2026-04-08 09:30:00+05:30	2026-04-08 09:40:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.675938+05:30	2026-02-19 06:04:05.675938+05:30
861	8	2026-04-08 09:40:00+05:30	2026-04-08 10:10:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.676847+05:30	2026-02-19 06:04:05.676848+05:30
862	8	2026-04-08 10:10:00+05:30	2026-04-08 10:20:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.677727+05:30	2026-02-19 06:04:05.677728+05:30
863	8	2026-04-08 10:20:00+05:30	2026-04-08 10:50:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.678611+05:30	2026-02-19 06:04:05.678612+05:30
864	8	2026-04-08 10:50:00+05:30	2026-04-08 11:00:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.679496+05:30	2026-02-19 06:04:05.679497+05:30
865	8	2026-04-08 11:00:00+05:30	2026-04-08 11:30:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.680477+05:30	2026-02-19 06:04:05.680479+05:30
866	8	2026-04-08 11:30:00+05:30	2026-04-08 11:40:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.681536+05:30	2026-02-19 06:04:05.681537+05:30
867	8	2026-04-08 11:40:00+05:30	2026-04-08 12:10:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.682588+05:30	2026-02-19 06:04:05.68259+05:30
868	8	2026-04-08 12:10:00+05:30	2026-04-08 12:20:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.683556+05:30	2026-02-19 06:04:05.683557+05:30
869	8	2026-04-08 12:20:00+05:30	2026-04-08 12:50:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.684711+05:30	2026-02-19 06:04:05.684714+05:30
870	8	2026-04-08 12:50:00+05:30	2026-04-08 13:00:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.685853+05:30	2026-02-19 06:04:05.685855+05:30
871	8	2026-04-08 13:00:00+05:30	2026-04-08 13:30:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.687506+05:30	2026-02-19 06:04:05.687509+05:30
872	8	2026-04-08 13:30:00+05:30	2026-04-08 13:40:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.688764+05:30	2026-02-19 06:04:05.688764+05:30
873	8	2026-04-08 13:40:00+05:30	2026-04-08 14:10:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.689658+05:30	2026-02-19 06:04:05.689659+05:30
874	8	2026-04-08 14:10:00+05:30	2026-04-08 14:20:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.690477+05:30	2026-02-19 06:04:05.690478+05:30
875	8	2026-04-08 14:20:00+05:30	2026-04-08 14:50:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.691264+05:30	2026-02-19 06:04:05.691264+05:30
876	8	2026-04-08 14:50:00+05:30	2026-04-08 15:00:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.692045+05:30	2026-02-19 06:04:05.692046+05:30
877	8	2026-04-08 15:00:00+05:30	2026-04-08 15:30:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.692939+05:30	2026-02-19 06:04:05.692939+05:30
878	8	2026-04-08 15:30:00+05:30	2026-04-08 15:40:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.693756+05:30	2026-02-19 06:04:05.693756+05:30
879	8	2026-04-08 15:40:00+05:30	2026-04-08 16:10:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.694571+05:30	2026-02-19 06:04:05.694571+05:30
880	8	2026-04-08 16:10:00+05:30	2026-04-08 16:20:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.695378+05:30	2026-02-19 06:04:05.695379+05:30
881	8	2026-04-08 16:20:00+05:30	2026-04-08 16:50:00+05:30	2026-04-08	available	\N	\N	\N	generated	2026-02-19 06:04:05.696375+05:30	2026-02-19 06:04:05.696377+05:30
882	8	2026-04-08 16:50:00+05:30	2026-04-08 17:00:00+05:30	2026-04-08	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.697608+05:30	2026-02-19 06:04:05.69761+05:30
883	8	2026-04-09 09:00:00+05:30	2026-04-09 09:30:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.698594+05:30	2026-02-19 06:04:05.698595+05:30
884	8	2026-04-09 09:30:00+05:30	2026-04-09 09:40:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.699613+05:30	2026-02-19 06:04:05.699615+05:30
885	8	2026-04-09 09:40:00+05:30	2026-04-09 10:10:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.70053+05:30	2026-02-19 06:04:05.700531+05:30
886	8	2026-04-09 10:10:00+05:30	2026-04-09 10:20:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.701367+05:30	2026-02-19 06:04:05.701369+05:30
887	8	2026-04-09 10:20:00+05:30	2026-04-09 10:50:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.702221+05:30	2026-02-19 06:04:05.702221+05:30
888	8	2026-04-09 10:50:00+05:30	2026-04-09 11:00:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.703066+05:30	2026-02-19 06:04:05.703067+05:30
889	8	2026-04-09 11:00:00+05:30	2026-04-09 11:30:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.704229+05:30	2026-02-19 06:04:05.704232+05:30
890	8	2026-04-09 11:30:00+05:30	2026-04-09 11:40:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.705621+05:30	2026-02-19 06:04:05.705623+05:30
891	8	2026-04-09 11:40:00+05:30	2026-04-09 12:10:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.706571+05:30	2026-02-19 06:04:05.706571+05:30
892	8	2026-04-09 12:10:00+05:30	2026-04-09 12:20:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.707347+05:30	2026-02-19 06:04:05.707348+05:30
893	8	2026-04-09 12:20:00+05:30	2026-04-09 12:50:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.708297+05:30	2026-02-19 06:04:05.708298+05:30
894	8	2026-04-09 12:50:00+05:30	2026-04-09 13:00:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.709248+05:30	2026-02-19 06:04:05.709248+05:30
895	8	2026-04-09 13:00:00+05:30	2026-04-09 13:30:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.710259+05:30	2026-02-19 06:04:05.71026+05:30
896	8	2026-04-09 13:30:00+05:30	2026-04-09 13:40:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.711236+05:30	2026-02-19 06:04:05.711237+05:30
897	8	2026-04-09 13:40:00+05:30	2026-04-09 14:10:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.712177+05:30	2026-02-19 06:04:05.712178+05:30
898	8	2026-04-09 14:10:00+05:30	2026-04-09 14:20:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.713151+05:30	2026-02-19 06:04:05.713153+05:30
899	8	2026-04-09 14:20:00+05:30	2026-04-09 14:50:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.714433+05:30	2026-02-19 06:04:05.714436+05:30
900	8	2026-04-09 14:50:00+05:30	2026-04-09 15:00:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.715863+05:30	2026-02-19 06:04:05.715865+05:30
901	8	2026-04-09 15:00:00+05:30	2026-04-09 15:30:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.717148+05:30	2026-02-19 06:04:05.71715+05:30
902	8	2026-04-09 15:30:00+05:30	2026-04-09 15:40:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.718328+05:30	2026-02-19 06:04:05.718329+05:30
903	8	2026-04-09 15:40:00+05:30	2026-04-09 16:10:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.719479+05:30	2026-02-19 06:04:05.71948+05:30
904	8	2026-04-09 16:10:00+05:30	2026-04-09 16:20:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.720958+05:30	2026-02-19 06:04:05.72096+05:30
905	8	2026-04-09 16:20:00+05:30	2026-04-09 16:50:00+05:30	2026-04-09	available	\N	\N	\N	generated	2026-02-19 06:04:05.722047+05:30	2026-02-19 06:04:05.722048+05:30
906	8	2026-04-09 16:50:00+05:30	2026-04-09 17:00:00+05:30	2026-04-09	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.722981+05:30	2026-02-19 06:04:05.722982+05:30
907	8	2026-04-11 09:00:00+05:30	2026-04-11 09:30:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.723848+05:30	2026-02-19 06:04:05.723849+05:30
908	8	2026-04-11 09:30:00+05:30	2026-04-11 09:40:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.724629+05:30	2026-02-19 06:04:05.72463+05:30
909	8	2026-04-11 09:40:00+05:30	2026-04-11 10:10:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.725398+05:30	2026-02-19 06:04:05.725399+05:30
910	8	2026-04-11 10:10:00+05:30	2026-04-11 10:20:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.726157+05:30	2026-02-19 06:04:05.726157+05:30
911	8	2026-04-11 10:20:00+05:30	2026-04-11 10:50:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.726913+05:30	2026-02-19 06:04:05.726913+05:30
912	8	2026-04-11 10:50:00+05:30	2026-04-11 11:00:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.727795+05:30	2026-02-19 06:04:05.727795+05:30
913	8	2026-04-11 11:00:00+05:30	2026-04-11 11:30:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.728871+05:30	2026-02-19 06:04:05.728872+05:30
914	8	2026-04-11 11:30:00+05:30	2026-04-11 11:40:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.730089+05:30	2026-02-19 06:04:05.730091+05:30
915	8	2026-04-11 11:40:00+05:30	2026-04-11 12:10:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.731329+05:30	2026-02-19 06:04:05.731331+05:30
916	8	2026-04-11 12:10:00+05:30	2026-04-11 12:20:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.732594+05:30	2026-02-19 06:04:05.732595+05:30
917	8	2026-04-11 12:20:00+05:30	2026-04-11 12:50:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.733925+05:30	2026-02-19 06:04:05.733927+05:30
918	8	2026-04-11 12:50:00+05:30	2026-04-11 13:00:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.735171+05:30	2026-02-19 06:04:05.735172+05:30
919	8	2026-04-11 13:00:00+05:30	2026-04-11 13:30:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.736355+05:30	2026-02-19 06:04:05.736357+05:30
920	8	2026-04-11 13:30:00+05:30	2026-04-11 13:40:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.737467+05:30	2026-02-19 06:04:05.737468+05:30
921	8	2026-04-11 13:40:00+05:30	2026-04-11 14:10:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.738386+05:30	2026-02-19 06:04:05.738387+05:30
922	8	2026-04-11 14:10:00+05:30	2026-04-11 14:20:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.73926+05:30	2026-02-19 06:04:05.739261+05:30
923	8	2026-04-11 14:20:00+05:30	2026-04-11 14:50:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.740023+05:30	2026-02-19 06:04:05.740023+05:30
924	8	2026-04-11 14:50:00+05:30	2026-04-11 15:00:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.740793+05:30	2026-02-19 06:04:05.740793+05:30
925	8	2026-04-11 15:00:00+05:30	2026-04-11 15:30:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.741542+05:30	2026-02-19 06:04:05.741542+05:30
926	8	2026-04-11 15:30:00+05:30	2026-04-11 15:40:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.742271+05:30	2026-02-19 06:04:05.742271+05:30
927	8	2026-04-11 15:40:00+05:30	2026-04-11 16:10:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.743+05:30	2026-02-19 06:04:05.743001+05:30
928	8	2026-04-11 16:10:00+05:30	2026-04-11 16:20:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.743905+05:30	2026-02-19 06:04:05.743906+05:30
929	8	2026-04-11 16:20:00+05:30	2026-04-11 16:50:00+05:30	2026-04-11	available	\N	\N	\N	generated	2026-02-19 06:04:05.744982+05:30	2026-02-19 06:04:05.744983+05:30
930	8	2026-04-11 16:50:00+05:30	2026-04-11 17:00:00+05:30	2026-04-11	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.7461+05:30	2026-02-19 06:04:05.746102+05:30
931	8	2026-04-13 09:00:00+05:30	2026-04-13 09:30:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.74759+05:30	2026-02-19 06:04:05.747593+05:30
932	8	2026-04-13 09:30:00+05:30	2026-04-13 09:40:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.749196+05:30	2026-02-19 06:04:05.749198+05:30
933	8	2026-04-13 10:00:00+05:30	2026-04-13 10:30:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.750435+05:30	2026-02-19 06:04:05.750438+05:30
934	8	2026-04-13 10:30:00+05:30	2026-04-13 10:40:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.751604+05:30	2026-02-19 06:04:05.751605+05:30
935	8	2026-04-13 10:40:00+05:30	2026-04-13 11:10:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.752966+05:30	2026-02-19 06:04:05.752968+05:30
936	8	2026-04-13 11:10:00+05:30	2026-04-13 11:20:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.755756+05:30	2026-02-19 06:04:05.755758+05:30
937	8	2026-04-13 11:20:00+05:30	2026-04-13 11:50:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.757098+05:30	2026-02-19 06:04:05.757099+05:30
938	8	2026-04-13 11:50:00+05:30	2026-04-13 12:00:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.758259+05:30	2026-02-19 06:04:05.75826+05:30
939	8	2026-04-13 09:40:00+05:30	2026-04-13 10:10:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.760556+05:30	2026-02-19 06:04:05.760557+05:30
940	8	2026-04-13 10:10:00+05:30	2026-04-13 10:20:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.761793+05:30	2026-02-19 06:04:05.761794+05:30
941	8	2026-04-13 10:20:00+05:30	2026-04-13 10:50:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.763095+05:30	2026-02-19 06:04:05.763098+05:30
942	8	2026-04-13 10:50:00+05:30	2026-04-13 11:00:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.764521+05:30	2026-02-19 06:04:05.764523+05:30
943	8	2026-04-13 11:00:00+05:30	2026-04-13 11:30:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.765968+05:30	2026-02-19 06:04:05.765971+05:30
944	8	2026-04-13 11:30:00+05:30	2026-04-13 11:40:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.767419+05:30	2026-02-19 06:04:05.767421+05:30
945	8	2026-04-13 11:40:00+05:30	2026-04-13 12:10:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.768627+05:30	2026-02-19 06:04:05.768628+05:30
946	8	2026-04-13 12:10:00+05:30	2026-04-13 12:20:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.770351+05:30	2026-02-19 06:04:05.770353+05:30
947	8	2026-04-13 12:20:00+05:30	2026-04-13 12:50:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.772126+05:30	2026-02-19 06:04:05.772127+05:30
948	8	2026-04-13 12:50:00+05:30	2026-04-13 13:00:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.773084+05:30	2026-02-19 06:04:05.773085+05:30
949	8	2026-04-13 13:00:00+05:30	2026-04-13 13:30:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.773851+05:30	2026-02-19 06:04:05.773852+05:30
950	8	2026-04-13 13:30:00+05:30	2026-04-13 13:40:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.774625+05:30	2026-02-19 06:04:05.774625+05:30
951	8	2026-04-13 13:40:00+05:30	2026-04-13 14:10:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.775372+05:30	2026-02-19 06:04:05.775372+05:30
952	8	2026-04-13 14:10:00+05:30	2026-04-13 14:20:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.776078+05:30	2026-02-19 06:04:05.776079+05:30
953	8	2026-04-13 14:20:00+05:30	2026-04-13 14:50:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.776779+05:30	2026-02-19 06:04:05.776779+05:30
954	8	2026-04-13 14:50:00+05:30	2026-04-13 15:00:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.777479+05:30	2026-02-19 06:04:05.77748+05:30
955	8	2026-04-13 15:00:00+05:30	2026-04-13 15:30:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.778223+05:30	2026-02-19 06:04:05.778224+05:30
956	8	2026-04-13 15:30:00+05:30	2026-04-13 15:40:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.779146+05:30	2026-02-19 06:04:05.779147+05:30
957	8	2026-04-13 15:40:00+05:30	2026-04-13 16:10:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.780441+05:30	2026-02-19 06:04:05.780443+05:30
958	8	2026-04-13 16:10:00+05:30	2026-04-13 16:20:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.781832+05:30	2026-02-19 06:04:05.781835+05:30
959	8	2026-04-13 16:20:00+05:30	2026-04-13 16:50:00+05:30	2026-04-13	available	\N	\N	\N	generated	2026-02-19 06:04:05.783091+05:30	2026-02-19 06:04:05.783093+05:30
960	8	2026-04-13 16:50:00+05:30	2026-04-13 17:00:00+05:30	2026-04-13	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.784369+05:30	2026-02-19 06:04:05.784371+05:30
961	8	2026-04-14 09:00:00+05:30	2026-04-14 09:30:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.785726+05:30	2026-02-19 06:04:05.785728+05:30
962	8	2026-04-14 09:30:00+05:30	2026-04-14 09:40:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.787217+05:30	2026-02-19 06:04:05.787219+05:30
963	8	2026-04-14 09:40:00+05:30	2026-04-14 10:10:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.788473+05:30	2026-02-19 06:04:05.788474+05:30
964	8	2026-04-14 10:10:00+05:30	2026-04-14 10:20:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.789421+05:30	2026-02-19 06:04:05.789422+05:30
965	8	2026-04-14 10:20:00+05:30	2026-04-14 10:50:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.790287+05:30	2026-02-19 06:04:05.790287+05:30
966	8	2026-04-14 10:50:00+05:30	2026-04-14 11:00:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.791309+05:30	2026-02-19 06:04:05.79131+05:30
967	8	2026-04-14 11:00:00+05:30	2026-04-14 11:30:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.792437+05:30	2026-02-19 06:04:05.792438+05:30
968	8	2026-04-14 11:30:00+05:30	2026-04-14 11:40:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.793549+05:30	2026-02-19 06:04:05.793549+05:30
969	8	2026-04-14 11:40:00+05:30	2026-04-14 12:10:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.794671+05:30	2026-02-19 06:04:05.794671+05:30
970	8	2026-04-14 12:10:00+05:30	2026-04-14 12:20:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.795952+05:30	2026-02-19 06:04:05.795953+05:30
971	8	2026-04-14 12:20:00+05:30	2026-04-14 12:50:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.79735+05:30	2026-02-19 06:04:05.797352+05:30
972	8	2026-04-14 12:50:00+05:30	2026-04-14 13:00:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.79867+05:30	2026-02-19 06:04:05.798672+05:30
973	8	2026-04-14 13:00:00+05:30	2026-04-14 13:30:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.799901+05:30	2026-02-19 06:04:05.799903+05:30
974	8	2026-04-14 13:30:00+05:30	2026-04-14 13:40:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.801364+05:30	2026-02-19 06:04:05.801367+05:30
975	8	2026-04-14 13:40:00+05:30	2026-04-14 14:10:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.803546+05:30	2026-02-19 06:04:05.803548+05:30
976	8	2026-04-14 14:10:00+05:30	2026-04-14 14:20:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.804822+05:30	2026-02-19 06:04:05.804823+05:30
977	8	2026-04-14 14:20:00+05:30	2026-04-14 14:50:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.805648+05:30	2026-02-19 06:04:05.805649+05:30
978	8	2026-04-14 14:50:00+05:30	2026-04-14 15:00:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.806376+05:30	2026-02-19 06:04:05.806377+05:30
979	8	2026-04-14 15:00:00+05:30	2026-04-14 15:30:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.807088+05:30	2026-02-19 06:04:05.807089+05:30
980	8	2026-04-14 15:30:00+05:30	2026-04-14 15:40:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.807773+05:30	2026-02-19 06:04:05.807774+05:30
981	8	2026-04-14 15:40:00+05:30	2026-04-14 16:10:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.808451+05:30	2026-02-19 06:04:05.808452+05:30
982	8	2026-04-14 16:10:00+05:30	2026-04-14 16:20:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.809121+05:30	2026-02-19 06:04:05.809122+05:30
983	8	2026-04-14 16:20:00+05:30	2026-04-14 16:50:00+05:30	2026-04-14	available	\N	\N	\N	generated	2026-02-19 06:04:05.809787+05:30	2026-02-19 06:04:05.809787+05:30
984	8	2026-04-14 16:50:00+05:30	2026-04-14 17:00:00+05:30	2026-04-14	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.81053+05:30	2026-02-19 06:04:05.810531+05:30
985	8	2026-04-15 09:00:00+05:30	2026-04-15 09:30:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.811679+05:30	2026-02-19 06:04:05.81168+05:30
986	8	2026-04-15 09:30:00+05:30	2026-04-15 09:40:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.812851+05:30	2026-02-19 06:04:05.812853+05:30
987	8	2026-04-15 09:40:00+05:30	2026-04-15 10:10:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.814089+05:30	2026-02-19 06:04:05.814091+05:30
988	8	2026-04-15 10:10:00+05:30	2026-04-15 10:20:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.815462+05:30	2026-02-19 06:04:05.815464+05:30
989	8	2026-04-15 10:20:00+05:30	2026-04-15 10:50:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.816721+05:30	2026-02-19 06:04:05.816723+05:30
990	8	2026-04-15 10:50:00+05:30	2026-04-15 11:00:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.818001+05:30	2026-02-19 06:04:05.818002+05:30
991	8	2026-04-15 11:00:00+05:30	2026-04-15 11:30:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.819408+05:30	2026-02-19 06:04:05.81941+05:30
992	8	2026-04-15 11:30:00+05:30	2026-04-15 11:40:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.820711+05:30	2026-02-19 06:04:05.820712+05:30
993	8	2026-04-15 11:40:00+05:30	2026-04-15 12:10:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.821649+05:30	2026-02-19 06:04:05.82165+05:30
994	8	2026-04-15 12:10:00+05:30	2026-04-15 12:20:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.822465+05:30	2026-02-19 06:04:05.822466+05:30
995	8	2026-04-15 12:20:00+05:30	2026-04-15 12:50:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.823258+05:30	2026-02-19 06:04:05.823259+05:30
996	8	2026-04-15 12:50:00+05:30	2026-04-15 13:00:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.824012+05:30	2026-02-19 06:04:05.824013+05:30
997	8	2026-04-15 13:00:00+05:30	2026-04-15 13:30:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.824757+05:30	2026-02-19 06:04:05.824758+05:30
998	8	2026-04-15 13:30:00+05:30	2026-04-15 13:40:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.825499+05:30	2026-02-19 06:04:05.825499+05:30
999	8	2026-04-15 13:40:00+05:30	2026-04-15 14:10:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.826245+05:30	2026-02-19 06:04:05.826246+05:30
1000	8	2026-04-15 14:10:00+05:30	2026-04-15 14:20:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.827327+05:30	2026-02-19 06:04:05.827327+05:30
1001	8	2026-04-15 14:20:00+05:30	2026-04-15 14:50:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.828635+05:30	2026-02-19 06:04:05.828636+05:30
1002	8	2026-04-15 14:50:00+05:30	2026-04-15 15:00:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.829963+05:30	2026-02-19 06:04:05.829965+05:30
1003	8	2026-04-15 15:00:00+05:30	2026-04-15 15:30:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.831356+05:30	2026-02-19 06:04:05.831359+05:30
1004	8	2026-04-15 15:30:00+05:30	2026-04-15 15:40:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.832847+05:30	2026-02-19 06:04:05.832849+05:30
1005	8	2026-04-15 15:40:00+05:30	2026-04-15 16:10:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.834903+05:30	2026-02-19 06:04:05.834905+05:30
1006	8	2026-04-15 16:10:00+05:30	2026-04-15 16:20:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.836749+05:30	2026-02-19 06:04:05.836753+05:30
1007	8	2026-04-15 16:20:00+05:30	2026-04-15 16:50:00+05:30	2026-04-15	available	\N	\N	\N	generated	2026-02-19 06:04:05.838278+05:30	2026-02-19 06:04:05.838279+05:30
1008	8	2026-04-15 16:50:00+05:30	2026-04-15 17:00:00+05:30	2026-04-15	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.839193+05:30	2026-02-19 06:04:05.839194+05:30
1009	8	2026-04-16 09:00:00+05:30	2026-04-16 09:30:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.839946+05:30	2026-02-19 06:04:05.839946+05:30
1010	8	2026-04-16 09:30:00+05:30	2026-04-16 09:40:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.84068+05:30	2026-02-19 06:04:05.840681+05:30
1011	8	2026-04-16 09:40:00+05:30	2026-04-16 10:10:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.841406+05:30	2026-02-19 06:04:05.841407+05:30
1012	8	2026-04-16 10:10:00+05:30	2026-04-16 10:20:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.842295+05:30	2026-02-19 06:04:05.842295+05:30
1013	8	2026-04-16 10:20:00+05:30	2026-04-16 10:50:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.843434+05:30	2026-02-19 06:04:05.843434+05:30
1014	8	2026-04-16 10:50:00+05:30	2026-04-16 11:00:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.844568+05:30	2026-02-19 06:04:05.844569+05:30
1015	8	2026-04-16 11:00:00+05:30	2026-04-16 11:30:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.845652+05:30	2026-02-19 06:04:05.845653+05:30
1016	8	2026-04-16 11:30:00+05:30	2026-04-16 11:40:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.847047+05:30	2026-02-19 06:04:05.84705+05:30
1017	8	2026-04-16 11:40:00+05:30	2026-04-16 12:10:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.848345+05:30	2026-02-19 06:04:05.848347+05:30
1018	8	2026-04-16 12:10:00+05:30	2026-04-16 12:20:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.84954+05:30	2026-02-19 06:04:05.849541+05:30
1019	8	2026-04-16 12:20:00+05:30	2026-04-16 12:50:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.850771+05:30	2026-02-19 06:04:05.850773+05:30
1020	8	2026-04-16 12:50:00+05:30	2026-04-16 13:00:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.852076+05:30	2026-02-19 06:04:05.852077+05:30
1021	8	2026-04-16 13:00:00+05:30	2026-04-16 13:30:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.853225+05:30	2026-02-19 06:04:05.853227+05:30
1022	8	2026-04-16 13:30:00+05:30	2026-04-16 13:40:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.854224+05:30	2026-02-19 06:04:05.854225+05:30
1023	8	2026-04-16 13:40:00+05:30	2026-04-16 14:10:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.85512+05:30	2026-02-19 06:04:05.85512+05:30
1024	8	2026-04-16 14:10:00+05:30	2026-04-16 14:20:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.855952+05:30	2026-02-19 06:04:05.855953+05:30
1025	8	2026-04-16 14:20:00+05:30	2026-04-16 14:50:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.856741+05:30	2026-02-19 06:04:05.856742+05:30
1026	8	2026-04-16 14:50:00+05:30	2026-04-16 15:00:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.8575+05:30	2026-02-19 06:04:05.857501+05:30
1027	8	2026-04-16 15:00:00+05:30	2026-04-16 15:30:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.858556+05:30	2026-02-19 06:04:05.858556+05:30
1028	8	2026-04-16 15:30:00+05:30	2026-04-16 15:40:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.859608+05:30	2026-02-19 06:04:05.859609+05:30
1029	8	2026-04-16 15:40:00+05:30	2026-04-16 16:10:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.860671+05:30	2026-02-19 06:04:05.860672+05:30
1030	8	2026-04-16 16:10:00+05:30	2026-04-16 16:20:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.861832+05:30	2026-02-19 06:04:05.861832+05:30
1031	8	2026-04-16 16:20:00+05:30	2026-04-16 16:50:00+05:30	2026-04-16	available	\N	\N	\N	generated	2026-02-19 06:04:05.863088+05:30	2026-02-19 06:04:05.86309+05:30
1032	8	2026-04-16 16:50:00+05:30	2026-04-16 17:00:00+05:30	2026-04-16	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.864469+05:30	2026-02-19 06:04:05.864471+05:30
1033	8	2026-04-18 09:00:00+05:30	2026-04-18 09:30:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.865811+05:30	2026-02-19 06:04:05.865813+05:30
1034	8	2026-04-18 09:30:00+05:30	2026-04-18 09:40:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.867141+05:30	2026-02-19 06:04:05.867143+05:30
1035	8	2026-04-18 09:40:00+05:30	2026-04-18 10:10:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.868453+05:30	2026-02-19 06:04:05.868456+05:30
1036	8	2026-04-18 10:10:00+05:30	2026-04-18 10:20:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.869619+05:30	2026-02-19 06:04:05.869621+05:30
1037	8	2026-04-18 10:20:00+05:30	2026-04-18 10:50:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.870589+05:30	2026-02-19 06:04:05.87059+05:30
1038	8	2026-04-18 10:50:00+05:30	2026-04-18 11:00:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.871453+05:30	2026-02-19 06:04:05.871453+05:30
1039	8	2026-04-18 11:00:00+05:30	2026-04-18 11:30:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.872682+05:30	2026-02-19 06:04:05.872682+05:30
1040	8	2026-04-18 11:30:00+05:30	2026-04-18 11:40:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.873689+05:30	2026-02-19 06:04:05.87369+05:30
1041	8	2026-04-18 11:40:00+05:30	2026-04-18 12:10:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.874447+05:30	2026-02-19 06:04:05.874448+05:30
1042	8	2026-04-18 12:10:00+05:30	2026-04-18 12:20:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.875271+05:30	2026-02-19 06:04:05.875271+05:30
1043	8	2026-04-18 12:20:00+05:30	2026-04-18 12:50:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.876084+05:30	2026-02-19 06:04:05.876084+05:30
1044	8	2026-04-18 12:50:00+05:30	2026-04-18 13:00:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.876836+05:30	2026-02-19 06:04:05.876837+05:30
1045	8	2026-04-18 13:00:00+05:30	2026-04-18 13:30:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.87782+05:30	2026-02-19 06:04:05.87782+05:30
1046	8	2026-04-18 13:30:00+05:30	2026-04-18 13:40:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.878995+05:30	2026-02-19 06:04:05.878996+05:30
1047	8	2026-04-18 13:40:00+05:30	2026-04-18 14:10:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.880297+05:30	2026-02-19 06:04:05.8803+05:30
1048	8	2026-04-18 14:10:00+05:30	2026-04-18 14:20:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.881601+05:30	2026-02-19 06:04:05.881603+05:30
1049	8	2026-04-18 14:20:00+05:30	2026-04-18 14:50:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.882811+05:30	2026-02-19 06:04:05.882812+05:30
1050	8	2026-04-18 14:50:00+05:30	2026-04-18 15:00:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.884128+05:30	2026-02-19 06:04:05.88413+05:30
1051	8	2026-04-18 15:00:00+05:30	2026-04-18 15:30:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.885391+05:30	2026-02-19 06:04:05.885393+05:30
1052	8	2026-04-18 15:30:00+05:30	2026-04-18 15:40:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.886433+05:30	2026-02-19 06:04:05.886434+05:30
1053	8	2026-04-18 15:40:00+05:30	2026-04-18 16:10:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.887577+05:30	2026-02-19 06:04:05.887578+05:30
1054	8	2026-04-18 16:10:00+05:30	2026-04-18 16:20:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.888403+05:30	2026-02-19 06:04:05.888404+05:30
1055	8	2026-04-18 16:20:00+05:30	2026-04-18 16:50:00+05:30	2026-04-18	available	\N	\N	\N	generated	2026-02-19 06:04:05.889188+05:30	2026-02-19 06:04:05.889189+05:30
1056	8	2026-04-18 16:50:00+05:30	2026-04-18 17:00:00+05:30	2026-04-18	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.88997+05:30	2026-02-19 06:04:05.88997+05:30
1057	8	2026-04-20 09:00:00+05:30	2026-04-20 09:30:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.890723+05:30	2026-02-19 06:04:05.890724+05:30
1058	8	2026-04-20 09:30:00+05:30	2026-04-20 09:40:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.891548+05:30	2026-02-19 06:04:05.891549+05:30
1059	8	2026-04-20 10:00:00+05:30	2026-04-20 10:30:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.892329+05:30	2026-02-19 06:04:05.89233+05:30
1060	8	2026-04-20 10:30:00+05:30	2026-04-20 10:40:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.893076+05:30	2026-02-19 06:04:05.893077+05:30
1061	8	2026-04-20 10:40:00+05:30	2026-04-20 11:10:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.894153+05:30	2026-02-19 06:04:05.894154+05:30
1062	8	2026-04-20 11:10:00+05:30	2026-04-20 11:20:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.895237+05:30	2026-02-19 06:04:05.895238+05:30
1063	8	2026-04-20 11:20:00+05:30	2026-04-20 11:50:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.8964+05:30	2026-02-19 06:04:05.896402+05:30
1064	8	2026-04-20 11:50:00+05:30	2026-04-20 12:00:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.897713+05:30	2026-02-19 06:04:05.897716+05:30
1065	8	2026-04-20 09:40:00+05:30	2026-04-20 10:10:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.900371+05:30	2026-02-19 06:04:05.900374+05:30
1066	8	2026-04-20 10:10:00+05:30	2026-04-20 10:20:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.901703+05:30	2026-02-19 06:04:05.901705+05:30
1067	8	2026-04-20 10:20:00+05:30	2026-04-20 10:50:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.902769+05:30	2026-02-19 06:04:05.902771+05:30
1068	8	2026-04-20 10:50:00+05:30	2026-04-20 11:00:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.906926+05:30	2026-02-19 06:04:05.906927+05:30
1069	8	2026-04-20 11:00:00+05:30	2026-04-20 11:30:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.907996+05:30	2026-02-19 06:04:05.907996+05:30
1070	8	2026-04-20 11:30:00+05:30	2026-04-20 11:40:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.909067+05:30	2026-02-19 06:04:05.909068+05:30
1071	8	2026-04-20 11:40:00+05:30	2026-04-20 12:10:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.910101+05:30	2026-02-19 06:04:05.910102+05:30
1072	8	2026-04-20 12:10:00+05:30	2026-04-20 12:20:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.911113+05:30	2026-02-19 06:04:05.911114+05:30
1073	8	2026-04-20 12:20:00+05:30	2026-04-20 12:50:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.912124+05:30	2026-02-19 06:04:05.912125+05:30
1074	8	2026-04-20 12:50:00+05:30	2026-04-20 13:00:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.91316+05:30	2026-02-19 06:04:05.913162+05:30
1075	8	2026-04-20 13:00:00+05:30	2026-04-20 13:30:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.9145+05:30	2026-02-19 06:04:05.914502+05:30
1076	8	2026-04-20 13:30:00+05:30	2026-04-20 13:40:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.916095+05:30	2026-02-19 06:04:05.916097+05:30
1077	8	2026-04-20 13:40:00+05:30	2026-04-20 14:10:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.917491+05:30	2026-02-19 06:04:05.917493+05:30
1078	8	2026-04-20 14:10:00+05:30	2026-04-20 14:20:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.918813+05:30	2026-02-19 06:04:05.918814+05:30
1079	8	2026-04-20 14:20:00+05:30	2026-04-20 14:50:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.919763+05:30	2026-02-19 06:04:05.919764+05:30
1080	8	2026-04-20 14:50:00+05:30	2026-04-20 15:00:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.921096+05:30	2026-02-19 06:04:05.921097+05:30
1081	8	2026-04-20 15:00:00+05:30	2026-04-20 15:30:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.922556+05:30	2026-02-19 06:04:05.922557+05:30
1082	8	2026-04-20 15:30:00+05:30	2026-04-20 15:40:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.923772+05:30	2026-02-19 06:04:05.923773+05:30
1083	8	2026-04-20 15:40:00+05:30	2026-04-20 16:10:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.924913+05:30	2026-02-19 06:04:05.924914+05:30
1084	8	2026-04-20 16:10:00+05:30	2026-04-20 16:20:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.926007+05:30	2026-02-19 06:04:05.926007+05:30
1085	8	2026-04-20 16:20:00+05:30	2026-04-20 16:50:00+05:30	2026-04-20	available	\N	\N	\N	generated	2026-02-19 06:04:05.927077+05:30	2026-02-19 06:04:05.927078+05:30
1086	8	2026-04-20 16:50:00+05:30	2026-04-20 17:00:00+05:30	2026-04-20	blocked	\N	\N	\N	generated	2026-02-19 06:04:05.928086+05:30	2026-02-19 06:04:05.928087+05:30
85	8	2026-02-21 13:00:00+05:30	2026-02-21 13:30:00+05:30	2026-02-21	booked	\N	\N	29	generated	2026-02-19 06:04:04.691472+05:30	2026-02-20 14:55:58.114219+05:30
1191	8	2026-02-24 09:00:00+05:30	2026-02-24 09:30:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.094175+05:30	2026-02-24 15:41:42.094186+05:30
1192	8	2026-02-24 09:40:00+05:30	2026-02-24 10:10:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.097632+05:30	2026-02-24 15:41:42.097638+05:30
1193	8	2026-02-24 10:20:00+05:30	2026-02-24 10:50:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.100469+05:30	2026-02-24 15:41:42.100473+05:30
1194	8	2026-02-24 11:00:00+05:30	2026-02-24 11:30:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.103039+05:30	2026-02-24 15:41:42.103044+05:30
1195	8	2026-02-24 11:40:00+05:30	2026-02-24 12:10:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.105683+05:30	2026-02-24 15:41:42.105688+05:30
1196	8	2026-02-24 12:20:00+05:30	2026-02-24 12:50:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.108296+05:30	2026-02-24 15:41:42.1083+05:30
1197	8	2026-02-24 13:00:00+05:30	2026-02-24 13:30:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.110864+05:30	2026-02-24 15:41:42.110869+05:30
1198	8	2026-02-24 13:40:00+05:30	2026-02-24 14:10:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.113539+05:30	2026-02-24 15:41:42.113543+05:30
1199	8	2026-02-24 14:20:00+05:30	2026-02-24 14:50:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.115573+05:30	2026-02-24 15:41:42.115577+05:30
1200	8	2026-02-24 15:00:00+05:30	2026-02-24 15:30:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.117561+05:30	2026-02-24 15:41:42.117565+05:30
1201	8	2026-02-24 15:40:00+05:30	2026-02-24 16:10:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.11953+05:30	2026-02-24 15:41:42.119533+05:30
1202	8	2026-02-24 16:20:00+05:30	2026-02-24 16:50:00+05:30	2026-02-24	available	\N	\N	\N	generated	2026-02-24 15:41:42.121627+05:30	2026-02-24 15:41:42.12163+05:30
1203	8	2026-02-25 09:00:00+05:30	2026-02-25 09:30:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.123597+05:30	2026-02-24 15:41:42.1236+05:30
1204	8	2026-02-25 09:40:00+05:30	2026-02-25 10:10:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.125535+05:30	2026-02-24 15:41:42.125539+05:30
1205	8	2026-02-25 10:20:00+05:30	2026-02-25 10:50:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.129632+05:30	2026-02-24 15:41:42.129636+05:30
1206	8	2026-02-25 11:00:00+05:30	2026-02-25 11:30:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.132183+05:30	2026-02-24 15:41:42.132187+05:30
1207	8	2026-02-25 11:40:00+05:30	2026-02-25 12:10:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.134591+05:30	2026-02-24 15:41:42.134595+05:30
1208	8	2026-02-25 12:20:00+05:30	2026-02-25 12:50:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.137196+05:30	2026-02-24 15:41:42.137201+05:30
1209	8	2026-02-25 13:00:00+05:30	2026-02-25 13:30:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.139893+05:30	2026-02-24 15:41:42.139898+05:30
1210	8	2026-02-25 13:40:00+05:30	2026-02-25 14:10:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.142431+05:30	2026-02-24 15:41:42.142435+05:30
1211	8	2026-02-25 14:20:00+05:30	2026-02-25 14:50:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.144928+05:30	2026-02-24 15:41:42.144933+05:30
1212	8	2026-02-25 15:00:00+05:30	2026-02-25 15:30:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.147475+05:30	2026-02-24 15:41:42.147479+05:30
1213	8	2026-02-25 15:40:00+05:30	2026-02-25 16:10:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.150322+05:30	2026-02-24 15:41:42.150327+05:30
1214	8	2026-02-25 16:20:00+05:30	2026-02-25 16:50:00+05:30	2026-02-25	available	\N	\N	\N	generated	2026-02-24 15:41:42.153047+05:30	2026-02-24 15:41:42.153052+05:30
1215	8	2026-02-26 09:00:00+05:30	2026-02-26 09:30:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.15566+05:30	2026-02-24 15:41:42.155664+05:30
1216	8	2026-02-26 09:40:00+05:30	2026-02-26 10:10:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.15831+05:30	2026-02-24 15:41:42.158315+05:30
1217	8	2026-02-26 10:20:00+05:30	2026-02-26 10:50:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.161006+05:30	2026-02-24 15:41:42.161015+05:30
1218	8	2026-02-26 11:00:00+05:30	2026-02-26 11:30:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.1639+05:30	2026-02-24 15:41:42.163904+05:30
1219	8	2026-02-26 11:40:00+05:30	2026-02-26 12:10:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.166464+05:30	2026-02-24 15:41:42.166468+05:30
1220	8	2026-02-26 12:20:00+05:30	2026-02-26 12:50:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.168934+05:30	2026-02-24 15:41:42.168938+05:30
1221	8	2026-02-26 13:00:00+05:30	2026-02-26 13:30:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.17148+05:30	2026-02-24 15:41:42.171485+05:30
1222	8	2026-02-26 13:40:00+05:30	2026-02-26 14:10:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.174044+05:30	2026-02-24 15:41:42.174048+05:30
1223	8	2026-02-26 14:20:00+05:30	2026-02-26 14:50:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.176578+05:30	2026-02-24 15:41:42.176582+05:30
1224	8	2026-02-26 15:00:00+05:30	2026-02-26 15:30:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.178585+05:30	2026-02-24 15:41:42.178588+05:30
1225	8	2026-02-26 15:40:00+05:30	2026-02-26 16:10:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.180602+05:30	2026-02-24 15:41:42.180605+05:30
1226	8	2026-02-26 16:20:00+05:30	2026-02-26 16:50:00+05:30	2026-02-26	available	\N	\N	\N	generated	2026-02-24 15:41:42.182636+05:30	2026-02-24 15:41:42.18264+05:30
1228	8	2026-02-28 09:40:00+05:30	2026-02-28 10:10:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.186809+05:30	2026-02-24 15:41:42.186812+05:30
1229	8	2026-02-28 10:20:00+05:30	2026-02-28 10:50:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.188797+05:30	2026-02-24 15:41:42.1888+05:30
1230	8	2026-02-28 11:00:00+05:30	2026-02-28 11:30:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.192672+05:30	2026-02-24 15:41:42.192676+05:30
1231	8	2026-02-28 11:40:00+05:30	2026-02-28 12:10:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.19548+05:30	2026-02-24 15:41:42.195484+05:30
1232	8	2026-02-28 12:20:00+05:30	2026-02-28 12:50:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.197736+05:30	2026-02-24 15:41:42.19774+05:30
1233	8	2026-02-28 13:00:00+05:30	2026-02-28 13:30:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.199827+05:30	2026-02-24 15:41:42.19983+05:30
1234	8	2026-02-28 13:40:00+05:30	2026-02-28 14:10:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.201849+05:30	2026-02-24 15:41:42.201852+05:30
1235	8	2026-02-28 14:20:00+05:30	2026-02-28 14:50:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.203598+05:30	2026-02-24 15:41:42.203601+05:30
1236	8	2026-02-28 15:00:00+05:30	2026-02-28 15:30:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.205431+05:30	2026-02-24 15:41:42.205434+05:30
1237	8	2026-02-28 15:40:00+05:30	2026-02-28 16:10:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.207175+05:30	2026-02-24 15:41:42.207178+05:30
1239	8	2026-03-02 09:00:00+05:30	2026-03-02 09:30:00+05:30	2026-03-02	available	\N	\N	\N	generated	2026-02-24 15:41:42.210649+05:30	2026-02-24 15:41:42.210652+05:30
1240	8	2026-03-03 09:00:00+05:30	2026-03-03 09:30:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.212467+05:30	2026-02-24 15:41:42.212471+05:30
1241	8	2026-03-03 09:40:00+05:30	2026-03-03 10:10:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.21471+05:30	2026-02-24 15:41:42.214714+05:30
1242	8	2026-03-03 10:20:00+05:30	2026-03-03 10:50:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.216723+05:30	2026-02-24 15:41:42.216726+05:30
1243	8	2026-03-03 11:00:00+05:30	2026-03-03 11:30:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.218697+05:30	2026-02-24 15:41:42.2187+05:30
1244	8	2026-03-03 11:40:00+05:30	2026-03-03 12:10:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.220671+05:30	2026-02-24 15:41:42.220675+05:30
1245	8	2026-03-03 12:20:00+05:30	2026-03-03 12:50:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.222644+05:30	2026-02-24 15:41:42.222647+05:30
1246	8	2026-03-03 13:00:00+05:30	2026-03-03 13:30:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.224575+05:30	2026-02-24 15:41:42.224578+05:30
1247	8	2026-03-03 13:40:00+05:30	2026-03-03 14:10:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.226486+05:30	2026-02-24 15:41:42.226489+05:30
1248	8	2026-03-03 14:20:00+05:30	2026-03-03 14:50:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.228419+05:30	2026-02-24 15:41:42.228422+05:30
1249	8	2026-03-03 15:00:00+05:30	2026-03-03 15:30:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.230361+05:30	2026-02-24 15:41:42.230364+05:30
1250	8	2026-03-03 15:40:00+05:30	2026-03-03 16:10:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.232286+05:30	2026-02-24 15:41:42.232289+05:30
1251	8	2026-03-03 16:20:00+05:30	2026-03-03 16:50:00+05:30	2026-03-03	available	\N	\N	\N	generated	2026-02-24 15:41:42.2343+05:30	2026-02-24 15:41:42.234304+05:30
1252	8	2026-03-04 09:00:00+05:30	2026-03-04 09:30:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.236317+05:30	2026-02-24 15:41:42.23632+05:30
1253	8	2026-03-04 09:40:00+05:30	2026-03-04 10:10:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.238306+05:30	2026-02-24 15:41:42.23831+05:30
1254	8	2026-03-04 10:20:00+05:30	2026-03-04 10:50:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.241388+05:30	2026-02-24 15:41:42.241397+05:30
1255	8	2026-03-04 11:00:00+05:30	2026-03-04 11:30:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.243769+05:30	2026-02-24 15:41:42.243772+05:30
1256	8	2026-03-04 11:40:00+05:30	2026-03-04 12:10:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.245646+05:30	2026-02-24 15:41:42.245648+05:30
1257	8	2026-03-04 12:20:00+05:30	2026-03-04 12:50:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.247491+05:30	2026-02-24 15:41:42.247492+05:30
1258	8	2026-03-04 13:00:00+05:30	2026-03-04 13:30:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.249585+05:30	2026-02-24 15:41:42.249587+05:30
1259	8	2026-03-04 13:40:00+05:30	2026-03-04 14:10:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.251992+05:30	2026-02-24 15:41:42.251994+05:30
1260	8	2026-03-04 14:20:00+05:30	2026-03-04 14:50:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.25393+05:30	2026-02-24 15:41:42.253932+05:30
1261	8	2026-03-04 15:00:00+05:30	2026-03-04 15:30:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.25573+05:30	2026-02-24 15:41:42.255731+05:30
1262	8	2026-03-04 15:40:00+05:30	2026-03-04 16:10:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.257511+05:30	2026-02-24 15:41:42.257512+05:30
1263	8	2026-03-04 16:20:00+05:30	2026-03-04 16:50:00+05:30	2026-03-04	available	\N	\N	\N	generated	2026-02-24 15:41:42.259376+05:30	2026-02-24 15:41:42.259378+05:30
1264	8	2026-03-05 09:00:00+05:30	2026-03-05 09:30:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.261749+05:30	2026-02-24 15:41:42.261751+05:30
1265	8	2026-03-05 09:40:00+05:30	2026-03-05 10:10:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.263719+05:30	2026-02-24 15:41:42.26372+05:30
1266	8	2026-03-05 10:20:00+05:30	2026-03-05 10:50:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.265286+05:30	2026-02-24 15:41:42.265287+05:30
1267	8	2026-03-05 11:00:00+05:30	2026-03-05 11:30:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.266966+05:30	2026-02-24 15:41:42.266968+05:30
1268	8	2026-03-05 11:40:00+05:30	2026-03-05 12:10:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.268673+05:30	2026-02-24 15:41:42.268674+05:30
1269	8	2026-03-05 12:20:00+05:30	2026-03-05 12:50:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.27037+05:30	2026-02-24 15:41:42.270371+05:30
1270	8	2026-03-05 13:00:00+05:30	2026-03-05 13:30:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.272115+05:30	2026-02-24 15:41:42.272116+05:30
1271	8	2026-03-05 13:40:00+05:30	2026-03-05 14:10:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.273763+05:30	2026-02-24 15:41:42.273764+05:30
1272	8	2026-03-05 14:20:00+05:30	2026-03-05 14:50:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.275396+05:30	2026-02-24 15:41:42.275397+05:30
1273	8	2026-03-05 15:00:00+05:30	2026-03-05 15:30:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.277036+05:30	2026-02-24 15:41:42.277037+05:30
1274	8	2026-03-05 15:40:00+05:30	2026-03-05 16:10:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.278655+05:30	2026-02-24 15:41:42.278656+05:30
1275	8	2026-03-05 16:20:00+05:30	2026-03-05 16:50:00+05:30	2026-03-05	available	\N	\N	\N	generated	2026-02-24 15:41:42.280319+05:30	2026-02-24 15:41:42.28032+05:30
1276	8	2026-03-07 09:00:00+05:30	2026-03-07 09:30:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.282023+05:30	2026-02-24 15:41:42.282024+05:30
1277	8	2026-03-07 09:40:00+05:30	2026-03-07 10:10:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.283691+05:30	2026-02-24 15:41:42.283692+05:30
1278	8	2026-03-07 10:20:00+05:30	2026-03-07 10:50:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.285371+05:30	2026-02-24 15:41:42.285372+05:30
1279	8	2026-03-07 11:00:00+05:30	2026-03-07 11:30:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.287041+05:30	2026-02-24 15:41:42.287042+05:30
1280	8	2026-03-07 11:40:00+05:30	2026-03-07 12:10:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.288635+05:30	2026-02-24 15:41:42.288636+05:30
1281	8	2026-03-07 12:20:00+05:30	2026-03-07 12:50:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.290248+05:30	2026-02-24 15:41:42.290249+05:30
1282	8	2026-03-07 13:00:00+05:30	2026-03-07 13:30:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.291837+05:30	2026-02-24 15:41:42.291839+05:30
1283	8	2026-03-07 13:40:00+05:30	2026-03-07 14:10:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.293463+05:30	2026-02-24 15:41:42.293464+05:30
1284	8	2026-03-07 14:20:00+05:30	2026-03-07 14:50:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.295053+05:30	2026-02-24 15:41:42.295054+05:30
1285	8	2026-03-07 15:00:00+05:30	2026-03-07 15:30:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.296679+05:30	2026-02-24 15:41:42.296681+05:30
1286	8	2026-03-07 15:40:00+05:30	2026-03-07 16:10:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.298307+05:30	2026-02-24 15:41:42.298308+05:30
1287	8	2026-03-07 16:20:00+05:30	2026-03-07 16:50:00+05:30	2026-03-07	available	\N	\N	\N	generated	2026-02-24 15:41:42.29993+05:30	2026-02-24 15:41:42.299931+05:30
1288	8	2026-03-09 09:00:00+05:30	2026-03-09 09:30:00+05:30	2026-03-09	available	\N	\N	\N	generated	2026-02-24 15:41:42.301395+05:30	2026-02-24 15:41:42.301397+05:30
1238	8	2026-02-28 16:20:00+05:30	2026-02-28 16:50:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.208902+05:30	2026-02-26 14:40:39.295496+05:30
1227	8	2026-02-28 09:00:00+05:30	2026-02-28 09:30:00+05:30	2026-02-28	available	\N	\N	\N	generated	2026-02-24 15:41:42.184841+05:30	2026-02-26 09:45:18.66085+05:30
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, patient_id, appointment_date, appointment_time, reason, notes, status, created_at, updated_at, doctor_id, slot_id, booking_mode, delay_reason, extended_from_appointment_id, feedback_given) FROM stdin;
7	4	2026-02-27	12:00:00	obj	mbnmn	rejected	2026-02-15 10:54:18.770763	2026-02-15 11:02:00.089653	8	\N	auto_confirm	\N	\N	f
13	4	2026-02-26	13:00:00	sdzxfcgvhbjnm zdxfcgvhbjnm	cvbnm cfghvbjn, cfgvhbnm,xcvbnm 	rejected	2026-02-18 16:04:15.397697	2026-02-19 03:18:11.76705	8	\N	auto_confirm	\N	\N	f
1	4	2026-02-16	13:00:00	sdfgh	cfgvhbjnkm dftgyhuj drftgyhuj	cancelled_by_patient	2026-02-14 04:06:53.024686	2026-02-14 04:07:04.907743	8	\N	auto_confirm	\N	\N	f
4	4	2026-02-26	06:00:00	hjkg	hgjhjmk,	cancelled_by_patient	2026-02-14 04:44:54.806888	2026-02-14 04:50:58.084769	8	\N	auto_confirm	\N	\N	f
8	4	2026-02-15	17:00:00	cvghf	fghfgh	no_show	2026-02-15 11:05:27.329788	2026-02-15 11:16:00.568153	8	\N	auto_confirm	\N	\N	f
9	4	2026-02-15	17:30:00	dbc	cvvv	no_show	2026-02-15 11:06:22.329549	2026-02-15 11:16:06.329808	8	\N	auto_confirm	\N	\N	f
10	4	2026-02-15	19:00:00	bjnm	bam,	no_show	2026-02-15 11:16:40.163826	2026-02-15 11:28:26.3784	8	\N	auto_confirm	\N	\N	f
2	4	2026-02-28	16:00:00	vhcbj	hbdjfkgjndg\n[Governance Log 2026-02-20 02:14:18] - Nayana Admin (Admin) changed status from rejected to No-show.\n[Governance Log 2026-02-20 02:14:43] - Nayana Admin (Admin) changed status from no_show to Cancelled.\n[Governance Log 2026-02-20 02:26:30] - Nayana Admin (Admin) changed status from cancelled_by_doctor to No-show.\n[Governance Log 2026-02-20 02:39:52] - Nayana Admin (Admin) changed status from no_show to Cancelled.	cancelled_by_doctor	2026-02-14 04:07:34.044365	2026-02-20 02:39:52.703993	8	\N	auto_confirm	\N	\N	f
14	9	2026-02-09	08:51:13.189272	\N	\N	completed	2026-02-20 03:21:13.190692	2026-02-20 03:21:13.190694	49	\N	auto_confirm	\N	\N	t
15	4	2026-02-10	08:51:13.20535	\N	\N	completed	2026-02-20 03:21:13.205578	2026-02-20 03:21:13.205579	32	\N	auto_confirm	\N	\N	t
16	4	2026-01-22	08:51:13.211015	\N	\N	completed	2026-02-20 03:21:13.211252	2026-02-20 03:21:13.211254	20	\N	auto_confirm	\N	\N	t
17	2	2026-01-31	08:51:13.216545	\N	\N	completed	2026-02-20 03:21:13.216757	2026-02-20 03:21:13.216758	37	\N	auto_confirm	\N	\N	t
18	4	2026-02-11	08:51:13.221811	\N	\N	completed	2026-02-20 03:21:13.222046	2026-02-20 03:21:13.222047	36	\N	auto_confirm	\N	\N	t
19	9	2026-02-12	08:51:13.227746	\N	\N	completed	2026-02-20 03:21:13.227962	2026-02-20 03:21:13.227963	27	\N	auto_confirm	\N	\N	t
20	3	2026-02-05	08:51:13.233572	\N	\N	completed	2026-02-20 03:21:13.23378	2026-02-20 03:21:13.233781	26	\N	auto_confirm	\N	\N	t
21	4	2026-02-12	08:51:13.23901	\N	\N	completed	2026-02-20 03:21:13.239214	2026-02-20 03:21:13.239215	19	\N	auto_confirm	\N	\N	t
22	3	2026-02-07	08:51:13.24442	\N	\N	completed	2026-02-20 03:21:13.24463	2026-02-20 03:21:13.244633	29	\N	auto_confirm	\N	\N	t
23	9	2026-02-03	08:51:13.249331	\N	\N	completed	2026-02-20 03:21:13.249553	2026-02-20 03:21:13.249553	19	\N	auto_confirm	\N	\N	t
24	2	2026-02-05	08:51:13.254812	\N	\N	completed	2026-02-20 03:21:13.255035	2026-02-20 03:21:13.25504	16	\N	auto_confirm	\N	\N	t
25	3	2026-02-07	08:51:13.259477	\N	\N	completed	2026-02-20 03:21:13.259691	2026-02-20 03:21:13.259692	20	\N	auto_confirm	\N	\N	t
26	4	2026-02-13	08:51:13.264738	\N	\N	completed	2026-02-20 03:21:13.264965	2026-02-20 03:21:13.264966	15	\N	auto_confirm	\N	\N	t
27	3	2026-02-03	08:51:13.269008	\N	\N	completed	2026-02-20 03:21:13.269271	2026-02-20 03:21:13.269272	51	\N	auto_confirm	\N	\N	t
28	2	2026-01-30	08:51:13.274259	\N	\N	completed	2026-02-20 03:21:13.274553	2026-02-20 03:21:13.274556	31	\N	auto_confirm	\N	\N	t
11	4	2026-02-15	20:00:00	vomiting	sjdh jgfhb sdfmhsd	completed	2026-02-15 13:36:41.713534	2026-02-20 03:49:59.787665	8	\N	auto_confirm	\N	\N	t
12	4	2026-02-20	15:00:00	nm,	ghjbnm	completed	2026-02-17 12:36:32.073227	2026-02-20 15:14:39.415492	8	\N	auto_confirm	\N	\N	t
29	4	2026-02-20	16:00:00	fghjk	hgngfhbfdf	completed	2026-02-20 14:49:46.857115	2026-02-20 15:14:59.409082	8	85	doctor_approval	\N	\N	t
5	4	2026-02-28	12:00:00	xcvx	xcvcx \n[Governance Log 2026-02-20 02:40:13] - Nayana Admin (Admin) changed status from rejected to Approved.	completed	2026-02-14 05:01:05.921931	2026-02-20 15:15:28.135824	8	\N	auto_confirm	\N	\N	t
3	4	2026-02-27	09:00:00	cdv	fgfhh fifth	completed	2026-02-14 04:07:59.387741	2026-02-20 15:15:40.017403	8	\N	auto_confirm	\N	\N	t
30	4	2026-02-28	16:20:00	nob,b	jkhh	pending	2026-02-26 09:39:19.539173	2026-02-26 09:45:22.966636	8	1238	doctor_approval	\N	\N	f
\.


--
-- Data for Name: clinical_remarks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clinical_remarks (id, patient_id, doctor_id, content, created_at, updated_at) FROM stdin;
2	4	8	cbvn	2026-02-15 14:45:17.69399	2026-02-15 14:45:17.693996
3	4	8	bjnm,	2026-02-20 15:02:15.628785	2026-02-20 15:02:15.628795
\.


--
-- Data for Name: clinical_structures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clinical_structures (id, sector, specialty, is_active, created_at) FROM stdin;
1	North Sector	Neurologist	t	2026-02-20 02:24:09.889638
2	North Sector	Neurosurgeon	t	2026-02-20 02:24:09.889642
3	North Sector	Clinical Neurophysiologist	t	2026-02-20 02:24:09.889642
4	North Sector	Neuro-Oncologist	t	2026-02-20 02:24:09.889643
5	North Sector	Neuro-Ophthalmologist	t	2026-02-20 02:24:09.889643
6	North Sector	Neuroradiologist	t	2026-02-20 02:24:09.889644
7	North Sector	Pediatric Neurologist	t	2026-02-20 02:24:09.889644
8	North Sector	Neuropsychologist	t	2026-02-20 02:24:09.889644
9	North Sector	Cognitive Scientist	t	2026-02-20 02:24:09.889645
10	North Sector	Psychiatrist	t	2026-02-20 02:24:09.889645
11	South Sector	Cardiologist	t	2026-02-20 02:24:09.889646
12	South Sector	Pulmonologist	t	2026-02-20 02:24:09.889646
13	South Sector	Gastroenterologist	t	2026-02-20 02:24:09.889646
14	South Sector	Nephrologist	t	2026-02-20 02:24:09.889647
15	South Sector	Endocrinologist	t	2026-02-20 02:24:09.889647
16	South Sector	Hematologist	t	2026-02-20 02:24:09.889647
17	South Sector	Rheumatologist	t	2026-02-20 02:24:09.889648
18	South Sector	Infectious Disease Specialist	t	2026-02-20 02:24:09.889648
19	South Sector	Internal Medicine	t	2026-02-20 02:24:09.889649
20	South Sector	Urologist	t	2026-02-20 02:24:09.889649
21	East Sector	General Surgeon	t	2026-02-20 02:24:09.889649
22	East Sector	Orthopedic Surgeon	t	2026-02-20 02:24:09.88965
23	East Sector	Plastic Surgeon	t	2026-02-20 02:24:09.88965
24	East Sector	Anesthesiologist	t	2026-02-20 02:24:09.889651
25	East Sector	Otolaryngologist (ENT)	t	2026-02-20 02:24:09.889651
26	East Sector	Ophthalmologist	t	2026-02-20 02:24:09.889651
27	East Sector	Dermatologist	t	2026-02-20 02:24:09.889652
28	East Sector	Oncologist	t	2026-02-20 02:24:09.889652
29	East Sector	Medical Geneticist	t	2026-02-20 02:24:09.889652
30	East Sector	Pathologist	t	2026-02-20 02:24:09.889653
31	West Sector	Family Physician	t	2026-02-20 02:24:09.889653
32	West Sector	Pediatrician	t	2026-02-20 02:24:09.889654
33	West Sector	Obstetrician	t	2026-02-20 02:24:09.889654
34	West Sector	Gynecologist	t	2026-02-20 02:24:09.889655
35	West Sector	Emergency Physician	t	2026-02-20 02:24:09.889655
36	West Sector	Pain Management Specialist	t	2026-02-20 02:24:09.889655
37	West Sector	Physical Medicine & Rehab	t	2026-02-20 02:24:09.889656
38	West Sector	Preventive Medicine	t	2026-02-20 02:24:09.889656
39	West Sector	Clinical Researcher	t	2026-02-20 02:24:09.889657
40	West Sector	Radiologist	t	2026-02-20 02:24:09.889657
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversation_participants (id, conversation_id, user_id, role, joined_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, type, created_at, updated_at) FROM stdin;
1	direct	2026-02-14 12:27:00.127107	2026-02-14 17:57:00.13342
2	direct	2026-02-15 15:20:52.782227	2026-02-15 15:20:52.782232
3	direct	2026-02-15 15:20:52.804862	2026-02-15 15:20:52.804865
4	direct	2026-02-15 15:20:52.810899	2026-02-15 15:20:52.810901
5	direct	2026-02-15 15:20:52.818571	2026-02-15 15:20:52.818573
\.


--
-- Data for Name: doctor_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_audit_logs (id, doctor_id, actor_id, action_type, description, action_metadata, ip_address, user_agent, created_at) FROM stdin;
1	11	10	onboarding	Initial onboarding by Admin. Specialty: Neurologist	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-19 12:27:40.166464
2	11	10	license_verified	Medical license successfully verified by Senior Admin.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 12:28:24.108656
3	8	10	license_verified	Medical license successfully verified by Senior Admin.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 12:30:59.81503
7	8	10	license_revoked	Clinical credentials revoked by Senior Admin.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:06:55.148238
8	8	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:07:01.501621
11	11	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:29:22.723034
12	8	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:29:22.728298
13	11	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:29:29.51121
14	8	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:29:29.52037
15	8	10	license_verified	Medical license successfully verified.	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-19 16:29:45.390864
\.


--
-- Data for Name: doctor_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_availability (id, doctor_id, day_of_week, start_time, end_time) FROM stdin;
2	1	Tuesday	09:00:00	17:00:00
3	1	Wednesday	09:00:00	17:00:00
4	1	Thursday	09:00:00	17:00:00
9	1	Friday	09:00:00	05:00:00
11	1	Saturday	09:00:00	17:00:00
12	1	Monday	09:00:00	10:00:00
\.


--
-- Data for Name: doctor_blocked_dates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_blocked_dates (id, doctor_id, date, reason) FROM stdin;
\.


--
-- Data for Name: doctor_consultation_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_consultation_settings (id, doctor_user_id, consultation_fee, consultation_mode, cancellation_policy_hours, auto_cancel_unpaid_minutes, created_at) FROM stdin;
\.


--
-- Data for Name: doctor_expertise_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_expertise_tags (id, doctor_id, tag_name) FROM stdin;
51	1	Ben
52	1	hmm
53	1	bomb
54	1	vhbnm,
\.


--
-- Data for Name: doctor_notification_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_notification_settings (id, doctor_user_id, email_on_booking, sms_on_booking, in_app_notifications, reminder_before_minutes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: doctor_privacy_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_privacy_settings (id, doctor_user_id, show_profile_publicly, show_consultation_fee, allow_chat_before_booking, allow_reviews_publicly, created_at) FROM stdin;
\.


--
-- Data for Name: doctor_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_profiles (id, user_id, specialization, license_number, qualification, experience_years, department, phone, gender, dob, bio, hospital_name, consultation_fee, consultation_mode, profile_image, created_at, updated_at, sector) FROM stdin;
4	13	Neurosurgeon	\N	\N	\N	Neurosurgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:16:09.740827	2026-02-20 02:33:50.568386	West Sector
5	14	Neurologist	\N	Institutional Certification	5	Neurologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:20.006433	2026-02-20 02:20:20.006439	North Sector
6	15	Neurosurgeon	\N	Institutional Certification	5	Neurosurgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:20.256272	2026-02-20 02:20:20.256276	North Sector
7	16	Clinical Neurophysiologist	\N	Institutional Certification	5	Clinical Neurophysiologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:20.566222	2026-02-20 02:20:20.566226	North Sector
8	17	Neuro-Oncologist	\N	Institutional Certification	5	Neuro-Oncologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:20.810209	2026-02-20 02:20:20.810213	North Sector
9	18	Neuro-Ophthalmologist	\N	Institutional Certification	5	Neuro-Ophthalmologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:21.143774	2026-02-20 02:20:21.143791	North Sector
10	19	Neuroradiologist	\N	Institutional Certification	5	Neuroradiologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:21.417371	2026-02-20 02:20:21.417375	North Sector
11	20	Pediatric Neurologist	\N	Institutional Certification	5	Pediatric Neurologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:21.66987	2026-02-20 02:20:21.669876	North Sector
12	21	Neuropsychologist	\N	Institutional Certification	5	Neuropsychologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:21.911699	2026-02-20 02:20:21.911706	North Sector
13	22	Cognitive Scientist	\N	Institutional Certification	5	Cognitive Scientist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:22.156027	2026-02-20 02:20:22.15603	North Sector
14	23	Psychiatrist	\N	Institutional Certification	5	Psychiatrist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:22.391902	2026-02-20 02:20:22.391905	North Sector
15	24	Cardiologist	\N	Institutional Certification	5	Cardiologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:22.63504	2026-02-20 02:20:22.635043	South Sector
16	25	Pulmonologist	\N	Institutional Certification	5	Pulmonologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:22.889051	2026-02-20 02:20:22.889055	South Sector
17	26	Gastroenterologist	\N	Institutional Certification	5	Gastroenterologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:23.130708	2026-02-20 02:20:23.130711	South Sector
18	27	Nephrologist	\N	Institutional Certification	5	Nephrologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:23.373609	2026-02-20 02:20:23.373613	South Sector
19	28	Endocrinologist	\N	Institutional Certification	5	Endocrinologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:23.61298	2026-02-20 02:20:23.612983	South Sector
20	29	Hematologist	\N	Institutional Certification	5	Hematologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:23.852547	2026-02-20 02:20:23.852551	South Sector
21	30	Rheumatologist	\N	Institutional Certification	5	Rheumatologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:24.094745	2026-02-20 02:20:24.094749	South Sector
22	31	Infectious Disease Specialist	\N	Institutional Certification	5	Infectious Disease Specialist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:24.349187	2026-02-20 02:20:24.349194	South Sector
23	32	Internal Medicine	\N	Institutional Certification	5	Internal Medicine	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:24.587049	2026-02-20 02:20:24.587052	South Sector
24	33	Urologist	\N	Institutional Certification	5	Urologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:24.872547	2026-02-20 02:20:24.872551	South Sector
25	34	General Surgeon	\N	Institutional Certification	5	General Surgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:25.117096	2026-02-20 02:20:25.117099	East Sector
26	35	Orthopedic Surgeon	\N	Institutional Certification	5	Orthopedic Surgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:25.358556	2026-02-20 02:20:25.358563	East Sector
27	36	Plastic Surgeon	\N	Institutional Certification	5	Plastic Surgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:25.594873	2026-02-20 02:20:25.594876	East Sector
28	37	Anesthesiologist	\N	Institutional Certification	5	Anesthesiologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:25.833238	2026-02-20 02:20:25.833242	East Sector
29	38	Otolaryngologist (ENT)	\N	Institutional Certification	5	Otolaryngologist (ENT)	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:26.070885	2026-02-20 02:20:26.070889	East Sector
30	39	Ophthalmologist	\N	Institutional Certification	5	Ophthalmologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:26.38916	2026-02-20 02:20:26.389172	East Sector
31	40	Dermatologist	\N	Institutional Certification	5	Dermatologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:26.636353	2026-02-20 02:20:26.636356	East Sector
32	41	Oncologist	\N	Institutional Certification	5	Oncologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:26.872258	2026-02-20 02:20:26.872261	East Sector
33	42	Medical Geneticist	\N	Institutional Certification	5	Medical Geneticist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:27.10964	2026-02-20 02:20:27.109642	East Sector
34	43	Pathologist	\N	Institutional Certification	5	Pathologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:27.346564	2026-02-20 02:20:27.346568	East Sector
35	44	Family Physician	\N	Institutional Certification	5	Family Physician	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:27.58398	2026-02-20 02:20:27.583983	West Sector
36	45	Pediatrician	\N	Institutional Certification	5	Pediatrician	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:27.821004	2026-02-20 02:20:27.821007	West Sector
37	46	Obstetrician	\N	Institutional Certification	5	Obstetrician	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:28.058177	2026-02-20 02:20:28.058181	West Sector
38	47	Gynecologist	\N	Institutional Certification	5	Gynecologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:28.297296	2026-02-20 02:20:28.297299	West Sector
39	48	Emergency Physician	\N	Institutional Certification	5	Emergency Physician	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:28.534558	2026-02-20 02:20:28.534562	West Sector
40	49	Pain Management Specialist	\N	Institutional Certification	5	Pain Management Specialist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:28.772652	2026-02-20 02:20:28.772655	West Sector
41	50	Physical Medicine & Rehab	\N	Institutional Certification	5	Physical Medicine & Rehab	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:29.009459	2026-02-20 02:20:29.009463	West Sector
42	51	Preventive Medicine	\N	Institutional Certification	5	Preventive Medicine	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:29.245703	2026-02-20 02:20:29.245709	West Sector
43	52	Clinical Researcher	\N	Institutional Certification	5	Clinical Researcher	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:29.48265	2026-02-20 02:20:29.482654	West Sector
44	53	Radiologist	\N	Institutional Certification	5	Radiologist	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:20:29.720575	2026-02-20 02:20:29.720578	West Sector
2	11	Neurologist	NJ-12345-H	\N	\N	Cardiologist	\N	\N	\N	\N	\N	500	\N	\N	2026-02-19 12:27:40.160422	2026-02-20 02:33:50.565598	South Sector
3	12	General Surgeon	\N	\N	\N	General Surgeon	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 02:16:09.735268	2026-02-20 02:33:50.567283	East Sector
1	8	Neurologist	NEURO-12345	MBBS, MD (Neurology)	10	Neurologist	+1234567890	Female	1985-05-20	Expert in neurological disorders with over a decade of experience.\n\n\n\n\nbjmmn	City Neuro Hospital	150	Both	/api/doctor/profile/uploads/doctor_8_1772098324_WhatsApp_Image_2026-02-22_at_15.46.33.jpeg	2026-02-15 05:24:12.670091	2026-02-26 09:32:04.731786	North Sector
\.


--
-- Data for Name: doctor_schedule_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_schedule_settings (id, doctor_user_id, slot_duration_minutes, buffer_minutes, approval_mode, timezone, created_at, updated_at, accepting_new_bookings) FROM stdin;
1	8	30	10	doctor_approval	Asia/Kolkata	2026-02-19 05:10:51.520055+05:30	2026-02-19 05:10:51.520057+05:30	t
2	11	30	10	doctor_approval	Asia/Kolkata	2026-02-19 12:52:02.356624+05:30	2026-02-19 12:52:02.356627+05:30	t
3	24	30	10	doctor_approval	Asia/Kolkata	2026-02-20 05:49:15.604142+05:30	2026-02-20 05:49:15.604145+05:30	t
4	12	30	10	doctor_approval	Asia/Kolkata	2026-02-20 06:43:09.473398+05:30	2026-02-20 06:43:09.473403+05:30	t
5	53	30	10	doctor_approval	Asia/Kolkata	2026-02-27 13:58:45.321099+05:30	2026-02-27 13:58:45.321106+05:30	t
\.


--
-- Data for Name: doctor_slot_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_slot_overrides (id, doctor_user_id, override_date, scope, start_time_utc, end_time_utc, reason, created_by, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: doctor_status_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctor_status_logs (id, doctor_id, admin_id, previous_status, new_status, reason, created_at) FROM stdin;
1	11	10	active	suspended	xcvxcv	2026-02-19 12:32:53.12079
2	11	10	suspended	active	bnvmn	2026-02-19 15:41:06.464413
5	11	10	active	suspended	mb	2026-02-19 16:29:16.691958
6	8	10	active	suspended	mb	2026-02-19 16:29:16.711077
7	11	10	suspended	active	ngv	2026-02-19 16:29:39.997746
8	8	10	suspended	suspended	m	2026-02-19 16:34:16.505455
9	11	10	active	suspended	m	2026-02-19 16:34:16.519946
10	8	10	suspended	active	Bulk restoration by Senior Admin	2026-02-19 16:36:36.551433
11	11	10	suspended	active	Bulk restoration by Senior Admin	2026-02-19 16:36:36.559355
\.


--
-- Data for Name: emergency_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.emergency_contacts (id, patient_id, contact_name, relationship, phone, alternate_phone, email, is_primary, created_at, updated_at) FROM stdin;
46	2	sdfdf	fgdf	13245y	23545	sdfdnm	f	2026-02-26 14:06:36.927397	2026-02-26 14:06:36.927403
47	2	erer	sdfsd	2435465	43545	sfdsf	t	2026-02-26 14:06:36.927403	2026-02-26 14:06:36.927403
\.


--
-- Data for Name: in_app_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.in_app_notifications (id, user_id, type, title, message, payload, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: medical_record_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_record_audit_logs (id, medical_record_id, action, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_records (id, patient_id, title, category, file_path, doctor_name, appointment_id, description, record_date, verified_by_doctor, created_at, updated_at, file_type, file_size_bytes, hospital_name, notes, status, uploaded_by) FROM stdin;
1	4	van	Scan	uploads/medical_records/B12_-_TalentLink_A_professional_matchmaking_platform_that_connects_freelancers_with_clients_manages_project_proposals_contracts_and_secure_communication_5.pdf	bn 	\N	\N	2026-02-14	f	2026-02-14 05:50:57.982042	2026-02-14 05:50:57.982047	\N	\N	\N	\N	active	\N
3	4	hvnbm	vaccination	uploads/4/medical_records/4_1772253534466_enterprise_report_7d_2026-02-20.pdf	Dr. Nayana	\N	\N	2026-02-28	f	2026-02-28 10:08:54.474232	2026-02-28 10:08:54.474236	pdf	1346992	City Neuro Hospital	mnbnm	active	8
4	4	cxvcmv	lab	https://res.cloudinary.com/dqzb7b4zw/image/upload/v1772276633/neuronest/medical_records/neuronest/medical_records/4_1772256832078.pdf	Dr. Nayana	\N	\N	2026-02-28	f	2026-02-28 11:03:54.265056	2026-02-28 11:03:54.26506	pdf	71652	City Neuro Hospital	cvbcvb	active	8
\.


--
-- Data for Name: message_reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_reactions (id, message_id, user_id, reaction_type, created_at) FROM stdin;
\.


--
-- Data for Name: message_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_status (id, message_id, user_id, status, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, content, type, is_read, is_deleted, created_at, updated_at) FROM stdin;
2	1	4	Hi Dr. House. I'm feeling a bit better, thanks.	text	t	f	2026-02-14 12:27:00.13936	2026-02-14 12:27:00.139361
4	1	4	Yes, twice a day as prescribed.	text	t	f	2026-02-14 12:27:00.139362	2026-02-14 12:27:00.139363
6	1	4	nb 	text	f	f	2026-02-14 12:27:28.262479	2026-02-14 12:27:28.262486
7	1	4	/api/chat/uploads/1771072301_jpg	image	f	f	2026-02-14 12:31:41.598192	2026-02-14 12:31:41.598195
8	1	4	/api/chat/uploads/1771072766_van.pdf	file	f	f	2026-02-14 12:39:26.962338	2026-02-14 12:39:26.962341
9	1	4	bam	text	f	f	2026-02-14 12:48:15.64125	2026-02-14 12:48:15.641257
10	1	4	gfhfghfg	text	f	f	2026-02-14 14:15:07.938597	2026-02-14 14:15:07.938606
14	5	4	Hello Dr. Nayana, checking in for my assessment.	text	t	f	2026-02-15 15:20:52.82263	2026-02-15 15:30:39.641183
13	4	3	Hello Dr. Nayana, checking in for my assessment.	text	t	f	2026-02-15 15:20:52.814094	2026-02-15 15:31:29.010563
18	4	8	Kindly upload your latest lab/blood test reports in the 'Medical Records' section.	text	f	f	2026-02-15 15:31:35.647103	2026-02-15 15:31:35.647127
17	5	4	ok	text	t	f	2026-02-15 15:31:00.941223	2026-02-15 15:33:35.348193
19	4	8	Please monitor your blood pressure and heart rate for the next 3 days and share the logs.	text	f	f	2026-02-15 15:55:20.189443	2026-02-15 15:55:20.189451
12	3	2	Hello Dr. Nayana, checking in for my assessment.	text	t	f	2026-02-15 15:20:52.807914	2026-02-15 16:00:49.095852
11	2	1	Hello Dr. Nayana, checking in for my assessment.	text	t	f	2026-02-15 15:20:52.797997	2026-02-15 16:00:51.477534
20	4	8	I would like to schedule a quick video consultation. Are you available for a call now?	text	f	f	2026-02-16 14:22:36.246504	2026-02-16 14:22:36.246522
21	5	4	xcvbn	text	t	f	2026-02-17 03:59:17.935977	2026-02-17 08:05:36.14038
22	5	4	dog	text	t	f	2026-02-17 04:00:07.375688	2026-02-17 08:05:36.14038
15	5	8	Please book a follow-up appointment through your dashboard for further evaluation.	text	t	f	2026-02-15 15:30:43.069136	2026-02-17 12:42:39.67584
16	5	8	I have updated your prescription. Please follow the new dosage instructions carefully.	text	t	f	2026-02-15 15:30:45.762446	2026-02-17 12:42:39.67584
24	1	4	hey	text	f	f	2026-02-17 12:47:02.900697	2026-02-17 12:47:02.900707
25	1	4	Please call me back when free.	text	f	f	2026-02-17 12:49:31.187962	2026-02-17 12:49:31.187999
23	5	4	hey	text	t	f	2026-02-17 12:37:49.870615	2026-02-17 12:58:55.69479
26	5	4	I would like to book an appointment.	text	t	f	2026-02-17 12:53:34.884975	2026-02-17 12:58:55.69479
27	5	4	Please call me back when free.	text	t	f	2026-02-17 13:48:52.804349	2026-02-17 14:46:49.216934
28	5	4	hgvv	text	t	f	2026-02-17 13:59:49.425802	2026-02-17 14:46:49.216934
29	5	4	cxvx cvbcb	text	t	f	2026-02-17 14:04:50.51529	2026-02-17 14:46:49.216934
30	5	4	ghvbnmdfghjknm	text	t	f	2026-02-17 14:04:54.536095	2026-02-17 14:46:49.216934
31	5	8	jhkgg kjhk,	text	t	f	2026-02-17 14:46:56.435545	2026-02-17 15:26:40.916775
32	1	4	I am uploading my latest report.	text	f	f	2026-02-17 15:42:30.237065	2026-02-17 15:42:30.237093
33	1	4	gif gnfn jhfghnf nfh	text	f	f	2026-02-17 15:47:52.016729	2026-02-17 15:47:52.016739
34	1	4	dmv hn mgh	text	f	f	2026-02-17 15:49:05.79476	2026-02-17 15:49:05.794818
35	1	4	ebb jh jhjgh	text	f	f	2026-02-17 15:49:28.10992	2026-02-17 15:49:28.10996
36	1	4	bad ged gbdgfdc 	text	f	f	2026-02-17 15:53:34.961356	2026-02-17 15:53:34.961369
37	1	4	cvvcghgfgfgdfghfh	text	f	f	2026-02-17 15:53:46.892924	2026-02-17 15:53:46.892929
38	5	8	msg ghgmb mjgvm	text	t	f	2026-02-17 16:22:56.66647	2026-02-18 15:41:52.549218
39	5	4	I would like to book an appointment.	text	t	f	2026-02-18 16:14:46.356375	2026-02-18 16:26:35.888209
40	5	4	fghfgh gfhgfg fghgfh	text	t	f	2026-02-18 16:14:56.668203	2026-02-18 16:26:35.888209
41	5	4	dfgdfgdfgdgfdgffhfhfdfgdfxg	text	t	f	2026-02-18 16:15:01.587014	2026-02-18 16:26:35.888209
42	5	4	vbnm hgvnbnm chgcvjbnkm	text	t	f	2026-02-18 16:17:05.061441	2026-02-18 16:26:35.888209
43	5	4	gfdhgfvgmnbvghngfjhnmgfvhgfhvj	text	t	f	2026-02-18 16:17:09.386896	2026-02-18 16:26:35.888209
44	5	4	hgvjbmgbkjmhb khi,gbkhj,vb hmm,bnk j	text	t	f	2026-02-18 16:17:45.347766	2026-02-18 16:26:35.888209
45	5	4	jhbdfdjkghfjdgdjkgdgkdfgkdhgdfsjgjfhdsfkdg	text	t	f	2026-02-18 16:17:55.993565	2026-02-18 16:26:35.888209
46	5	4	dvcfvdfv	text	t	f	2026-02-18 16:19:23.602321	2026-02-18 16:26:35.888209
47	5	4	Please call me back when free.	text	t	f	2026-02-18 16:21:42.601974	2026-02-18 16:26:35.888209
48	5	8	fdvdfvdfbfbfgnghnghnghnghnghnghngnghnghnghnghng	text	t	f	2026-02-18 16:26:44.998592	2026-02-19 07:45:21.226901
49	5	8	gjjghn hngbmjh jhjk,jkm kjh,k, jkh	text	t	f	2026-02-19 03:41:29.650409	2026-02-19 07:45:21.226901
50	5	8	hjgmhmb	text	t	f	2026-02-19 03:43:48.926982	2026-02-19 07:45:21.226901
51	5	4	I have a question about my medication.	text	t	f	2026-02-20 05:52:22.261088	2026-02-20 08:20:13.600483
52	5	8	/api/chat/uploads/1771581238_2019_Dec._CS407-C_-_ktu_qbank.pdf	text	t	f	2026-02-20 09:53:58.030818	2026-02-22 02:00:25.050371
53	5	8	dfgdf	text	t	f	2026-02-27 17:53:52.536697	2026-02-27 18:08:19.032896
54	5	8	I would like to book an appointment.	text	t	f	2026-02-27 17:54:24.468324	2026-02-27 18:08:19.032896
55	5	8	ok	text	t	f	2026-02-27 17:54:30.146337	2026-02-27 18:08:19.032896
56	5	8	Please call me back when free.	text	t	f	2026-02-27 18:01:37.422773	2026-02-27 18:08:19.032896
57	5	4	I have a question about my medication.	text	t	f	2026-02-27 18:08:26.191816	2026-02-27 18:08:30.145023
59	5	4	fdghgfh	text	t	f	2026-02-27 18:08:35.518895	2026-02-27 18:08:42.086569
61	5	4	gfngfhjgn	text	t	f	2026-02-27 18:08:49.940469	2026-02-27 18:08:58.463449
62	5	4	I am uploading my latest report.	text	t	f	2026-02-27 18:08:53.772759	2026-02-27 18:08:58.463449
58	5	8	gfdfh	text	t	f	2026-02-27 18:08:31.835675	2026-02-27 18:09:04.261258
60	5	8	fghgfh	text	t	f	2026-02-27 18:08:43.363029	2026-02-27 18:09:04.261258
63	5	4	abc is requesting a secure video consultation.	call_request	t	f	2026-02-27 18:09:08.789578	2026-02-27 18:12:38.860818
64	5	4	abc is requesting a secure video consultation.	call_request	t	f	2026-02-27 18:12:27.758828	2026-02-27 18:12:38.860818
65	5	4	abc is requesting a secure video consultation.	call_request	t	f	2026-02-27 18:12:33.812082	2026-02-27 18:12:38.860818
66	5	8	Doctor is initiating a secure video consultation.	call_request	f	f	2026-02-27 18:51:20.538853	2026-02-27 18:51:20.53886
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modules (id, module_key, display_name, is_enabled, roles_allowed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_preferences (id, user_id, email_appointments, email_prescriptions, email_messages, email_announcements, email_feedback, sms_appointments, sms_prescriptions, inapp_appointments, inapp_prescriptions, inapp_messages, inapp_announcements, allow_doctor_followup, allow_promotions, allow_anonymous_feedback, share_history_with_doctors, allow_analytics, created_at, updated_at, sms_messages, sms_announcements) FROM stdin;
1	1	t	t	t	t	t	f	f	t	t	t	t	t	f	t	t	t	2026-02-20 12:20:43.350519	2026-02-20 12:20:43.350519	f	f
34	3	t	t	t	t	t	f	f	t	t	t	t	t	f	t	t	t	2026-02-20 13:42:21.76042	2026-02-20 13:42:21.76042	f	f
3	4	t	t	t	t	t	f	f	t	t	t	t	t	f	t	t	t	2026-02-20 12:26:57.921364	2026-02-20 08:20:56.532636	f	f
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.participants (id, conversation_id, user_id, joined_at) FROM stdin;
1	1	4	2026-02-14 12:27:00.129372
3	2	8	2026-02-15 15:20:52.788572
4	2	1	2026-02-15 15:20:52.788576
5	3	8	2026-02-15 15:20:52.805404
6	3	2	2026-02-15 15:20:52.805405
7	4	8	2026-02-15 15:20:52.811414
8	4	3	2026-02-15 15:20:52.811415
9	5	8	2026-02-15 15:20:52.819092
10	5	4	2026-02-15 15:20:52.819093
\.


--
-- Data for Name: patient_allergies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_allergies (id, patient_id, allergy_name, reaction, severity, diagnosed_date, status, created_at, updated_at, created_by_user_id, created_by_role) FROM stdin;
1	4	mccv	\N	severe	\N	inactive	2026-02-26 14:39:22.967055	2026-02-26 14:49:57.04979	\N	patient
4	1	Penicillin	Anaphylaxis	severe	2023-06-02	active	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	\N	patient
5	1	Dust	Sneezing	moderate	2024-03-28	active	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	\N	patient
6	4	mom	Rash	severe	2026-02-11	active	2026-02-26 14:56:44.105591	2026-02-26 14:56:44.105593	\N	patient
8	4	k,bn	Nausea	severe	2026-02-18	active	2026-02-26 14:59:49.218892	2026-02-26 14:59:49.218896	\N	patient
9	4	xcvxcv	Rash	moderate	2026-02-04	active	2026-02-26 17:38:21.974955	2026-02-26 17:38:21.974959	4	patient
7	4	mnv.kh	Swelling	moderate	2026-02-03	inactive	2026-02-26 14:56:55.86527	2026-02-26 17:40:00.67775	\N	patient
10	4	n,bm	Rash	severe	2026-02-18	active	2026-02-28 09:57:17.887367	2026-02-28 09:57:17.88737	8	doctor
\.


--
-- Data for Name: patient_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_audit_logs (id, patient_id, actor_id, action_type, description, audit_metadata, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: patient_conditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_conditions (id, patient_id, condition_name, diagnosed_date, status, last_reviewed, created_at, updated_at, under_treatment, created_by_user_id, created_by_role) FROM stdin;
3	1	Diabetes	2022-11-14	active	2026-02-06	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	t	\N	patient
4	1	Hypertension	2023-09-10	active	2026-02-11	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	t	\N	patient
5	4	vdfgefd	2026-02-11	active	2026-02-12	2026-02-26 14:57:08.404334	2026-02-26 14:57:08.404341	t	\N	patient
6	4	,nb	2025-09-03	active	2026-02-27	2026-02-28 09:34:57.695686	2026-02-28 09:34:57.695689	t	8	doctor
\.


--
-- Data for Name: patient_flags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_flags (id, patient_id, reporter_id, category, reason, severity, is_resolved, resolved_at, resolved_by, resolution_note, created_at) FROM stdin;
\.


--
-- Data for Name: patient_medications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_medications (id, patient_id, drug_name, dosage, frequency, start_date, end_date, prescribed_by, created_at, updated_at, status, created_by_user_id, created_by_role, medication_origin, source_hospital_name) FROM stdin;
3	1	Metformin	500 mg	Twice daily	2025-02-26	\N	Dr. Nayana	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	active	\N	patient	past_external	\N
4	1	Amlodipine	5 mg	Once daily	2025-08-10	\N	Dr. Nayana	2026-02-26 20:26:06.554885	2026-02-26 20:26:06.554885	active	\N	patient	past_external	\N
5	4	dfbfd	dfvf	fdbvdf	2026-02-05	2026-02-05	dfbvdf	2026-02-26 14:57:18.569705	2026-02-26 17:27:29.306445	inactive	\N	patient	past_external	\N
6	4	kjffgdf	400mg	2	2026-02-04	2026-02-19	dfdsf	2026-02-26 17:27:44.465848	2026-02-26 17:27:44.465852	active	4	patient	past_external	\N
7	4	xcvxc	50 g	1-1-1-0	2025-06-03	2025-10-24	Dr xcd	2026-02-27 15:40:42.597742	2026-02-27 15:40:42.597746	active	4	patient	past_external	xgdg
8	4	n,b,n,b	700 mg	1-1-0-1	2026-02-01	2026-03-28	Dr. Nayana	2026-02-28 09:41:00.095597	2026-02-28 09:41:00.095629	active	8	doctor	current_doctor	\N
\.


--
-- Data for Name: patient_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_profiles (id, user_id, full_name, phone, date_of_birth, gender, blood_group, height_cm, weight_kg, address, city, state, country, pincode, allergies, chronic_conditions, profile_image, created_at, updated_at) FROM stdin;
3	2	Nayana	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-14 11:32:18.755627	2026-02-14 11:32:18.75563
4	9	Nayana Patient	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 14:30:30.879161	2026-02-17 14:30:30.879165
32	54	Admin User	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-21 03:18:06.558574	2026-02-21 03:18:06.558578
5	3	Nezrin		\N			\N	\N								/uploads/user_3_1772059958.jpg	2026-02-20 08:12:18.475769	2026-02-26 04:22:38.041583
2	4	abc	1234567890	2026-02-06	Female	O-	126	23	kollam	Kāsaragod	Kerala	India	671121	Penicillin	Diabetes, Asthma	/uploads/user_4_1772093809.jpg	2026-02-13 06:58:01.160293	2026-02-26 14:06:36.899793
\.


--
-- Data for Name: patient_status_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_status_logs (id, patient_id, admin_id, previous_status, new_status, reason, created_at) FROM stdin;
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions, duration_days, created_at, updated_at) FROM stdin;
1	1	fcvb	500	1-0-1	5	vgbn	\N	2026-02-19 14:51:50.512735	2026-02-19 14:54:39.309205
2	2	vbnm	101 mg	1-0-1-1	5 days	After Food, With Water	\N	2026-02-19 14:51:50.512735	2026-02-19 14:54:39.309205
3	3	vbnm	101 mg	1-0-1-1	5 days	After Food, With Water	\N	2026-02-19 14:51:50.512735	2026-02-19 14:54:39.309205
4	4	vbnm	200 mg	1-1-0-1	3 days	After Food	\N	2026-02-20 20:29:18.17509	2026-02-20 20:29:18.17509
5	5	nmv	700 mg	1-1-1-1	10 days	After Food, Before Food, With Water, Bedtime	\N	2026-02-27 16:32:13.286894	2026-02-27 16:32:13.286894
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescriptions (id, doctor_id, patient_id, appointment_id, diagnosis, notes, status, valid_until, created_at, updated_at, issued_date, is_deleted) FROM stdin;
2	8	4	5	vb n	dfxcgvhbnm	draft	2026-02-28	2026-02-17 03:37:48.110322	2026-02-17 03:37:48.110328	2026-02-19	f
1	8	4	\N	vcbn	cvbnm	active	2026-02-08	2026-02-17 03:18:27.418961	2026-02-17 03:18:27.418968	2026-02-19	f
3	8	4	5	vb n	dfxcgvhbnm	active	2026-02-28	2026-02-17 03:37:52.531424	2026-02-17 03:37:52.531428	2026-02-19	f
4	8	4	29	vjbhnkm	bam	active	2026-02-23	2026-02-20 14:59:18.174789	2026-02-20 14:59:18.174794	2026-02-20	f
5	8	4	5	qwerty	sd ds sd ds	active	2026-02-28	2026-02-27 11:02:13.286549	2026-02-27 11:02:13.286554	2026-02-27	f
\.


--
-- Data for Name: record_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.record_tags (id, record_id, tag_name, created_at) FROM stdin;
1	3	bam	2026-02-28 10:08:54.482849
\.


--
-- Data for Name: review_escalations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_escalations (id, review_id, escalated_by, reason, status, created_at) FROM stdin;
2	17	4	bm	open	2026-02-20 03:49:59.798549
3	15	1		open	2026-02-20 10:13:28.688475
4	20	4	zxcvxzvxzvxzv	open	2026-02-20 15:15:28.141227
\.


--
-- Data for Name: review_moderation_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_moderation_logs (id, review_id, action, performed_by, note, created_at) FROM stdin;
2	17	flag	1		2026-02-20 10:12:32.162637
3	15	hide	1		2026-02-20 10:13:19.543062
4	15	approve	1		2026-02-20 10:13:23.717137
5	15	escalate	1		2026-02-20 10:13:28.691402
6	15	approve	1		2026-02-20 10:14:21.916094
\.


--
-- Data for Name: review_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_tags (id, review_id, tag) FROM stdin;
2	17	Good Communication
3	17	Rushed Consultation
4	18	Good Communication
5	18	Explained Clearly
6	18	Poor Explanation
7	19	Good Communication
8	19	Explained Clearly
9	19	Friendly & Caring
10	19	Professional
11	19	Thorough Examination
12	19	On Time
13	20	Rushed Consultation
14	20	Poor Explanation
15	20	Unprofessional
16	20	Dismissed Concerns
17	20	Prescription Issue
18	20	Long Waiting Time
19	21	Good Communication
20	21	Explained Clearly
21	21	Friendly & Caring
22	21	Professional
23	21	Thorough Examination
24	21	On Time
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, appointment_id, patient_id, doctor_id, rating, review_text, sentiment, is_hidden, is_flagged, created_at, updated_at) FROM stdin;
2	14	9	49	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.201906	2026-02-20 03:21:13.20191
3	15	4	32	2	Wait time was too long.	negative	f	t	2026-02-20 03:21:13.208848	2026-02-20 03:21:13.20885
4	16	4	20	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.214618	2026-02-20 03:21:13.214621
5	17	2	37	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.219204	2026-02-20 03:21:13.219206
6	18	4	36	3	Standard visit, nothing special.	neutral	f	f	2026-02-20 03:21:13.224974	2026-02-20 03:21:13.224976
7	19	9	27	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.23118	2026-02-20 03:21:13.231182
8	20	3	26	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.236697	2026-02-20 03:21:13.236698
9	21	4	19	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.242173	2026-02-20 03:21:13.242175
10	22	3	29	4	Very good doctor, answered all questions.	positive	f	f	2026-02-20 03:21:13.247273	2026-02-20 03:21:13.247275
11	23	9	19	4	Very good doctor, answered all questions.	positive	f	f	2026-02-20 03:21:13.252691	2026-02-20 03:21:13.252692
12	24	2	16	4	Very good doctor, answered all questions.	positive	f	f	2026-02-20 03:21:13.25787	2026-02-20 03:21:13.257872
13	25	3	20	5	Exceptional care! Dr. was brilliant.	positive	f	f	2026-02-20 03:21:13.262746	2026-02-20 03:21:13.262747
16	28	2	31	4	Very good doctor, answered all questions.	positive	f	f	2026-02-20 03:21:13.277401	2026-02-20 03:21:13.277404
17	11	4	8	5		positive	f	t	2026-02-20 03:49:59.792962	2026-02-20 03:49:59.792966
14	26	4	15	1	Very good doctor, answered all questions.	negative	f	f	2026-02-20 03:21:13.267141	2026-02-20 03:53:37.300574
15	27	3	51	1	The doctor was extremely late and very dismissive.	negative	f	f	2026-02-20 03:21:13.271855	2026-02-20 10:14:21.915347
18	12	4	8	5	n m	positive	f	f	2026-02-20 15:14:39.418475	2026-02-20 15:14:39.41848
19	29	4	8	5	xxc,zxnczx	positive	f	f	2026-02-20 15:14:59.41012	2026-02-20 15:14:59.410123
20	5	4	8	5	cxxvxvxcvxcvxvxzvzxv	positive	f	t	2026-02-20 15:15:28.137085	2026-02-20 15:15:28.137091
21	3	4	8	5	xcvxxcvxc	positive	f	f	2026-02-20 15:15:40.018279	2026-02-20 15:15:40.018347
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
4	patient
5	super_admin
6	admin
7	doctor
\.


--
-- Data for Name: security_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_activity (id, user_id, event_type, description, ip_address, user_agent, created_at) FROM stdin;
1	4	login_success	New login from Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:05:39.231951
2	4	password_change	Password changed successfully	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:08:04.019167
3	4	login_success	New login from Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:08:14.155095
4	3	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:12:16.198923
5	1	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:12:55.773336
6	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:14:06.534333
7	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:19:58.672152
8	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:20:30.339716
9	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:21:02.861721
10	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 08:31:50.863246
11	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:29:33.976833
12	4	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:41:57.621502
13	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:44:23.840902
14	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:44:58.828444
15	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:51:50.667754
16	10	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:52:01.102514
17	10	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:52:04.621922
18	10	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:52:09.859334
19	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:52:25.27113
20	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 09:53:14.640244
21	10	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:03:08.394372
22	10	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:03:55.252511
23	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:05:42.976331
24	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:09:44.057344
25	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:11:13.434504
26	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:15:41.088167
27	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:16:23.701251
28	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 10:29:40.55704
29	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 13:41:16.371503
30	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 13:50:19.706767
31	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:48:06.22534
32	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:50:27.643624
33	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:50:55.586666
34	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:55:36.091516
35	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:57:31.383846
36	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 14:58:07.793552
37	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:01:19.763373
38	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:01:51.204293
39	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:03:10.852019
40	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:04:21.375771
41	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:11:22.730732
42	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:11:40.237683
43	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:14:01.018406
44	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:15:59.261813
45	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:16:23.573114
46	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 15:17:09.656047
47	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 16:44:38.92067
48	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 16:46:03.479364
49	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 16:49:27.999309
50	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 17:09:04.386115
51	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-20 17:10:21.041727
52	54	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-21 03:19:08.717109
53	54	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-21 03:23:17.573083
54	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 03:52:59.943749
55	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 04:15:41.586998
56	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 04:15:51.360813
57	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 04:21:22.850885
58	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 04:22:53.372603
59	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 04:23:18.656905
60	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 04:35:19.618586
61	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 04:55:20.628555
62	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 05:06:06.569977
63	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 08:05:41.147627
64	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 08:38:05.414883
65	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 08:56:54.87614
66	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 08:58:13.709414
67	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 09:13:14.041493
68	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 09:44:24.824736
69	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 09:44:56.584296
70	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 09:49:05.234582
71	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 09:57:04.765938
72	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 09:59:09.721317
73	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 10:05:29.733418
74	10	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-21 10:58:20.492893
75	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-21 13:01:02.528761
76	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 01:59:21.652011
77	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 01:59:48.725299
78	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 02:00:07.103999
79	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 04:15:13.244463
80	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 10:35:46.741631
81	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-22 12:09:34.331377
82	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 11:05:02.799688
83	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 12:38:12.40444
84	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 14:15:05.047709
85	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 14:38:34.504068
86	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 15:14:34.276614
87	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 15:58:50.305838
88	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 15:58:56.802833
89	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-24 16:03:23.064159
90	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 13:39:31.618262
123	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 13:41:26.507944
124	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 13:41:41.784604
125	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 13:41:48.9367
126	3	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 13:59:30.957224
127	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:38:01.432207
128	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:46:15.441556
129	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:47:44.443104
130	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:49:32.317706
131	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:50:18.950354
132	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:50:36.395618
133	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:51:55.006342
134	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-25 14:53:31.812813
135	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:07:27.60987
136	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:08:50.532599
137	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:10:24.599725
138	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:19:33.179645
139	3	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:21:35.634709
140	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:34:39.961528
141	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:35:17.05443
142	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:37:04.651757
143	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:40:20.296218
144	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 04:44:09.241971
145	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:39:38.903463
146	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:44:05.827592
147	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:45:44.852146
148	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:45:55.280432
149	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:47:17.047291
150	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 05:47:31.187209
151	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 09:31:20.757106
152	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 09:31:40.073939
153	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 09:34:42.980856
154	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 10:59:26.669502
155	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 13:41:01.53128
156	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 13:41:12.405057
157	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 13:41:48.670711
158	10	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 13:42:19.847446
159	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 13:43:01.222071
160	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 14:29:43.260563
161	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 17:24:22.230808
162	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-26 17:42:57.524421
163	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 10:42:22.572254
164	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 10:59:12.597667
165	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 11:01:17.903581
166	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 11:02:34.189633
167	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 12:42:51.427161
168	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 14:18:26.418374
169	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 14:19:19.119755
170	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 14:39:24.01092
171	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 14:59:32.994267
172	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 15:42:24.042503
173	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 16:04:11.509142
174	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 16:24:30.334445
175	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 16:44:36.94532
176	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:04:52.51152
177	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:46:53.642093
178	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:52:59.129598
179	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:53:08.150036
180	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:53:41.464794
181	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 17:53:45.794146
182	4	login_failed	Failed login attempt detected	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-27 18:07:45.733511
183	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-27 18:08:04.682201
184	4	login_success	New login from Chrome on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	2026-02-27 18:08:10.853253
185	4	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 04:09:33.761677
186	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 04:14:19.592015
187	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 05:44:50.812807
188	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 06:58:12.337412
189	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 08:10:58.955687
190	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 08:55:24.78119
191	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 10:47:02.67175
192	8	login_success	New login from Safari on MacOS	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	2026-02-28 10:59:05.989714
\.


--
-- Data for Name: slot_event_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.slot_event_logs (id, event_type, doctor_user_id, slot_id, appointment_id, actor_user_id, source, reason, correlation_id, previous_status, new_status, metadata_json, created_at) FROM stdin;
1	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-26", "end_date": "2026-03-11", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-26 14:40:39.290018+05:30
2	slot_status_changed	8	1238	\N	\N	slot_engine	Hold expired	\N	held	available	{}	2026-02-26 14:40:39.296574+05:30
3	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 11:04:22.302872+05:30
4	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:43:01.423149+05:30
5	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:43:01.639501+05:30
6	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:43:31.78233+05:30
7	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:44:01.960278+05:30
8	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:52:41.50783+05:30
9	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:53:11.547225+05:30
10	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:53:22.883263+05:30
11	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:56:24.435509+05:30
12	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:56:24.54982+05:30
13	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:56:54.788638+05:30
14	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:57:24.886874+05:30
15	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:57:54.880632+05:30
16	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:58:24.906226+05:30
17	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:58:54.88707+05:30
18	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:59:24.901359+05:30
19	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 12:59:54.8906+05:30
20	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:00:24.87964+05:30
21	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:00:54.916926+05:30
22	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:01:24.895123+05:30
23	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:01:55.034629+05:30
24	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:02:30.879037+05:30
25	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:03:00.86845+05:30
26	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:03:30.876753+05:30
27	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:04:00.95908+05:30
28	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:04:45.624808+05:30
29	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:05:22.664875+05:30
31	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:58:37.016126+05:30
32	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:58:37.115115+05:30
33	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.339471+05:30
34	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.369164+05:30
35	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.398609+05:30
36	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.429914+05:30
37	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.462952+05:30
38	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.496013+05:30
39	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.533058+05:30
40	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.574468+05:30
41	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.612062+05:30
42	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.649872+05:30
43	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.689691+05:30
44	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.729409+05:30
45	slots_generated	53	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 53, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 0}	2026-02-27 13:58:45.768733+05:30
30	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 13:39:52.471844+05:30
46	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:00:58.31674+05:30
47	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:00:58.446574+05:30
48	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:01:28.596052+05:30
49	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:01:58.592077+05:30
50	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:02:28.599315+05:30
51	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:02:58.59242+05:30
52	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:03:28.601078+05:30
53	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:03:58.614093+05:30
54	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:04:28.607875+05:30
55	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:04:58.579941+05:30
56	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:05:28.604479+05:30
57	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:05:58.596659+05:30
58	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:06:28.605619+05:30
59	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:06:58.595212+05:30
60	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:07:28.609882+05:30
61	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:07:58.589144+05:30
62	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:08:28.601333+05:30
63	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:08:58.586032+05:30
64	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:09:28.600861+05:30
65	slots_generated	8	\N	\N	\N	slot_generation	generate_slots_for_doctor	\N	\N	\N	{"doctor_user_id": 8, "start_date": "2026-02-27", "end_date": "2026-03-12", "generated_available": 0, "generated_blocked": 0, "updated_existing": 0, "skipped_existing": 98}	2026-02-27 14:09:58.597436+05:30
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, setting_key, setting_value, setting_type, setting_group, updated_by, updated_at) FROM stdin;
1	platform_name	NeuroNest	string	general	\N	2026-02-21 08:53:11.656956
2	support_email	support@neuronest.com	email	general	\N	2026-02-21 08:53:11.661172
3	contact_number	+1-800-NEURO-01	string	general	\N	2026-02-21 08:53:11.66219
5	default_timezone	UTC	string	general	\N	2026-02-21 08:53:11.664251
6	default_language	en-US	string	general	\N	2026-02-21 08:53:11.665221
7	default_session_duration	30	integer	appointments	\N	2026-02-21 08:53:11.666144
8	buffer_time	15	integer	appointments	\N	2026-02-21 08:53:11.667109
9	cancellation_policy_hours	24	integer	appointments	\N	2026-02-21 08:53:11.668022
10	auto_approve_appointments	false	boolean	appointments	\N	2026-02-21 08:53:11.668923
11	max_daily_appointments_per_doctor	20	integer	appointments	\N	2026-02-21 08:53:11.669801
12	platform_commission_percentage	15	integer	payments	\N	2026-02-21 08:53:11.670736
13	enable_payment_gateway	true	boolean	payments	\N	2026-02-21 08:53:11.671612
14	tax_percentage	5	integer	payments	\N	2026-02-21 08:53:11.672481
15	auto_settlement	true	boolean	payments	\N	2026-02-21 08:53:11.673354
16	refund_window_days	7	integer	payments	\N	2026-02-21 08:53:11.67422
17	enable_email_notifications	true	boolean	notifications	\N	2026-02-21 08:53:11.675144
18	enable_in_app_notifications	true	boolean	notifications	\N	2026-02-21 08:53:11.675804
19	enable_sms_notifications	false	boolean	notifications	\N	2026-02-21 08:53:11.676467
20	critical_alert_escalation	true	boolean	notifications	\N	2026-02-21 08:53:11.677413
26	enable_automated_backups	true	boolean	backup	\N	2026-02-21 08:53:11.682878
27	backup_frequency	daily	string	backup	\N	2026-02-21 08:53:11.683607
28	data_retention_days	365	integer	backup	\N	2026-02-21 08:53:11.684238
4	maintenance_mode	true	boolean	general	10	2026-02-21 09:38:39.900531
25	account_lockout_attempts	3	integer	security	10	2026-02-21 13:05:33.673496
23	enable_2fa	False	boolean	security	10	2026-02-21 13:05:33.688969
22	force_strong_password	True	boolean	security	10	2026-02-21 13:05:33.691129
21	password_min_length	12	integer	security	10	2026-02-21 13:05:33.692881
24	session_timeout_minutes	60	integer	security	10	2026-02-21 13:05:33.694756
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
09471791-1877-40b7-af18-56abee15ffc9	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, full_name, account_status, email_verified, phone_verified, is_deleted, created_at, updated_at, is_email_verified, is_phone_verified, is_verified, preferred_language, is_two_factor_enabled) FROM stdin;
2	nayana@gmail.com	$2b$12$rscwEXOQi3RQJ5DQNlLOeuiIfgYC5bvkm3e4D6P0Kqx.uona4GGs2	patient	Nayana	active	f	f	f	2026-02-19 13:49:49.425068	2026-02-19 13:49:49.425068	f	f	f	en	f
3	nezrin@gmail.com	$2b$12$rz1WL1EI8XOYzVn26qsF0OS/6VfUbuQbSeeTXLjbH4Zj4ZCH.yBla	patient	Nezrin	active	f	f	f	2026-02-19 13:49:49.425068	2026-02-19 13:49:49.425068	f	f	f	en	f
22	cognitive.scientist@neuronest.com	$2b$12$qxM.NdGJoObzPZQAuWa8h.FD66DfDgnsJrwAp5E8mr3LxI.KnORUq	doctor	Dr. Virtual Cognitive Scientist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
1	deleted_1_patient11@neuronest.com	$2b$12$M/UZgYzrlcjtA4DsQGp/o.XW.kzpPkazjo4gmXu2sh.4TqCu4NyqO	patient	Patient One	deleted	f	f	t	2026-02-19 13:49:49.425068	2026-02-20 08:13:15.299798	f	f	f	en	f
23	psychiatrist@neuronest.com	$2b$12$GCQ8dEe/8eOpu9QZDP6vGeLcSsW52ydsX4Pr4O7nNzNEXyy2hLmS.	doctor	Dr. Virtual Psychiatrist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
24	cardiologist@neuronest.com	$2b$12$46/d4NMBpYwuoxHe/TaZsuDBVJu0uY.yHZRNDTP4zDRXdRz2ahpem	doctor	Dr. Virtual Cardiologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
10	admin@neuronest.com	$2b$12$CQI0EmACzUVfOJ0GPNbDxOHgTBJO/qScPHA7WKnGeaZcoqCuFVxOe	admin	Nayana Admin	active	f	f	f	2026-02-19 13:49:49.425068	2026-02-19 13:49:49.425068	f	f	f	en	f
25	pulmonologist@neuronest.com	$2b$12$O7LCzZ2XEQtB4WuLstcBTe9.LJOy8wdYx/hxZIJkY9D0XF4mxaVey	doctor	Dr. Virtual Pulmonologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
26	gastroenterologist@neuronest.com	$2b$12$LTdbKNNheBiq7oSPgdUSFe9weZrgL490RhFNv7khJCqDSLeWbosae	doctor	Dr. Virtual Gastroenterologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
27	nephrologist@neuronest.com	$2b$12$cCav2OhbjFVawkInDUJpDOF1I0GkVRnvJkyEAKMsSwhRXua20vpOG	doctor	Dr. Virtual Nephrologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
9	patient@neuronest.com	$2b$12$OulOwzzwXyqe2ma0P5L.kOmSTfaxwV42zrT5G0O5wZEKwIm.2Tljy	patient	Nayana Patient	suspended	f	f	f	2026-02-19 13:49:49.425068	2026-02-19 13:49:49.425068	f	f	f	en	f
28	endocrinologist@neuronest.com	$2b$12$yh1fK.i99npeTD4H9OnPH.7H2MzsOkkC6qsQT0Q3KXQWg5JboeD0.	doctor	Dr. Virtual Endocrinologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
29	hematologist@neuronest.com	$2b$12$GdKLcceNY.XqS4S0nw2Q1.mAHK5Gy6bPSNpuNtL4IPeID.hqwMiR2	doctor	Dr. Virtual Hematologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
30	rheumatologist@neuronest.com	$2b$12$.CEwzvD5BOnQWo1AbwZEfOyPO9olQI487GV/62agAiHuyUfddieva	doctor	Dr. Virtual Rheumatologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
31	infectious.disease.specialist@neuronest.com	$2b$12$bevubc/TOHvADUxN.VDqzOTaXPMc/IgsW4magiCPdgPOv8aS8ACha	doctor	Dr. Virtual Infectious Disease Specialist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
32	internal.medicine@neuronest.com	$2b$12$AGI4GXjLH.KlLu5PkUD50.DbloeVF/cds7i9Pvm.XbAX5DO1U8oEC	doctor	Dr. Virtual Internal Medicine	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
33	urologist@neuronest.com	$2b$12$yI6q76geyQJ37Au4bf1AgOJf8exE3H/EGmz.1/Y9lWaz4Vv0RQi6K	doctor	Dr. Virtual Urologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
34	general.surgeon@neuronest.com	$2b$12$xYQ3qfYx5S5xngQXZ.cdfuZfDa89cnhKWXM4YnogbAOWccKnUTE/2	doctor	Dr. Virtual General Surgeon	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
35	orthopedic.surgeon@neuronest.com	$2b$12$tUTm0dxszQT6xIjCxcRjDuZ8.c9OlzeB9kd.b8YBADJ7V8v/ix6Si	doctor	Dr. Virtual Orthopedic Surgeon	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
36	plastic.surgeon@neuronest.com	$2b$12$Sz1HElwITxmSh4r.L5RBJOFatPcm29CMesP4euhIFCgas235SJHju	doctor	Dr. Virtual Plastic Surgeon	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
37	anesthesiologist@neuronest.com	$2b$12$YBk.8KXHSMKC7awYXOjsNOLBeoLU6onvA5vP088heYzvidZDu5SAe	doctor	Dr. Virtual Anesthesiologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
8	doctor@neuronest.com	$2b$12$mJKJlIVg3Z0P82glFveqnOvlMgJiONQI./7WrJbCo/gvug5vFq.Da	doctor	Dr. Nayana	active	f	f	f	2026-02-19 13:49:49.425068	2026-02-19 13:49:49.425068	f	f	t	en	f
11	house@medicine.org	$2b$12$5HoA77vDkmnqlTzv.Q/XIuEcaNDQ1KUKI0cRwH0LP34AzjZNXxiry	doctor	Dr. Gregory House	active	f	f	f	2026-02-19 17:57:39.883834	2026-02-19 17:57:39.883834	f	f	t	en	f
12	meredith@grey.com	$2b$12$rcgmehJUKwfbqM8JTxbMT.zxB4kn7IyMApt3E7WKHD4feDrFlXr6a	doctor	Dr. Meredith Grey	active	f	f	f	2026-02-20 07:46:09.491558	2026-02-20 07:46:09.491558	f	f	f	en	f
13	derek@shepherd.com	$2b$12$LtbZnyE65SGwcCC3GfL3pObrTAT9FjHnef88uC4PRf4as2dbNEI0m	doctor	Dr. Derek Shepherd	active	f	f	f	2026-02-20 07:46:09.491558	2026-02-20 07:46:09.491558	f	f	f	en	f
14	neurologist@neuronest.com	$2b$12$AW2fLhaBcRGTKLCp4iohy.rDP5mq2C8/eMpHMmD8fPAmq9c6z.KSi	doctor	Dr. Virtual Neurologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
15	neurosurgeon@neuronest.com	$2b$12$JubbHRBQyUI382JrcTie4O3O04WmEvL4yI.gr7BRSBAkxmyV743E.	doctor	Dr. Virtual Neurosurgeon	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
16	clinical.neurophysiologist@neuronest.com	$2b$12$UxoujKuAsT4x6wUtTtLadOrLo10PB1TA5X2UQbenbQhv5zuVRE.yS	doctor	Dr. Virtual Clinical Neurophysiologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
17	neuro-oncologist@neuronest.com	$2b$12$o8AQDDngVyTfNGxHuoC2.eV2XOCh1Kmt26OlyZcJxasg3NdftEQ2.	doctor	Dr. Virtual Neuro-Oncologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
18	neuro-ophthalmologist@neuronest.com	$2b$12$6IVJxFbq0VckVKiFjpwIwu14rK/M0B/c.DW249Us0SOsGYEWvvt8u	doctor	Dr. Virtual Neuro-Ophthalmologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
19	neuroradiologist@neuronest.com	$2b$12$rLrKweWPEgePi2TOs3424.JkbPFUYOENyM.OxzmdNENf4caD4R6vm	doctor	Dr. Virtual Neuroradiologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
20	pediatric.neurologist@neuronest.com	$2b$12$KSWHI/aubXFRlrMFVaI...ocFCwjJhl2IFFN6eQruix9VeFcL0BGK	doctor	Dr. Virtual Pediatric Neurologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
21	neuropsychologist@neuronest.com	$2b$12$mSMXiXQSSnBOl3UwaLDL/ewhwPWTCj1xiFmpyhgw6lXgqoehRaNMK	doctor	Dr. Virtual Neuropsychologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
38	otolaryngologist.ent@neuronest.com	$2b$12$eilVVusYaN/X5hIpXROqB.TeWf8FG2OAJk8T//IZp2BajO5LBIfqC	doctor	Dr. Virtual Otolaryngologist (ENT)	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
39	ophthalmologist@neuronest.com	$2b$12$VGiS0NHnf3EOoEixrrmv5ORUI62H4SLTwu8xCD9P9QhMhSCpsXdCe	doctor	Dr. Virtual Ophthalmologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
40	dermatologist@neuronest.com	$2b$12$5bDUtSLv90bhQlsP7LjdSOsYVZUEQBRTsT9SmNMLlZSjqPhr8f4ty	doctor	Dr. Virtual Dermatologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
41	oncologist@neuronest.com	$2b$12$yJ6putVEhhiVK5rTH1533.EzAnYJExNMvw.Ei/cSFreUsyO3suoKS	doctor	Dr. Virtual Oncologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
42	medical.geneticist@neuronest.com	$2b$12$TjW.B7uQdM7BwigFcVQEDOQd6lU6UEwXzIe7LpD6ouxY6GzqXQ9Zu	doctor	Dr. Virtual Medical Geneticist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
43	pathologist@neuronest.com	$2b$12$35kEMnTweif4fFSvAit51uX2GQ5.y1G1h12mjeLbg8qv.OYcWhJ7m	doctor	Dr. Virtual Pathologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
44	family.physician@neuronest.com	$2b$12$WpTqIHK1bZ1eTTO65rc0CeVjp8mYyHxYlmZ2VxFSDrx7Ipw./XSNm	doctor	Dr. Virtual Family Physician	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
45	pediatrician@neuronest.com	$2b$12$.Jlfufjj24XtxsahMolEYu2F/VpFBfM4fOwLjeS9x7qlrYGdf/jsG	doctor	Dr. Virtual Pediatrician	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
46	obstetrician@neuronest.com	$2b$12$Wmd.KdjCcStjFfnoNqxw5O1Z9EYqhP/lMNL9J05xFbgfKQHcvH7Gi	doctor	Dr. Virtual Obstetrician	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
47	gynecologist@neuronest.com	$2b$12$Hqg5XmT8kCpjwzcWJs7jMe7W1ucGVUdchXWTO.vdBVVa/sGDj2rmW	doctor	Dr. Virtual Gynecologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
48	emergency.physician@neuronest.com	$2b$12$0HqJ7.y3hZ2UqnDpw5GGxeAKu3W6wGsqJnjdNKlbn4AThZI8wJ1hu	doctor	Dr. Virtual Emergency Physician	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
49	pain.management.specialist@neuronest.com	$2b$12$wwVPbfg2Mt.Wr7.OcKlb0eROGF4qQZcKmqJcVfo4tvKDT/FF8cbIG	doctor	Dr. Virtual Pain Management Specialist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
50	physical.medicine.&.rehab@neuronest.com	$2b$12$rPcNQZIxhcdsODQDKqE1ROVPF8nScSGO3CKvE9TaJ3.eUtxTceEnW	doctor	Dr. Virtual Physical Medicine & Rehab	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
51	preventive.medicine@neuronest.com	$2b$12$s5GCNG923Qajcl8qjrT3WuHAl81opOwz.MyRzt3sft7dMfpEf83x.	doctor	Dr. Virtual Preventive Medicine	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
52	clinical.researcher@neuronest.com	$2b$12$OE65MukSlACTKPP7JtSbsOjwc.qGoQEZGf6ItK1hf8J3aAFXKbVR2	doctor	Dr. Virtual Clinical Researcher	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
53	radiologist@neuronest.com	$2b$12$YlRSsx8N66ERyGddsdj7CeaVIvetSSCMb8Fxx9nPCPga5cU9fLkc2	doctor	Dr. Virtual Radiologist	active	f	f	f	2026-02-20 07:50:19.73113	2026-02-20 07:50:19.73113	f	f	f	en	f
4	abc@gmail.com	$2b$12$ePH9LORS7X2rTQD0NkWbau5ywvX6WQtj0H8THZ3eLlu0Rqfsok.Ly	patient	abc	active	f	f	f	2026-02-19 13:49:49.425068	2026-02-20 08:08:04.013013	f	f	f	en	f
54	admin@admin.com	$2b$12$CLIoMIxzJchB6IA348drB.LvQgzH6h/qi.0kQ0pfrSzE5csFo6Mn2	patient	Admin User	active	f	f	f	2026-02-21 03:18:06.540449	2026-02-21 03:18:06.540466	f	f	f	en	f
\.


--
-- Name: announcement_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcement_reads_id_seq', 1, false);


--
-- Name: announcement_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcement_targets_id_seq', 1, false);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: appointment_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appointment_slots_id_seq', 1288, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appointments_id_seq', 30, true);


--
-- Name: clinical_remarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clinical_remarks_id_seq', 3, true);


--
-- Name: clinical_structures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clinical_structures_id_seq', 40, true);


--
-- Name: conversation_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversation_participants_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 5, true);


--
-- Name: doctor_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_audit_logs_id_seq', 15, true);


--
-- Name: doctor_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_availability_id_seq', 15, true);


--
-- Name: doctor_blocked_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_blocked_dates_id_seq', 1, false);


--
-- Name: doctor_consultation_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_consultation_settings_id_seq', 1, false);


--
-- Name: doctor_expertise_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_expertise_tags_id_seq', 54, true);


--
-- Name: doctor_notification_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_notification_settings_id_seq', 1, false);


--
-- Name: doctor_privacy_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_privacy_settings_id_seq', 1, false);


--
-- Name: doctor_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_profiles_id_seq', 44, true);


--
-- Name: doctor_schedule_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_schedule_settings_id_seq', 5, true);


--
-- Name: doctor_slot_overrides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_slot_overrides_id_seq', 1, false);


--
-- Name: doctor_status_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_status_logs_id_seq', 11, true);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.emergency_contacts_id_seq', 47, true);


--
-- Name: in_app_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.in_app_notifications_id_seq', 1, false);


--
-- Name: medical_record_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medical_record_audit_logs_id_seq', 1, false);


--
-- Name: medical_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medical_records_id_seq', 4, true);


--
-- Name: message_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_reactions_id_seq', 1, false);


--
-- Name: message_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_status_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 66, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modules_id_seq', 1, false);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 96, true);


--
-- Name: participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.participants_id_seq', 10, true);


--
-- Name: patient_allergies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_allergies_id_seq', 10, true);


--
-- Name: patient_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_audit_logs_id_seq', 1, false);


--
-- Name: patient_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_conditions_id_seq', 6, true);


--
-- Name: patient_flags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_flags_id_seq', 1, false);


--
-- Name: patient_medications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_medications_id_seq', 8, true);


--
-- Name: patient_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_profiles_id_seq', 47, true);


--
-- Name: patient_status_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_status_logs_id_seq', 1, false);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prescription_items_id_seq', 5, true);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 5, true);


--
-- Name: record_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.record_tags_id_seq', 1, true);


--
-- Name: review_escalations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_escalations_id_seq', 4, true);


--
-- Name: review_moderation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_moderation_logs_id_seq', 6, true);


--
-- Name: review_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_tags_id_seq', 24, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 21, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- Name: security_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.security_activity_id_seq', 192, true);


--
-- Name: slot_event_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.slot_event_logs_id_seq', 65, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 28, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 54, true);


--
-- Name: announcement_reads announcement_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_pkey PRIMARY KEY (id);


--
-- Name: announcement_targets announcement_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_targets
    ADD CONSTRAINT announcement_targets_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: appointment_slots appointment_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_slots
    ADD CONSTRAINT appointment_slots_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: clinical_remarks clinical_remarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_remarks
    ADD CONSTRAINT clinical_remarks_pkey PRIMARY KEY (id);


--
-- Name: clinical_structures clinical_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_structures
    ADD CONSTRAINT clinical_structures_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_conversation_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: doctor_audit_logs doctor_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_audit_logs
    ADD CONSTRAINT doctor_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: doctor_availability doctor_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_pkey PRIMARY KEY (id);


--
-- Name: doctor_blocked_dates doctor_blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_blocked_dates
    ADD CONSTRAINT doctor_blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: doctor_consultation_settings doctor_consultation_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_consultation_settings
    ADD CONSTRAINT doctor_consultation_settings_pkey PRIMARY KEY (id);


--
-- Name: doctor_expertise_tags doctor_expertise_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_expertise_tags
    ADD CONSTRAINT doctor_expertise_tags_pkey PRIMARY KEY (id);


--
-- Name: doctor_notification_settings doctor_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_notification_settings
    ADD CONSTRAINT doctor_notification_settings_pkey PRIMARY KEY (id);


--
-- Name: doctor_privacy_settings doctor_privacy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_privacy_settings
    ADD CONSTRAINT doctor_privacy_settings_pkey PRIMARY KEY (id);


--
-- Name: doctor_profiles doctor_profiles_license_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_profiles
    ADD CONSTRAINT doctor_profiles_license_number_key UNIQUE (license_number);


--
-- Name: doctor_profiles doctor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_profiles
    ADD CONSTRAINT doctor_profiles_pkey PRIMARY KEY (id);


--
-- Name: doctor_profiles doctor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_profiles
    ADD CONSTRAINT doctor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: doctor_schedule_settings doctor_schedule_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_schedule_settings
    ADD CONSTRAINT doctor_schedule_settings_pkey PRIMARY KEY (id);


--
-- Name: doctor_slot_overrides doctor_slot_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_slot_overrides
    ADD CONSTRAINT doctor_slot_overrides_pkey PRIMARY KEY (id);


--
-- Name: doctor_status_logs doctor_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_status_logs
    ADD CONSTRAINT doctor_status_logs_pkey PRIMARY KEY (id);


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: medical_record_audit_logs medical_record_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_record_audit_logs
    ADD CONSTRAINT medical_record_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: message_reactions message_reactions_message_id_user_id_reaction_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_user_id_reaction_type_key UNIQUE (message_id, user_id, reaction_type);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: message_status message_status_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_status
    ADD CONSTRAINT message_status_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_status message_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_status
    ADD CONSTRAINT message_status_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: patient_allergies patient_allergies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT patient_allergies_pkey PRIMARY KEY (id);


--
-- Name: patient_audit_logs patient_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_audit_logs
    ADD CONSTRAINT patient_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: patient_conditions patient_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_conditions
    ADD CONSTRAINT patient_conditions_pkey PRIMARY KEY (id);


--
-- Name: patient_flags patient_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_flags
    ADD CONSTRAINT patient_flags_pkey PRIMARY KEY (id);


--
-- Name: patient_medications patient_medications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_medications
    ADD CONSTRAINT patient_medications_pkey PRIMARY KEY (id);


--
-- Name: patient_profiles patient_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_pkey PRIMARY KEY (id);


--
-- Name: patient_profiles patient_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_user_id_key UNIQUE (user_id);


--
-- Name: patient_status_logs patient_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_status_logs
    ADD CONSTRAINT patient_status_logs_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: record_tags record_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_tags
    ADD CONSTRAINT record_tags_pkey PRIMARY KEY (id);


--
-- Name: review_escalations review_escalations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_escalations
    ADD CONSTRAINT review_escalations_pkey PRIMARY KEY (id);


--
-- Name: review_moderation_logs review_moderation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_pkey PRIMARY KEY (id);


--
-- Name: review_tags review_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_tags
    ADD CONSTRAINT review_tags_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: security_activity security_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_activity
    ADD CONSTRAINT security_activity_pkey PRIMARY KEY (id);


--
-- Name: slot_event_logs slot_event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs
    ADD CONSTRAINT slot_event_logs_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: appointments unique_doctor_slot; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time);


--
-- Name: announcement_reads uq_announcement_user_read; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT uq_announcement_user_read UNIQUE (announcement_id, user_id);


--
-- Name: appointment_slots uq_doctor_slot_start; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_slots
    ADD CONSTRAINT uq_doctor_slot_start UNIQUE (doctor_user_id, slot_start_utc);


--
-- Name: patient_allergies uq_patient_allergy_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT uq_patient_allergy_name UNIQUE (patient_id, allergy_name);


--
-- Name: patient_conditions uq_patient_condition_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_conditions
    ADD CONSTRAINT uq_patient_condition_name UNIQUE (patient_id, condition_name);


--
-- Name: record_tags uq_record_tag_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_tags
    ADD CONSTRAINT uq_record_tag_name UNIQUE (record_id, tag_name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_appointments_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_patient_id ON public.appointments USING btree (patient_id);


--
-- Name: idx_appointments_slot_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_slot_id ON public.appointments USING btree (slot_id);


--
-- Name: idx_conversation_participants_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_participants_user ON public.conversation_participants USING btree (user_id);


--
-- Name: idx_message_status_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_status_user ON public.message_status USING btree (user_id);


--
-- Name: idx_patient_allergies_patient_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_allergies_patient_status ON public.patient_allergies USING btree (patient_id, status);


--
-- Name: idx_patient_conditions_patient_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_conditions_patient_status ON public.patient_conditions USING btree (patient_id, status);


--
-- Name: idx_patient_medications_patient_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_medications_patient_active ON public.patient_medications USING btree (patient_id, end_date);


--
-- Name: idx_record_tags_record_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_record_tags_record_id ON public.record_tags USING btree (record_id);


--
-- Name: idx_record_tags_tag_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_record_tags_tag_name ON public.record_tags USING btree (tag_name);


--
-- Name: idx_slot_doctor_date_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slot_doctor_date_status ON public.appointment_slots USING btree (doctor_user_id, slot_date_local, status);


--
-- Name: idx_slot_event_doctor_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slot_event_doctor_created ON public.slot_event_logs USING btree (doctor_user_id, created_at);


--
-- Name: idx_slot_event_slot_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slot_event_slot_created ON public.slot_event_logs USING btree (slot_id, created_at);


--
-- Name: idx_slot_override_doctor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slot_override_doctor_date ON public.doctor_slot_overrides USING btree (doctor_user_id, override_date);


--
-- Name: ix_appointment_slots_booked_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appointment_slots_booked_appointment_id ON public.appointment_slots USING btree (booked_appointment_id);


--
-- Name: ix_appointment_slots_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appointment_slots_doctor_user_id ON public.appointment_slots USING btree (doctor_user_id);


--
-- Name: ix_appointment_slots_slot_date_local; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appointment_slots_slot_date_local ON public.appointment_slots USING btree (slot_date_local);


--
-- Name: ix_appointment_slots_slot_start_utc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appointment_slots_slot_start_utc ON public.appointment_slots USING btree (slot_start_utc);


--
-- Name: ix_appointment_slots_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appointment_slots_status ON public.appointment_slots USING btree (status);


--
-- Name: ix_doctor_consultation_settings_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_doctor_consultation_settings_doctor_user_id ON public.doctor_consultation_settings USING btree (doctor_user_id);


--
-- Name: ix_doctor_notification_settings_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_doctor_notification_settings_doctor_user_id ON public.doctor_notification_settings USING btree (doctor_user_id);


--
-- Name: ix_doctor_privacy_settings_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_doctor_privacy_settings_doctor_user_id ON public.doctor_privacy_settings USING btree (doctor_user_id);


--
-- Name: ix_doctor_schedule_settings_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_doctor_schedule_settings_doctor_user_id ON public.doctor_schedule_settings USING btree (doctor_user_id);


--
-- Name: ix_doctor_slot_overrides_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_doctor_slot_overrides_doctor_user_id ON public.doctor_slot_overrides USING btree (doctor_user_id);


--
-- Name: ix_doctor_slot_overrides_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_doctor_slot_overrides_is_active ON public.doctor_slot_overrides USING btree (is_active);


--
-- Name: ix_doctor_slot_overrides_override_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_doctor_slot_overrides_override_date ON public.doctor_slot_overrides USING btree (override_date);


--
-- Name: ix_in_app_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_in_app_notifications_user_id ON public.in_app_notifications USING btree (user_id);


--
-- Name: ix_modules_module_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_modules_module_key ON public.modules USING btree (module_key);


--
-- Name: ix_security_activity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_security_activity_user_id ON public.security_activity USING btree (user_id);


--
-- Name: ix_slot_event_logs_actor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_actor_user_id ON public.slot_event_logs USING btree (actor_user_id);


--
-- Name: ix_slot_event_logs_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_appointment_id ON public.slot_event_logs USING btree (appointment_id);


--
-- Name: ix_slot_event_logs_correlation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_correlation_id ON public.slot_event_logs USING btree (correlation_id);


--
-- Name: ix_slot_event_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_created_at ON public.slot_event_logs USING btree (created_at);


--
-- Name: ix_slot_event_logs_doctor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_doctor_user_id ON public.slot_event_logs USING btree (doctor_user_id);


--
-- Name: ix_slot_event_logs_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_event_type ON public.slot_event_logs USING btree (event_type);


--
-- Name: ix_slot_event_logs_slot_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_slot_event_logs_slot_id ON public.slot_event_logs USING btree (slot_id);


--
-- Name: ix_system_settings_setting_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_system_settings_setting_key ON public.system_settings USING btree (setting_key);


--
-- Name: unique_primary_contact; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_primary_contact ON public.emergency_contacts USING btree (patient_id) WHERE (is_primary = true);


--
-- Name: announcement_reads announcement_reads_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;


--
-- Name: announcement_reads announcement_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: announcement_targets announcement_targets_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_targets
    ADD CONSTRAINT announcement_targets_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: announcements announcements_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointment_slots appointment_slots_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_slots
    ADD CONSTRAINT appointment_slots_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: appointment_slots appointment_slots_held_by_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_slots
    ADD CONSTRAINT appointment_slots_held_by_patient_id_fkey FOREIGN KEY (held_by_patient_id) REFERENCES public.users(id);


--
-- Name: clinical_remarks clinical_remarks_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_remarks
    ADD CONSTRAINT clinical_remarks_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: clinical_remarks clinical_remarks_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_remarks
    ADD CONSTRAINT clinical_remarks_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: doctor_audit_logs doctor_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_audit_logs
    ADD CONSTRAINT doctor_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: doctor_audit_logs doctor_audit_logs_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_audit_logs
    ADD CONSTRAINT doctor_audit_logs_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: doctor_availability doctor_availability_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id);


--
-- Name: doctor_blocked_dates doctor_blocked_dates_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_blocked_dates
    ADD CONSTRAINT doctor_blocked_dates_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id);


--
-- Name: doctor_consultation_settings doctor_consultation_settings_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_consultation_settings
    ADD CONSTRAINT doctor_consultation_settings_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: doctor_expertise_tags doctor_expertise_tags_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_expertise_tags
    ADD CONSTRAINT doctor_expertise_tags_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id);


--
-- Name: doctor_notification_settings doctor_notification_settings_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_notification_settings
    ADD CONSTRAINT doctor_notification_settings_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: doctor_privacy_settings doctor_privacy_settings_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_privacy_settings
    ADD CONSTRAINT doctor_privacy_settings_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: doctor_profiles doctor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_profiles
    ADD CONSTRAINT doctor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: doctor_schedule_settings doctor_schedule_settings_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_schedule_settings
    ADD CONSTRAINT doctor_schedule_settings_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: doctor_slot_overrides doctor_slot_overrides_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_slot_overrides
    ADD CONSTRAINT doctor_slot_overrides_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: doctor_slot_overrides doctor_slot_overrides_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_slot_overrides
    ADD CONSTRAINT doctor_slot_overrides_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: doctor_status_logs doctor_status_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_status_logs
    ADD CONSTRAINT doctor_status_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: doctor_status_logs doctor_status_logs_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_status_logs
    ADD CONSTRAINT doctor_status_logs_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: emergency_contacts emergency_contacts_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments fk_appointments_doctor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments fk_appointments_extended_from; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_extended_from FOREIGN KEY (extended_from_appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: appointments fk_appointments_slot_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_slot_id FOREIGN KEY (slot_id) REFERENCES public.appointment_slots(id) ON DELETE SET NULL;


--
-- Name: medical_records fk_medical_records_uploaded_by_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT fk_medical_records_uploaded_by_users FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: appointments fk_patient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: in_app_notifications in_app_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: medical_record_audit_logs medical_record_audit_logs_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_record_audit_logs
    ADD CONSTRAINT medical_record_audit_logs_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id);


--
-- Name: medical_record_audit_logs medical_record_audit_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_record_audit_logs
    ADD CONSTRAINT medical_record_audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: medical_records medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: participants participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: participants participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: patient_allergies patient_allergies_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT patient_allergies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: patient_audit_logs patient_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_audit_logs
    ADD CONSTRAINT patient_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: patient_audit_logs patient_audit_logs_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_audit_logs
    ADD CONSTRAINT patient_audit_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: patient_conditions patient_conditions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_conditions
    ADD CONSTRAINT patient_conditions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: patient_flags patient_flags_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_flags
    ADD CONSTRAINT patient_flags_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: patient_flags patient_flags_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_flags
    ADD CONSTRAINT patient_flags_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: patient_flags patient_flags_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_flags
    ADD CONSTRAINT patient_flags_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: patient_medications patient_medications_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_medications
    ADD CONSTRAINT patient_medications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: patient_profiles patient_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: patient_status_logs patient_status_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_status_logs
    ADD CONSTRAINT patient_status_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: patient_status_logs patient_status_logs_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_status_logs
    ADD CONSTRAINT patient_status_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: prescription_items prescription_items_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: prescriptions prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: prescriptions prescriptions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: record_tags record_tags_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_tags
    ADD CONSTRAINT record_tags_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.medical_records(id) ON DELETE CASCADE;


--
-- Name: review_escalations review_escalations_escalated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_escalations
    ADD CONSTRAINT review_escalations_escalated_by_fkey FOREIGN KEY (escalated_by) REFERENCES public.users(id);


--
-- Name: review_escalations review_escalations_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_escalations
    ADD CONSTRAINT review_escalations_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- Name: review_moderation_logs review_moderation_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: review_moderation_logs review_moderation_logs_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- Name: review_tags review_tags_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_tags
    ADD CONSTRAINT review_tags_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: reviews reviews_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: security_activity security_activity_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_activity
    ADD CONSTRAINT security_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: slot_event_logs slot_event_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs
    ADD CONSTRAINT slot_event_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id);


--
-- Name: slot_event_logs slot_event_logs_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs
    ADD CONSTRAINT slot_event_logs_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: slot_event_logs slot_event_logs_doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs
    ADD CONSTRAINT slot_event_logs_doctor_user_id_fkey FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- Name: slot_event_logs slot_event_logs_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_event_logs
    ADD CONSTRAINT slot_event_logs_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.appointment_slots(id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fadAwwjnfZwihevVzwer7PqDoa5AePwaNYaqLNTVxa2fB2nwdQdPle0hnLcdNWM

