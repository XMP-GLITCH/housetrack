import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, DoorOpen, MapPin, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        if (res.data.success) setProperties(res.data.data);
      } catch {
        setError('Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Properties</h1>
          <p className="text-sm text-text-secondary mt-1">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} registered</p>
        </div>
        <Link
          to="/landlord/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
        >
          <Plus size={18} /> Add Property
        </Link>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-4">
            <Building size={28} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No properties yet</h3>
          <p className="text-sm text-text-secondary mb-6">Add your first property to get started.</p>
          <Link
            to="/landlord/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
          >
            <Plus size={16} /> Add Property
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((property) => {
            const totalRooms = property.rooms?.length ?? 0;
            const occupiedRooms = property.rooms?.filter(r => r.status === 'occupied').length ?? 0;
            const availableRooms = property.rooms?.filter(r => r.status === 'available').length ?? 0;

            return (
              <Link key={property.id} to={`/landlord/properties/${property.id}`}>
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 bg-accent-light rounded-btn flex items-center justify-center flex-shrink-0">
                      <Building size={20} className="text-accent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={property.status} />
                      <ChevronRight size={16} className="text-text-tertiary" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-1">{property.property_name}</h3>

                  <div className="flex items-center gap-1 text-text-tertiary mb-4">
                    <MapPin size={13} />
                    <span className="text-xs">{property.location}</span>
                  </div>

                  <div className="text-xs text-text-secondary mb-4 capitalize">
                    {property.property_type}
                  </div>

                  <div className="border-t border-border pt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-text-primary">{totalRooms}</p>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">{availableRooms}</p>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Available</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-warning">{occupiedRooms}</p>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Occupied</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Properties;
