import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { getUsers } from '../../services/userService';
import { Loader2 } from 'lucide-react';

interface CommunityMembersTabProps {
  activeUser: User;
}

export const CommunityMembersTab: React.FC<CommunityMembersTabProps> = ({ activeUser }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Fetch only members of the current user's community
        const data = await getUsers(activeUser.communityId);
        
        // Filter out admins from the directory list and count
        const filteredMembers = data.filter(member => 
          member.role !== 'super_admin' && 
          member.role !== 'executive_admin' && 
          member.role !== 'community_admin'
        );
        
        setMembers(filteredMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeUser?.communityId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [activeUser?.communityId]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Community Members Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified registered community members with active Digital ID cards.</p>
        </div>
        <span className="text-xs bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl font-bold border border-slate-200 dark:border-slate-700">
          Total: {members.length} Active
        </span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-500 text-sm">
            No members found for this community.
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
                  alt={member.name} 
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: {member.membershipId || member.id.slice(0, 8)} • {member.city}, {member.state}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${member.isVerified ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                {member.isVerified ? '✓ KYC Verified' : 'Pending KYC'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
