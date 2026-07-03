import React, { useState, useEffect } from 'react';
import { Coffee, Sun, Moon, Calendar, AlertCircle, Check, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiClient } from '../../services/apiClient';

// WHY: Provides an interactive weekly meal tracker for residents.
// Enforces the 4:00 PM kitchen lockdown cutoff rule natively on the user interface.
export default function MealCalendar({ propertyId }) {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // WHY: Simulates loading a static weekly schedule for the multi-tenant kitchen.
    // In a final integration, this maps out to the backend database via a simple GET call.
    const fetchWeeklyMenu = async () => {
        setLoading(true);
        setError('');
        try {
            // Dummy data representing upcoming meal schedules populated for testing
            const targetDate = new Date();
            const mockMeals = [
                {
                    _id: 'meal_b1',
                    date: new Date(targetDate),
                    mealType: 'Breakfast',
                    menuDescription: 'Aloo Paratha with Curd & Tea',
                    skippedTenants: []
                },
                {
                    _id: 'meal_l1',
                    date: new Date(targetDate),
                    mealType: 'Lunch',
                    menuDescription: 'Jeera Rice, Dal Tadka, Seasonal Veg, & Roti',
                    skippedTenants: []
                },
                {
                    _id: 'meal_d1',
                    date: new Date(targetDate),
                    mealType: 'Dinner',
                    menuDescription: 'Paneer Butter Masala, Roti, Kheer',
                    skippedTenants: ['some_other_tenant_id'] // Mocking an already skipped item
                }
            ];

            setMeals(mockMeals);
        } catch (err) {
            setError('Failed to fetch the kitchen operational calendar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeeklyMenu();
    }, [propertyId]);

    // WHY: Evaluates the hard 4:00 PM cutoff limitation before pushing data mutations to the server.
    const handleToggleAttendance = async (mealId, mealType) => {
        setActionError('');
        setSuccessMessage('');

        // 1. Get current hour markers (24-hour clock)
        const currentHour = new Date().getHours();

        // 2. ENFORCE CUTOFF BOUNDARY: 16 represents 4:00 PM. Lock input instantly if boundary breached.
        if (currentHour >= 16 && mealType === 'Dinner') {
            setActionError('🔒 Access Denied: The 4:00 PM strict kitchen lockdown cutoff window has expired. Dinner portions are locked.');
            return;
        }

        try {
            // Call our backend endpoint to register the change
            const response = await apiClient('/operations/meals/toggle-attendance', {
                method: 'POST',
                body: JSON.stringify({ mealId })
            });

            if (response.status === 'success') {
                setSuccessMessage(`Attendance preference updated successfully for ${mealType}!`);

                // Optimistically toggle state variables locally inside memory
                setMeals(prevMeals =>
                    prevMeals.map(meal => {
                        if (meal._id === mealId) {
                            // Simulating toggle check against a mock tenant profile assignment
                            const isCurrentlySkipped = meal.isCurrentTenantSkipped;
                            return {
                                ...meal,
                                isCurrentTenantSkipped: !isCurrentlySkipped
                            };
                        }
                        return meal;
                    })
                );
            }
        } catch (err) {
            // Fallback action state updates if server validation layer returns a 403 status
            setActionError(err.message || 'Failed to modify meal presence logs.');
        }
    };

    const getMealIcon = (type) => {
        switch (type) {
            case 'Breakfast': return <Coffee className="h-5 w-5 text-amber-500" />;
            case 'Lunch': return <Sun className="h-5 w-5 text-orange-500" />;
            case 'Dinner': return <Moon className="h-5 w-5 text-indigo-500" />;
            default: return <Calendar className="h-5 w-5 text-slate-500" />;
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-sm text-gray-500">Syncing dietary optimization manifests...</div>;
    }

    return (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <Card
                title="Kitchen Hub & Food Optimization"
                subtitle="View today's menu layout. Opt-out toggles for Dinner permanently lock at exactly 4:00 PM daily."
            >
                {/* ACTION LEVEL WARNING NOTIFICATIONS */}
                {actionError && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        {actionError}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm font-semibold">
                        {successMessage}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {meals.map((meal) => {
                        const isSkipped = meal.isCurrentTenantSkipped;
                        return (
                            <div
                                key={meal._id}
                                className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isSkipped ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-md mt-0.5">
                                        {getMealIcon(meal.mealType)}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800 text-md">{meal.mealType}</h5>
                                        <p className="text-sm text-gray-600 mt-0.5 font-medium">{meal.menuDescription}</p>
                                    </div>
                                </div>

                                {/* INTERACTIVE TOGGLE BUTTON CONTROLLER ELEMENT */}
                                <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(meal._id, meal.mealType)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 self-end sm:self-auto border outline-none ${isSkipped
                                            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                            : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                        }`}
                                >
                                    {isSkipped ? (
                                        <>
                                            <X className="h-3.5 w-3.5" /> Skipping Meal
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-3.5 w-3.5" /> Attending Meal
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}