import React, { useState } from 'react';
import { Trash2, Sun, Moon, Sunset, Coffee, Clock, X } from 'lucide-react';

const MedicineRow = ({ item, index, onChange, onRemove }) => {
    // Parsing helpers
    const parseValueUnit = (str, defaultUnit) => {
        const match = str ? str.match(/^(\d*(?:\.\d+)?)\s*(.*)$/) : null;
        if (match && match[1]) {
             return { val: match[1], unit: match[2] || defaultUnit };
        }
        return { val: '', unit: defaultUnit };
    };

    const parseFreq = (str) => {
        // Expecting "1-0-1-0" or etc.
        if (!str || !str.includes('-')) return [false, false, false, false];
        const parts = str.split('-').map(s => s.trim() === '1');
        while (parts.length < 4) parts.push(false);
        return parts.slice(0, 4);
    };

    // Internal state for structured inputs (synced with item prop)
    const [dose, setDose] = useState(parseValueUnit(item.dosage, 'mg'));
    const [dur, setDur] = useState(parseValueUnit(item.duration, 'days'));
    const [freq, setFreq] = useState(parseFreq(item.frequency));

    const handleDoseChange = (val, unit) => {
        const newVal = { val: val ?? dose.val, unit: unit ?? dose.unit };
        setDose(newVal);
        onChange(index, 'dosage', `${newVal.val} ${newVal.unit}`.trim());
    };

    const handleDurChange = (val, unit) => {
        const newVal = { val: val ?? dur.val, unit: unit ?? dur.unit };
        setDur(newVal);
        onChange(index, 'duration', `${newVal.val} ${newVal.unit}`.trim());
    };

    const handleFreqToggle = (i) => {
        const newFreq = [...freq];
        newFreq[i] = !newFreq[i];
        setFreq(newFreq);
        // Convert to 1-0-1-0 string
        onChange(index, 'frequency', newFreq.map(b => b ? '1' : '0').join('-'));
    };

    const addInstruction = (text) => {
        const current = item.instructions || '';
        const separator = current.trim() ? ', ' : '';
        onChange(index, 'instructions', current + separator + text);
    };

    const freqConfig = [
        { label: 'Mrng', icon: Sun, color: '#FDBA74' },
        { label: 'Aftn', icon: Sun, color: '#FDBA74' }, // Use same icon or varied
        { label: 'Eve', icon: Sunset, color: '#F97316' },
        { label: 'Night', icon: Moon, color: '#6366F1' }
    ];

    const instructionPresets = ['After Food', 'Before Food', 'With Water', 'Bedtime'];

    return (
        <div className="bg-white rounded-4 border border-light shadow-sm p-4 mb-4 position-relative hover-shadow transition-all">
            {/* 1. Header: Number, Name, Delete */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bolder shadow-sm flex-shrink-0" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                    {index + 1}
                </div>
                
                <div className="flex-grow-1 position-relative">
                    <input 
                        type="text" 
                        placeholder="Drug Name (e.g. Paracetamol)"
                        value={item.medicine_name}
                        onChange={(e) => onChange(index, 'medicine_name', e.target.value)}
                        className="form-control form-control-lg border-0 border-bottom border-2 rounded-0 shadow-none px-0 py-1 bg-transparent text-dark fw-bolder"
                        style={{ fontSize: '1.25rem' }}
                        required
                    />
                </div>

                <button 
                    type="button" 
                    onClick={() => onRemove(index)} 
                    className="btn btn-sm btn-danger bg-opacity-10 text-danger border-0 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 hover-bg-danger hover-text-white transition-all"
                    style={{ width: '36px', height: '36px' }}
                    title="Remove"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>

            {/* 2. Structured Inputs Grid */}
            <div className="row g-3 align-items-end mb-4">
                
                {/* DOSE */}
                <div className="col-12 col-md-3">
                    <label className="form-label text-secondary small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>Dosage</label>
                    <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border border-light">
                        <input 
                            type="number" 
                            className="form-control border-0 shadow-none bg-light fw-bold text-dark px-3 py-2" 
                            placeholder="500"
                            value={dose.val}
                            onChange={(e) => handleDoseChange(e.target.value, null)}
                        />
                        <select 
                            className="form-select border-0 shadow-none bg-light fw-bold text-secondary ps-2 pe-4 py-2 text-center"
                            style={{ maxWidth: '80px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}
                            value={dose.unit}
                            onChange={(e) => handleDoseChange(null, e.target.value)}
                        >
                            <option value="mg">mg</option>
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="tab">tab</option>
                            <option value="cap">cap</option>
                        </select>
                    </div>
                </div>

                {/* FREQUENCY (TOGGLES) */}
                <div className="col-12 col-md-6">
                    <label className="form-label text-secondary small fw-bold text-uppercase mb-2 d-flex justify-content-between" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                        <span>Frequency</span>
                        <span className="text-primary">{freq.map(b=>b?'1':'0').join('-')}</span>
                    </label>
                    <div className="d-flex gap-2 p-1 bg-light rounded-3 border border-light shadow-sm">
                        {freqConfig.map((conf, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleFreqToggle(i)}
                                className={`btn flex-grow-1 d-flex flex-column align-items-center justify-content-center py-2 rounded-2 border-0 transition-all ${freq[i] ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                            >
                                <conf.icon size={16} color={freq[i] ? conf.color : '#94A3B8'} className="mb-1" />
                                <span className="small fw-bolder" style={{ fontSize: '0.7rem', color: freq[i] ? '#1E293B' : '#94A3B8' }}>{conf.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DURATION */}
                <div className="col-12 col-md-3">
                    <label className="form-label text-secondary small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>Duration</label>
                    <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border border-light">
                        <input 
                            type="number" 
                            className="form-control border-0 shadow-none bg-light fw-bold text-dark px-3 py-2" 
                            placeholder="5"
                            value={dur.val}
                            onChange={(e) => handleDurChange(e.target.value, null)}
                        />
                        <select 
                            className="form-select border-0 shadow-none bg-light fw-bold text-secondary ps-2 pe-4 py-2 text-center"
                            style={{ maxWidth: '85px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}
                            value={dur.unit}
                            onChange={(e) => handleDurChange(null, e.target.value)}
                        >
                            <option value="days">Days</option>
                            <option value="wks">Wks</option>
                            <option value="mth">Mth</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Instructions */}
            <div>
                <label className="form-label text-secondary small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>Instructions</label>
                
                {/* Chips */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {instructionPresets.map(preset => (
                        <button 
                            key={preset} 
                            type="button" 
                            className="btn btn-sm btn-light rounded-pill border fw-bold text-secondary hover-bg-primary hover-text-white transition-all px-3 py-1"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => addInstruction(preset)}
                        >
                            + {preset}
                        </button>
                    ))}
                </div>

                <textarea 
                    className="form-control bg-light border-light shadow-sm rounded-3 fw-medium text-dark px-3 py-2"
                    rows="2"
                    placeholder="Add custom instructions..."
                    value={item.instructions || ''}
                    onChange={(e) => onChange(index, 'instructions', e.target.value)}
                    style={{ resize: 'none' }}
                />
            </div>
            
            <style>{`
                .hover-shadow { transition: box-shadow 0.3s ease; }
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important; }
                .hover-bg-danger:hover { background-color: var(--bs-danger) !important; color: white !important; }
                .hover-bg-primary:hover { background-color: var(--bs-primary) !important; color: white !important; border-color: var(--bs-primary) !important; }
                .form-control:focus, .form-select:focus { border-color: #86b7fe !important; outline: 0; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important; }
            `}</style>
        </div>
    );
};

export default MedicineRow;
