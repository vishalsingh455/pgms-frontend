import React, { useState } from 'react';
import { Wrench, AlertTriangle, Image as ImageIcon, ClipboardList, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiClient } from '../../services/apiClient';
import { TICKET_CATEGORIES, URGENCY_LEVELS } from '../../config/constants';

// WHY: Provides an interactive form interface for tenants to file building maintenance issues.
// Validates data footprints and captures compulsory photo evidence links prior to hitting backend networks.
export default function TicketForm({ onTicketCreated }) {
    const [formData, setFormData] = useState({
        category: '',
        urgencyLevel: '',
        description: '',
        photoUrl: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // WHY: Evaluates form parameter configurations on the client side before making network queries.
    const validateForm = () => {
        const tempErrors = {};
        if (!formData.category) tempErrors.category = 'Please choose an operational defect category.';
        if (!formData.urgencyLevel) tempErrors.urgencyLevel = 'An urgency severity level assignment is required.';
        if (!formData.description.trim()) tempErrors.description = 'Please describe the maintenance issue details.';
        if (!formData.photoUrl.trim()) tempErrors.photoUrl = 'Image evidence URL link is mandatory to file tickets.';

        // Quick structural check for URL patterns
        if (formData.photoUrl && !formData.photoUrl.startsWith('http')) {
            tempErrors.photoUrl = 'Please input a valid web host link structure (e.g., https://...)';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear validation error tags dynamically as the user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Hit our backend support ticket controller gateway architecture route
            const response = await apiClient('/support-tickets', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.status === 'success') {
                setSuccessMessage('🎉 Support ticket successfully compiled and dispatched to caretakers!');
                // Clear out the form inputs for future submissions
                setFormData({ category: '', urgencyLevel: '', description: '', photoUrl: '' });

                // Trigger parent callback tracking if provided
                if (onTicketCreated) onTicketCreated();
            }
        } catch (err) {
            setErrors({ server: err.message || 'Server error tracking updates.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <Card
                title="File Maintenance Grievance Ticket"
                subtitle="Log infrastructure updates. Visual defect evidence uploads are strictly mandatory."
            >
                {successMessage && (
                    <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                {errors.server && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm font-medium">
                        ⚠️ {errors.server}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* CATEGORY SELECT LINK SELECTION */}
                    <div className="flex flex-col w-full">
                        <label className="mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-slate-400" /> Operational Issue Category <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2.5 border rounded-md text-sm outline-none bg-white transition-colors duration-150 focus:ring-2 focus:ring-offset-1 ${errors.category ? 'border-red-600 focus:ring-red-200 focus:border-red-600' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                                }`}
                        >
                            <option value="">-- Choose Category --</option>
                            {TICKET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        {errors.category && <span className="text-red-600 text-xs mt-1 font-medium">{errors.category}</span>}
                    </div>

                    {/* URGENCY RANK RANGE LAYOUT SELECTION */}
                    <div className="flex flex-col w-full">
                        <label className="mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-slate-400" /> Urgency Severity Rank <span className="text-red-600">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {URGENCY_LEVELS.map(level => {
                                const isActive = formData.urgencyLevel === level;
                                return (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: 'urgencyLevel', value: level } })}
                                        className={`py-2.5 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all border outline-none text-center ${isActive
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.urgencyLevel && <span className="text-red-600 text-xs mt-1 font-medium">{errors.urgencyLevel}</span>}
                    </div>

                    {/* DESCRIPTION TEXT LANE */}
                    <div className="flex flex-col w-full">
                        <label className="mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-slate-400" /> Written Description Details <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Provide a detailed explanation of the problem (e.g., Water leakage under Room 204 washbasin...)"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2.5 border rounded-md text-sm outline-none bg-white transition-colors duration-150 focus:ring-2 focus:ring-offset-1 ${errors.description ? 'border-red-600 focus:ring-red-200 focus:border-red-600' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                                }`}
                        />
                        {errors.description && <span className="text-red-600 text-xs mt-1 font-medium">{errors.description}</span>}
                    </div>

                    {/* PHOTO EVIDENCE URL STRING CHANNEL ELEMENT */}
                    <Input
                        label="Visual Evidence Image Link URL"
                        name="photoUrl"
                        type="text"
                        placeholder="https://your-cloud-storage.com/evidence-image.jpg"
                        required
                        value={formData.photoUrl}
                        onChange={handleInputChange}
                        error={errors.photoUrl}
                        icon={<ImageIcon className="h-4 w-4 text-slate-400" />}
                    />

                    <Button type="submit" variant="primary" className="w-full mt-2 py-3" isLoading={isSubmitting}>
                        Dispatch Support Ticket
                    </Button>

                </form>
            </Card>
        </div>
    );
}