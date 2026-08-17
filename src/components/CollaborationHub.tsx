import React, { useState } from 'react';
import {
  Users,
  Share2,
  MessageSquare,
  History,
  Plus,
  Mail,
  Shield,
  Check,
  Copy,
  Clock,
  Send,
  UserPlus,
  FolderGit2,
  Trash2
} from 'lucide-react';
import { TeamWorkspace, ProjectComment, ProjectVersionHistory, Language, UserProfile } from '../types';
import { isRTL } from '../lib/i18n';

interface CollaborationHubProps {
  lang: Language;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

const SAMPLE_TEAM_WORKSPACE: TeamWorkspace = {
  id: 'team_acad_01',
  name: 'Academic Research Consortium',
  ownerId: 'usr_demo_001',
  members: [
    { userId: 'usr_demo_001', name: 'Dr. Kaveen Hussein', email: 'kaveen.hussein@edu.ac', role: 'Admin' },
    { userId: 'usr_demo_002', name: 'Prof. Alexander Smith', email: 'a.smith@edu.ac', role: 'Editor' },
    { userId: 'usr_demo_003', name: 'Dr. Miriam Al-Hassan', email: 'm.alhassan@edu.ac', role: 'Viewer' }
  ],
  projectsCount: 8,
  createdAt: new Date().toISOString()
};

const SAMPLE_COMMENTS: ProjectComment[] = [
  {
    id: 'c1',
    projectId: 'p1',
    authorId: 'usr_demo_002',
    authorName: 'Prof. Alexander Smith',
    content: 'Chapter 3 methodology sample size N=185 looks strong. Let us double check the SPSS Cronbach alpha reliability output.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'c2',
    projectId: 'p1',
    authorId: 'usr_demo_001',
    authorName: 'Dr. Kaveen Hussein',
    content: 'Agreed! I expanded Section 4 with SPSS regression Beta coefficients and localized regional context.',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const SAMPLE_VERSIONS: ProjectVersionHistory[] = [
  {
    id: 'v2',
    projectId: 'p1',
    versionName: 'Version 2.0 (Doctoral Deep-Dive)',
    updatedBy: 'Dr. Kaveen Hussein',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    changesSummary: 'Expanded Section 4 with SPSS regression tables and added localized regional framework analysis.',
    snapshotData: {}
  },
  {
    id: 'v1',
    projectId: 'p1',
    versionName: 'Version 1.0 (Initial Draft)',
    updatedBy: 'Prof. Alexander Smith',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    changesSummary: 'Initial research paper formulation with APA 7th citations.',
    snapshotData: {}
  }
];

export const CollaborationHub: React.FC<CollaborationHubProps> = ({ lang, currentUser, onOpenAuth }) => {
  const [workspace, setWorkspace] = useState<TeamWorkspace>(SAMPLE_TEAM_WORKSPACE);
  const [comments, setComments] = useState<ProjectComment[]>(SAMPLE_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [activeTab, setActiveTab] = useState<'team' | 'comments' | 'versions'>('team');
  const [shareCopied, setShareCopied] = useState(false);

  const rtl = isRTL(lang);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember = {
      userId: `usr_inv_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole
    };

    setWorkspace({
      ...workspace,
      members: [...workspace.members, newMember]
    });
    setInviteEmail('');
  };

  const handleRemoveMember = (userId: string) => {
    setWorkspace({
      ...workspace,
      members: workspace.members.filter(m => m.userId !== userId)
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const comment: ProjectComment = {
      id: `c_${Date.now()}`,
      projectId: 'p1',
      authorId: currentUser?.id || 'guest',
      authorName: currentUser?.name || 'Academic Collaborator',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    setComments([...comments, comment]);
    setNewCommentText('');
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/share/workspace/${workspace.id}`;
    navigator.clipboard.writeText(link);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white shadow-lg border border-blue-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> Team Workspace & Real-Time Collaboration Hub
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Academic Collaboration & Version History</h2>
          <p className="text-xs md:text-sm text-blue-200">
            Share research projects, manage team member permissions, leave inline discussion comments, and track complete version snapshots.
          </p>
        </div>

        <button
          onClick={handleCopyShareLink}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          {shareCopied ? 'Share Link Copied!' : 'Share Workspace Link'}
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'team'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Team Members & Permissions ({workspace.members.length})
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'comments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Project Discussions ({comments.length})
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'versions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Version History ({SAMPLE_VERSIONS.length})
        </button>
      </div>

      {/* TAB 1: TEAM MEMBERS & PERMISSIONS */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Members List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" /> Active Workspace Directory
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{workspace.name}</span>
              </div>

              <div className="space-y-3">
                {workspace.members.map((member) => (
                  <div
                    key={member.userId}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{member.name}</h4>
                        <p className="text-[11px] text-slate-500">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          member.role === 'Admin'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : member.role === 'Editor'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {member.role}
                      </span>

                      {member.role !== 'Admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove collaborator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invite Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleAddMember} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserPlus className="w-5 h-5 text-blue-500" /> Invite Collaborator
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@uod.ac"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Access Level & Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Editor">Editor (Can edit papers & run SPSS)</option>
                  <option value="Viewer">Viewer (Read-only access & export)</option>
                  <option value="Admin">Admin (Full management privileges)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Send Invite
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT DISCUSSIONS */}
      {activeTab === 'comments' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Research Project Discussion Thread
            </h3>

            {/* Comments Thread */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {comment.authorName.charAt(0)}
                      </div>
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif pl-7 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment or feedback note for the team..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Send className="w-4 h-4" /> Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History className="w-5 h-5 text-blue-500" /> Project Version Snapshots & Restorations
            </h3>

            <div className="space-y-3">
              {SAMPLE_VERSIONS.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{v.versionName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                        {v.updatedBy}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-serif">
                      {v.changesSummary}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(v.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`Restored snapshot ${v.versionName}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shrink-0"
                  >
                    Restore Version
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
