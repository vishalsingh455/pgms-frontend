import React, { useState, useEffect } from 'react';
import { Bed, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiClient } from '../../services/apiClient';

// WHY: Displays a real-time, color-coded grid interface representing the layout of a PG.
// Allows owners to visually inspect vacancies and spot data trends at a glance.
export default function OccupancyGrid({ propertyId }) {
    const [matrixData, setMatrixData] = useState([]);
    const [propertyName, setPropertyName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVacancy, setFilterVacancy] = useState('all'); // 'all', 'vacant', 'occupied'

    // WHY: Isolates the network fetch routine so it can be re-triggered via a manual refresh button.
    const fetchOccupancyData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient(`/properties/${propertyId}/occupancy-matrix`);
            if (response.status === 'success') {
                setMatrixData(response.data.matrix);
                setPropertyName(response.data.propertyName);
            }
        } catch (err) {
            setError(err.message || 'Failed to sync real-time occupancy records.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data automatically when the component mounts onto the screen
    useEffect(() => {
        if (propertyId) {
            fetchOccupancyData();
        }
    }, [propertyId]);

    // =========================================================================
    // CLIENT-SIDE SEARCH & FILTER COMPUTATION LOGIC
    // =========================================================================
    const filteredMatrix = matrixData.map(room => {
        // Filter individual beds inside each room based on the active selection tab
        const bedsMatched = room.beds.filter(bed => {
            const matchesVacancy =
                filterVacancy === 'all' ||
                (filterVacancy === 'vacant' && !bed.isOccupied) ||
                (filterVacancy === 'occupied' && bed.isOccupied);

            // Match if the search query is blank or matches a tenant profile name/ID
            const matchesSearch =
                !searchQuery ||
                (bed.currentTenantId && typeof bed.currentTenantId === 'string' &&
                    bed.currentTenantId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                bed.bedLabel.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesVacancy && matchesSearch;
        });

        return { ...room, filteredBeds: bedsMatched };
    }).filter(room => room.filteredBeds.length > 0 || searchQuery === ''); // Hide rooms completely if they don't match criteria

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm font-medium">Fetching structural asset inventory maps...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50 text-red-700">
                <div className="flex flex-col items-center py-4">
                    <p className="font-semibold mb-3">Operational Synch Error: {error}</p>
                    <Button variant="danger" onClick={fetchOccupancyData}>Retry Sync Loop</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">

            {/* FILTER PANEL MANAGEMENT BAR */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search beds or renter IDs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={() => setFilterVacancy('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterVacancy === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All Beds
                    </button>
                    <button
                        onClick={() => setFilterVacancy('vacant')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterVacancy === 'vacant' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Vacant Only
                    </button>
                    <button
                        onClick={() => setFilterVacancy('occupied')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterVacancy === 'occupied' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Occupied Only
                    </button>
                    <Button variant="outline" onClick={fetchOccupancyData} className="ml-2 !p-2">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* CORE MATRIX STRUCTURAL VISUAL GRID */}
            <Card title={propertyName || "Property Grid Map"} subtitle="Real-time multi-tenant floor allocation index matrix">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMatrix.map((room) => (
                        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between shadow-sm">
                            <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-200">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">Room {room.roomNumber}</h4>
                                    <span className="text-xs text-gray-500 font-medium">Floor Level {room.floorNumber}</span>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 uppercase tracking-tight">
                                    {room.roomType.replace('Sharing', ' Sharing')}
                                </span>
                            </div>

                            {/* BEDS HORIZONTAL LAYOUT LANE */}
                            <div className="grid grid-cols-2 gap-2">
                                {room.filteredBeds.map((bed) => (
                                    <div
                                        key={bed._id}
                                        className={`flex flex-col items-center justify-center p-3 rounded-md border transition-all duration-150 ${bed.isOccupied
                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                : 'bg-green-50 border-green-200 text-green-700'
                                            }`}
                                    >
                                        <Bed className="h-6 w-6 mb-1" />
                                        <span className="text-xs font-bold">{bed.bedLabel}</span>
                                        <span className="text-[10px] uppercase font-semibold mt-1 flex items-center gap-1">
                                            {bed.isOccupied ? (
                                                <>
                                                    <XCircle className="h-3 w-3" /> Occupied
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-3 w-3" /> Vacant
                                                </>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}