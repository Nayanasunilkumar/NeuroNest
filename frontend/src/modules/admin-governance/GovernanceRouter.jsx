import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EscalationQueue from './EscalationQueue';
import DoctorEscalationPage from './DoctorEscalationPage';

const GovernanceRouter = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="queue" replace />} />
            <Route path="queue" element={<EscalationQueue />} />
            <Route path="doctor/:doctor_id" element={<DoctorEscalationPage />} />
        </Routes>
    );
};

export default GovernanceRouter;
