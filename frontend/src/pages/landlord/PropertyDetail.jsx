import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DoorOpen, Trash2, Pencil } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Commercial', 'Other'];
const ROOM_TYPES = ['Single', 'Double', 'Studio', 'Suite', 'Self-contain', 'Other'];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add room modal
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ room_number: '', room_type: '', rent_amount: '' });
  const [roomError, setRoomError] = useState('');
  const [roomLoading, setRoomLoading] = useState(false);

  // Edit property modal
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [propForm, setPropForm] = useState({ property_name: '', location: '', property_type: '', description: '' });
  const [propError, setPropError] = useState('');
  const [propLoading, setPropLoading] = useState(false);

  // Edit room modal
  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState({ room_number: '', room_type: '', rent_amount: '' });
  const [editRoomError, setEditRoomError] = useState('');
  const [editRoomLoading, setEditRoomLoading] = useState(false);

  // Confirm dialogs
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState(null);
  const [confirmDeleteProperty, setConfirmDeleteProperty] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`);
      if (res.data.success) setProperty(res.data.data);
    } catch {
      setError('Failed to load property.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperty(); }, [id]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setRoomError('');
    if (!roomForm.room_number || !roomForm.room_type || !roomForm.rent_amount) {
      setRoomError('All fields are required.');
      return;
    }
    setRoomLoading(true);
    try {
      const res = await api.post(`/rooms/property/${id}`, { ...roomForm, rent_amount: Number(roomForm.rent_amount) });
      if (res.data.success) {
        setShowAddRoom(false);
        setRoomForm({ room_number: '', room_type: '', rent_amount: '' });
        fetchProperty();
        toast('Room added.');
      }
    } catch {
      setRoomError('Failed to add room.');
    } finally {
      setRoomLoading(false);
    }
  };

  const openEditProperty = () => {
    setPropForm({
      property_name: property.property_name,
      location: property.location,
      property_type: property.property_type,
      description: property.description ?? '',
    });
    setPropError('');
    setShowEditProperty(true);
  };

  const handleEditProperty = async (e) => {
    e.preventDefault();
    if (!propForm.property_name || !propForm.location || !propForm.property_type) {
      setPropError('Name, location, and type are required.');
      return;
    }
    setPropLoading(true);
    setPropError('');
    try {
      const res = await api.patch(`/properties/${id}`, propForm);
      if (res.data.success) {
        setShowEditProperty(false);
        fetchProperty();
        toast('Property updated.');
      }
    } catch {
      setPropError('Failed to update property.');
    } finally {
      setPropLoading(false);
    }
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setEditRoomForm({ room_number: room.room_number, room_type: room.room_type, rent_amount: String(room.rent_amount) });
    setEditRoomError('');
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    if (!editRoomForm.room_number || !editRoomForm.room_type || !editRoomForm.rent_amount) {
      setEditRoomError('All fields are required.');
      return;
    }
    setEditRoomLoading(true);
    setEditRoomError('');
    try {
      const res = await api.patch(`/rooms/${editingRoom.id}`, { ...editRoomForm, rent_amount: Number(editRoomForm.rent_amount) });
      if (res.data.success) {
        setEditingRoom(null);
        fetchProperty();
        toast('Room updated.');
      }
    } catch {
      setEditRoomError('Failed to update room.');
    } finally {
      setEditRoomLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await api.delete(`/rooms/${confirmDeleteRoom.id}`);
      setConfirmDeleteRoom(null);
      fetchProperty();
      toast('Room deleted.');
    } catch {
      setConfirmDeleteRoom(null);
      toast('Cannot delete an occupied room.', 'error');
    }
  };

  const handleDeleteProperty = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/properties/${id}`);
      navigate('/landlord/properties');
    } catch {
      setConfirmDeleteProperty(false);
      setDeleteLoading(false);
      toast('Cannot delete a property with occupied rooms.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !property) {
    return <p className="text-sm text-danger py-10">{error || 'Property not found.'}</p>;
  }

  const rooms = property.rooms ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/landlord/properties" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{property.property_name}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{property.location} · {property.property_type}</p>
        </div>
        <button onClick={openEditProperty} className="p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors">
          <Pencil size={16} />
        </button>
        <Badge status={property.status} />
      </div>

      {property.description && (
        <Card className="mb-6">
          <p className="text-sm text-text-secondary">{property.description}</p>
        </Card>
      )}

      {/* Rooms Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Rooms <span className="text-text-tertiary font-normal text-sm">({rooms.length})</span>
        </h2>
        <Button onClick={() => setShowAddRoom(true)}>
          <Plus size={16} className="mr-1.5" /> Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <DoorOpen size={28} className="text-text-tertiary mb-3" />
          <p className="text-sm font-semibold text-text-primary mb-1">No rooms yet</p>
          <p className="text-sm text-text-secondary">Add rooms to start assigning tenants.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map(room => (
            <Card key={room.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-text-primary">Room {room.room_number}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{room.room_type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditRoom(room)} className="p-1.5 rounded-btn text-text-tertiary hover:text-accent hover:bg-surface-alt transition-colors">
                    <Pencil size={13} />
                  </button>
                  <Badge status={room.status} />
                </div>
              </div>
              <p className="text-lg font-bold text-accent">
                {formatCurrency(room.rent_amount)}<span className="text-xs text-text-tertiary font-normal">/mo</span>
              </p>
              {room.status !== 'occupied' && (
                <button
                  onClick={() => setConfirmDeleteRoom(room)}
                  className="self-start text-xs text-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-border">
        <button
          onClick={() => setConfirmDeleteProperty(true)}
          disabled={deleteLoading}
          className="text-sm text-danger hover:underline flex items-center gap-1.5"
        >
          <Trash2 size={14} /> Delete Property
        </button>
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={showAddRoom} onClose={() => setShowAddRoom(false)} title="Add Room">
        <form onSubmit={handleAddRoom} className="space-y-4">
          {roomError && <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">{roomError}</div>}
          <Input label="Room Number / Name" placeholder="e.g. 101 or A1" value={roomForm.room_number}
            onChange={e => setRoomForm(p => ({ ...p, room_number: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Room Type</label>
            <select value={roomForm.room_type} onChange={e => setRoomForm(p => ({ ...p, room_type: e.target.value }))} required
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors">
              <option value="">Select type…</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Monthly Rent (XAF)" type="number" placeholder="e.g. 45000" min="0" value={roomForm.rent_amount}
            onChange={e => setRoomForm(p => ({ ...p, rent_amount: e.target.value }))} required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={roomLoading}>Add Room</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAddRoom(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Property Modal */}
      <Modal isOpen={showEditProperty} onClose={() => setShowEditProperty(false)} title="Edit Property">
        <form onSubmit={handleEditProperty} className="space-y-4">
          {propError && <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">{propError}</div>}
          <Input label="Property Name" value={propForm.property_name}
            onChange={e => setPropForm(p => ({ ...p, property_name: e.target.value }))} required />
          <Input label="Location" value={propForm.location}
            onChange={e => setPropForm(p => ({ ...p, location: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Property Type</label>
            <select value={propForm.property_type} onChange={e => setPropForm(p => ({ ...p, property_type: e.target.value }))} required
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors">
              <option value="">Select type…</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Description <span className="text-text-tertiary font-normal">(optional)</span></label>
            <textarea value={propForm.description} onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={propLoading}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setShowEditProperty(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal isOpen={!!editingRoom} onClose={() => setEditingRoom(null)} title={`Edit Room ${editingRoom?.room_number ?? ''}`}>
        <form onSubmit={handleEditRoom} className="space-y-4">
          {editRoomError && <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">{editRoomError}</div>}
          <Input label="Room Number / Name" value={editRoomForm.room_number}
            onChange={e => setEditRoomForm(p => ({ ...p, room_number: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Room Type</label>
            <select value={editRoomForm.room_type} onChange={e => setEditRoomForm(p => ({ ...p, room_type: e.target.value }))} required
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors">
              <option value="">Select type…</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Monthly Rent (XAF)" type="number" min="0" value={editRoomForm.rent_amount}
            onChange={e => setEditRoomForm(p => ({ ...p, rent_amount: e.target.value }))} required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={editRoomLoading}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setEditingRoom(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete room confirm */}
      <ConfirmDialog
        isOpen={!!confirmDeleteRoom}
        title="Delete Room"
        message={`Delete Room ${confirmDeleteRoom?.room_number}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteRoom}
        onCancel={() => setConfirmDeleteRoom(null)}
      />

      {/* Delete property confirm */}
      <ConfirmDialog
        isOpen={confirmDeleteProperty}
        title="Delete Property"
        message="Delete this property and all its rooms? This cannot be undone."
        confirmLabel="Delete Property"
        danger
        onConfirm={handleDeleteProperty}
        onCancel={() => setConfirmDeleteProperty(false)}
      />
    </div>
  );
};

export default PropertyDetail;
