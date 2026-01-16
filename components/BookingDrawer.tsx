import React, { useState, useEffect, useMemo } from 'react';
import { Booking, Resource, RecurrenceRule, Member } from '../types';
import * as Icons from './icons';
import { useDatabase } from '../context/DatabaseContext';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  resources: Resource[];
  members: Member[];
  selectedBooking: Booking | null;
  selectedInstanceDate?: string | null;
  slotData?: { startTime: Date, resourceId: string } | null;
}

const getISODateTimeString = (date: Date) => {
  const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
  const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
  return localISOTime;
};

const getISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
}

const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  resources,
  members,
  selectedBooking,
  selectedInstanceDate,
  slotData
}) => {
  const { addCasualMember } = useDatabase();
  const [formData, setFormData] = useState({
    title: '',
    resourceId: '',
    memberId: '',
    startTime: getISODateTimeString(new Date()),
    endTime: getISODateTimeString(new Date(Date.now() + 60 * 60 * 1000)),
    color: 'blue' as Booking['color'],
    isRecurring: false,
    recurrenceRule: 'weekly' as RecurrenceRule,
    recurrenceEndDate: getISODateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  
  const [isAddingCasualMember, setIsAddingCasualMember] = useState(false);
  const [casualMemberForm, setCasualMemberForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()));
  }, [members, memberSearch]);


  useEffect(() => {
    if (selectedBooking) {
      // If we are editing a specific instance, its date overrides the series' start date
      const startTime = selectedInstanceDate ? new Date(selectedInstanceDate) : new Date(selectedBooking.startTime);
      const originalStartTime = new Date(selectedBooking.startTime);
      const duration = new Date(selectedBooking.endTime).getTime() - originalStartTime.getTime();
      const endTime = new Date(startTime.getTime() + duration);
      
      const selectedMember = members.find(m => m.id === selectedBooking.memberId);
      setMemberSearch(selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '');

      setFormData({
        title: selectedBooking.title,
        resourceId: selectedBooking.resourceId,
        memberId: selectedBooking.memberId || '',
        startTime: getISODateTimeString(startTime),
        endTime: getISODateTimeString(endTime),
        color: selectedBooking.color,
        isRecurring: !!selectedBooking.recurrence,
        recurrenceRule: selectedBooking.recurrence?.rule || 'weekly',
        recurrenceEndDate: selectedBooking.recurrence ? getISODateString(new Date(selectedBooking.recurrence.endDate)) : getISODateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      });
    } else {
      // Reset for new booking, potentially with slot data
      const startTime = slotData?.startTime || new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        resourceId: slotData?.resourceId || '',
        memberId: '',
        startTime: getISODateTimeString(startTime),
        endTime: getISODateTimeString(endTime),
        color: 'blue',
        isRecurring: false,
        recurrenceRule: 'weekly',
        recurrenceEndDate: getISODateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      });
      setMemberSearch('');
      setIsAddingCasualMember(false);
      setCasualMemberForm({ firstName: '', lastName: '', email: '', phone: '' });
    }
  }, [selectedBooking, selectedInstanceDate, isOpen, members, slotData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };

  const isFormValid = formData.title && formData.resourceId && formData.startTime && formData.endTime;

  const handleSave = () => {
    if (!isFormValid) {
      alert("Please fill in all required fields.");
      return;
    }

    const resource = resources.find(r => r.id === formData.resourceId);

    // FIX: Added missing locationId property to match the Booking interface.
    const bookingToSave: Booking = {
      id: selectedBooking?.id || `b_${Date.now()}`,
      locationId: resource?.locationId || '',
      seriesId: selectedBooking?.seriesId,
      isException: selectedBooking?.isException,
      title: formData.title,
      resourceId: formData.resourceId,
      memberId: formData.memberId || undefined,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      color: formData.color,
      status: selectedBooking?.status || 'scheduled',
      recurrence: formData.isRecurring ? {
        rule: formData.recurrenceRule,
        endDate: new Date(formData.recurrenceEndDate).toISOString(),
        exceptionDates: selectedBooking?.recurrence?.exceptionDates,
      } : undefined,
    };
    
    onSave(bookingToSave);
    onClose();
  };
  
  const handleDelete = () => {
    if (selectedBooking) {
        // Pass the instance information back for context
        const bookingToDelete: Booking = {
            ...selectedBooking,
            startTime: selectedInstanceDate || selectedBooking.startTime,
        };
        onDelete(bookingToDelete);
        onClose();
    }
  }

  const handleMemberSelect = (member: Member) => {
    setFormData(prev => ({ ...prev, memberId: member.id }));
    setMemberSearch(`${member.firstName} ${member.lastName}`);
    setIsMemberDropdownOpen(false);
  };
  
  const handleSaveCasualMember = () => {
      if (casualMemberForm.firstName && casualMemberForm.email) {
          const newMember = addCasualMember(casualMemberForm);
          // After saving, select this new member in the drawer
          handleMemberSelect(newMember);
          // Reset and close the form
          setIsAddingCasualMember(false);
          setCasualMemberForm({ firstName: '', lastName: '', email: '', phone: '' });
      } else {
          alert('First Name and Email are required for a casual member.');
      }
  };


  const handleMemberSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberSearch(e.target.value);
    setIsMemberDropdownOpen(true);
    // If user is typing, clear the selected memberId to force a new selection
    if (formData.memberId) {
        const currentMember = members.find(m => m.id === formData.memberId);
        if (`${currentMember?.firstName} ${currentMember?.lastName}` !== e.target.value) {
            setFormData(p => ({ ...p, memberId: '' }));
        }
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card-dark shadow-lg z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-border-dark flex-shrink-0">
            <h2 className="text-lg font-semibold">{selectedBooking ? 'Edit Booking' : 'Add Booking'}</h2>
            <div className="flex items-center space-x-2">
                {selectedBooking && (
                    <button onClick={handleDelete} className="p-2 rounded-full text-text-dark-secondary hover:bg-red-900/50 hover:text-red-500">
                        <Icons.TrashIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onClose} className="p-1 rounded-full hover:bg-background-dark">
                    <Icons.XIcon className="w-6 h-6" />
                </button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-dark-secondary mb-1">Service / Class *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark-secondary mb-1">Resource *</label>
              <select name="resourceId" value={formData.resourceId} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark">
                <option value="" disabled>Select a resource</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
            </div>

             <div>
              <label className="block text-sm font-medium text-text-dark-secondary mb-1">Client</label>
              {isAddingCasualMember ? (
                  <div className="p-4 bg-background-dark rounded-md space-y-3 border border-border-dark">
                      <h4 className="font-semibold text-sm">Add Casual Member</h4>
                      <input type="text" placeholder="First Name *" value={casualMemberForm.firstName} onChange={e => setCasualMemberForm(p => ({ ...p, firstName: e.target.value }))} className="p-2 w-full bg-card-dark rounded-md border border-border-dark" />
                      <input type="text" placeholder="Last Name" value={casualMemberForm.lastName} onChange={e => setCasualMemberForm(p => ({ ...p, lastName: e.target.value }))} className="p-2 w-full bg-card-dark rounded-md border border-border-dark" />
                      <input type="email" placeholder="Email *" value={casualMemberForm.email} onChange={e => setCasualMemberForm(p => ({ ...p, email: e.target.value }))} className="p-2 w-full bg-card-dark rounded-md border border-border-dark" />
                      <input type="tel" placeholder="Phone" value={casualMemberForm.phone} onChange={e => setCasualMemberForm(p => ({ ...p, phone: e.target.value }))} className="p-2 w-full bg-card-dark rounded-md border border-border-dark" />
                      <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setIsAddingCasualMember(false)} className="px-3 py-1 text-xs rounded-md hover:bg-border-dark">Cancel</button>
                          <button type="button" onClick={handleSaveCasualMember} className="px-3 py-1 text-xs rounded-md bg-primary-600 text-white hover:bg-primary-700">Save & Select</button>
                      </div>
                  </div>
              ) : (
                  <div className="relative">
                      <input type="text" value={memberSearch} onChange={handleMemberSearchChange} onFocus={() => setIsMemberDropdownOpen(true)} onBlur={() => setTimeout(() => setIsMemberDropdownOpen(false), 200)} placeholder="Search for a member..." className="p-2 w-full bg-background-dark rounded-md border border-border-dark" />
                      <button type="button" onClick={() => setIsAddingCasualMember(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-border-dark text-text-dark-secondary" title="Add casual member"><Icons.PlusIcon className="w-5 h-5" /></button>

                      {isMemberDropdownOpen && filteredMembers.length > 0 && (
                          <ul className="absolute z-20 w-full bg-card-dark shadow-lg rounded-md mt-1 border border-border-dark max-h-40 overflow-y-auto">
                              {filteredMembers.map(member => (
                                  <li key={member.id} onMouseDown={() => handleMemberSelect(member)} className="p-2 hover:bg-background-dark cursor-pointer text-sm">{member.firstName} {member.lastName}</li>
                              ))}
                          </ul>
                      )}
                  </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-text-dark-secondary mb-1">Starts *</label>
                  <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark" />
               </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark-secondary mb-1">Ends *</label>
                  <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark" />
               </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark-secondary mb-1">Color Tag</label>
                <div className="flex space-x-2">
                    {(['blue', 'green', 'purple', 'orange', 'red', 'gray'] as const).map(color => (
                        <button key={color} onClick={() => setFormData(p => ({...p, color}))} className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? `border-primary-500 ring-2 ring-offset-1 ring-primary-500 ring-offset-card-dark` : 'border-transparent'} bg-${color}-400`}></button>
                    ))}
                </div>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-2">Recurrence</h3>
              <div className="p-4 bg-background-dark rounded-md space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm">Make this a series</span>
                </label>
                {formData.isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-dark-secondary mb-1">Repeats</label>
                            <select name="recurrenceRule" value={formData.recurrenceRule} onChange={handleChange} className="p-2 w-full bg-card-dark rounded-md text-sm border border-border-dark">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-text-dark-secondary mb-1">Until</label>
                            <input type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate} onChange={handleChange} className="p-2 w-full bg-card-dark rounded-md text-sm border border-border-dark" />
                        </div>
                    </div>
                )}
              </div>
            </div>
          </main>

          <footer className="p-4 border-t border-border-dark flex justify-end space-x-2 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-dark-primary bg-background-dark rounded-md hover:bg-border-dark">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!isFormValid} className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
              Save
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default BookingDrawer;