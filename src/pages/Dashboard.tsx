import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { AddPaperForm } from '../components/AddPaperForm'
import { isAdminUser } from '../types'

interface PaperItem {
  id: string
  title: string
  created_at?: string
  user_id?: string
}

export function Dashboard() {
  const [papers, setPapers] = useState<PaperItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // هێنانا لێکۆڵینێن بەکارهێنەری یان هەموو لێکۆڵینان ئەگەر ئەدمین بێت
  const fetchPapers = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        
        // فێچکرنا ڕۆل یان پشکنین دگەل تێكڕایێ شێوازێن ئەدمینی
        const userRole = user.role || user.user_metadata?.role || user.app_metadata?.role || ''
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        const adminCheck = userRole === 'admin' || isAdminUser({ email: user.email, name: userName, role: userRole, id: user.id, createdAt: '' })
        
        setIsAdmin(adminCheck)

        // ئەگەر ئەدمین بێت -> هێنانا تەواوی داتایێن هەموو بەکارهێنەران ل Supabase
        // ئەگەر بەکارهێنەری ئاسایی بێت -> تەنها هێنانا لێکۆڵینێن خۆی
        let query = supabase.from('papers').select('*')
        
        if (!adminCheck) {
          query = query.eq('user_id', user.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
          console.warn('[Supabase Papers Fetch Warning]:', error.message)
          setErrorMsg(error.message)
        } else if (data) {
          setPapers(data as PaperItem[])
        }
      } else {
        setErrorMsg('تکایە پێشتر بچە ژوورڤە!')
      }
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e.message || 'خەڵەتییەک ل هێنانا داتایان ڕووبدوو.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  // سڕینەڤەیا لێکۆڵینێ
  const handleDeletePaper = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase.from('papers').delete().eq('id', id)
      if (error) {
        alert(error.message)
      } else {
        setPapers(prev => prev.filter(p => p.id !== id))
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // چوونەدەرڤە (Sign Out)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navigation Header with Admin Badge */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                🎓 مشتەرییا EduPlanner Pro (Dashboard)
              </h1>
              {isAdmin && (
                <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-extrabold text-xs flex items-center gap-1 shadow-xs">
                  👑 Admin Panel (بینینی تەواوی داتایان)
                </span>
              )}
            </div>
            {userEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بەکارهێنەر: <span className="font-semibold text-slate-700 dark:text-slate-300">{userEmail}</span>
                {isAdmin && <span className="ml-2 font-bold text-purple-500">(سەڵاحییەتا ئەدمینی هەیە)</span>}
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            چوونەدەرڤە (Logout)
          </button>
        </header>

        {/* Special Admin Announcement Banner */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white shadow-lg border border-purple-500/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 text-lg">
                🛡️
              </div>
              <div>
                <h3 className="font-bold text-sm text-purple-200">پانێلا ئەدمینیی ئاست بەرز (Super Admin Permission Granted)</h3>
                <p className="text-xs text-purple-300/90">تە سەڵاحییەتا هەیی بۆ دیتن و بەڕێوەبرنا هەموو لێکۆڵینێن سەرجەم بەکارهێنەران ل Supabase.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-purple-200 font-semibold">
              All System Papers Mode
            </span>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Add Paper Form */}
          <div className="lg:col-span-1 space-y-4">
            <AddPaperForm onPaperAdded={fetchPapers} />
          </div>

          {/* Right Column: Papers List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {isAdmin ? 'لیستا گشتی یا هەموو لێکۆڵینان د داتابێسێ دا' : 'لیستا لێکۆڵینێن پاشەکەوتکری'} ({papers.length})
                  </h2>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      ADMIN ACCESS
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchPapers}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  نووژەنکرنەوە 🔄
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-600 text-xs border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                  <p>خەریکە داتایان دئینیت...</p>
                </div>
              ) : papers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  هیچ لێکۆڵینەک نەهاتییە زێدەکرن. ژ لایێ چەپێ فۆڕمێ پڕ بکە داکو زێدە ببێت.
                </div>
              ) : (
                <div className="space-y-3">
                  {papers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 hover:border-indigo-300 transition"
                    >
                      <div className="space-y-1 truncate">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          📄 {paper.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          {paper.created_at && (
                            <span>مێژوو: {new Date(paper.created_at).toLocaleDateString('ar-EG')}</span>
                          )}
                          {isAdmin && paper.user_id && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                              User ID: {paper.user_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePaper(paper.id)}
                        disabled={deletingId === paper.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition shrink-0 disabled:opacity-50"
                      >
                        {deletingId === paper.id ? 'سڕینەڤە...' : 'سڕینەڤە 🗑️'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
