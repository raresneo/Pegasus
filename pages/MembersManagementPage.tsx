
import React, { useState, useMemo, memo, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Member, MembershipStatus, TaxonomyItem } from '../types';
import * as Icons from '../components/icons';
import { membershipTiers } from '../lib/data';
import Modal from '../components/Modal';
import { useNotifications } from '../context/NotificationContext';

const MemberCard = memo(({ member, onViewMember, selectionMode, isSelected, onSelect, clientTags, viewMode = 'grid' }: { member: Member; onViewMember: (member: Member) => void; selectionMode: boolean; isSelected: boolean; onSelect: (id: string) => void; clientTags: TaxonomyItem[]; viewMode?: 'grid' | 'list'; }) => {
  const tier = membershipTiers.find(t => t.id === member.membership.tierId);
  const isGrayedOut = ['expired', 'cancelled'].includes(member.membership.status);

  const activeTags = useMemo(() => {
    return clientTags.filter(tag => member.tags?.includes(tag.id) || member.tags?.includes(tag.name));
  }, [clientTags, member.tags]);

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => selectionMode ? onSelect(member.id) : onViewMember(member)}
        className={`group flex items-center gap-6 glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${isGrayedOut ? 'opacity-40 grayscale' : ''} ${isSelected ? 'border-primary-500 bg-primary-500/5' : 'border-white/5 hover:bg-white/5'}`}
      >
        {selectionMode && (
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-black' : 'bg-white/5 border-white/20'}`}>
            {isSelected && <Icons.CheckIcon className="w-3 h-3 font-black" />}
          </div>
        )}

        <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-primary-500 text-lg">
          {member.avatar}
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <p className="font-black text-white truncate text-sm uppercase tracking-tight">{`${member.firstName} ${member.lastName}`}</p>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{tier?.name || 'Standard'}</p>
          </div>
          <div className="col-span-3">
            <p className="text-xs text-white/60 truncate">{member.email}</p>
          </div>
          <div className="col-span-3 flex gap-1 flex-wrap">
            {activeTags.slice(0, 2).map(tag => (
              <span key={tag.id} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${tag.color || 'bg-white/10 text-white'}`}>
                {tag.name}
              </span>
            ))}
          </div>
          <div className="col-span-2 text-right">
            <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${member.membership.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              {member.membership.status}
            </span>
          </div>
        </div>

        <div className="p-2 text-white/20 group-hover:text-primary-500 transition-colors">
          <Icons.ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => selectionMode ? onSelect(member.id) : onViewMember(member)}
      className={`group relative glass-card rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 cursor-pointer border-2 ${isGrayedOut ? 'opacity-40 grayscale' : ''} ${isSelected ? 'border-primary-500 ring-4 ring-primary-500/10 scale-[1.02]' : 'border-white/10 hover:border-primary-500/50 hover:-translate-y-2'}`}
    >
      {selectionMode && (
        <div className={`absolute top-6 right-6 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-30 ${isSelected ? 'bg-primary-500 border-primary-500 text-black shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/20'}`}>
          {isSelected && <Icons.CheckIcon className="w-4 h-4 font-black" />}
        </div>
      )}

      <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2.5rem]"></div>

      <div className="flex flex-col items-center text-center space-y-6 relative z-20">
        <div className="w-24 h-24 bg-black border-2 border-primary-500/30 rounded-[2rem] flex-shrink-0 flex items-center justify-center font-black text-primary-500 text-3xl shadow-inner transition-transform duration-700 group-hover:scale-110">
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white truncate text-xl uppercase tracking-tighter leading-tight text-high-contrast">{`${member.firstName} ${member.lastName}`}</p>
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mt-3">{tier?.name || 'Fără Abonament'}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 justify-center relative z-20 min-h-[30px]">
        {activeTags.map(tag => (
          <span key={tag.id} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg ${tag.color || 'bg-white/10 text-white border border-white/20'}`}>
            {tag.name}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center relative z-20">
        <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${member.membership.status === 'active' ? 'bg-green-600 text-white border-green-500' : 'bg-white/5 text-slate-400 border-white/20'}`}>
          {member.membership.status}
        </span>
        <div className={`p-3 rounded-2xl transition-all duration-500 bg-white/5 text-primary-500 group-hover:bg-primary-500 group-hover:text-black group-hover:translate-x-1 shadow-lg`}>
          <Icons.ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
});

interface MembersManagementPageProps {
  onViewMember: (member: Member) => void;
  navigationContext?: any;
}

const MembersManagementPage: React.FC<MembersManagementPageProps> = ({ onViewMember, navigationContext }) => {
  const { members, clientTags, bulkDeleteMembers, bulkUpdateMemberStatus, bulkAddTagsToMembers } = useDatabase();
  const { notify } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'everyone' | 'active' | 'expired' | 'frozen' | 'prospects'>('everyone');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);

  const [targetStatus, setTargetStatus] = useState<MembershipStatus>('frozen');
  const [targetTagId, setTargetTagId] = useState<string>('');

  const filteredMembers = useMemo(() => {
    let data = members;

    // Filter by Tab
    if (activeTab !== 'everyone' && activeTab !== 'prospects') {
      data = data.filter(m => m.membership.status === activeTab);
    }

    // Search Filter
    return data.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm, activeTab]);

  const handleSelect = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const executeBulkDelete = () => {
    bulkDeleteMembers(selectedMemberIds);
    notify(`Eliminat cu succes ${selectedMemberIds.length} membri.`, 'info');
    setSelectedMemberIds([]);
    setSelectionMode(false);
    setIsBulkDeleteModalOpen(false);
  };

  const executeBulkStatusUpdate = () => {
    bulkUpdateMemberStatus(selectedMemberIds, targetStatus);
    notify(`Status actualizat pentru ${selectedMemberIds.length} profile.`, 'success');
    setSelectedMemberIds([]);
    setSelectionMode(false);
    setIsBulkStatusModalOpen(false);
  };

  const executeBulkTagAssignment = () => {
    if (!targetTagId) return;
    bulkAddTagsToMembers(selectedMemberIds, targetTagId);
    notify(`Etichetă aplicată pentru ${selectedMemberIds.length} profile.`, 'success');
    setSelectedMemberIds([]);
    setSelectionMode(false);
    setIsBulkTagModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn relative min-h-full pb-32">
      {/* Modals for Bulk Actions */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Eliminare în Masă"
        description={`Ești pe cale să ștergi definitiv ${selectedMemberIds.length} profile din baza de date Pegasus. Această acțiune este ireversibilă.`}
        onConfirm={executeBulkDelete}
        confirmText="Șterge definitiv"
        confirmColor="red"
      />

      <Modal
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        title="Modificare Status în Masă"
        description={`Schimbă starea pentru ${selectedMemberIds.length} membri selectați la statusul: ${targetStatus.toUpperCase()}.`}
        onConfirm={executeBulkStatusUpdate}
        confirmText="Aplică Modificarea"
      />

      <Modal
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        title="Atribuire Etichetă"
        description={`Aplică eticheta selectată pentru ${selectedMemberIds.length} profile. Aceasta se va adăuga la lista lor existentă de tag-uri.`}
        onConfirm={executeBulkTagAssignment}
        confirmText="Aplică Tag"
      />

      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none italic">Management Membri</h1>
          <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">Explorator de profile Pegasus Core.</p>
        </div>
        <div className="flex gap-4">
          {selectionMode && (
            <button
              onClick={handleSelectAll}
              className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-primary-500 border border-primary-500/20 hover:bg-primary-500/10 transition-all"
            >
              {selectedMemberIds.length === filteredMembers.length ? 'Deselectează Tot' : 'Selectează Tot Filtered'}
            </button>
          )}
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedMemberIds([]);
            }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectionMode ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white'}`}
          >
            {selectionMode ? 'Anulează Selecția' : 'Selecție Multiplă'}
          </button>
        </div>
      </header>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'everyone', label: 'Toți Membrii' },
            { id: 'active', label: 'Activi' },
            { id: 'expired', label: 'Expirați' },
            { id: 'frozen', label: 'Suspendați/Frozen' },
            { id: 'prospects', label: 'Prospects' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group flex-1">
            <Icons.SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 text-primary-500 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Caută în baza de date Pegasus (Nume sau Email)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white transition-all shadow-inner"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-primary-500 shadow-lg' : 'text-white/20 hover:text-white'}`}
            >
              <Icons.ViewGridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-primary-500 shadow-lg' : 'text-white/20 hover:text-white'}`}
            >
              <Icons.ViewListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {filteredMembers.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onViewMember={onViewMember}
            selectionMode={selectionMode}
            isSelected={selectedMemberIds.includes(member.id)}
            onSelect={handleSelect}
            clientTags={clientTags}
            viewMode={viewMode}
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
          <Icons.UsersIcon className="w-20 h-20 mb-6" />
          <p className="font-black text-xl uppercase tracking-widest italic">Niciun membru găsit în acest nod</p>
        </div>
      )}

      {/* Floating Bulk Actions Toolbar */}
      {selectedMemberIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-full max-w-4xl px-4">
          <div className="bg-black/80 backdrop-blur-2xl border-2 border-primary-500/30 rounded-3xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 pl-4">
              <div className="w-10 h-10 bg-primary-500 text-black rounded-xl flex items-center justify-center font-black shadow-lg">
                {selectedMemberIds.length}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">Membri Selectați</p>
                <p className="text-xs font-bold text-white/60">Gata pentru procesare</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-2">
              <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block"></div>

              {/* Status Action */}
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                <select
                  className="bg-transparent text-[9px] font-black uppercase tracking-widest outline-none px-2 cursor-pointer"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as MembershipStatus)}
                >
                  <option value="active">Activ</option>
                  <option value="frozen">Suspendă</option>
                  <option value="cancelled">Anulează</option>
                </select>
                <button
                  onClick={() => setIsBulkStatusModalOpen(true)}
                  className="bg-primary-500 text-black px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all"
                >
                  Aplică Status
                </button>
              </div>

              {/* Tag Action */}
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                <select
                  className="bg-transparent text-[9px] font-black uppercase tracking-widest outline-none px-2 cursor-pointer max-w-[120px]"
                  value={targetTagId}
                  onChange={(e) => setTargetTagId(e.target.value)}
                >
                  <option value="">Alege Tag...</option>
                  {clientTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                </select>
                <button
                  disabled={!targetTagId}
                  onClick={() => setIsBulkTagModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30"
                >
                  Adaugă Tag
                </button>
              </div>

              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                title="Ștergere în Masă"
              >
                <Icons.TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManagementPage;
