import React, { useState } from 'react';
import { Trash2, Sun, Moon, Sunset, Coffee, Clock } from 'lucide-react';
import '../../styles/doctor-prescription-pro.css';

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
        <div className="medicine-block fade-in">
            {/* 1. Header: Number, Name, Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="row-number-badge">{index + 1}</div>
                
                <div style={{ flex: 1 }}>
                    {/* <label className="pro-label-subtle" style={{marginBottom: 2}}>Medicine Name</label> */}
                    <input 
                        type="text" 
                        placeholder="Drug Name (e.g. Paracetamol)"
                        value={item.medicine_name}
                        onChange={(e) => onChange(index, 'medicine_name', e.target.value)}
                        className="pro-input"
                        style={{ fontSize: '1.1rem', fontWeight: 600, border: 'none', background: 'transparent', padding: 0 }}
                        required
                    />
                </div>

                <div style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
                    <button 
                        type="button" 
                        onClick={() => onRemove(index)} 
                        className="nexus-btn-icon"
                        style={{ color: '#EF4444', width: 28, height: 28 }}
                        title="Remove"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* 2. Structured Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2fr minmax(140px, 1fr)', gap: '20px', alignItems: 'end', marginBottom: '20px' }}>
                
                {/* DOSE */}
                <div className="input-group-col">
                    <label className="pro-label-subtle">Dosage</label>
                    <div className="input-group-row">
                        <input 
                            type="number" 
                            className="input-group-field" 
                            placeholder="500"
                            value={dose.val}
                            onChange={(e) => handleDoseChange(e.target.value, null)}
                        />
                        <select 
                            className="input-group-addon"
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
                <div className="input-group-col">
                    <label className="pro-label-subtle">Frequency ({freq.map(b=>b?'1':'0').join('-')})</label>
                    <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        {freqConfig.map((conf, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleFreqToggle(i)}
                                className={`freq-toggle-btn ${freq[i] ? 'active' : ''}`}
                                style={{ flex: 1, padding: '10px 0' }}
                            >
                                <conf.icon size={16} color={freq[i] ? conf.color : '#94A3B8'} />
                                <span className="freq-label" style={{ color: freq[i] ? '#1E293B' : '#94A3B8' }}>{conf.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DURATION */}
                <div className="input-group-col">
                    <label className="pro-label-subtle">Duration</label>
                    <div className="input-group-row">
                        <input 
                            type="number" 
                            className="input-group-field" 
                            placeholder="5"
                            value={dur.val}
                            onChange={(e) => handleDurChange(e.target.value, null)}
                        />
                        <select 
                            className="input-group-addon"
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
                <label className="pro-label-subtle">Instructions</label>
                
                {/* Chips */}
                <div className="instruction-chips">
                    {instructionPresets.map(preset => (
                        <button 
                            key={preset} 
                            type="button" 
                            className="chip-btn"
                            onClick={() => addInstruction(preset)}
                        >
                            + {preset}
                        </button>
                    ))}
                </div>

                <textarea 
                    className="pro-input"
                    rows="1"
                    placeholder="Add custom instructions..."
                    value={item.instructions || ''}
                    onChange={(e) => onChange(index, 'instructions', e.target.value)}
                    style={{ height: 'auto', minHeight: '42px', resize: 'none' }}
                />
            </div>
        </div>
    );
};

export default MedicineRow;
